import {
  BRANDS,
  OFFICIAL_DOMAINS,
  MULTI_SUFFIXES,
  RISKY_TLDS,
  SHORTENERS,
  CONFUSABLES,  
} from './brands.js';

export const URL_LEVELS = {
  safe: { id: 'safe', label: 'No phishing signals', tone: 'emerald', min: 0 },
  caution: { id: 'caution', label: 'Worth checking', tone: 'sky', min: 22 },
  suspicious: { id: 'suspicious', label: 'Likely phishing', tone: 'amber', min: 45 },
  critical: { id: 'critical', label: 'PHISHING LINK', tone: 'red', min: 72 },
};

export function deconfuse(text) {
  return [...text].map((ch) => CONFUSABLES[ch] ?? ch).join('');  
}

export function hasNonLatin(host) {  
  return /[^\x00-\x7F]/.test(host);
} 

export function registrableDomain(host) {
  const parts = host.split('.').filter(Boolean);
  for (const suffix of MULTI_SUFFIXES) {
    if (host === suffix) return host;
    if (host.endsWith(`.${suffix}`)) { 
      return parts.slice(-(suffix.split('.').length + 1)).join('.');  
    }
  }
  return parts.slice(-2).join('.');
}

export function levenshtein(a, b) {
  if (a === b) return 0;  
  if (!a.length || !b.length) return Math.max(a.length, b.length);

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);  
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {  
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      ); 
    }
    prev = row;
  }
  return prev[b.length];
}


function segmentsOf(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export function parseUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    const u = new URL(withScheme);
    const host = u.hostname.toLowerCase().replace(/\.$/, '');
    return {  
      href: u.href,
      scheme: u.protocol.replace(':', ''),
      host,  
      registrable: registrableDomain(host),
      subdomain: host.slice(0, Math.max(0, host.length - registrableDomain(host).length - 1)),
      tld: host.split('.').pop(),
      path: u.pathname + u.search,
      port: u.port,
      auth: Boolean(u.username || u.password),
      suppliedScheme: /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? u.protocol.replace(':', '') : null,
    };
  } catch {
    return null;
  }
}


