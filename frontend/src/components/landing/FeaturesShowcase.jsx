import { motion } from 'framer-motion';
import { Network, Zap, Users, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

const features = [
  {
    icon: <Network className="w-8 h-8 text-primary" />,
    title: 'NEURAL CONNECTIVITY',
    desc: 'Deconstruct massive complexities into atomic nodes. Map multi-dimensional problems with spatial intelligence.',
    accent: 'bg-primary/20'
  },
  {
    icon: <Users className="w-8 h-8 text-secondary" />,
    title: 'SWARM COLLABORATION',
    desc: 'Real-time synchronization across the global node network. Watch high-frequency ideas collide and fuse instantly.',
    accent: 'bg-secondary/20'
  },
  {
    icon: <Cpu className="w-8 h-8 text-emerald-400" />,
    title: 'SYNERGY ENGINE',
    desc: 'Transform abstract mapping into actionable momentum. Direct root cause analysis into high-impact execution pathing.',
    accent: 'bg-emerald-500/20'
  }
];

export default function FeaturesShowcase() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" id="features">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-full h-[600px] bg-primary/5 -translate-y-1/2 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-main/5 border border-border mb-6"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Core Infrastructure</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold text-main mb-6 uppercase tracking-tight">
            ENGINEERED FOR <span className="text-primary">ULTIMATE CLARITY</span>
          </h2>
          <p className="text-muted font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            A high-performance environment designed to untangle chaotic data and align cross-functional teams with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-10 rounded-[40px] border-border hover:border-primary/20 transition-all duration-700 relative group overflow-hidden h-full flex flex-col"
            >
              {/* Particle Background */}
              <div className="absolute inset-0 dot-grid opacity-10 group-hover:opacity-20 transition-opacity" />
              
              <div className={`mb-10 w-20 h-20 ${feature.accent} rounded-[28px] flex items-center justify-center border border-border relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner`}>
                <div className="absolute inset-0 bg-main/5 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity" />
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-display font-extrabold text-main mb-4 relative z-10 uppercase tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted font-medium leading-relaxed relative z-10 text-sm group-hover:text-muted transition-colors">{feature.desc}</p>
              
              <div className="mt-auto pt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  <div className="h-px flex-grow bg-primary/20" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">OPTIMIZED_BY_NEXUS</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
