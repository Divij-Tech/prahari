import { analyze } from './scamEngine.js';
import { analyzeUrl, worstUrlIn, registrableDomain, levenshtein } from './urlScanner.js';
import { BRANDS, OFFICIAL_DOMAINS, FREEMAIL } from './brands.js';

export const EMAIL_LEVELS = {
   safe: { id: 'safe', label: 'Nothing suspicious', tone: 'emerald', min: 0 },
   caution: { id: 'caution', label: 'Worth checking', tone: 'sky', min: 22 },
   suspicious: { id: 'suspicious', label: 'Likely phishing email', tone: 'amber', min: 45 },
   critical: { id: 'critical', label: 'PHISHING EMAIL', tone: 'red', min: 72 },
};

export function parseAddress(raw) {
   const text = String(raw || '').trim();
   if (!text) return { display: '', address: '', domain: '', registrable: '' };

   const match = text.match(/^\s*(?:"?([^"<]*?)"?\s*)?<?([^\s<>@]+@[^\s<>@]+)>?\s*$/);
   if (!match) return { display: text, address: '', domain: '', registrable: '' };

   const display = (match[1] || '').trim(); 
   const address = (match[2] || '').toLowerCase();
   const domain = address.split('@')[1] || '';
   return { display, address, domain, registrable: domain ? registrableDomain(domain) : '' };
}

function claimedBrand(text) {
   const raw = String(text || '').toLowerCase();
   const segments = raw.split(/[^a-z0-9]+/).filter(Boolean);

   for (const brand of BRANDS) {
      if (raw.includes(brand.name.toLowerCase())) return brand;
      if (brand.tokens.some((t) => segments.includes(t))) return brand;
   }

   if (/\b(bank|income tax|customs|police|cyber|government|ministry)\b/i.test(text)) {
      return { name: 'a bank or government body', tokens: [], domains: [], generic: true };
   }
   return null;
}

