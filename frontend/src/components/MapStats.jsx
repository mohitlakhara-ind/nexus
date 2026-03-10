import { BarChart3, GitBranch, ThumbsUp, MessageCircle, Activity } from 'lucide-react';

export default function MapStats({ nodes, edges }) {
  // Node type distribution
  const typeLabels = {
    problem: { label: 'Goals', color: '#ef4444' },
    rootCause: { label: 'Reasons', color: '#f59e0b' },
    solution: { label: 'Results', color: '#22c55e' },
    decision: { label: 'Decisions', color: '#06b6d4' },
    action: { label: 'Actions', color: '#8b5cf6' },
    note: { label: 'Notes', color: '#6b7280' },
    swot: { label: 'Strategy', color: '#ec4899' },
    fishbone: { label: 'Factors', color: '#3b82f6' },
    group: { label: 'Frames', color: '#6366f1' },
    image: { label: 'Images', color: '#14b8a6' },
  };

  const typeCounts = {};
  nodes.forEach(n => {
    const t = n.type || 'other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const topVoted = [...nodes]
    .filter(n => (n.data?.votes || 0) > 0)
    .sort((a, b) => (b.data?.votes || 0) - (a.data?.votes || 0))
    .slice(0, 3);

  const topCommented = [...nodes]
    .filter(n => (n.data?.comments?.length || 0) > 0)
    .sort((a, b) => (b.data?.comments?.length || 0) - (a.data?.comments?.length || 0))
    .slice(0, 3);

  // Connectivity health: ratio of edges to possible edges
  const maxEdges = nodes.length > 1 ? nodes.length * (nodes.length - 1) / 2 : 1;
  const connectivity = Math.min(100, Math.round((edges.length / maxEdges) * 100 * 5));

  const maxCount = Math.max(1, ...Object.values(typeCounts));

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-main/5 rounded-2xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-main">{nodes.length}</p>
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Nodes</p>
        </div>
        <div className="bg-main/5 rounded-2xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-main">{edges.length}</p>
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Edges</p>
        </div>
        <div className="bg-main/5 rounded-2xl p-3 text-center border border-border">
          <div className="flex items-center justify-center gap-1">
            <Activity size={14} className={connectivity > 50 ? 'text-accent' : connectivity > 20 ? 'text-warning' : 'text-danger'} />
            <p className="text-2xl font-bold text-main">{connectivity}%</p>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Health</p>
        </div>
      </div>

      {/* Type distribution bar chart */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-muted" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Distribution</span>
        </div>
        <div className="space-y-2">
          {Object.entries(typeCounts).map(([type, count]) => {
            const info = typeLabels[type] || { label: type, color: '#888' };
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-muted w-16 text-right truncate">{info.label}</span>
                <div className="flex-grow h-4 bg-main/5 rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: info.color }}
                  />
                </div>
                <span className="text-[10px] font-bold text-main w-6">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top voted */}
      {topVoted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp size={14} className="text-muted" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Top Voted</span>
          </div>
          {topVoted.map(n => (
            <div key={n.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-main truncate flex-grow">{n.data.label}</span>
              <span className="text-[10px] font-bold text-primary">{n.data.votes}↑</span>
            </div>
          ))}
        </div>
      )}

      {/* Top commented */}
      {topCommented.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={14} className="text-muted" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Most Discussed</span>
          </div>
          {topCommented.map(n => (
            <div key={n.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-main truncate flex-grow">{n.data.label}</span>
              <span className="text-[10px] font-bold text-secondary">{n.data.comments.length}💬</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
