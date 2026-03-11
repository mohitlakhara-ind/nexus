import { Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-32 pb-12 relative overflow-hidden">
      {/* Background FX - Subtle ambient light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-24">
          
          <div className="md:col-span-12 lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 group mb-8 inline-flex">
              <Logo className="size-10 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tighter text-main leading-none uppercase italic">
                  NEXUS
                </span>
                <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-primary leading-none mt-1 uppercase">
                  Synthesis Labs
                </span>
              </div>
            </Link>
            <p className="text-muted font-medium max-w-sm leading-relaxed mb-10 text-pretty">
              High-performance recursive mapping for elite engineering teams. Architecting clarity from abstract complexity at the velocity of thought.
            </p>
            <div className="flex items-center gap-4">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)] animate-pulse" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] font-mono">Status: All Nodes Operational</span>
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-main font-display font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Registry</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2 group">Features <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2 group">Roadmap <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
              <li><Link to="/discover" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Shared Maps</Link></li>
              <li><Link to="/ranks" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Global Ranks</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-main font-display font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Documentation</a></li>
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Core API</a></li>
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Security Whitepaper</a></li>
              <li><a href="#" className="text-muted font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest">Changelog</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-main font-display font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="size-11 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all hover:scale-110 active:scale-95 shadow-sm" title="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="size-11 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all hover:scale-110 active:scale-95 shadow-sm" title="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="size-11 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all hover:scale-110 active:scale-95 shadow-sm" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-main/5 border border-border">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-relaxed">
                Join our decentralized engineering community to stay ahead of the curve.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.25em] font-mono">
            &copy; {new Date().getFullYear()} NEXUS_SYNTHESIS_LABS <span className="mx-2 opacity-30">//</span> ALL_SYSTEMS_GO
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-muted text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors underline-offset-4 hover:underline">Privacy_Vault</a>
            <a href="#" className="text-muted text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors underline-offset-4 hover:underline">Terms_Encryption</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
