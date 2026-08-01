import { analyze } from '../src/lib/scamEngine.js';
import { SCAMS } from './scams.js';
import { GENUINE } from './genuine.js';

const DATASET = [
   ...SCAMS.map((c) => ({ ...c, label: 'scam' })),
   ...GENUINE.map((c) => ({ ...c, label: 'genuine' })),
];

const THRESHOLD = 45;

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const sweepOnly = args.includes('--sweep');

function scoreOf(c) {
   return analyze(c.text, { mode: c.channel === 'message' ? 'message' : 'call' }).score;
}

const scored = DATASET.map((c) => ({ ...c, score: scoreOf(c) }));

function confusion(threshold) {
   let tp = 0;  
   let fp = 0;
   let tn = 0;  
   let fn = 0;
   for (const c of scored) {
      const flagged = c.score >= threshold;
      if (c.label === 'scam') flagged ? (tp += 1) : (fn += 1);
      else flagged ? (fp += 1) : (tn += 1);
   }
   const precision = tp + fp ? tp / (tp + fp) : 0;
   const recall = tp + fn ? tp / (tp + fn) : 0;
   const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0; 
   const accuracy = (tp + tn) / scored.length;
   return { tp, fp, tn, fn, precision, recall, f1, accuracy };
}

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const bar = (n, width = 22) =>
   '█'.repeat(Math.round(n * width)).padEnd(width, '·'); 

console.log('\n═══ THRESHOLD SWEEP ═══════════════════════════════════════════════\n');
console.log('  thr   precision   recall      F1        flagged');
for (const t of [15, 22, 30, 38, 45, 55, 62, 72, 80]) {
   const m = confusion(t);
   const mark = t === THRESHOLD ? ' ←' : '';
   console.log(
      `  ${String(t).padStart(3)}   ${pct(m.precision).padStart(7)}   ` +  
         `${pct(m.recall).padStart(7)}   ${pct(m.f1).padStart(7)}   ` +
         `${String(m.tp + m.fp).padStart(3)}/${scored.length}${mark}`,
   );
}

if (sweepOnly) process.exit(0);

const m = confusion(THRESHOLD);

console.log(`\n═══ RESULTS @ threshold ${THRESHOLD} ═══════════════════════════════════\n`);
console.log(`  corpus        ${scored.length} cases  (${SCAMS.length} scam, ${GENUINE.length} genuine)`);
console.log(`  precision     ${pct(m.precision)}  ${bar(m.precision)}`);
console.log(`  recall        ${pct(m.recall)}  ${bar(m.recall)}`);
console.log(`  F1            ${pct(m.f1)}  ${bar(m.f1)}`);
console.log(`  accuracy      ${pct(m.accuracy)}  ${bar(m.accuracy)}`);

console.log('\n  confusion matrix');  
console.log('                    predicted scam   predicted genuine');
console.log(`    actual scam      ${String(m.tp).padStart(10)}       ${String(m.fn).padStart(10)}`);
console.log(`    actual genuine   ${String(m.fp).padStart(10)}       ${String(m.tn).padStart(10)}`);

console.log('\n═══ RECALL BY FRAUD TYPE ══════════════════════════════════════════\n');
const byType = {};
for (const c of scored.filter((x) => x.label === 'scam')) {
   byType[c.type] ??= { hit: 0, total: 0 };
   byType[c.type].total += 1;
   if (c.score >= THRESHOLD) byType[c.type].hit += 1;
}
for (const [type, v] of Object.entries(byType).sort(
   (a, b) => a[1].hit / a[1].total - b[1].hit / b[1].total,
)) {
   const r = v.hit / v.total;
   console.log(`  ${type.padEnd(16)} ${String(v.hit).padStart(2)}/${String(v.total).padEnd(2)}  ${pct(r).padStart(6)}  ${bar(r, 16)}`);
}

console.log('\n═══ BY CHANNEL ════════════════════════════════════════════════════\n');
for (const channel of ['call', 'message']) {
   const subset = scored.filter((c) => c.channel === channel);
   const tp = subset.filter((c) => c.label === 'scam' && c.score >= THRESHOLD).length;
   const fn = subset.filter((c) => c.label === 'scam' && c.score < THRESHOLD).length;
   const fp = subset.filter((c) => c.label === 'genuine' && c.score >= THRESHOLD).length;
   const p = tp + fp ? tp / (tp + fp) : 1;
   const r = tp + fn ? tp / (tp + fn) : 1; 
   console.log(`  ${channel.padEnd(8)} precision ${pct(p).padStart(6)}   recall ${pct(r).padStart(6)}   (${subset.length} cases)`);
}

if (quiet) process.exit(m.fp > 0 || m.recall < 0.8 ? 1 : 0);

const missed = scored.filter((c) => c.label === 'scam' && c.score < THRESHOLD);
const falseAlarms = scored.filter((c) => c.label === 'genuine' && c.score >= THRESHOLD);

console.log(`\n═══ MISSED SCAMS (${missed.length}) ═══════════════════════════════════════════\n`); 
for (const c of missed.sort((a, b) => a.score - b.score)) {
   console.log(`  [${c.id}] ${c.type} · scored ${c.score}`);
   console.log(`      "${c.text.slice(0, 150)}${c.text.length > 150 ? '…' : ''}"\n`);
}

console.log(`═══ FALSE ALARMS (${falseAlarms.length}) ══════════════════════════════════════════\n`);
for (const c of falseAlarms.sort((a, b) => b.score - a.score)) {
   const r = analyze(c.text, { mode: c.channel === 'message' ? 'message' : 'call' });
   console.log(`  [${c.id}] ${c.type} · scored ${c.score}`);
   console.log(`      "${c.text.slice(0, 150)}${c.text.length > 150 ? '…' : ''}"`);
   console.log(`      fired: ${r.hits.map((h) => h.id).join(', ')}\n`);
} 

console.log('───────────────────────────────────────────────────────────────────'); 
console.log(
   `  ${missed.length} missed · ${falseAlarms.length} false alarms · ` +
      `F1 ${pct(m.f1)}\n`,
);
