import { useState } from 'react';
import { analyzeUrl } from '../lib/urlScanner.js';
import { toneOf } from '../lib/tone.js';

const SAMPLES = [
  { label: 'Fake SBI', url: 'http://sbi-kyc-verify.online-update.in/login' },
  { label: 'Real SBI', url: 'https://www.sbi.co.in/' },
  { label: 'Fake refund', url: 'http://incometax-refund.gov-verify.in/claim' },
  { label: 'Typosquat', url: 'https://arnazon.in/orders' },
];

export default function LinkScanner() {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(null);

  function check(value) {
    const url = (value ?? input).trim();
    if (!url) return;  
    setInput(url);
    setChecked({ url, ...analyzeUrl(url) });  
  }

  const result = checked && checked.url === input.trim() ? checked : null;
  const tone = result ? toneOf(result.level.tone) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <h2 className="text-[15px] font-bold text-slate-100">Link Checker</h2>
      <p className="mt-0.5 text-[10.5px] leading-snug text-haze">
        Paste any link. Prahari shows you which part of it actually decides where
        you go.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => check(s.url)}  
            className="chip border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1]"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="https://…"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
        />
        <button
          onClick={() => check()}
          disabled={!input.trim()}  
          className="rounded-xl bg-sky-600 px-3.5 text-[12px] font-bold text-white transition hover:bg-sky-500 disabled:bg-white/[0.06] disabled:text-slate-600" 
        >
          Check
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pb-4">
        {result && !result.ok && (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11.5px] text-haze">
            That does not look like a web address.
          </p>
        )}  

        {result?.ok && (
          <>
            <div className={`animate-rise rounded-xl border ${tone.border} ${tone.bg} p-3`}>
              <div className="flex items-center justify-between">  
                <span className={`text-[11px] font-black uppercase tracking-widest ${tone.text}`}>
                  {result.level.label}
                </span>
                <span className="font-mono text-[10px] text-haze">{result.score}/100</span>
              </div>
              <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-100">
                {result.verdictLine}
              </p>
            </div>

            <Anatomy parsed={result.parsed} tone={tone} />

            {result.hits.length > 0 && (
              <div className="space-y-2">
                {result.hits.map((h) => (  
                  <div
                    key={h.id}
                    className={`rounded-xl border p-2.5 ${
                      h.weight < 0
                        ? 'border-emerald-400/25 bg-emerald-500/[0.06]'
                        : 'border-rose-400/25 bg-rose-500/[0.06]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">  
                      <p
                        className={`text-[12px] font-semibold leading-tight ${  
                          h.weight < 0 ? 'text-emerald-200' : 'text-rose-200'
                        }`}
                      >
                        {h.label}
                      </p>
                      <span className="shrink-0 font-mono text-[9.5px] text-haze">  
                        {h.weight > 0 ? `+${h.weight}` : h.weight}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10.5px] leading-snug text-slate-400">{h.why}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!result && (
          <p className="pt-4 text-[11px] leading-relaxed text-haze">
            Nothing checked yet. Try the samples above — the “Fake SBI” and “Real SBI”
            pair is the whole lesson in two taps.
          </p>
        )}
      </div>
    </div>
  );  
}

function Anatomy({ parsed, tone }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
      <p className="panel-title">Where this actually goes</p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-0.5 font-mono text-[12px] leading-relaxed">
        <span className="text-slate-600">{parsed.scheme}://</span>
        {parsed.subdomain && <span className="text-slate-500">{parsed.subdomain}.</span>}
        <span
          className={`rounded px-1 font-bold ${tone.bg} ${tone.text} ring-1 ${tone.ring}`}
        >
          {parsed.registrable}
        </span>  
        <span className="break-all text-slate-600">{parsed.path}</span>
      </div>

      <div className="mt-2.5 space-y-1 text-[10.5px] leading-snug">
        {parsed.subdomain && (
          <p className="text-slate-500">
            <span className="font-mono text-slate-400">{parsed.subdomain}</span> — chosen
            freely by whoever owns the domain. Anyone can put any brand name here.
          </p>
        )}  
        <p className={tone.dim}>
          <span className="font-mono">{parsed.registrable}</span> — the real destination. 
          This is the only part that is registered and paid for.
        </p>
      </div>
    </div>
  );
}
