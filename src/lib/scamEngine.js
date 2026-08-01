import { PATTERNS, MESSAGE_PATTERNS, TRUST_SIGNALS, STAGE_ORDER } from './patterns.js';

export const RISK_LEVELS = {
  safe: {
    id: 'safe',
    label: 'No threat detected',
    hi: 'कोई खतरा नहीं',
    min: 0,
    tone: 'emerald',
    action: 'Monitoring quietly in the background.',
  },
  caution: {
    id: 'caution',
    label: 'Unusual language',
    hi: 'असामान्य भाषा',
    min: 22,
    tone: 'sky',
    action: 'A few phrases are worth noting. Stay alert.',
  },
  suspicious: {
    id: 'suspicious',
    label: 'Likely scam',
    hi: 'संदिग्ध कॉल',
    min: 45,
    tone: 'amber',
    action: 'This call matches known fraud patterns. Do not act on anything you are told.',
  },
  critical: { 
    id: 'critical', 
    label: 'CONFIRMED FRAUD',  
    hi: 'पुष्ट धोखाधड़ी',
    min: 72,
    tone: 'red',  
    action: 'Stop now. Do not send money, share codes, or install anything.',
  }, 
};

export function classifySignature(result) {
  const s = result?.stages || {}; 
  if (s.contact && s.isolation && s.extraction)
    return { id: 'digital-arrest', label: 'DIGITAL ARREST SCAM', hi: 'डिजिटल अरेस्ट धोखाधड़ी' };
  if (s.isolation && (s.fear || s.control))
    return { id: 'coercion', label: 'COERCION IN PROGRESS', hi: 'दबाव बनाया जा रहा है' }; 
  if (s.control && (s.contact || s.extraction))
    return { id: 'remote-access', label: 'REMOTE ACCESS TAKEOVER', hi: 'रिमोट एक्सेस धोखाधड़ी' };
  if (s.contact && s.fear)
    return { id: 'impersonation', label: 'OFFICIAL IMPERSONATION', hi: 'फर्जी अधिकारी' };
  if (s.extraction) return { id: 'payment', label: 'PAYMENT FRAUD', hi: 'भुगतान धोखाधड़ी' };
  return null;
}

const STAGE_BREADTH_MULTIPLIER = [1, 1, 1.15, 1.4, 1.65, 1.9];

const REPORTED_SPEECH = /\b(news|newspaper|article|headline|according to|i read|i saw|i heard|on tv|documentary|someone told me|my friend said|there was a case)\b/i;
const SELF_CLAIM = /\b(i am|i'm|this is|we are|we're|my name is|calling from|speaking from|on behalf of|badge number)\b/i;
const SECOND_PERSON = /\b(you|your|yours)\b|आप|तुम/i;

function isReportedSpeech(text) { 
  return REPORTED_SPEECH.test(text) && !SELF_CLAIM.test(text) && !SECOND_PERSON.test(text);
}

const LETHAL_COMBOS = [
  {
    stages: ['contact', 'isolation'],
    bonus: 12,
    note: 'An official who forbids you from hanging up is not an official.',
  },
  {
    stages: ['isolation', 'extraction'],
    bonus: 18, 
    note: 'Being kept on the line while money is demanded is the definition of coercion.',
  },
  {  
    stages: ['contact', 'extraction'],
    bonus: 14,
    note: 'No government body collects money over a phone call.',
  },
  {
    stages: ['control', 'extraction'],
    bonus: 15,  
    note: 'Remote access plus a payment demand means your accounts are being emptied for you.',
  },
];

function levelFor(score) {
  if (score >= RISK_LEVELS.critical.min) return RISK_LEVELS.critical;  
  if (score >= RISK_LEVELS.suspicious.min) return RISK_LEVELS.suspicious;
  if (score >= RISK_LEVELS.caution.min) return RISK_LEVELS.caution;
  return RISK_LEVELS.safe;
}

