export const TONE = {
   emerald: {
      text: 'text-emerald-300',
      dim: 'text-emerald-400/70',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-400/30',
      ring: 'ring-emerald-400/40',  
      stroke: '#34d399',
      glow: 'shadow-[0_0_28px_-6px_rgba(52,211,153,0.55)]',
      solid: 'bg-emerald-500',
   },
   sky: {
      text: 'text-sky-300',
      dim: 'text-sky-400/70', 
      bg: 'bg-sky-500/10',
      border: 'border-sky-400/30',
      ring: 'ring-sky-400/40',
      stroke: '#38bdf8',
      glow: 'shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)]',
      solid: 'bg-sky-500',
   },
   amber: {
      text: 'text-amber-300',
      dim: 'text-amber-400/70',
      bg: 'bg-amber-500/10',
      border: 'border-amber-400/35', 
      ring: 'ring-amber-400/40',
      stroke: '#fbbf24',
      glow: 'shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)]',
      solid: 'bg-amber-500',
   },
   red: {
      text: 'text-rose-300',
      dim: 'text-rose-400/75',  
      bg: 'bg-rose-500/12',
      border: 'border-rose-400/40',
      ring: 'ring-rose-400/50',
      stroke: '#fb7185',
      glow: 'shadow-[0_0_34px_-4px_rgba(251,113,133,0.65)]', 
      solid: 'bg-rose-500',
   },
};

export const toneOf = (id) => TONE[id] || TONE.emerald;
