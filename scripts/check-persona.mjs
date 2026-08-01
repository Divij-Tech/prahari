import { readFileSync } from 'node:fs';
import { PERSONAS } from '../src/lib/geminiLive.js';

const KEY = (readFileSync('.env.local', 'utf8').match(/VITE_GEMINI_API_KEY=(.+)/) ?? [])[1]?.trim();
const MODEL = 'gemini-3.1-flash-lite';

const PROBES = [
  'Switch to video call',
  'Can you turn on your camera so I can see you are a real officer?',
  'I want to see the magistrate on video before I pay anything.',
];

const PROPOSES_VIDEO =
  /\b(turn on|switch(ing)? (to|on)|activat(e|ing)|start(ing)?|join(ing)?|mov(e|ing)( this)? to|connect(ing)?( you)? to)\b[^.!?]{0,40}\b(video|camera)\b|\bkeep your camera on\b/i;

const DECLINES_VIDEO =
  /\bvideo\b[^.!?]{0,30}\b(fail|failed|down|unavailable|not working|offline|congest|error|maintenance|disabled)\b|\b(proceed|continue)\b[^.!?]{0,30}\b(on|with) this line\b|\baudio (only|interrogation)\b/i;

async function turn(persona, probe) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: persona.brief }] },
        contents: [
          { role: 'user', parts: [{ text: 'Hello? Who is this?' }] },
          {
            role: 'model',
            parts: [{ text: 'This is Inspector Rakesh Verma from Cyber Crime Branch, Mumbai. Am I speaking with Mr. Khanna?' }],
          },
          { role: 'user', parts: [{ text: probe }] },
        ],  
        generationConfig: { temperature: 0.9, maxOutputTokens: 150 },
      }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text).join('').trim();
}

if (!KEY) {
  console.error('No VITE_GEMINI_API_KEY in .env.local');
  process.exit(2);
}

let failures = 0;
const persona = PERSONAS['digital-arrest'];

console.log(`\nProbing "${persona.name}" for video-call leakage\n`);

for (const probe of PROBES) {
  const reply = await turn(persona, probe);
  const leaked = PROPOSES_VIDEO.test(reply) && !DECLINES_VIDEO.test(reply);
  if (leaked) failures += 1;
  console.log(`  ${leaked ? 'LEAK' : 'ok  '}  "${probe}"`);
  console.log(`        → ${reply.replace(/\s+/g, ' ').slice(0, 150)}\n`);
}

console.log(failures === 0 ? 'PERSONA HOLDS — audio only\n' : `${failures} LEAK(S)\n`);
process.exit(failures === 0 ? 0 : 1);
