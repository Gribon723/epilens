import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: 'easeOut', delay },
})

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Trend Analysis',
    desc: 'Detect rising and falling patterns across decades of WHO data with linear regression and 5-year projections.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="7" cy="17" r="2" />
        <circle cx="12" cy="10" r="2" />
        <circle cx="17" cy="6" r="2" />
        <circle cx="9" cy="14" r="1.5" />
        <circle cx="14" cy="8" r="1.5" />
      </svg>
    ),
    title: 'Correlation',
    desc: 'Find statistically significant relationships between any two indicators across 194 countries.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: 'Anomaly Detection',
    desc: 'Surface unexpected spikes and drops using rolling baseline windows that catch what the eye misses.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <line x1="7" y1="7" x2="10" y2="10" />
        <line x1="17" y1="7" x2="14" y2="10" />
        <line x1="7" y1="17" x2="10" y2="14" />
        <line x1="17" y1="17" x2="14" y2="14" />
      </svg>
    ),
    title: 'Country Clustering',
    desc: 'Group nations by epidemiological similarity using K-Means to reveal hidden geographic patterns.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Burden Index',
    desc: 'Combine multiple indicators into a single normalised score to rank countries by overall disease burden.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'PDF Reports',
    desc: 'Export any analysis as a publication-ready PDF with chart, statistics table, annotations, and WHO attribution.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy overflow-x-hidden">

      {/* ── Top nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-navy/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-teal">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="font-display font-bold text-xl text-white tracking-wide">EpiLens</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-sans text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-sans font-medium bg-teal text-navy px-4 py-2 rounded-lg hover:bg-teal/90 transition-colors shadow-[0_0_16px_rgba(0,212,170,0.3)]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-teal/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-teal/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-crimson/[0.06] blur-3xl pointer-events-none" />

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-10 shrink-0"
        >
          <div className="w-52 h-52 md:w-64 md:h-64 rounded-full border border-teal/20 flex items-center justify-center
            shadow-[0_0_80px_rgba(0,212,170,0.12)] bg-white/[0.02] backdrop-blur-sm">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border border-teal/15 flex items-center justify-center bg-teal/5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-teal/10 border border-teal/25 flex items-center justify-center
                shadow-[0_0_24px_rgba(0,212,170,0.2)]">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-teal">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
                  <ellipse cx="12" cy="12" rx="4.5" ry="10" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="5" y1="6.5" x2="19" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="5" y1="17.5" x2="19" y2="17.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
          {/* Pulsing dots representing data points */}
          {[
            { top: '12%', left: '22%' },
            { top: '35%', left: '8%' },
            { top: '60%', left: '18%' },
            { top: '20%', right: '15%' },
            { top: '55%', right: '10%' },
            { bottom: '15%', left: '35%' },
          ].map((style, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-teal shadow-[0_0_8px_#00d4aa] animate-pulse"
              style={{ ...style, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </motion.div>

        {/* Headline */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            <span className="text-xs font-mono text-teal tracking-widest uppercase">WHO Global Health Observatory</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-5">
            See the patterns.<br />
            <span className="text-teal">Understand the world.</span>
          </h1>

          <p className="font-sans text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            EpiLens transforms WHO data into interactive analyses -- trend projections, anomaly alerts,
            country clusters, and publication-ready PDF reports. Built for epidemiologists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto font-display font-bold text-navy bg-teal px-8 py-3.5 rounded-xl
                hover:bg-teal/90 transition-all shadow-[0_0_24px_rgba(0,212,170,0.35)] hover:shadow-[0_0_32px_rgba(0,212,170,0.5)]"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto font-sans text-slate-300 border border-white/10 px-8 py-3.5 rounded-xl
                hover:border-white/20 hover:text-white transition-all bg-white/[0.03] backdrop-blur-sm"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 animate-bounce">
          <span className="text-xs font-mono">scroll</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-white/10 bg-white/[0.02] py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '2 000+', label: 'Indicators' },
            { value: '194', label: 'Countries' },
            { value: '5', label: 'Analysis types' },
            { value: '24 h', label: 'Data cache' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-mono font-medium text-2xl md:text-3xl text-teal mb-1">{value}</p>
              <p className="font-sans text-slate-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
            Every tool an epidemiologist needs
          </h2>
          <p className="font-sans text-slate-400 max-w-xl mx-auto">
            Six analysis modules, one coherent platform. No Python required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              {...fadeUp(i * 0.07)}
              className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6
                hover:border-teal/30 hover:bg-teal/[0.04] hover:shadow-[0_0_24px_rgba(0,212,170,0.08)]
                transition-all duration-200"
            >
              <div className="text-teal mb-4 w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center
                group-hover:shadow-[0_0_12px_rgba(0,212,170,0.25)] transition-all">
                {icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">{title}</h3>
              <p className="font-sans text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-3xl p-10 md:p-14
          shadow-[0_0_60px_rgba(0,212,170,0.06)]">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to see what the data says?
          </h2>
          <p className="font-sans text-slate-400 mb-8 text-lg">
            Create a free account and start your first analysis in under two minutes.
          </p>
          <Link
            to="/register"
            className="inline-block font-display font-bold text-navy bg-teal px-10 py-4 rounded-xl text-lg
              hover:bg-teal/90 transition-all shadow-[0_0_24px_rgba(0,212,170,0.35)]"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-8 px-6 text-center">
        <p className="font-sans text-slate-600 text-sm">
          Data sourced from the{' '}
          <a
            href="https://www.who.int/data/gho"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-teal transition-colors"
          >
            WHO Global Health Observatory
          </a>
          . EpiLens is an independent research tool.
        </p>
      </footer>
    </div>
  )
}
