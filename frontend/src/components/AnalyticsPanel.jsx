import { useMemo } from 'react';
import { X, GitGraph, Share2, ThumbsUp, Layers, BarChart3, Activity, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsPanel({ nodes, edges, onClose }) {
  const stats = useMemo(() => {
    const typeCount = nodes.reduce((acc, n) => {
      acc[n.data?.type || 'unknown'] = (acc[n.data?.type || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    const topVoted = [...nodes]
      .sort((a, b) => (b.data?.votes || 0) - (a.data?.votes || 0))
      .slice(0, 3);
    const totalVotes = nodes.reduce((acc, n) => acc + (n.data?.votes || 0), 0);
    return { typeCount, topVoted, totalVotes };
  }, [nodes, edges]);

  const typeColors = {
    problem: { color: 'text-danger', border: 'border-danger/20', bg: 'bg-danger/10', glow: 'shadow-md' },
    root_cause: { color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', glow: 'shadow-md' },
    solution: { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'shadow-md' },
    unknown: { color: 'text-muted', border: 'border-border', bg: 'bg-main/5', glow: '' },
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="absolute top-0 left-0 h-full w-72 glass-panel border-r border-border shadow-[20px_0_50px_var(--shadow-color)] z-50 flex flex-col"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Activity size={16} className="text-primary" />
          </div>
          <h3 className="font-display font-extrabold text-main text-xs uppercase tracking-[0.2em]">Map Intelligence</h3>
        </div>
        <button onClick={onClose} className="p-2 text-muted hover:text-main hover:bg-main/5 rounded-xl transition-all">
          <X size={16} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* Real-time Counter */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-main/5 border border-border rounded-2xl p-4 text-center shadow-inner group">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers size={14} className="text-primary" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Nodes</span>
            </div>
            <p className="text-3xl font-display font-black text-main group-hover:text-primary transition-colors">{nodes.length}</p>
          </div>
          <div className="bg-main/5 border border-border rounded-2xl p-4 text-center shadow-inner group">
             <div className="flex items-center justify-center gap-2 mb-2">
              <Share2 size={14} className="text-secondary" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Edges</span>
            </div>
            <p className="text-3xl font-display font-black text-main group-hover:text-secondary transition-colors">{edges.length}</p>
          </div>
        </div>

        {/* Global Impact Header */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
                <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                    <ThumbsUp size={14} className="text-primary fill-primary/20" />
                </div>
                <div>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Synergy Impact</p>
                    <p className="text-xs font-bold text-main uppercase italic">Total Votes</p>
                </div>
            </div>
            <p className="text-2xl font-display font-black text-primary">{stats.totalVotes}</p>
        </div>

        {/* Distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between group">
              <span className="text-[10px] text-muted font-bold uppercase tracking-[0.3em]">Node Distribution</span>
              <div className="h-px flex-grow bg-border ml-4" />
          </div>
          
          <div className="space-y-5">
            {Object.entries(stats.typeCount).map(([type, count]) => {
              const style = typeColors[type] || typeColors.unknown;
              const pct = nodes.length > 0 ? Math.round((count / nodes.length) * 100) : 0;
              return (
                <div key={type} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${style.bg.replace('/10', '/100')}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${style.color}`}>{type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted">{count} Units</span>
                  </div>
                  <div className="w-full bg-main/5 rounded-full h-1 overflow-hidden backdrop-blur-sm border border-border">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-all ${style.bg.replace('/10', '/60')}`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Priority Clusters (Top Voted) */}
        {stats.topVoted.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center justify-between group">
                <span className="text-[10px] text-muted font-bold uppercase tracking-[0.3em]">High Priority Nodes</span>
                <div className="h-px flex-grow bg-border ml-4" />
            </div>
            <div className="space-y-3">
              {stats.topVoted.map((node, i) => (
                <div key={node.id} className="relative group overflow-hidden bg-main/5 border border-border rounded-2xl p-4 hover:border-primary/20 transition-all shadow-inner">
                  <div className="absolute top-0 right-0 p-2">
                      <Zap size={10} className={`${i === 0 ? 'text-primary' : 'text-muted'}`} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-mono font-black ${i === 0 ? 'text-primary' : 'text-muted'}`}>
                      0{i + 1}_
                    </span>
                    <p className="text-xs text-main font-bold uppercase tracking-tight truncate flex-grow italic truncate">
                        {node.data?.label || 'UNTITLED_NODE'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                          <div className={`size-1 rounded-full ${node.data?.type === 'problem' ? 'bg-danger' : node.data?.type === 'solution' ? 'bg-emerald-400' : 'bg-primary'}`} />
                          <span className="text-[8px] font-bold text-muted uppercase tracking-widest">{node.data?.type || 'CORE'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp size={10} className="text-primary" />
                        <span className="text-xs font-mono font-bold text-main">{node.data?.votes || 0}</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nodes.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="size-16 rounded-3xl bg-main/5 border border-border flex items-center justify-center mx-auto mb-6 opacity-30 shadow-inner">
                <BarChart3 size={32} className="text-muted" />
            </div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] leading-relaxed">Awaiting node entry for synergy analysis</p>
          </div>
        )}
      </div>
      
      {/* Footer Metrics */}
      <div className="p-6 border-t border-border bg-main/5">
          <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">Operational Status</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">OPTIMIZED</span>
                <div className="size-2 rounded-full bg-primary shadow-md" />
              </div>
          </div>
      </div>
    </motion.div>
  );
}
