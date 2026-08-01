import { useEffect, useRef } from 'react';
import { analyze } from '../lib/scamEngine.js';
import { toneOf } from '../lib/tone.js';

export default function CallScreen({
   active,
   caller,
   callerLabel,
   lines,
   interim,
   userInterim,
   result,
   seconds, 
   simulation,
   liveState,
   onEnd, 
}) {
   const feedRef = useRef(null);  
   const tone = toneOf(result.level.tone);

   useEffect(() => {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
   }, [lines.length, interim, userInterim]);

   if (!active) return <IdleScreen />; 

   const alert = result.score >= 22;  

   return (
      <div className="flex min-h-0 flex-1 flex-col">
         {simulation && (
            <div className="flex items-center justify-center gap-2 bg-fuchsia-500/15 py-1 text-[9.5px] font-bold uppercase tracking-widest text-fuchsia-200">
               <span className="size-1.5 rounded-full bg-fuchsia-400 animate-breathe" />
               Simulation · AI caller
            </div>
         )}

         <div className="px-5 pt-4 pb-3 text-center">
            <div
               className={`mx-auto grid size-14 place-items-center rounded-full text-lg font-bold ${
            result.score >= 45 ? 'bg-rose-500/20 text-rose-300 animate-ring' : 'bg-white/[0.07] text-slate-300'
          }`}
            >
               {result.score >= 45 ? '!' : '?'}
            </div>
            <p className="mt-2 font-mono text-[13px] font-semibold tracking-tight text-slate-100">
               {caller}
            </p>
            <p className="text-[10.5px] text-haze">{callerLabel}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">{fmt(seconds)}</p>
         </div>

         {alert && (  
            <div
               className={`animate-rise mx-3 mb-2 rounded-xl border px-3 py-2 ${tone.border} ${
            result.score >= 72 ? 'animate-alarm text-white' : `${tone.bg} ${tone.text}`
          }`}
            >
               <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide">
                  <WarnIcon /> {result.signature?.label ?? result.level.label}
               </p>
               <p className="mt-0.5 text-[11px] leading-snug text-white/85">{result.level.action}</p>
            </div>
         )}

         <div ref={feedRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-2">
            {lines.length === 0 && !interim && !userInterim && (
               <p className="px-2 pt-6 text-center text-[11px] leading-relaxed text-haze">
                  {liveState === 'connecting'
                     ? 'Connecting to the simulated caller…'
                     : 'Connected. The caller will speak first — answer out loud.'}
               </p>
            )}

            {lines.map((line, i) => (
               <Bubble key={i} line={line} />
            ))}

            {interim && (
               <div className="ml-1 max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.04] px-3 py-2">
                  <p className="text-[11.5px] leading-snug text-slate-400 italic">{interim}</p>
               </div>
            )}

            {userInterim && (
               <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-sky-600/15 px-3 py-2">
                     <p className="text-[11.5px] leading-snug text-sky-200/70 italic">{userInterim}</p>
                  </div>
               </div>
            )}
         </div>

         <div className="flex items-center justify-center gap-3 border-t border-white/[0.06] px-5 py-3">
            {simulation && <LiveStatus state={liveState} />}
            <button
               onClick={onEnd}
               className="rounded-full bg-rose-600 px-5 py-2 text-[12px] font-bold text-white transition hover:bg-rose-500 active:scale-95"
            >
               End call
            </button>
         </div>
      </div>
   );
}

function Bubble({ line }) {
   const mine = line.s === 'you';

   const local = mine ? null : analyze(line.t);
   const hot = local && local.hits.length > 0;

   return (
      <div className={`animate-rise flex ${mine ? 'justify-end' : 'justify-start'}`}>
         <div
            className={`max-w-[86%] rounded-2xl px-3 py-2 ${
          mine
            ? 'rounded-br-md bg-sky-600/25 text-sky-50'
            : hot
              ? 'rounded-bl-md border border-rose-400/40 bg-rose-500/[0.13] text-rose-50'
              : 'rounded-bl-md bg-white/[0.055] text-slate-200'
        }`}
         >
            <p className="text-[11.5px] leading-snug">{line.t}</p>
            {hot && (
               <p className="mt-1 flex flex-wrap gap-1">
                  {local.hits.slice(0, 2).map((h) => (
                     <span
                        key={h.id}
                        className="chip border-rose-400/40 bg-rose-500/20 text-[9px] text-rose-200"
                     >
                        {h.label}
                     </span>
                  ))}
               </p>
            )}
         </div>
      </div>
   );
} 

function LiveStatus({ state }) {
   const map = {
      connecting: ['border-slate-400/30 bg-white/[0.05] text-slate-300', 'connecting'],  
      listening: ['border-emerald-400/30 bg-emerald-500/10 text-emerald-300', 'your turn'], 
      speaking: ['border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300', 'caller speaking'],
      closed: ['border-slate-400/20 bg-white/[0.04] text-slate-500', 'ended'],  
   };
   const [cls, label] = map[state] || map.connecting;
   return ( 
      <span className={`chip ${cls}`}>
         <span className="size-1.5 rounded-full bg-current animate-breathe" />
         {label}
      </span>
   );
}

function IdleScreen() {
   return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">  
         <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/25">
            <svg viewBox="0 0 24 24" className="size-8 text-emerald-400" fill="currentColor">
               <path d="M12 2 4 5.2v6c0 5 3.4 9.5 8 10.8 4.6-1.3 8-5.8 8-10.8v-6z" />
            </svg>
         </div>
         <p className="mt-4 text-[15px] font-semibold text-slate-100">Prahari is on guard</p>
         <p className="mt-1.5 text-[11.5px] leading-relaxed text-haze">
            Calls and messages are analysed on this device. Nothing is uploaded, nothing
            is recorded to storage.
         </p>
         <p className="mt-5 rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-slate-400"> 
            engine: on-device · v0.1
         </p>
      </div>
   );
} 

function WarnIcon() {
   return (
      <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
         <path d="M12 2 1 21h22zm0 6 .9 7h-1.8zM12 17.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
      </svg> 
   );
}

function fmt(s) {
   const m = Math.floor(s / 60);
   return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
