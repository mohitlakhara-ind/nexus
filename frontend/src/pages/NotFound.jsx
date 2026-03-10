import { Link } from 'react-router-dom';
import { Network, Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="glass-panel border border-border p-12 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl"
      >
        <div className="size-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner">
          <Search size={40} className="drop-shadow-sm" />
        </div>
        
        <h1 className="text-6xl font-display font-extrabold text-main mb-4 tracking-tight drop-shadow-sm">404</h1>
        
        <h2 className="text-xl font-bold text-main mb-3">Dead End Reached</h2>
        <p className="text-muted mb-8 leading-relaxed max-w-sm mx-auto">
          We searched the entire network, but we couldn't find the node you're looking for. It might have been deleted, or the link is broken.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-background rounded-xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Dashboard
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto px-8 py-3.5 bg-main/5 hover:bg-main/10 text-main border border-border rounded-xl font-bold transition-all hover:border-main/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Network size={18} />
            Explore Maps
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
