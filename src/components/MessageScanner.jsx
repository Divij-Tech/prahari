import { useState } from 'react';
import { analyze } from '../lib/scamEngine.js';
import { analyseMessage } from '../lib/gemini.js';
import { worstUrlIn } from '../lib/urlScanner.js';
import { SAMPLE_MESSAGES } from '../lib/scenarios.js';
import EmailScanner from './EmailScanner.jsx';

export default function MessageScanner({ onResult }) {  
    const [mode, setMode] = useState('sms');
    const [text, setText] = useState('');
    const [checked, setChecked] = useState(null);
    const [busy, setBusy] = useState(false);

    const verdict = checked && checked.of === text.trim() ? checked : null;

    async function run(input) {
        const value = (input ?? text).trim();  
        if (!value) return; 
        setBusy(true);
        setChecked(null);

        const local = analyze(value, { mode: 'message' });

        const url = worstUrlIn(value);
        const merged = url && url.score > local.score
            ? { ...local, score: url.score, level: local.level }  
            : local;
        onResult?.(merged);

        const out = await analyseMessage(value, local);
        setChecked({ of: value, ...out, local, url });
        setBusy(false);
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
            <h2 className="text-[15px] font-bold text-slate-100">
                {mode === 'sms' ? 'Message Scanner' : 'Email Scanner'}
            </h2>
            <p className="mt-0.5 text-[10.5px] leading-snug text-haze">
                {mode === 'sms'
                    ? 'Paste any SMS or WhatsApp message. Prahari explains why it is or is not safe.'
                    : 'Sender, wording and links are checked separately, then compared.'}
            </p>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-white/[0.04] p-1">  
                {[
                    { id: 'sms', label: 'SMS / WhatsApp' },
                    { id: 'email', label: 'Email' },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
              mode === m.id ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'
            }`}
                    >
                        {m.label}  
                    </button>
                ))}
            </div>

            {mode === 'email' && <EmailScanner />}

            {mode === 'sms' && (  
                <>
            <div className="mt-3 flex flex-wrap gap-1.5">
                {SAMPLE_MESSAGES.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => {
                            setText(m.text);
                            run(m.text);
                        }}
                        className="chip border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1]"
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <textarea
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the message here…"
                rows={4}
                className="mt-2.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-[11.5px] leading-snug text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
            />

            <button
                onClick={() => run()}
                disabled={busy || !text.trim()}
                className="mt-2 rounded-xl bg-sky-600 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-sky-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-600"
            >
                {busy ? 'Analysing…' : 'Check this message'} 
            </button>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-3">  
                {busy && <Skeleton />}
                {verdict && !busy && <Verdict v={verdict} />}
            </div>
                </>
            )} 
        </div>
    );
}

function Verdict({ v }) {
    const map = {
        SCAM: {
            cls: 'border-rose-400/40 bg-rose-500/12 text-rose-200',
            label: 'Scam',
        },
        SUSPICIOUS: {
            cls: 'border-amber-400/40 bg-amber-500/12 text-amber-200',
            label: 'Suspicious',
        },
        LIKELY_GENUINE: {
            cls: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200',  
            label: 'Looks genuine',
        },
    };
    const style = map[v.verdict] || map.SUSPICIOUS;

    return (
        <div className="animate-rise space-y-2.5">
            <div className={`rounded-xl border p-3 ${style.cls}`}>
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest">{style.label}</span>
                    <span className="font-mono text-[10px] opacity-70">{Math.round(v.confidence)}% conf</span>
                </div>  
                <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-white">{v.headline}</p>
                {v.hindi && <p className="mt-1 text-[11px] leading-snug opacity-80">{v.hindi}</p>}  
            </div>

            {v.url?.ok && v.url.score >= 22 && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/[0.08] p-3">  
                    <p className="panel-title">Link inside this message</p>
                    <p className="mt-1.5 break-all font-mono text-[10.5px] text-slate-300">
                        {v.url.parsed.subdomain && (  
                            <span className="text-slate-600">{v.url.parsed.subdomain}.</span>
                        )}
                        <span className="font-bold text-rose-200">{v.url.parsed.registrable}</span>
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-slate-300">{v.url.verdictLine}</p>
                </div>
            )}

            {v.redFlags?.length > 0 && (
                <Block title="Why it looks this way">
                    {v.redFlags.map((f, i) => (
                        <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-slate-300">
                            <span className="text-rose-400">•</span>
                            {f}
                        </li>
                    ))}
                </Block> 
            )}

            {v.whatToDo?.length > 0 && (
                <Block title="What to do now">
                    {v.whatToDo.map((f, i) => (
                        <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-slate-300">
                            <span className="font-mono text-sky-400">{i + 1}.</span>
                            {f}
                        </li>
                    ))}
                </Block>  
            )}

            <p className="text-center font-mono text-[9.5px] text-slate-600">
                analysis: {v.source} · on-device score {v.local.score}/100
            </p>
        </div>
    );
}

function Block({ title, children }) {
    return (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="panel-title">{title}</p>
            <ul className="mt-1.5 space-y-1.5">{children}</ul>
        </div>
    );  
}  

function Skeleton() {
    return (
        <div className="space-y-2">
            {[0, 1, 2].map((i) => (
                <div
                    key={i} 
                    className="relative h-12 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]"
                >
                    <div className="animate-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>
            ))}
        </div>
    );
}
