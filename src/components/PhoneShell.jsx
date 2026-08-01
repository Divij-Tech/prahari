export default function PhoneShell({ children, tab, onTab, alarm }) {
  const tabs = [
    { id: 'call', label: 'Calls', icon: PhoneIcon },
    { id: 'messages', label: 'Inbox', icon: ChatIcon },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'investigator', label: 'Ask AI', icon: SparkIcon },
  ];

  return (
    <div
      className={`relative mx-auto w-full max-w-[352px] rounded-[2.6rem] border-[3px] p-2 transition-colors duration-500 ${
        alarm
          ? 'border-rose-500/70 shadow-[0_0_60px_-8px_rgba(244,63,94,0.55)]'
          : 'border-ink-700 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.95)]'
      } bg-ink-900`}
    >
      <div className="relative flex h-[688px] flex-col overflow-hidden rounded-[2.1rem] bg-ink-950">
        <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-1 text-[10.5px] font-medium text-slate-400">
          <span className="font-mono">9:41</span>
          <div className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1.5">
            <ShieldMini />
            <span className="tracking-tight">4G</span>
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>

        <nav className="relative z-20 grid grid-cols-4 gap-1 border-t border-white/[0.07] bg-ink-900/90 px-2 pb-3 pt-2 backdrop-blur">
          {tabs.map(({ id, label, icon: Icon }) => {
            const on = tab === id;
            return (  
              <button
                key={id}
                onClick={() => onTab(id)}  
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                  on ? 'text-sky-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon active={on} />
                <span className="text-[9.5px] font-semibold tracking-tight">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );  
}

function PhoneIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M6.6 3.5 8.9 8l-2 1.9a13 13 0 0 0 7.2 7.2l1.9-2 4.5 2.3-.6 3.1a2 2 0 0 1-2.2 1.6C10.4 21.2 2.8 13.6 2 5.3a2 2 0 0 1 1.6-2.2z" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon({ active }) {
  return (  
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" strokeLinejoin="round" />
    </svg>
  );   
}

function LinkIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1.8 1.8" strokeLinecap="round" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3.3 3.3a4 4 0 1 0 5.7 5.7l1.8-1.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z" strokeLinejoin="round" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldMini() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-emerald-400" fill="currentColor">
      <path d="M12 2 4 5.2v6c0 5 3.4 9.5 8 10.8 4.6-1.3 8-5.8 8-10.8v-6z" />
    </svg>
  );
}
