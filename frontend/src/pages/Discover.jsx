import { useState, useEffect } from 'react';
import { Search, Globe, TrendingUp, Clock, GitGraph, ArrowRight, Star, Filter, Calendar, Zap, Compass, Sparkles, GitFork } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

function DiscoverCard({ graph, index }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleFork = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Log in to fork maps.');
      return;
    }
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch(`${API_URL}/graphs/${graph._id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Fork failed');
      const forked = await res.json();
      toast.success('Map forked! Redirecting...', { icon: '🍴' });
      setTimeout(() => navigate(`/graph/${forked._id}`), 800);
    } catch (err) {
      toast.error('Failed to fork map.');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card rounded-[40px] p-10 border-border hover:border-secondary/40 transition-all duration-500 group flex flex-col h-full relative overflow-hidden hover-lift"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 size-48 bg-secondary/10 rounded-full blur-[60px] group-hover:bg-secondary/20 transition-all duration-700" />

      <div className="flex items-start justify-between mb-8">
        <div className="size-16 rounded-3xl bg-main/5 border border-border flex items-center justify-center shadow-inner group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-all duration-500">
          <GitGraph size={28} className="text-muted group-hover:text-secondary transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-main/5 border border-border group-hover:border-secondary/20 transition-all">
          <Star size={14} className="text-amber-400 group-hover:animate-pulse" />
          <span className="text-[10px] font-bold text-main uppercase tracking-widest">{graph.stars || 0}</span>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="font-display font-extrabold text-main text-2xl uppercase tracking-tight mb-4 line-clamp-1 group-hover:text-secondary transition-colors italic">
          {graph.title}
        </h3>
        <p className="text-muted/70 text-sm font-medium line-clamp-3 mb-10 leading-relaxed group-hover:text-muted transition-colors">
          {graph.description || 'A community project built with Nexus Canvas exploring complex architectural patterns.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-border/50">
        <Link to={`/profile/${graph.creator?._id}`} className="flex items-center gap-3 group/user">
          <div
            className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-background border border-border shadow-lg"
            style={{
              backgroundColor: `hsl(${graph.creator?.username?.charCodeAt(0) * 15}, 50%, 45%)`
            }}
          >
            {graph.creator?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-main uppercase tracking-[0.1em] truncate max-w-[100px]">
              {graph.creator?.username}
            </span>
            <span className="text-[8px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
              <Calendar size={8} /> {new Date(graph.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </Link>

        <ArrowRight size={20} className="text-muted group-hover:text-secondary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Fork Button */}
      <button
        onClick={handleFork}
        className="absolute top-6 right-6 z-20 p-2.5 rounded-2xl bg-main/10 border border-border text-muted hover:bg-secondary/20 hover:text-secondary hover:border-secondary/30 transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
        title="Fork this map"
      >
        <GitFork size={16} />
      </button>

      <Link to={`/graph/${graph._id}`} className="absolute inset-0 z-10" />
    </motion.div>
  );
}

export default function Discover() {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('trending');

  useEffect(() => {
    fetchDiscoverMaps();
  }, []);

  const fetchDiscoverMaps = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/graphs`);
      if (res.ok) {
        const data = await res.json();
        setGraphs(data);
      }
    } catch {
      console.error('Failed to load discover maps');
    } finally {
      setLoading(false);
    }
  };

  const filteredGraphs = graphs.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 mesh-bg">
      {/* Hero Section */}
      <div className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-20 right-10 size-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 left-10 size-64 bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-secondary/30" />
            <span className="text-secondary font-display font-bold uppercase tracking-[0.5em] text-[10px] italic flex items-center gap-2">
              <Sparkles size={12} /> The Community Vault
            </span>
            <div className="h-px w-8 bg-secondary/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-extrabold text-main uppercase italic tracking-tighter leading-none mb-8"
          >
            DISCOVER <span className="gradient-text">NEXUS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-80"
          >
            Forge new logic pathways. Explore verified frameworks, collaborative research, and strategic architectural maps.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Floating Search & Filter Bar */}
        <div className="sticky top-24 z-50 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[32px] p-2 flex flex-col md:flex-row items-center gap-2 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

            <div className="relative flex-grow group w-full">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" />
              <input
                type="text"
                placeholder="Query the nexus: Project title, tags, or methodology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none rounded-2xl py-5 pl-14 pr-6 text-main text-sm focus:ring-0 transition-all font-bold placeholder:text-muted/50"
              />
            </div>

            <div className="flex gap-2 p-1 bg-main/5 rounded-2xl w-full md:w-auto">
              {[
                { id: 'trending', label: 'Trending', icon: Zap },
                { id: 'recent', label: 'Fresh', icon: Clock },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`
                      flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap
                      ${tab === t.id ? 'bg-background text-main shadow-sm border border-secondary/20 ring-1 ring-secondary/30' : 'text-muted hover:text-main'}
                    `}
                  >
                    <Icon size={14} className={tab === t.id ? 'text-secondary' : ''} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <button className="hidden md:flex p-4 bg-secondary text-background rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md">
              <Filter size={18} />
            </button>
          </motion.div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-[40px] bg-main/5 animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredGraphs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-[48px] py-40 text-center border-border mesh-bg"
          >
            <Compass size={64} className="text-secondary mx-auto mb-8 opacity-20" />
            <h3 className="text-3xl font-display font-extrabold text-main uppercase tracking-tight mb-4">No Cycles Found</h3>
            <p className="text-muted max-w-sm mx-auto font-medium">Your search query did not return any collaborative segments from the nexus library.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredGraphs.map((graph, idx) => (
                <DiscoverCard key={graph._id} graph={graph} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
