import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle, ArrowUp, Trash2, Edit3, Check, X, ChevronDown, ChevronUp, FileText, Pin } from 'lucide-react';
import NodeComments from '../NodeComments';
import NodeLinkBadge from '../NodeLinkBadge';

export default function ProblemNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [editDesc, setEditDesc] = useState(data.description || '');
  const [showDesc, setShowDesc] = useState(false);
  const votes = data.votes || 0;
  const accentColor = data.color || 'var(--node-problem-border)';

  const handleSave = () => {
    data.onLabelChange?.(id, editLabel, editDesc);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(data.label);
    setEditDesc(data.description || '');
    setIsEditing(false);
  };

  return (
    <div
      className="glass-card rounded-xl p-4 min-w-[240px] max-w-[300px] group transition-all duration-300 hover:scale-[1.02] border-t-2"
      style={{
        borderTopColor: accentColor,
        boxShadow: `0 8px 32px -8px ${accentColor}66`,
        color: 'var(--node-problem-text)'
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-danger" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg flex items-center justify-center bg-danger/10 border border-danger/20" style={{ borderColor: `${accentColor}40`, background: `${accentColor}15` }}>
            <AlertTriangle size={16} style={{ color: accentColor }} />
          </div>
          <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>Problem</span>
          {data.isPinned && <Pin size={10} style={{ color: accentColor }} className="opacity-70" />}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <NodeComments nodeId={id} comments={data.comments || []} onAddComment={data.onAddComment} />
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowDesc(true); }}
            className="p-1.5 hover:bg-main/5 rounded-lg text-muted hover:text-main transition-all"
            title="Edit"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}
            className="p-1.5 hover:bg-danger/20 rounded-lg text-muted hover:text-danger transition-all"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          <textarea
            autoFocus
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            placeholder="Node title..."
            className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-main focus:outline-none focus:border-primary/50 resize-none h-16 font-sans"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Add description or notes..."
            className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-muted focus:outline-none focus:border-primary/30 resize-none h-20 font-sans"
          />
          <div className="flex justify-end gap-1">
            <button onClick={handleCancel} className="p-1.5 hover:bg-main/5 rounded-lg text-muted"><X size={12} /></button>
            <button onClick={handleSave} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary"><Check size={12} /></button>
          </div>
        </div>
      ) : (
        <div
          className="font-display font-bold text-sm leading-snug break-words mb-3 line-clamp-3 cursor-pointer"
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        >
          {data.label}
        </div>
      )}

      {/* Description Collapsible */}
      {!isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }}
          className="flex items-center gap-1 text-[10px] text-muted hover:text-main transition-colors mb-2 w-full"
        >
          <FileText size={10} />
          <span className="uppercase tracking-widest font-bold">{data.description ? 'Notes' : 'Add Notes'}</span>
          {data.description ? (showDesc ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null}
        </button>
      )}
      {showDesc && !isEditing && data.description && (
        <div className="text-[11px] text-muted leading-relaxed mb-2 px-2 py-1.5 bg-main/5 rounded-lg border border-border whitespace-pre-wrap">
          {data.description}
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-border">
        <button
          onClick={(e) => { e.stopPropagation(); data.onVote?.(id); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-all border border-danger/20"
        >
          <ArrowUp size={12} className="text-danger transition-transform" />
          <span className="text-xs font-mono font-bold text-danger">{votes}</span>
        </button>
        {votes > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(votes, 5) }).map((_, i) => (
              <div key={i} className="size-1.5 rounded-full" style={{ background: accentColor, opacity: 0.5 + i * 0.1 }} />
            ))}
          </div>
        )}
      </div>
      <NodeLinkBadge nodeId={id} link={data.link} onLinkChange={data.onLinkChange} />

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-danger" />
    </div>
  );
}
