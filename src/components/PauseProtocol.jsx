import { useEffect, useState } from 'react';

const CHECKS = [
   {
      id: 'hangup',  
      text: 'I have hung up and called the department myself, on a number I looked up independently.',
   },
   {
      id: 'family',  
      text: 'I have told at least one family member what I was just asked to do.',
   },
   {
      id: 'law',
      text: 'I understand that "digital arrest" does not exist in Indian law, and no agency collects money by phone.',
   },
];  

export default function PauseProtocol({ result, coolOff = 30, onDismiss, onAlertGuardian, guardianNotified }) {
   const [left, setLeft] = useState(coolOff);
   const [checked, setChecked] = useState({});

   useEffect(() => {
      if (left <= 0) return undefined;
      const t = setTimeout(() => setLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
   }, [left]);

   const allChecked = CHECKS.every((c) => checked[c.id]);
   const canProceed = left <= 0 && allChecked;
   const pct = ((coolOff - left) / coolOff) * 100;

   return (
      <div className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-[#5c0b1c]">
         <div className="animate-alarm px-5 pt-7 pb-5 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-white/15 ring-4 ring-white/20">
               <svg viewBox="0 0 24 24" className="size-8 text-white" fill="currentColor">
                  <path d="M12 2 1 21h22zm0 6 .9 7h-1.8zM12 17.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
               </svg>
            </div>
            <h2 className="mt-3 text-[26px] font-black leading-none tracking-tight text-white">
               STOP
            </h2>
            <p className="mt-1 text-[13px] font-bold text-rose-100">रुकिए — यह धोखाधड़ी है</p>  
            <p className="mt-2.5 text-[12px] font-medium leading-snug text-white/90">
               You are being pressured into sending money by someone impersonating an
               official. This is a crime in progress.
            </p>
         </div>

         <div className="flex-1 space-y-3 bg-[#3d0713] px-4 py-4">
            <div className="rounded-xl bg-white/[0.07] p-3">
               <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200/80">
                     Cooling-off period
                  </p>
                  <p className="font-mono text-lg font-bold text-white tabular-nums">
                     {left > 0 ? `0:${String(left).padStart(2, '0')}` : 'done'}
                  </p>
               </div>
               <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div  
                     className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear"
                     style={{ width: `${pct}%` }}
                  />  
               </div>
               <p className="mt-2 text-[10.5px] leading-snug text-rose-100/75">
                  Money sent by UPI cannot be recalled. Nothing you were told will become
                  untrue in the next {coolOff} seconds.
               </p>  
            </div>  

            <div className="grid grid-cols-2 gap-2">
               <a
                  href="tel:1930"
                  className="rounded-xl bg-white py-2.5 text-center text-[12px] font-bold text-[#5c0b1c] transition hover:bg-rose-50 active:scale-[0.97]"
               >
                  Call 1930  
                  <span className="block text-[9px] font-semibold opacity-70">Cyber helpline</span>
               </a>
               <button
                  onClick={onAlertGuardian}
                  disabled={guardianNotified}
                  className={`rounded-xl py-2.5 text-[12px] font-bold transition active:scale-[0.97] ${
              guardianNotified
                ? 'bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-300/40'
                : 'bg-amber-400 text-[#3d0713] hover:bg-amber-300' 
            }`}
               >
                  {guardianNotified ? 'Family alerted ✓' : 'Alert my family'}
                  <span className="block text-[9px] font-semibold opacity-70">
                     {guardianNotified ? 'Anjali is calling you' : 'Sends live context'}
                  </span>
               </button>
            </div>

            <div className="rounded-xl bg-white/[0.07] p-3">
               <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200/80">
                  Before you can continue  
               </p>
               <ul className="mt-2 space-y-2">
                  {CHECKS.map((c) => (  
                     <li key={c.id}>
                        <label className="flex cursor-pointer items-start gap-2.5">
                           <input
                              type="checkbox"
                              checked={Boolean(checked[c.id])}
                              onChange={(e) =>
                                 setChecked((prev) => ({ ...prev, [c.id]: e.target.checked }))
                              }
                              className="mt-0.5 size-4 shrink-0 accent-emerald-400"
                           />
                           <span className="text-[11px] leading-snug text-white/85">{c.text}</span>
                        </label>
                     </li>
                  ))}
               </ul>
            </div>

            {result?.hits?.length > 0 && (  
               <div className="rounded-xl bg-black/25 p-3"> 
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200/80">
                     What the caller actually did
                  </p> 
                  <ul className="mt-1.5 space-y-1">
                     {result.hits.slice(0, 4).map((h) => ( 
                        <li key={h.id} className="flex gap-1.5 text-[10.5px] leading-snug text-white/80">
                           <span className="text-rose-300">•</span>
                           {h.label}
                        </li>
                     ))}  
                  </ul>
               </div>
            )}

            <button 
               onClick={onDismiss}
               disabled={!canProceed}
               className={`w-full rounded-lg py-2 text-[11px] font-medium transition ${
            canProceed
              ? 'text-white/60 underline underline-offset-2 hover:text-white/90'
              : 'cursor-not-allowed text-white/25' 
          }`}
            >
               {left > 0
                  ? `Dismiss available in ${left}s`
                  : allChecked
                     ? 'I have verified everything — dismiss this warning'
                     : 'Tick all three boxes to dismiss'}
            </button>
         </div>
      </div>
   );
}
