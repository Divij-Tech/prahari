import { useState } from 'react';
import { analyzeEmail } from '../lib/emailScanner.js';
import { toneOf } from '../lib/tone.js';

const SAMPLES = {
  phish: {
    label: 'Fake bank alert',
    from: 'State Bank of India <sbi.security.team@gmail.com>',
    replyTo: '',
    subject: 'URGENT: Your account will be suspended',
    body:
      'Dear Customer, your KYC verification has failed. Please confirm your account details by clicking the link below within 24 hours to avoid suspension.\n\nhttp://sbi-kyc-verify.online-update.in/login',
  },  
  bec: {
    label: 'Invoice fraud',
    from: 'Accounts Payable <finance@suppliers-invoice.info>',
    replyTo: 'payments@vendor-settlement.site',
    subject: 'Updated bank details for invoice 44120',
    body:
      'Please note our bank account details have changed. Kindly remit the outstanding payment to the new account provided in the attached invoice. Confirm once transferred.',
  },  
  genuine: {
    label: 'Real bank mail',
    from: 'State Bank of India <alerts@sbi.co.in>',
    replyTo: '',
    subject: 'Periodic KYC update due',
    body:
      'Your periodic KYC update is due. Please visit your nearest branch with original identity proof before 30 September. We will never ask for your details over email, phone or SMS.',
  },
};

export default function EmailScanner() {
  const [fields, setFields] = useState({ from: '', replyTo: '', subject: '', body: '' });
  const [checked, setChecked] = useState(null);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const snapshot = (f) => JSON.stringify([f.from, f.replyTo, f.subject, f.body]);

  function run(f) {
    setChecked({ of: snapshot(f), ...analyzeEmail(f) });
  }

  function load(sample) {
    const { label, ...rest } = sample;
    setFields(rest); 
    run(rest);
  }

  const result = checked && checked.of === snapshot(fields) ? checked : null;
  const tone = result ? toneOf(result.level.tone) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(SAMPLES).map(([key, s]) => (
          <button
            key={key}
            onClick={() => load(s)}
            className="chip border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1]"  
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-2.5 space-y-1.5">
        <Field label="From" value={fields.from} onChange={set('from')} placeholder="Name <address@domain>" mono />
        <Field label="Reply-To" value={fields.replyTo} onChange={set('replyTo')} placeholder="optional" mono />
        <Field label="Subject" value={fields.subject} onChange={set('subject')} placeholder="Subject line" />
        <textarea
          value={fields.body} 
          onChange={set('body')}
          rows={3}
          placeholder="Paste the email body…" 
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11px] leading-snug text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
        />
      </div>

      <button
        onClick={() => run(fields)}
        disabled={!fields.from.trim() && !fields.body.trim()}
        className="mt-2 rounded-xl bg-sky-600 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-sky-500 disabled:bg-white/[0.06] disabled:text-slate-600"
      >
        Check this email
      </button>

      <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pb-3">
        {result && (
          <>
            <div className={`animate-rise rounded-xl border ${tone.border} ${tone.bg} p-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase tracking-widest ${tone.text}`}>
                  {result.level.label}  
                </span>
                <span className="font-mono text-[10px] text-haze">{result.score}/100</span>
              </div>
              {result.sender.address && (
                <p className="mt-1.5 break-all font-mono text-[10.5px] text-slate-300">
                  from {result.sender.address}
                  <span className="text-haze"> · domain </span>
                  <span className="font-bold text-slate-100">{result.sender.registrable}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <Score label="sender" value={result.breakdown.headerScore} />
              <Score label="wording" value={result.breakdown.textScore} />
              <Score label="link" value={result.breakdown.urlScore} />
            </div> 
            {result.breakdown.corroborating >= 2 && (
              <p className="rounded-lg border border-rose-400/25 bg-rose-500/[0.07] px-2.5 py-1.5 text-[10.5px] leading-snug text-rose-200/90">
                <span className="font-semibold">Corroborated · </span>
                {result.breakdown.corroborating} independent checks flagged this separately.
                Agreement between them is stronger evidence than any one alone. 
              </p>
            )}

            {result.headerHits.map((h) => (
              <Finding key={h.id} hit={h} />
            ))}
            {result.textResult.hits.slice(0, 3).map((h) => (
              <Finding key={h.id} hit={h} />
            ))}
            {result.urlResult?.hits 
              ?.filter((h) => h.weight > 0)
              .slice(0, 2)  
              .map((h) => (
                <Finding key={`u-${h.id}`} hit={h} />
              ))}
          </>
        )}

        {!result && (
          <p className="pt-3 text-[11px] leading-relaxed text-haze">
            Load a sample or paste an email. The sender line usually settles it before the
            body is even read.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 focus-within:border-sky-400/50">
      <span className="w-14 shrink-0 text-[9.5px] font-bold uppercase tracking-wider text-haze">
        {label}
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck={false} 
        className={`min-w-0 flex-1 bg-transparent text-[11px] text-slate-100 placeholder:text-slate-600 focus:outline-none ${
          mono ? 'font-mono' : ''
        }`}
      />
    </label>
  );
}

function Score({ label, value }) {
  const tone = value >= 72 ? 'text-rose-300' : value >= 45 ? 'text-amber-300' : value >= 22 ? 'text-sky-300' : 'text-slate-400';
  return (
    <div className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-center">
      <p className={`text-[13px] font-bold ${tone}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-haze">{label}</p>
    </div>
  );
}

function Finding({ hit }) {
  const good = hit.weight < 0;
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        good
          ? 'border-emerald-400/25 bg-emerald-500/[0.06]'
          : 'border-rose-400/25 bg-rose-500/[0.06]'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p
          className={`text-[12px] font-semibold leading-tight ${
            good ? 'text-emerald-200' : 'text-rose-200'
          }`}
        >
          {hit.label}
        </p>
        <span className="shrink-0 font-mono text-[9.5px] text-haze">  
          {hit.weight > 0 ? `+${hit.weight}` : hit.weight}
        </span>  
      </div>
      {hit.evidence ? (
        <p className="mt-1 break-all border-l-2 border-white/10 pl-2 font-mono text-[10px] text-slate-400">
          {hit.evidence}
        </p>
      ) : null}
      <p className="mt-1.5 text-[10.5px] leading-snug text-slate-400">{hit.why}</p>
    </div>
  );
}
