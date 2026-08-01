const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const geminiConfigured = Boolean(API_KEY);

const SYSTEM_BRIEF = `You are Prahari, an Indian cyber-fraud safety assistant.
You help ordinary people — often elderly, often frightened — understand whether
a call, message or website is a scam.

Rules:
- Be calm and concrete. Never lecture, never moralise, never panic the user.
- Use short sentences. Assume the reader may be under active pressure from a scammer.
- Ground advice in Indian reality: the 1930 cybercrime helpline, cybercrime.gov.in,
  UPI, Aadhaar, RBI, and the fact that "digital arrest" has no legal existence in India.
- Never ask the user for an OTP, PIN, password, card number or Aadhaar number.
- If something is genuinely safe, say so plainly. Do not manufacture suspicion.`;

async function generate(prompt, { json = false, timeoutMs = 20000 } = {}) {
  if (!API_KEY) throw new Error('no-key');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_BRIEF }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
          ...(json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });

    if (!res.ok) throw new Error(`gemini-${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
    if (!text) throw new Error('gemini-empty');
    return json ? JSON.parse(text) : text;
  } finally {
    clearTimeout(timer); 
  }
}

export async function analyseMessage(message, localResult) {
  const prompt = `Analyse this message received by an Indian user. Decide if it is a scam.

MESSAGE:
"""
${message}
"""

The on-device detector scored this ${localResult.score}/100 and flagged: ${
    localResult.hits.map((h) => h.label).join('; ') || 'nothing' 
  }.

Reply as JSON with exactly these keys:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "LIKELY_GENUINE",
  "confidence": 0-100,
  "headline": "one short sentence a worried person can read in two seconds",
  "redFlags": ["specific things in THIS message, quoting it where useful"],
  "whatToDo": ["concrete next steps, most important first"],
  "hindi": "the headline translated to simple Hindi"
}`;

  try {
    const out = await generate(prompt, { json: true });
    return { ...out, source: 'gemini' };
  } catch {
    return localFallbackMessage(localResult);
  }
}

export async function askInvestigator(question, context) {
  const prompt = `A user asks: "${question}"

${context ? `Context from their device:\n${context}\n` : ''}
Answer in under 130 words. Be direct. If you cannot verify something (a specific
phone number, a specific URL's live status), say so honestly and tell them how to
check it themselves.`;

  try {
    return { text: await generate(prompt), source: 'gemini' };
  } catch {
    return {
      text:  
        'I could not reach the AI service just now, so here is the standing advice.\n\n' +
        'Treat any unexpected call or message claiming legal trouble as fraud until proven otherwise. ' +
        'No Indian agency arrests people over a phone or video call, and none of them collect money by UPI. ' +
        'Hang up, then call the organisation yourself on a number you looked up independently. ' +
        'To report fraud, call 1930 or file at cybercrime.gov.in.',
      source: 'fallback',
    };
  }
}

export async function narrateIncident(report) {
  const prompt = `Write a short factual incident summary for a cybercrime complaint,
based on this automated detection record. Third person, past tense, no drama.
Maximum 120 words. End with the single most important next step.

RECORD:
${JSON.stringify(report, null, 2)}`;

  try {
    return { text: await generate(prompt), source: 'gemini' };
  } catch {
    const stages = report.attackStagesObserved?.join(', ') || 'none';
    return {
      text:
        `On ${new Date(report.generatedAt).toLocaleString('en-IN')}, an incoming call from ` +
        `${report.callerId} was classified by Prahari as "${report.classification}" with a risk ` +
        `score of ${report.riskScore}/100. Attack stages observed: ${stages}. ` +
        `${report.detectedBehaviours?.length || 0} distinct fraud behaviours were recorded, ` +
        `including impersonation of law enforcement and a demand for funds transfer. ` +
        `The transcript hash is retained for integrity verification.\n\n` +
        `Next step: report this on the 1930 helpline or at cybercrime.gov.in within 24 hours — ` +
        `the golden hour for freezing a fraudulent transfer.`,
      source: 'fallback',
    };
  }
}

function localFallbackMessage(localResult) {
  const isScam = localResult.score >= 45;
  const isSus = localResult.score >= 22;
  return {
    verdict: isScam ? 'SCAM' : isSus ? 'SUSPICIOUS' : 'LIKELY_GENUINE',  
    confidence: Math.min(95, 45 + localResult.score / 2),
    headline: isScam
      ? 'This message matches known fraud patterns. Do not click anything in it.'
      : isSus
        ? 'Parts of this message look unusual. Verify before acting.'
        : 'Nothing in this message matches known fraud patterns.',
    redFlags: localResult.hits.map((h) => `${h.label} — ${h.why}`),
    whatToDo: isScam
      ? [
          'Do not click any link or call any number in the message.',
          'Contact the organisation on a number you look up yourself.',
          'Report it on the 1930 helpline or at cybercrime.gov.in.',
        ]
      : ['Verify with the organisation directly before taking any action.'],
    hindi: isScam
      ? 'यह संदेश धोखाधड़ी के ज्ञात पैटर्न से मेल खाता है। इसमें दिए किसी लिंक पर क्लिक न करें।'
      : 'इस संदेश में कोई ज्ञात धोखाधड़ी पैटर्न नहीं मिला।',
    source: 'on-device',
  };
}
