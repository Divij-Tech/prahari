import { useState } from 'react';
import { buildIncidentReport } from '../lib/scamEngine.js';
import { narrateIncident } from '../lib/gemini.js';

export default function GuardianPanel({ alerts, result, transcript, caller, startedAt }) {  
    const [report, setReport] = useState(null);
    const [narrative, setNarrative] = useState(null);
    const [busy, setBusy] = useState(false);

    async function generate() {
        setBusy(true);
        const r = await buildIncidentReport({ transcript, result, caller, startedAt });
        setReport(r);   
        const n = await narrateIncident(r);
        setNarrative(n.text);
        setBusy(false);
    }

    function download() {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;  
        a.download = `${report.reportId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col gap-4">
            <section className="panel p-5">
                <span className="panel-title">Guardian Circle</span>

                <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-500/20 text-[12px] font-bold text-sky-300">
                        AS
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-100">Anjali Sharma</p>
                        <p className="text-[10px] text-haze">Daughter · Bengaluru · notify on high risk</p>
                    </div>
                    <span className="chip ml-auto border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
                        active
                    </span>
                </div> 

                <div className="mt-3 space-y-2">
                    {alerts.length === 0 ? (
                        <p className="text-[11px] leading-relaxed text-haze">
                            No alerts sent. Prahari notifies a guardian only when a coercion
                            pattern is confirmed — never for an ordinary call.
                        </p>
                    ) : (
                        alerts.map((a) => (
                            <article
                                key={a.id}
                                className="animate-rise rounded-xl border border-amber-400/30 bg-amber-500/[0.08] p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-200">
                                        <span className="size-1.5 rounded-full bg-amber-400 animate-breathe" />
                                        Alert delivered
                                    </p>
                                    <span className="font-mono text-[9.5px] text-amber-300/60">{a.time}</span>
                                </div>
                                <p className="mt-1.5 text-[11.5px] font-semibold leading-snug text-amber-50">
                                    “{headlineFor(a)}”  
                                </p>
                                <dl className="mt-2 space-y-0.5 font-mono text-[10px] text-amber-100/70">
                                    <div className="flex justify-between gap-2"> 
                                        <dt>caller</dt>
                                        <dd className="text-amber-100">{a.caller}</dd>
                                    </div> 
                                    <div className="flex justify-between gap-2">
                                        <dt>risk</dt>
                                        <dd className="text-amber-100">{a.score}/100</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>stages</dt>
                                        <dd className="truncate text-amber-100">{a.stages.join(' → ') || '—'}</dd>
                                    </div>  
                                </dl>
                                <p className="mt-2 rounded-lg bg-black/25 px-2 py-1.5 text-[10.5px] leading-snug text-amber-100/80"> 
                                    Suggested action sent to Anjali: <span className="font-semibold">call him now,
                                    do not text.</span> A scammer can talk over a message. They cannot talk over
                                    a ringing phone. 
                                </p>
                            </article>
                        ))
                    )}
                </div>
            </section>  

            <section className="panel p-5">
                <span className="panel-title">Forensic Incident Record</span>
                <p className="mt-1.5 text-[11px] leading-snug text-haze">
                    A filing-ready record of the offence, hashed for integrity. The first hour 
                    is when a fraudulent transfer can still be frozen.
                </p>

                {!report ? (
                    <button  
                        onClick={generate}
                        disabled={busy || result.hits.length === 0}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-[12px] font-bold text-slate-200 transition hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:text-slate-600"
                    >
                        {busy
                            ? 'Compiling…'
                            : result.hits.length === 0
                                ? 'Nothing to report yet'
                                : 'Generate incident record'}
                    </button>
                ) : (
                    <div className="animate-rise mt-3 space-y-2.5">
                        <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-slate-300">
                            <Row k="report id" v={report.reportId} />
                            <Row k="attack type" v={report.attackSignature} />
                            <Row k="classification" v={report.classification} /> 
                            <Row k="risk score" v={`${report.riskScore}/100`} />
                            <Row k="behaviours" v={report.detectedBehaviours.length} />
                            <Row k="stages" v={report.attackStagesObserved.join(', ') || '—'} />
                            <div className="mt-1.5 border-t border-white/10 pt-1.5">
                                <p className="text-slate-500">transcript sha-256</p>
                                <p className="break-all text-[9px] text-emerald-300/80">
                                    {report.transcriptSha256}
                                </p>
                            </div>
                        </div>

                        {narrative && (
                            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                                <p className="panel-title">Complaint summary</p>
                                <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
                                    {narrative}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={download}
                                className="rounded-xl border border-white/10 bg-white/[0.06] py-2 text-[11.5px] font-semibold text-slate-200 transition hover:bg-white/[0.11]"
                            >
                                Download JSON
                            </button>
                            <a
                                href="https://cybercrime.gov.in"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-sky-600 py-2 text-center text-[11.5px] font-semibold text-white transition hover:bg-sky-500"
                            >
                                File at cybercrime.gov.in 
                            </a>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

function headlineFor(alert) {
    switch (alert.signature?.id) {  
        case 'digital-arrest':
            return 'Dad may be on a digital arrest scam call right now.';
        case 'coercion':
            return 'Someone is pressuring Dad and telling him not to hang up.';
        case 'remote-access':
            return 'Dad is being asked to hand over control of his phone.';
        case 'impersonation':
            return 'Someone claiming to be a police officer is pressuring Dad.';
        case 'payment':
            return 'Dad is being pressured to send money right now.';
        default:
            return 'Dad may be on a fraudulent call right now.';
    }
}  

function Row({ k, v }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-slate-500">{k}</span>
            <span className="truncate text-slate-200">{v}</span>
        </div>  
    );
}
