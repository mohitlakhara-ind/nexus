import { motion } from 'framer-motion';
import { Target, GitBranch, Lightbulb, ArrowRight, Zap, Sparkles } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "NUCLEUS DEFINITION",
    desc: "Establish a central root node that anchor your entire problem-solving architecture. Clarity starts at the core.",
    icon: Target,
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    iconColor: "text-primary",
    label: "PROBLEM_NODE"
  },
  {
    num: "02",
    title: "CONTEXT EXPANSION",
    desc: "Synthesize cause-and-effect relationships. Branch out into high-fidelity context nodes with real-time swarm intelligence.",
    icon: GitBranch,
    color: "from-secondary/20 to-secondary/5",
    border: "border-secondary/30",
    iconColor: "text-secondary",
    label: "ROOT_CAUSE"
  },
  {
    num: "03",
    title: "SOLUTION SYNTHESIS",
    desc: "Engineer actionable solution nodes directly to root causes. Transform a tree of ideas into a tactical execution roadmap.",
    icon: Lightbulb,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    label: "SOLUTION_EXEC"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-40 relative overflow-hidden" id="how-it-works">
      {/* Background Grid & FX */}
      <div className="absolute inset-0 dot-grid opacity-[0.15] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-main/5 border border-border mb-8 shadow-inner"
          >
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Protocol Overview</span>
          </motion.div>
          <h2 className="text-4xl md:text-7xl font-display font-extrabold mb-8 tracking-tighter text-main uppercase italic text-center">
              SIMPLE MAPPING <span className="text-primary">PROCESS.</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto font-medium leading-relaxed text-center">
              Nexus turns complexity into clarity. Our four-step workflow ensures your team stays aligned from first thought to final execution.
          </p>
        </div>

        <div className="relative">
          {/* Central Connecting Vector */}
          <div className="hidden lg:block absolute top-[120px] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                  <div className={`h-full glass-card border-border rounded-[48px] p-10 hover:border-primary/20 transition-all duration-700 shadow-2xl flex flex-col group`}>
                    <div className="flex items-start justify-between mb-12">
                      <div className="text-6xl md:text-8xl font-display font-black text-main/5 group-hover:text-main/10 transition-colors pointer-events-none select-none italic">
                        0{idx + 1}
                      </div>
                      <div className={`w-20 h-20 rounded-3xl bg-main/5 flex items-center justify-center border border-border group-hover:scale-110 group-hover:border-primary/40 transition-all duration-700 shadow-inner overflow-hidden relative`}>
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Icon size={32} className="text-main group-hover:text-primary transition-colors relative z-10" />
                        <Sparkles size={12} className="absolute bottom-3 right-3 text-main/20 group-hover:text-main/60 transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-display font-extrabold text-main mb-6 uppercase tracking-tight group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-muted font-medium text-lg leading-relaxed mb-12 flex-grow">{step.desc}</p>

                    <div className="pt-8 border-t border-border mt-auto">
                        <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-4 text-center">Protocol Identity</div>
                        <div className={`w-full py-4 px-6 rounded-2xl border ${step.border} bg-main/5 flex items-center justify-between group-hover:bg-main/10 transition-all duration-500 relative overflow-hidden shadow-inner`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${step.accent.split(' ')[0]}`} />
                            <span className="text-[10px] font-bold text-main flex items-center gap-3 uppercase tracking-widest relative z-10">
                                <Activity size={12} className={step.accent} />
                                Active Node
                            </span>
                            <div className="size-2 rounded-full bg-emerald-500 shadow-md animate-pulse" />
                        </div>
                    </div>
                  </div>
              </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 pt-16 border-t border-border flex flex-col items-center text-center"
          >
            <p className="text-muted font-bold text-[10px] uppercase tracking-[0.4em] mb-8">Ready to initiate?</p>
            <div className="flex gap-4">
                <div className="size-1 rounded-full bg-primary animate-pulse" />
                <div className="size-1 rounded-full bg-secondary animate-pulse [animation-delay:200ms]" />
                <div className="size-1 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
            </div>
        </motion.div>
      </div>
    </section>
  );
}
