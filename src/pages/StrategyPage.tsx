import { FCC_WEIGHTS, HOT_TOPICS } from '../data/strategy'
import { motion } from 'framer-motion'

export default function StrategyPage() {
  // Sort weights descending
  const sortedWeights = Object.entries(FCC_WEIGHTS).sort(([, a], [, b]) => b - a)

  return (
    <div className="px-4 pt-4 pb-24">
      <header className="mb-6">
        <h1 className="font-display text-2xl tracking-wider text-teal">ESTRATÉGIA FCC</h1>
        <p className="font-body text-white/40 text-sm mt-1">Análise estratégica e prioridades</p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <span className="text-teal">#</span> PESO DO EDITAL
          </h2>
          <div className="flex flex-col gap-3">
            {sortedWeights.map(([subject, weight], index) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-display text-white/40">
                    {index + 1}°
                  </div>
                  <span className="font-body text-white capitalize">
                    {subject.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="font-mono text-teal bg-teal/10 px-2 py-1 rounded">
                  {(weight * 100).toFixed(0)}%
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">#</span> HOT TOPICS & ARMADILHAS
          </h2>
          <div className="grid gap-3">
            {HOT_TOPICS.map((topic, index) => {
              const [content, subject] = topic.split(' (')
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface/50 border border-border/50 rounded-xl p-4"
                >
                  <p className="font-body text-white/80 text-sm mb-2">{content}</p>
                  {subject && (
                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                      {subject.replace(')', '')}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
