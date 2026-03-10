import { Network, Github, Twitter, Linkedin, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-24 pb-12 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />
        
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3 group mb-8 inline-flex">
              <div className="size-12 bg-main/5 rounded-2xl flex items-center justify-center border border-border shadow-inner group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                <Network className="size-6 text-primary" />
              </div>
              <span className="text-2xl font-display font-black tracking-tighter text-main uppercase italic">
                Nexus
              </span>
            </Link>
            <p className="text-muted font-medium max-w-sm leading-relaxed mb-10">
              High-fidelity collaborative neural mapping for elite teams. Engineer clarity from abstract complexity at the speed of thought.
            </p>
            <div className="flex items-center gap-4">
                <div className="size-2 rounded-full bg-primary shadow-md animate-pulse" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Operational: Global Node Network</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-main font-display font-extrabold mb-8 uppercase tracking-widest text-xs">Product Repository</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-muted font-medium text-sm hover:text-primary transition-colors">Infrastructure</a></li>
              <li><a href="#how-it-works" className="text-muted font-medium text-sm hover:text-primary transition-colors">Synergy Pipeline</a></li>
              <li><Link to="/discover" className="text-muted font-medium text-sm hover:text-primary transition-colors">Shared Registry</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-main font-display font-extrabold mb-8 uppercase tracking-widest text-xs">Infrastructure</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted font-medium text-sm hover:text-primary transition-colors">Neural Assets</a></li>
              <li><a href="#" className="text-muted font-medium text-sm hover:text-primary transition-colors">Core API</a></li>
              <li><a href="#" className="text-muted font-medium text-sm hover:text-primary transition-colors">Security Cipher</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-main font-display font-extrabold mb-8 uppercase tracking-widest text-xs">Neural Sync</h4>
            <div className="flex gap-4">
              <a href="#" className="size-12 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all shadow-inner">
                <Github size={20} />
              </a>
              <a href="#" className="size-12 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all shadow-inner">
                <Twitter size={20} />
              </a>
              <a href="#" className="size-12 bg-main/5 rounded-2xl flex items-center justify-center text-muted hover:text-main hover:bg-main/10 border border-border transition-all shadow-inner">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} NEXUS_SYNTHESIS_LABS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8">
                <a href="#" className="text-muted text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">Privacy_Protocol</a>
                <a href="#" className="text-muted text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">Terms_Of_Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
}
