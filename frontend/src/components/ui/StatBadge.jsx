export default function StatBadge({ label, value, highlight = false }) {
  return (
    <div className={`bg-white/[0.04] border rounded-xl px-4 py-3 transition-all
      ${highlight
        ? 'border-teal/30 shadow-[0_0_12px_rgba(0,212,170,0.1)]'
        : 'border-white/10'}`}
    >
      <p className="text-xs font-sans text-slate-500 mb-1 leading-none">{label}</p>
      <p className={`font-mono font-medium text-base leading-tight
        ${highlight ? 'text-teal' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  )
}
