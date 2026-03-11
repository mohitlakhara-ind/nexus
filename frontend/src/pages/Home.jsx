import React, { useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Network, ArrowRight, Zap, Target, Brain, Share2, ShieldCheck, Sparkles, Layout, Users } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/authStore';

import FeaturesShowcase from '../components/landing/FeaturesShowcase';
import Footer from '../components/Footer';

const FeatureCard = ({ icon: Icon, title, description, colorClass, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-8 rounded-[32px] border-border relative group cursor-default hover:border-primary/20 transition-all"
    >
      <div className={`absolute -top-4 -right-4 size-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colorClass}`} />
      <div className="size-14 rounded-2xl flex items-center justify-center mb-6 bg-main/5 border border-border group-hover:bg-primary/5 transition-colors">
        <Icon size={28} className="text-main group-hover:text-primary transition-colors group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-xl font-display font-bold text-main mb-3 tracking-tight">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/20" ref={targetRef}>
      {/* Immersive Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 dot-grid opacity-[0.15] bg-[fixed]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-60" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />
        
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }} 
          className="relative z-10 w-full max-w-6xl mx-auto text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 bg-main/5 border border-border rounded-full pl-2 pr-5 py-1.5 mb-10 hover:border-primary/20 transition-all cursor-default group backdrop-blur-sm">
              <div className="bg-primary/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-primary">v4.0</div>
              <span className="text-xs font-bold font-display uppercase tracking-widest text-muted group-hover:text-main transition-colors">Visual Intelligence Engine</span>
              <Sparkles size={14} className="text-primary animate-pulse" />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black tracking-tighter mb-8 leading-[0.85] text-main uppercase italic text-balance">
              MAP YOUR <span className="gradient-text">THOUGHTS.</span> <br />
              <span className="relative inline-block mt-4 lg:mt-6">
                BUILD THE FUTURE.
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" 
                />
              </span>
            </h1>

            <p className="mt-12 text-lg md:text-2xl text-muted max-w-3xl mx-auto mb-16 leading-relaxed font-medium text-balance">
              Nexus turns complex chaos into <span className="text-main">structured clarity.</span> The infinite collaborative canvas for high-performance teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-12 py-6 bg-primary text-background rounded-full font-display font-black text-xl transition-all shadow-xl hover:shadow-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
              >
                <span>{isAuthenticated ? "OPEN DASHBOARD" : "START BUILDING"}</span>
                <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-12 py-6 glass-panel hover:bg-main/5 border-border rounded-full font-display font-bold text-main transition-all flex items-center justify-center gap-3 group"
              >
                <Layout size={20} className="text-muted group-hover:text-main transition-colors" />
                <span>HOW IT WORKS</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-32 px-4 relative border-t border-border bg-main/[0.01]">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-primary font-display font-bold uppercase tracking-[0.4em] text-[10px]">The Vision</span>
              <h2 className="text-4xl md:text-6xl font-display font-black text-main mt-6 mb-10 uppercase leading-[0.9] italic">
                Complexity is <br /><span className="text-primary">Beautifully Simple.</span>
              </h2>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-2"
              >
                <div className="size-16 rounded-[24px] bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Logo className="size-10 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Nexus Engine</span>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">v2.4.0 Stable</span>
                </div>
              </motion.div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <Target size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-main mb-2">Infinite Clarity</h4>
                    <p className="text-muted leading-relaxed font-medium">Never hit a wall again. Our canvas expands as fast as your brain does.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
                    <Users size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-main mb-2">Syncronized Mind</h4>
                    <p className="text-muted leading-relaxed font-medium">Work as one. Real-time collaboration that feels like being in the same room.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-50" />
              <div className="relative glass-card aspect-video rounded-[48px] border-border shadow-2xl p-4 overflow-hidden group">
                {/* Mock UI Preview */}
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                    <div className="bg-primary text-background px-6 py-3 rounded-full font-bold shadow-xl">PREVIEW NEXUS ENGINE</div>
                </div>
                <div className="w-full h-full rounded-[40px] bg-background border border-border overflow-hidden p-6 relative">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="size-3 rounded-full bg-danger/40" />
                      <div className="size-3 rounded-full bg-warning/40" />
                      <div className="size-3 rounded-full bg-accent/40" />
                   </div>
                   <div className="space-y-4">
                      <div className="h-4 w-1/2 bg-main/10 rounded-full" />
                      <div className="h-32 w-full bg-main/5 rounded-2xl border border-dashed border-border" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-primary/10 rounded-2xl border border-primary/20" />
                        <div className="h-20 bg-secondary/10 rounded-2xl border border-secondary/20" />
                        <div className="h-20 bg-accent/10 rounded-2xl border border-accent/20" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-20">
            <span className="text-secondary font-display font-bold uppercase tracking-[0.4em] text-[10px]">The Engine</span>
            <h2 className="text-4xl md:text-7xl font-display font-black text-main mt-6 uppercase leading-tight italic">
              Built for <span className="text-secondary">Performance.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard
              icon={Brain}
              title="Neural AI Assistant"
              description="Context-aware AI that analyzes your maps to find logic gaps, suggest improvements, and generate actionable items."
              colorClass="bg-primary"
              delay={0.1}
            />
            <FeatureCard
              icon={Share2}
              title="Hyper-Sync Sharing"
              description="Zero-latency real-time collaboration with cursor tracking, presence indicators, and live session voting."
              colorClass="bg-secondary"
              delay={0.2}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Immutable Backups"
              description="Enterprise-grade version control for your ideas. Recover any state of your map with a single click."
              colorClass="bg-accent"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="section-container">
          <div className="relative glass-card rounded-[64px] p-12 md:p-24 text-center overflow-hidden border-primary/10">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="absolute -top-24 -left-24 size-96 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 size-96 bg-secondary/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-display font-black text-main uppercase italic mb-8 leading-tight">
                Ready to map <br /> the <span className="text-primary text-stroke">unthinkable?</span>
              </h2>
              <Link
                to="/register"
                className="inline-flex px-16 py-8 bg-main text-background rounded-full font-display font-black text-2xl hover:scale-105 transition-transform shadow-2xl"
              >
                JOIN THE NEXUS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturesShowcase />
      <Footer />
    </div>
  );
}
