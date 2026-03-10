import { useState, useEffect } from 'react';
import { Network, Search, ArrowRight, Calendar, Globe, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';

export default function RecentMaps() {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestGraphs();
  }, []);

  const fetchLatestGraphs = async () => {
    try {
      const res = await fetch(`${API_URL}/graphs`);
      let data = await res.json();
      if (res.ok) {
        setGraphs(data.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to fetch recent graphs", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || graphs.length === 0) return null;

  return (
    <section className="py-24 md:py-40 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-primary mb-4"
            >
                <Globe size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Public Repositories</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-main uppercase italic">
              COMMUNITY <span className="text-primary">SNAPSHOTS</span>
            </h2>
            <p className="text-muted font-medium text-lg mt-4">Explore high-fidelity solution maps from the Nexus community.</p>
          </div>
          
          <Link to="/discover" className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-main hover:text-primary transition-all group pb-2">
            <span>VIEW ALL MAPS</span>
            <div className="size-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {graphs.map((graph, idx) => (
             <motion.div
               key={graph._id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
             >
              <Link 
                to={`/graph/${graph._id}`}
                className="block h-full glass-card p-10 rounded-[40px] border-border hover:border-primary/30 transition-all duration-700 group relative overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                    <Sparkles size={18} className="text-primary" />
                </div>
                
                <div className="mb-10 w-16 h-16 rounded-2xl bg-main/5 flex items-center justify-center border border-border group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-700 shadow-inner">
                  <Bell size={20} className="text-muted group-hover:text-primary transition-colors" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-background text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {/* notifications.length */}
                  </span>
                </div>
                
                <h3 className="text-2xl font-display font-extrabold text-main mb-4 group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-1">
                  {graph.title}
                </h3>
                <p className="text-muted font-medium text-sm leading-relaxed mb-10 line-clamp-2">
                  {graph.description || 'No project briefing provided for this synthesis node.'}
                </p>
                
                <div className="flex items-center justify-between pt-8 border-t border-border mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-main/5 flex items-center justify-center border border-border">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-md animate-pulse" />
                            <User size={14} className="text-muted" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{graph.creator?.username || 'GUEST_ID'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted">
                        <Star size={14} className="group-hover:text-amber-400 transition-colors" />
                        <span className="text-[10px] font-bold tracking-widest">{graph.stars || 0}</span>
                    </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center md:hidden">
           <Link to="/discover" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-main transition-all">
             <span>EXPLORE GLOBAL SYNAPSE</span>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>
    </section>
  );
}
