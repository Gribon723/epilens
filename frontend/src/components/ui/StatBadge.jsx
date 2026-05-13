import { motion } from 'framer-motion'

export default function StatBadge({ label, value, highlight = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut', delay }}
      className={`bg-white/[0.04] border rounded-xl px-4 py-3 transition-colors
        ${highlight
          ? 'border-teal/30 shadow-[0_0_14px_rgba(0,212,170,0.12)]'
          : 'border-white/10'}`}
    >
      <p className="text-xs font-sans text-slate-500 mb-1 leading-none">{label}</p>
      <p className={`font-mono font-medium text-base leading-tight
        ${highlight ? 'text-teal' : 'text-slate-100'}`}>
        {value}
      </p>
    </motion.div>
  )
}
