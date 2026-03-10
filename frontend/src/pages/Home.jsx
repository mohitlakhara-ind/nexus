import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Network, ArrowRight, Zap, Target, Brain, Share2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import FeaturesShowcase from '../components/landing/FeaturesShowcase';
import Footer from '../components/Footer';

const FeatureCard = ({ icon, title, description, colorClass }) => {
  const CardIcon = icon;
  return (
    <div className="glass-card p-8 rounded-3xl border-border relative group cursor-default">
      <div className={`absolute -top-4 -right-4 size-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`} />
      <div className={`size-14 rounded-2xl flex items-center justify-center mb-6 bg-main/5 border border-border group-hover:border-border/50 transition-colors`}>
        <CardIcon size={28} className="text-main group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-xl font-display font-bold text-main mb-3 tracking-tight">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const FloatingNode = ({ children, style }) => (
  <div
    style={style}
    className="absolute pointer-events-none glass-card px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase border-primary/20 bg-primary/5 text-primary whitespace-nowrap"
  >
    {children}
  </div>
);

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" ref={targetRef}>
      {/* Immersive Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4">
        {/* Kinetic Neural Background */}
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto text-center">
          <div>
            <div className="inline-flex items-center gap-3 bg-main/5 border border-border rounded-full pl-2 pr-5 py-1.5 mb-10 hover:border-border/50 transition-colors cursor-pointer group">
              <div className="bg-primary/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-primary">NEW</div>
              <span className="text-xs font-bold font-display uppercase tracking-widest text-muted group-hover:text-main transition-colors">Introducing Nexus v4.0</span>
              <ArrowRight size={14} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-8 leading-[0.95] text-main uppercase italic">
              VISUALIZE YOUR <span className="gradient-text">IDEAS.</span> <br />
              <span className="relative inline-block mt-4">
                SOLVE PROBLEMS TOGETHER.
                <div className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full w-full" />
              </span>
            </h1>

            <p className="mt-10 text-lg md:text-xl text-muted max-w-3xl mx-auto mb-14 leading-relaxed font-sans">
              Nexus is a simple tool for
              <span className="text-main font-semibold"> solving big problems with your team.</span> Turn complex challenges into clear maps and find better solutions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-10 py-5 bg-primary text-background rounded-2xl font-display font-bold text-lg transition-all shadow-md hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
              >
                <span>{isAuthenticated ? "GO TO DASHBOARD" : "GET STARTED FREE"}</span>
                <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => document.getElementById('problem-context')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-5 glass-card hover:bg-main/10 border-border rounded-2xl font-display font-bold text-muted hover:text-main transition-all flex items-center justify-center gap-3"
              >
                <Zap size={20} className="text-primary fill-primary/20" />
                <span>EXPLORE FEATURES</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Floating Kinetic Nodes */}
        <FloatingNode
          style={{ top: "20%", left: "10%", opacity: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-danger shadow-[0_0_8px_#ef4444]" />
            Main Goal
          </div>
        </FloatingNode>

        <FloatingNode
          style={{ bottom: "25%", right: "15%", opacity: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent shadow-[0_0_8px_#10b981]" />
            Smart Solution
          </div>
        </FloatingNode>
      </section>

      {/* NEW: The Challenge Section */}
      <section id="problem-context" className="py-24 px-4 relative border-t border-border bg-main/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-danger font-display font-bold uppercase tracking-[0.3em] text-[10px]">The Challenge</span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-main mt-4 mb-8 uppercase leading-tight">
              Old Tools Can't Handle <br /><span className="text-danger">Complex Work.</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="size-6 rounded-full bg-danger/20 flex items-center justify-center border border-danger/30 mt-1 shrink-0">
                  <div className="size-1.5 rounded-full bg-danger" />
                </div>
                <p className="text-muted leading-relaxed font-medium">
                  Documents and emails make it hard to see the big picture. Important details get lost in long threads.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="size-6 rounded-full bg-danger/20 flex items-center justify-center border border-danger/30 mt-1 shrink-0">
                  <div className="size-1.5 rounded-full bg-danger" />
                </div>
                <p className="text-muted leading-relaxed font-medium">
                  Simple whiteboards are messy. They don't help you track how your ideas are connected or who is doing what.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative glass-card p-10 rounded-[40px] border-border shadow-2xl">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-main/5 rounded-xl border border-border flex items-center px-4 gap-4">
                    <div className="size-3 rounded shadow-inner bg-main/20" />
                    <div className="h-2 w-full bg-main/5 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-danger/40 to-transparent w-full" />
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <span className="text-[9px] font-bold text-muted px-2 uppercase tracking-widest italic tracking-[0.3em]">Disconnected Work Layout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Smart Assistant Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[600px] bg-secondary/5 -translate-y-1/2 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="size-24 rounded-[32px] bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-8 shadow-inner relative group">
            <div className="absolute inset-0 bg-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Brain size={40} className="text-secondary relative z-10" />
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-extrabold text-main mb-8 uppercase tracking-tighter italic">
            SMART AI <span className="text-secondary">ASSISTANT</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted max-w-4xl leading-relaxed font-medium">
            Nexus helps you think. Our smart AI looks at your project maps to find risks and suggest the best next steps.
          </p>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            <div className="glass-card p-12 rounded-[48px] border-border text-left group hover:border-secondary/20 transition-all shadow-2xl">
              <h4 className="text-main font-display font-black text-2xl mb-6 group-hover:text-secondary transition-colors uppercase italic">Real-Time Help</h4>
              <p className="text-muted font-medium text-lg leading-relaxed">The AI checks your maps for logic gaps and points out weak spots before they become problems.</p>
            </div>
            <div className="glass-card p-12 rounded-[48px] border-border text-left group hover:border-secondary/20 transition-all shadow-2xl">
              <h4 className="text-main font-display font-black text-2xl mb-6 group-hover:text-secondary transition-colors uppercase italic">Quick Planning</h4>
              <p className="text-muted font-medium text-lg leading-relaxed">Create a full plan from one simple sentence. Go from a vague idea to a clear list of actions in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Simple Process Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-primary font-display font-bold uppercase tracking-[0.4em] text-[10px]">How It Works</span>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-main mt-4 uppercase italic">SIMPLE MAPPING <span className="text-primary">PROCESS</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Define", desc: "Start with your main problem or goal.", icon: Target },
              { title: "Branch", desc: "Add ideas and connect them together.", icon: Share2 },
              { title: "Analyze", desc: "Use AI to find the best way forward.", icon: Brain },
              { title: "Execute", desc: "Turn your map into a finished project.", icon: Zap },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-10 rounded-[40px] border-border hover:border-primary/20 transition-all flex flex-col items-center text-center group shadow-2xl"
                >
                  <div className="size-20 rounded-3xl bg-main/5 flex items-center justify-center border border-border mb-8 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-inner">
                    <Icon size={28} className="text-muted group-hover:text-primary group-hover:scale-110 transition-all" />
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-main mb-4 uppercase tracking-tighter group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-sm text-muted font-medium leading-relaxed group-hover:text-muted/80 transition-colors">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <span className="text-secondary font-display font-bold uppercase tracking-[0.4em] text-[10px]">Technology</span>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-main mt-4 mb-8 uppercase italic">Easy To Use.</h2>
            <p className="text-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Our tool handles thousands of points without any lag. Work with your team in real-time from anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              icon={Brain}
              title="Smart AI"
              description="Use AI to automatically build parts of your map and find solutions based on your goals."
              colorClass="bg-secondary"
            />
            <FeatureCard
              icon={Share2}
              title="Live Sharing"
              description="Work with your team at the same time. Watch ideas grow as if you were in the same room."
              colorClass="bg-primary"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Auto Backups"
              description="Your work is saved automatically. You can always go back to an older version of your map."
              colorClass="bg-accent"
            />
          </div>
        </div>
      </section>

      <FeaturesShowcase />
      <Footer />
    </div>
  );
}