export function analyzeEmail({ from = '', replyTo = '', subject = '', body = '' }) {
   const sender = parseAddress(from);  
   const reply = parseAddress(replyTo);
   const hits = [];
   const add = (id, weight, label, why, floor = 0, evidence = '') =>
      hits.push({ id, weight, label, why, floor, evidence });

   const senderOfficial = OFFICIAL_DOMAINS.has(sender.registrable);

   const claim = claimedBrand(`${sender.display} ${subject}`);

   if (claim && sender.domain && FREEMAIL.has(sender.registrable)) {
      add(
         'em-freemail-brand', 34,
         `Claims to be ${claim.name} but sent from a free mailbox`,
         `${claim.name} does not send official mail from ${sender.registrable}. Anyone can create an address there in two minutes. This alone settles it.`,
         80, sender.address,
      );
   }

   if (claim && !claim.generic && sender.registrable && !claim.domains.includes(sender.registrable)
         && !FREEMAIL.has(sender.registrable)) {
      add(
         'em-sender-domain-mismatch', 32,
         `Sender domain does not belong to ${claim.name}`, 
         `The message presents itself as ${claim.name}, but it was sent from "${sender.registrable}", which is not one of their domains. The display name is free text — the domain is not.`,
         78, sender.address,
      );
   }

   if (!senderOfficial && sender.registrable) {
      for (const domain of OFFICIAL_DOMAINS) {
         const d = levenshtein(sender.registrable, domain);
         if (d > 0 && d <= 2 && Math.abs(sender.registrable.length - domain.length) <= 2) {
            add(  
               'em-lookalike-sender', 32,
               `Sender domain imitates ${domain}`,
               `"${sender.registrable}" is ${d} character${d > 1 ? 's' : ''} away from the real "${domain}". It is registered to look right at a glance.`,
               78, sender.registrable,
            );
            break;
         }
      }
   }  

   if (reply.domain && sender.domain && reply.registrable !== sender.registrable) {
      add(
         'em-replyto-mismatch', 28,
         'Replies would go somewhere else entirely',
         `The message appears to come from "${sender.registrable}" but any reply is directed to "${reply.registrable}". Legitimate senders do not need this.`,
         70, reply.address,  
      );
   }

   if (/^\s*(urgent|action required|immediate|final notice|important|alert)\b/i.test(subject)
         || /!{2,}/.test(subject)) {
      add(
         'em-urgent-subject', 12, 'Subject line manufactures urgency',  
         'Urgency in a subject line exists to get you clicking before you check the sender.',
         0, subject.slice(0, 90),
      );
   }

   if (/\b(verify|confirm|update|re-?activate|restore)\b[^.]{0,60}\b(account|password|details|kyc|card)\b/i.test(body)
         && /\b(click|link|below|here|log ?in)\b/i.test(body)) {  
      add(
         'em-credential-harvest', 26,
         'Asks you to confirm account details through a link',
         'Banks and government portals never collect credentials through an emailed link. Open the official site yourself.',
         70, '',  
      );
   }

   if (/\b(change|update|revised|new)\b[^.]{0,50}\b(bank (account|details)|account (number|details)|payment details)\b/i.test(body)
         || /\b(remit|wire|transfer)\b[^.]{0,60}\b(new|updated|revised) account\b/i.test(body)) {
      add(
         'em-invoice-fraud', 28,  
         'Requests payment to changed bank details',
         'Business email compromise: an attacker inside or imitating a supplier changes the account number on a real invoice. Always confirm changed bank details by phone, on a number you already had.',
         74, '',
      );
   }

   if (/\battach(ed|ment)\b/i.test(body) && /\.(apk|exe|scr|jar|bat|js|zip|rar|iso)\b/i.test(body)) {
      add(
         'em-dangerous-attachment', 24,
         'Refers to an executable attachment',
         'Invoices and statements arrive as PDFs. An .apk, .exe or archive attachment is software, and opening it is how devices get taken over.',
         70, '', 
      );
   }

   if (sender.display && sender.address
         && /@/.test(sender.display) && sender.display.toLowerCase() !== sender.address) {
      add(  
         'em-display-name-spoof', 22,
         'Display name is itself a fake address',
         `The name shown is "${sender.display}" but the real sender is ${sender.address}. The visible name is chosen by the sender and means nothing.`,  
         62, sender.display,  
      );
   }

   let trust = 0;
   if (senderOfficial && (!reply.registrable || reply.registrable === sender.registrable)) { 
      trust = -45;
      hits.push({
         id: 'em-official-sender', weight: -45, floor: 0, evidence: sender.address,
         label: `Sent from the genuine ${sender.registrable} domain`,
         why: 'The sending domain really does belong to this organisation.',
      });
   }

   const textResult = analyze(`${subject}\n${body}`, { mode: 'message' });

   const advisory = textResult.trustHits.some((t) => t.id === 'trust-advisory');

   const headerBase = hits.filter((h) => h.weight > 0).reduce((n, h) => n + h.weight, 0);
   const headerFloor = senderOfficial || advisory ? 0 : Math.max(0, ...hits.map((h) => h.floor));
   const headerScore = Math.max(
      0,
      Math.min(100, Math.round(Math.max(headerBase, headerFloor) + trust + (advisory ? -25 : 0))),
   );  
   const urlResult = worstUrlIn(body);
   const urlScore = urlResult?.score ?? 0;

   const parts = [headerScore, textResult.score, urlScore];
   const flagging = parts.filter((s) => s >= 45).length;
   let score = Math.max(...parts);

   if (flagging >= 2) score = Math.min(100, score + 12);
   if (senderOfficial && trust < 0) score = Math.max(0, score + trust / 2);  
   score = Math.max(0, Math.min(100, Math.round(score)));

   const level =
      score >= EMAIL_LEVELS.critical.min ? EMAIL_LEVELS.critical
         : score >= EMAIL_LEVELS.suspicious.min ? EMAIL_LEVELS.suspicious  
            : score >= EMAIL_LEVELS.caution.min ? EMAIL_LEVELS.caution
               : EMAIL_LEVELS.safe;

   return {
      score,
      level,  
      sender,
      reply,
      claim,
      headerHits: hits.sort((a, b) => b.weight - a.weight),
      headerScore, 
      textResult,
      urlResult,
      breakdown: { headerScore, textScore: textResult.score, urlScore, corroborating: flagging },
   };
}

export { analyzeUrl };
