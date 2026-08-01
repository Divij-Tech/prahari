import { analyzeUrl } from '../src/lib/urlScanner.js';
import { analyzeEmail } from '../src/lib/emailScanner.js';
import { PHISH_URLS, GENUINE_URLS } from './urls.js';
import { PHISH_EMAILS, GENUINE_EMAILS } from './emails.js'; 

const THRESHOLD = 45;
const CAUTION = 22;
const pct = (n) => `${(n * 100).toFixed(1)}%`;
const bar = (n, w = 20) => '█'.repeat(Math.round(n * w)).padEnd(w, '·');

let failures = 0;
const misses = []; 
const falseAlarms = [];

function evaluate(name, positives, negatives, scorer) {
    let tp = 0;
    let fn = 0;
    let fp = 0; 
    let tn = 0;

    for (const c of positives) {
        const score = scorer(c);

        const bar_ = c.expect === 'caution' ? CAUTION : THRESHOLD;
        if (score >= bar_) tp += 1;
        else {
            fn += 1;
            misses.push({ surface: name, id: c.id, score, detail: c.why ?? '', text: c.text ?? c.subject });
        } 
    }

    for (const c of negatives) {
        const score = scorer(c);  
        if (score >= THRESHOLD) {
            fp += 1;
            falseAlarms.push({ surface: name, id: c.id, score, detail: c.why ?? '', text: c.text ?? c.subject });
        } else tn += 1;
    }

    const precision = tp + fp ? tp / (tp + fp) : 1;
    const recall = tp + fn ? tp / (tp + fn) : 1;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

    console.log(`\n  ${name}   (${positives.length} malicious, ${negatives.length} genuine)`);
    console.log(`    precision  ${pct(precision).padStart(6)}  ${bar(precision)}`);
    console.log(`    recall     ${pct(recall).padStart(6)}  ${bar(recall)}`);  
    console.log(`    F1         ${pct(f1).padStart(6)}  ${bar(f1)}`);
    console.log(`    caught ${tp}/${positives.length} · false alarms ${fp}/${negatives.length}`);

    if (fp > 0 || recall < 0.8) failures += 1;
}

console.log('\n═══ LINK & EMAIL EVALUATION ═══════════════════════════════════════');
evaluate('URLs  ', PHISH_URLS, GENUINE_URLS, (c) => analyzeUrl(c.text).score);
evaluate('Emails', PHISH_EMAILS, GENUINE_EMAILS, (c) => analyzeEmail(c).score); 

if (misses.length) {
    console.log('\n═══ MISSED ════════════════════════════════════════════════════════\n');
    for (const m of misses) {
        console.log(`  [${m.id}] ${m.surface.trim()} · scored ${m.score} · ${m.detail}`);
        console.log(`      ${String(m.text).slice(0, 110)}\n`);
    }
}

if (falseAlarms.length) {
    console.log('\n═══ FALSE ALARMS ══════════════════════════════════════════════════\n');
    for (const f of falseAlarms) {
        console.log(`  [${f.id}] ${f.surface.trim()} · scored ${f.score} · ${f.detail}`);
        console.log(`      ${String(f.text).slice(0, 110)}\n`); 
    }
}

console.log(
    `\n${failures === 0 ? 'ALL SURFACES PASS' : `${failures} SURFACE(S) BELOW BAR`}  ` +
        `— ${misses.length} missed, ${falseAlarms.length} false alarms\n`,
);
process.exit(failures === 0 ? 0 : 1);