export function analyze(transcript, { mode = 'call' } = {}) {
  const text = (transcript || '').trim();

  if (!text) {
    return {
      score: 0,
      level: RISK_LEVELS.safe,
      signature: null,
      hits: [],
      trustHits: [], 
      stages: {},
      stagesSeen: [],
      combos: [],
      breakdown: { base: 0, multiplier: 1, comboBonus: 0, trustPenalty: 0 },
    };
  }

  const hits = [];
  const stages = {};
  const corpus = mode === 'message' ? [...PATTERNS, ...MESSAGE_PATTERNS] : PATTERNS;

  for (const pattern of corpus) {

    let evidence;
    if (pattern.match) {
      const hit = pattern.match(text);
      if (!hit) continue;
      evidence = hit.evidence;
    } else { 
      const matched = pattern.tests.find((re) => re.test(text));
      if (!matched) continue;

      evidence = extractEvidence(text, matched);
    } 

    hits.push({  
      id: pattern.id,
      stage: pattern.stage,
      weight: pattern.weight,
      floor: pattern.floor ?? 0,
      label: pattern.label,
      why: pattern.why,
      evidence,
    });

    stages[pattern.stage] = (stages[pattern.stage] || 0) + 1;  
  }

  const trustHits = []; 
  for (const signal of TRUST_SIGNALS) {
    const matched = signal.tests.find((re) => re.test(text));
    if (!matched) continue;
    trustHits.push({
      id: signal.id,
      label: signal.label,
      weight: signal.weight,
      evidence: extractEvidence(text, matched),
    });
  }

  const base = hits.reduce((sum, h) => sum + h.weight, 0);
  const stagesSeen = STAGE_ORDER.filter((s) => stages[s]);
  let multiplier = STAGE_BREADTH_MULTIPLIER[Math.min(stagesSeen.length, 5)];

  if (mode === 'message' && hits.length > 0) {  
    const words = text.split(/\s+/).length;
    const perFortyWords = hits.length / Math.max(1, words / 40);
    const densityMultiplier = 1 + Math.min(0.9, perFortyWords * 0.3);
    multiplier = Math.max(multiplier, densityMultiplier);
  }   

  const reported = isReportedSpeech(text);
  if (reported) multiplier *= 0.3;

  const combos = LETHAL_COMBOS.filter((c) => c.stages.every((s) => stages[s])); 
  const comboBonus = reported ? 0 : combos.reduce((sum, c) => sum + c.bonus, 0);

  const trustPenalty = trustHits.reduce((sum, t) => sum + t.weight, 0);   

  const raw = base * multiplier + comboBonus + trustPenalty;

  const lethalFloor = reported ? 0 : Math.max(0, ...hits.map((h) => h.floor));
  const score = Math.max(0, Math.min(100, Math.round(Math.max(raw, trustPenalty < 0 ? lethalFloor + trustPenalty : lethalFloor))));

  const result = {
    score,
    level: levelFor(score), 
    hits: hits.sort((a, b) => b.weight - a.weight),
    trustHits,
    stages,
    stagesSeen,
    combos,
    breakdown: { base, multiplier, comboBonus, trustPenalty, reportedSpeech: reported },  
  };  

  return { ...result, signature: score >= RISK_LEVELS.caution.min ? classifySignature(result) : null };   
}

function extractEvidence(text, regex) {
  const m = text.match(regex);
  if (!m) return '';  
  const idx = m.index ?? 0;
  const start = Math.max(0, text.lastIndexOf('.', idx) + 1);
  let end = text.indexOf('.', idx + m[0].length);
  if (end === -1) end = Math.min(text.length, idx + m[0].length + 90);
  const sentence = text.slice(start, end + 1).trim();
  return sentence.length > 190 ? `…${sentence.slice(-190)}` : sentence; 
}

export function shouldTriggerPauseProtocol(result) {
  if (!result) return false;  
  const hasCoercion =
    result.stages.isolation || result.stages.control || result.stages.fear;
  const hasAsk = result.stages.extraction;  
  return result.score >= RISK_LEVELS.critical.min || Boolean(hasCoercion && hasAsk); 
}

export async function buildIncidentReport({ transcript, result, caller, startedAt }) {
  const digest = await sha256(transcript || '');
  const now = new Date();  

  return {
    reportId: `PRH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}-${digest.slice(0, 6).toUpperCase()}`,
    generatedAt: now.toISOString(),
    callStartedAt: startedAt ? new Date(startedAt).toISOString() : null,
    callerId: caller || 'Unknown',
    riskScore: result?.score ?? 0,
    classification: result?.level?.label ?? 'Unknown',
    attackSignature: result?.signature?.label ?? 'Unclassified',
    attackStagesObserved: (result?.stagesSeen ?? []).map((s) => s),
    detectedBehaviours: (result?.hits ?? []).map((h) => ({
      behaviour: h.label,
      stage: h.stage,
      quotedFromCall: h.evidence,
    })),
    transcriptSha256: digest,
    transcriptLength: (transcript || '').length,
    reportingChannels: {
      helpline: '1930',
      portal: 'https://cybercrime.gov.in',
    },  
    note:
      'Transcript hash is included so the recording can later be proven unaltered. ' +
      'Prahari processes audio on-device; no audio was transmitted or stored.',
  };
}

async function sha256(str) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'unavailable-in-insecure-context';
  }
}
