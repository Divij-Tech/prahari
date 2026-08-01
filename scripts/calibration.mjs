import { analyze, classifySignature } from '../src/lib/scamEngine.js';
import { SCENARIOS, SAMPLE_MESSAGES } from '../src/lib/scenarios.js';

const BANDS = { safe: [0, 21], caution: [22, 44], suspicious: [45, 71], critical: [72, 100] };

let failures = 0;

function band(score) {
   return Object.entries(BANDS).find(([, [lo, hi]]) => score >= lo && score <= hi)[0];
}

function check(name, score, expected, extra = '') {
   const got = band(score);
   const ok = got === expected;
   if (!ok) failures += 1;
   const pad = name.padEnd(30);
   console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${pad} score=${String(score).padStart(3)}  ` +
         `expected=${expected.padEnd(11)} got=${got.padEnd(11)} ${extra}`,
   );
}

console.log('\n── Calls ──────────────────────────────────────────────────────────────');
for (const sc of SCENARIOS) {
   const transcript = sc.lines.filter((l) => l.s === 'caller').map((l) => l.t).join(' ');
   const r = analyze(transcript);
   check(sc.name, r.score, sc.expected, `stages=${r.stagesSeen.length}/5 sig=${r.signature?.id ?? '—'}`);
}

console.log('\n── Calls, partway through (early-warning behaviour) ────────────────────');
for (const sc of SCENARIOS) {
   const half = sc.lines.filter((l) => l.s === 'caller');
   const transcript = half.slice(0, Math.ceil(half.length / 2)).map((l) => l.t).join(' ');
   const r = analyze(transcript);
   console.log(
      `      ${(sc.name + ' @50%').padEnd(30)} score=${String(r.score).padStart(3)}  ` +
         `band=${band(r.score)}`,
   );
}

console.log('\n── Messages ───────────────────────────────────────────────────────────');
const MSG_EXPECT = {
   courier: 'critical',
   kyc: 'critical',
   electricity: 'suspicious',
   genuine: 'safe',
};  
for (const m of SAMPLE_MESSAGES) {
   const r = analyze(m.text, { mode: 'message' });
   check(m.label, r.score, MSG_EXPECT[m.id], `hits=${r.hits.length} sig=${r.signature?.id ?? '—'}`);
}

console.log('\n── Everyday false-positive guards ─────────────────────────────────────');
const BENIGN = [  
   ['Dinner plans', 'Hey, are we still on for dinner at 8? I booked the table near the window.'],
   ['Delivery update', 'Your Amazon order has been delivered to your address. Rate your experience in the app.'],
   ['OTP receipt', '482913 is your OTP for login. Valid for 10 minutes. Do not share it with anyone.'],
   ['Work call', 'Hi, this is Rahul from the accounts team. Can you send me the invoice by Friday?'],  
   ['Real police news', 'The Mumbai police arrested three people in a money laundering case yesterday, according to the news report I read.'],
];
for (const [name, text] of BENIGN) {
   const r = analyze(text, { mode: 'message' });
   check(name, r.score, 'safe', `hits=${r.hits.map((h) => h.id).join(',') || 'none'}`);
}

console.log(
   `\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`,
);
process.exit(failures === 0 ? 0 : 1);
