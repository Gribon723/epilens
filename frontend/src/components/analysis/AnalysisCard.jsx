import { motion } from 'framer-motion'
import { useState } from 'react'
import { deleteAnalysis } from '../../api/analyses'

export default function AnalysisCard({ analysis, onDeleted, index = 0 }) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const countries = Array.isArray(analysis.countries) ? analysis.countries : []
  const created = new Date(analysis.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deleteAnalysis(analysis.id)
      onDeleted(analysis.id)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5
        hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        transition-colors duration-200 flex flex-col gap-3 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-white text-sm leading-snug line-clamp-2">
          {analysis.title}
        </h3>
        <span className="shrink-0 font-mono text-[10px] text-teal bg-teal/10 border border-teal/20 rounded-lg px-2 py-1 leading-none">
          {analysis.indicator_code}
        </span>
      </div>

      {/* Description */}
      {analysis.description && (
        <p className="font-sans text-slate-500 text-xs leading-relaxed line-clamp-2">
          {analysis.description}
        </p>
      )}

      {/* Country chips */}
      {countries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {countries.slice(0, 5).map(c => (
            <span key={c} className="font-mono text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
              {c}
            </span>
          ))}
          {countries.length > 5 && (
            <span className="font-mono text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
              +{countries.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Year range */}
      {analysis.year_start && (
        <p className="font-mono text-xs text-slate-600">
          {analysis.year_start} – {analysis.year_end}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.06]">
        <span className="font-mono text-xs text-slate-700">{created}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`font-sans text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50
            ${confirmDelete
              ? 'text-crimson border-crimson/30 bg-crimson/10 hover:bg-crimson/20'
              : 'text-slate-500 border-white/10 hover:text-crimson hover:border-crimson/20 hover:bg-crimson/5'}`}
        >
          {deleting ? 'Deleting…' : confirmDelete ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </motion.div>
  )
}
