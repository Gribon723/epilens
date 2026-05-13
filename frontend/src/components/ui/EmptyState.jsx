export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-slate-600">
          {icon}
        </div>
      )}
      <p className="font-display font-semibold text-slate-400 text-lg mb-2">{title}</p>
      {message && (
        <p className="font-sans text-slate-600 text-sm max-w-xs leading-relaxed">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
