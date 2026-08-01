import { STAGES, STAGE_ORDER } from '../lib/patterns.js';
import { toneOf } from '../lib/tone.js';

export default function AnalysisPanel({ result, active }) {
    const tone = toneOf(result.level.tone);

    return (
        <div className="flex flex-col gap-4">
            <RiskGauge result={result} active={active} />
            <KillChain result={result} />
            <SignalFeed result={result} tone={tone} />
        </div>
    );
}  

function RiskGauge({ result, active }) {
    const tone = toneOf(result.level.tone); 
    const R = 62;
    const CIRC = Math.PI * R; 
    const filled = (result.score / 100) * CIRC;  

    return (
        <section className={`panel p-5 ${result.score >= 72 ? tone.glow : ''}`}>  
            <div className="flex items-center justify-between">
                <span className="panel-title">Live Risk Assessment</span>
                {active && (
                    <span className="chip bg-white/5 border-white/10 text-haze">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-breathe" />
                        on-device
                    </span>
                )}
            </div>

            <div className="relative mt-3 flex justify-center">
                <svg viewBox="0 0 160 92" className="w-full max-w-[230px]">
                    <path
                        d="M 18 82 A 62 62 0 0 1 142 82"
                        fill="none"
                        stroke="rgba(139,152,178,0.16)"
                        strokeWidth="11"
                        strokeLinecap="round"  
                    />
                    <path
                        d="M 18 82 A 62 62 0 0 1 142 82"
                        fill="none"
                        stroke={tone.stroke}
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={`${filled} ${CIRC}`}
                        style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.22,1,0.36,1), stroke 400ms' }}
                    />
                    <text
                        x="80" 
                        y="70"
                        textAnchor="middle"
                        className="fill-white font-bold"
                        style={{ fontSize: 30, fontVariantNumeric: 'tabular-nums' }} 
                    >
                        {result.score}
                    </text>
                    <text x="80" y="86" textAnchor="middle" fill="#8a97b0" style={{ fontSize: 9 }}>
                        RISK SCORE
                    </text>
                </svg>
            </div>

            <div className={`mt-1 rounded-xl border ${tone.border} ${tone.bg} px-3 py-2.5 text-center`}>
                <p className={`text-sm font-bold tracking-wide ${tone.text}`}>
                    {result.signature?.label ?? result.level.label}
                </p>
                <p className="mt-0.5 text-[11px] text-haze">
                    {result.signature?.hi ?? result.level.hi}
                </p>
                {result.signature && (
                    <p className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${tone.dim}`}>
                        {result.level.label}
                    </p>
                )}  
                <p className="mt-1.5 text-[11.5px] leading-snug text-slate-300">{result.level.action}</p>
            </div>

            {result.hits.length > 0 && (
                <dl className="mt-3 grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                    <Stat label="signals" value={result.hits.length} />
                    <Stat label="stages" value={`${result.stagesSeen.length}/5`} />
                    <Stat label="boost" value={`${result.breakdown.multiplier.toFixed(2)}×`} />
                </dl>
            )}
        </section>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-center">
            <dd className="text-xs font-semibold text-slate-200">{value}</dd>
            <dt className="text-[9px] uppercase tracking-wider text-haze">{label}</dt>
        </div>
    );
}

function KillChain({ result }) {  
    return (
        <section className="panel p-5">
            <span className="panel-title">Attack Stages Observed</span>
            <p className="mt-1.5 text-[11px] leading-snug text-haze">
                Any one stage can be innocent. Prahari scores how many appear together —
                that combination is what has no honest explanation.
            </p>

            <ol className="mt-3 space-y-1.5">
                {STAGE_ORDER.map((id, i) => {
                    const stage = STAGES[id];
                    const seen = Boolean(result.stages[id]);
                    return (
                        <li
                            key={id}
                            className={`flex items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-all duration-500 ${
                seen
                  ? 'border-rose-400/35 bg-rose-500/10'
                  : 'border-white/[0.07] bg-white/[0.015]'
              }`}
                        >
                            <span
                                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold ${
                  seen ? 'bg-rose-500 text-white' : 'bg-white/[0.06] text-haze'
                }`}
                            >
                                {seen ? '!' : i + 1}
                            </span>
                            <div className="min-w-0">
                                <p  
                                    className={`text-[12px] font-semibold leading-tight ${
                    seen ? 'text-rose-200' : 'text-slate-400'
                  }`}
                                >
                                    {stage.label}
                                    <span className="ml-1.5 font-normal text-haze">{stage.hi}</span>
                                </p>
                                {seen && (
                                    <p className="mt-0.5 text-[10.5px] leading-snug text-rose-200/70">{stage.blurb}</p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            {result.combos.length > 0 && (
                <div className="mt-3 space-y-1.5">
                    {result.combos.map((c) => (  
                        <p
                            key={c.stages.join('-')}
                            className="rounded-lg border border-rose-400/25 bg-rose-500/[0.07] px-2.5 py-1.5 text-[10.5px] leading-snug text-rose-200/90"  
                        >
                            <span className="font-semibold">Combination flag · </span>
                            {c.note}
                        </p>
                    ))}
                </div>
            )}
        </section>
    );
}

function SignalFeed({ result, tone }) {
    const empty = result.hits.length === 0 && result.trustHits.length === 0;

    return (
        <section className="panel flex min-h-0 flex-1 flex-col p-5">
            <div className="flex items-center justify-between">
                <span className="panel-title">Detected Signals</span>
                {result.hits.length > 0 && (
                    <span className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
                        {result.hits.length}
                    </span>
                )}
            </div>

            {empty ? ( 
                <p className="mt-4 text-[11.5px] leading-relaxed text-haze">
                    Nothing flagged yet. Start a call or paste a message and detections will
                    appear here with the exact words that triggered them.
                </p>
            ) : (
                <ul className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1"> 
                    {result.hits.map((hit) => (
                        <li
                            key={hit.id}
                            className="animate-rise rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-2.5"
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-[12px] font-semibold leading-tight text-rose-200">{hit.label}</p>
                                <span className="shrink-0 font-mono text-[9.5px] text-rose-300/60">
                                    +{hit.weight}  
                                </span>
                            </div>
                            {hit.evidence && (
                                <p className="mt-1.5 border-l-2 border-rose-400/40 pl-2 text-[10.5px] italic leading-snug text-slate-300">
                                    “{hit.evidence}”
                                </p>
                            )}
                            <p className="mt-1.5 text-[10.5px] leading-snug text-slate-400">{hit.why}</p>
                        </li>
                    ))}

                    {result.trustHits.map((t) => (  
                        <li
                            key={t.id}
                            className="animate-rise rounded-lg border border-emerald-400/25 bg-emerald-500/[0.06] p-2.5"
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-[12px] font-semibold leading-tight text-emerald-200">
                                    {t.label}
                                </p>
                                <span className="shrink-0 font-mono text-[9.5px] text-emerald-300/60">
                                    {t.weight}
                                </span>
                            </div>
                            <p className="mt-1 text-[10.5px] leading-snug text-emerald-200/60">
                                Genuine-caller behaviour. This lowers the risk score.
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
