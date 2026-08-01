import { useEffect, useRef, useState } from 'react';
import { askInvestigator } from '../lib/gemini.js';

const STARTERS = [
   'Is “digital arrest” a real thing?',
   'A man says he is from CBI. How do I check?',  
   'They already have my Aadhaar number. Am I in danger?',
   'I sent money an hour ago. What do I do?',
];

export default function Investigator({ context }) {
   const [messages, setMessages] = useState([
      {
         role: 'ai',
         text:
            'I can help you check whether a call, message or website is genuine.\n\nAsk me anything — there is no such thing as a silly question here, and I will never ask you for an OTP, PIN or account number.',
      },
   ]); 
   const [input, setInput] = useState('');
   const [busy, setBusy] = useState(false);
   const endRef = useRef(null);

   useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages, busy]);

   async function send(q) {
      const question = (q ?? input).trim();
      if (!question || busy) return; 
      setInput('');
      setMessages((m) => [...m, { role: 'user', text: question }]);
      setBusy(true);
      const { text, source } = await askInvestigator(question, context);
      setMessages((m) => [...m, { role: 'ai', text, source }]);
      setBusy(false);
   }

   return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
         <h2 className="text-[15px] font-bold text-slate-100">AI Scam Investigator</h2>
         <p className="mt-0.5 text-[10.5px] leading-snug text-haze">
            Plain answers about anything suspicious.
         </p>  

         <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                     className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[11.5px] leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-md bg-sky-600/30 text-sky-50'
                  : 'rounded-bl-md border border-white/[0.08] bg-white/[0.045] text-slate-200'
              }`}
                  >
                     {m.text}
                     {m.source === 'fallback' && (
                        <span className="mt-1 block font-mono text-[9px] text-amber-400/70">
                           offline answer
                        </span> 
                     )}
                  </div>
               </div>
            ))}

            {busy && (
               <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.045] px-3 py-2.5">
                     {[0, 1, 2].map((i) => (
                        <span
                           key={i}
                           className="size-1.5 rounded-full bg-slate-400 animate-breathe"
                           style={{ animationDelay: `${i * 0.18}s` }}
                        />
                     ))}
                  </div>
               </div>
            )}
            <div ref={endRef} />
         </div>

         {messages.length <= 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
               {STARTERS.map((s) => (
                  <button
                     key={s}  
                     onClick={() => send(s)}
                     className="chip border-white/10 bg-white/[0.05] text-left text-slate-300 transition hover:bg-white/[0.1]"
                  >  
                     {s}
                  </button>
               ))}
            </div>
         )}

         <form
            onSubmit={(e) => {
               e.preventDefault();
               send();  
            }}
            className="mt-2 mb-3 flex gap-2"
         >
            <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask anything…"
               className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11.5px] text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
            />
            <button
               type="submit"
               disabled={busy || !input.trim()}
               className="rounded-xl bg-sky-600 px-3.5 text-[12px] font-bold text-white transition hover:bg-sky-500 disabled:bg-white/[0.06] disabled:text-slate-600"
            >
               Ask
            </button>
         </form>
      </div>  
   );
}