export function analyzeUrl(raw) {
  const parsed = parseUrl(raw);
  if (!parsed) {
    return {
      ok: false, score: 0, level: URL_LEVELS.safe, hits: [], parsed: null,
      impersonating: null, verdictLine: 'That does not look like a web address.',
    };
  }

  const hits = [];
  const add = (id, weight, label, why, floor = 0, evidence = '') =>
    hits.push({ id, weight, label, why, floor, evidence });

  const { host, registrable, subdomain, tld, path, scheme } = parsed;
  const folded = deconfuse(host);
  const official = OFFICIAL_DOMAINS.has(registrable);

  const hostSegments = segmentsOf(folded);
  const pathSegments = segmentsOf(path);
  let impersonating = null;

  const nearToken = (segments, token) =>
    segments.includes(token) ||
    (token.length >= 5 && segments.some((s) =>
      Math.abs(s.length - token.length) <= 1 && levenshtein(s, token) === 1));

  for (const brand of BRANDS) {
    const inHost = brand.tokens.some((t) => nearToken(hostSegments, t));
    const inPath = brand.tokens.some((t) => nearToken(pathSegments, t));
    const owns = brand.domains.includes(registrable);
    if (owns || (!inHost && !inPath)) continue;

    impersonating = brand;
    if (inHost) { 
      add(
        'url-brand-in-subdomain', 34,
        `Pretends to be ${brand.name}`,
        `The name "${brand.name}" appears in the address, but the actual site is "${registrable}", which ${brand.name} does not own. The part before the last dot is decoration; the part that decides where you land is "${registrable}".`, 
        78, host,
      );
    } else {
      add(
        'url-brand-in-path', 18,
        `Uses the ${brand.name} name in the link path`,
        `"${brand.name}" appears in the page path but the site itself is "${registrable}". Anyone can put any word after the slash.`,
        0, path,
      );
    }
    break;
  }

  if (!official && !impersonating) {
    for (const domain of OFFICIAL_DOMAINS) {
      const d = levenshtein(deconfuse(registrable), domain);
      if (d > 0 && d <= 2 && Math.abs(registrable.length - domain.length) <= 2) {
        add(
          'url-typosquat', 32,
          `One character away from ${domain}`,
          `"${registrable}" differs from the real "${domain}" by ${d} character${d > 1 ? 's' : ''}. This is deliberate — it is meant to survive a glance.`,
          78, registrable,
        );
        break;
      }
    }
  }

  if (host.startsWith('xn--') || host.includes('.xn--')) {
    add('url-punycode', 30, 'Address uses encoded characters',
      'The hostname is punycode, which is how non-Latin characters are smuggled into a domain that looks Latin. Legitimate Indian sites rarely need this.', 
      75, host);
  } else if (hasNonLatin(host)) {
    add('url-confusable', 30, 'Hostname mixes alphabets',
      'This address contains characters from another alphabet that render almost identically to Latin letters. It is designed to be indistinguishable from the real domain.',
      75, host);
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    add('url-ip-host', 28, 'Links to a bare IP address',
      'Real services use names, not raw IP addresses. This is a machine somebody rented, not a company.',
      72, host);
  }

  if (parsed.auth) {  
    add('url-embedded-credentials', 26, 'Credentials hidden in the address',
      'Text before the @ symbol is ignored by the browser — it exists purely to make the address look legitimate. Everything that matters comes after it.',  
      72, host);
  }

  if (SHORTENERS.has(registrable)) {

    add('url-shortener', 30, 'Destination is hidden behind a short link',
      'A shortened link conceals where you are actually going, so nothing about it can be checked before you tap. No bank or government department sends one.',  
      0, registrable);
  }

  if (RISKY_TLDS.has(tld) && !official) {
    add('url-risky-tld', 14, `Uses a .${tld} domain`,
      `The .${tld} ending is cheap and bulk-registered, so it appears in phishing far more often than in real Indian banking or government sites. On its own it proves nothing.`,
      0, `.${tld}`);
  }

  const subLabels = subdomain ? subdomain.split('.').filter(Boolean).length : 0;
  if (subLabels >= 3) {
    add('url-deep-subdomain', 12, 'Unusually deep subdomain chain',
      'Long chains of subdomains are used to push the real domain off the end of a phone screen, so only the reassuring part is visible.',
      0, host);
  }  

  const lure = ['verify', 'secure', 'login', 'update', 'kyc', 'account', 'confirm',
    'wallet', 'refund', 'reward', 'signin', 'auth', 'unlock', 'reactivate',
    'bank', 'banking', 'netbanking', 'payment', 'billing', 'support', 'helpdesk'];
  const lureHits = lure.filter((w) => hostSegments.includes(w));
  if (lureHits.length && !official) {  

    add(
      'url-lure-words',
      13 + 7 * (lureHits.length - 1),
      lureHits.length >= 3 ? 'Hostname is a stack of urgency words' : 'Hostname is built from urgency words',  
      `"${lureHits.join('", "')}" in the domain itself is a choice no real bank makes. Their domain is their name, not a description of what they want you to do.`,
      lureHits.length >= 3 ? 62 : 0, host,
    );
  }

  if (/\.apk(\?|$)/i.test(path)) {
    add('url-apk-download', 26, 'Link downloads an Android app file',
      'An .apk installs software outside the Play Store, bypassing its checks. This is how banking trojans arrive.',
      74, path);
  }

  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    add('url-odd-port', 12, `Connects on port ${parsed.port}`,
      'Ordinary websites use the standard ports. A custom port usually means somebody running a service off a rented box.',
      0, `:${parsed.port}`);
  }

  if (scheme === 'http' && parsed.suppliedScheme === 'http') {
    add('url-no-https', 10, 'Not an encrypted connection',
      'Anything typed into this page travels unprotected. No bank has served a login page over plain http for years.',
      0, 'http://');
  }

  let trust = 0;
  if (official) {
    trust = -45;
    hits.push({
      id: 'url-official-domain', weight: -45, floor: 0, evidence: registrable,  
      label: `Genuine ${BRANDS.find((b) => b.domains.includes(registrable))?.name ?? ''} domain`.trim(),
      why: 'This is the organisation\'s real registered domain.',
    });
  }  

  const base = hits.filter((h) => h.weight > 0).reduce((n, h) => n + h.weight, 0); 
  const floor = official ? 0 : Math.max(0, ...hits.map((h) => h.floor));
  const score = Math.max(0, Math.min(100, Math.round(Math.max(base + trust, floor + trust))));

  const level =
    score >= URL_LEVELS.critical.min ? URL_LEVELS.critical
      : score >= URL_LEVELS.suspicious.min ? URL_LEVELS.suspicious
        : score >= URL_LEVELS.caution.min ? URL_LEVELS.caution
          : URL_LEVELS.safe;

  return {
    ok: true,
    score,
    level,
    hits: hits.sort((a, b) => b.weight - a.weight),
    parsed,
    impersonating,
    verdictLine: verdictFor(level, parsed, impersonating), 
  };
}

function verdictFor(level, parsed, impersonating) {
  if (level.id === 'safe') {
    return `This address belongs to ${parsed.registrable}, and nothing about its structure is suspicious.`;
  }
  if (impersonating) {
    return `This link is dressed up as ${impersonating.name}, but it actually goes to ${parsed.registrable}. Do not enter anything on it.`;
  }  
  if (level.id === 'critical') {
    return `This link goes to ${parsed.registrable} and shows the structure of a phishing page. Do not open it.`;
  }
  return `This link goes to ${parsed.registrable}. Check that against the address you expected before continuing.`; 
} 

export function extractUrls(text) {
  const matches = String(text || '').match(
    /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/[^\s<>"')\]]*/gi,
  );
  return [...new Set(matches ?? [])].map((m) => m.replace(/[.,;:!?]+$/, ''));  
}

export function worstUrlIn(text) {
  const results = extractUrls(text).map(analyzeUrl).filter((r) => r.ok);
  if (!results.length) return null;  
  return results.sort((a, b) => b.score - a.score)[0];
}
