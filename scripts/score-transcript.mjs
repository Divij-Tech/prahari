import { analyze } from '../src/lib/scamEngine.js';

const text = process.argv.slice(2).join(' ');
if (!text) {
    console.error('usage: node scripts/score-transcript.mjs "<transcript>"');
    process.exit(2);
}

const r = analyze(text);

console.log('score      ', r.score);
console.log('level      ', r.level.label);
console.log('signature  ', r.signature?.label ?? '—');
console.log('stages     ', r.stagesSeen.join(' -> ') || '—');
console.log('multiplier ', `${r.breakdown.multiplier.toFixed(2)}x`);
console.log('hits       ', r.hits.length);
for (const h of r.hits) {
    console.log(`   +${String(h.weight).padStart(2)}  [${h.stage}] ${h.label}`); 
}
