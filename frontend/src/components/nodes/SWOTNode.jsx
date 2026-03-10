import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Target, Activity, ShieldAlert, ArrowRight, ExternalLink, Trash2, Edit3, Check, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NodeLinkBadge from '../NodeLinkBadge';

export default function SWOTNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [editDesc, setEditDesc] = useState(data.description || '');
  const [showDesc, setShowDesc] = useState(false);
  const labelLower = (data.label || '').toLowerCase();
  const accentColor = data.color || 'var(--node-swot-border)';

  let Icon = Target;
  let category = 'SWOT Element';

  if (labelLower.includes('strength')) {
    Icon = Activity;
    category = 'Strength';
  } else if (labelLower.includes('weakness')) {
    Icon = ShieldAlert;
    category = 'Weakness';
  } else if (labelLower.includes('opportunity')) {
    Icon = ArrowRight;
    category = 'Opportunity';
  } else if (labelLower.includes('threat')) {
    Icon = ShieldAlert;
    category = 'Threat';
  }

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
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card rounded-2xl p-4 min-w-[260px] max-w-[320px] group transition-all duration-300 hover:scale-[1.02] border-t-4 shadow-2xl"
      style={{
        borderTopColor: accentColor,
        boxShadow: `0 8px 32px -8px ${accentColor}66`,
        color: 'var(--node-swot-text)'
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-muted" />
      <Handle id="left" type="target" position={Position.Left} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-muted" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl flex items-center justify-center bg-main/5 border border-border">
            <Icon size={18} style={{ color: accentColor }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] opacity-60">{category}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-main/5 backdrop-blur-md rounded-lg p-1 border border-border">
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:bg-main/10 rounded-md text-muted hover:text-main"><Edit3 size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }} className="p-1.5 hover:bg-danger/20 text-danger rounded-md"><Trash2 size={12} /></button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          <textarea
            autoFocus
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full bg-main/10 border border-border rounded-xl p-3 text-sm text-main focus:outline-none focus:border-main/30 resize-none h-20 font-sans"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Detailed notes..."
            className="w-full bg-main/10 border border-border rounded-xl p-3 text-xs text-muted focus:outline-none focus:border-main/30 resize-none h-24"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={handleCancel} className="px-3 py-1.5 hover:bg-main/5 rounded-lg text-xs font-bold text-muted">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/20">Apply</button>
          </div>
        </div>
      ) : (
        <div className="mb-4" onDoubleClick={() => setIsEditing(true)}>
          <div className="font-display font-bold text-base leading-tight break-words mb-2">
            {data.label}
          </div>
          {data.description && (
            <div className="text-[11px] text-muted leading-relaxed whitespace-pre-wrap border-l-2 border-border pl-3 mt-3">
              {data.description}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-border/50">
        <button
          onClick={(e) => { e.stopPropagation(); data.onVote?.(id); }}
          className="flex items-center gap-2 px-3 py-2 bg-main/5 hover:bg-main/10 text-main rounded-xl transition-all border border-border group/btn"
        >
          <span className="text-[11px] font-mono font-black opacity-60">VOTES</span>
          <span className="text-sm font-black text-primary">{data.votes || 0}</span>
        </button>

        {data.issueLink && (
          <a
            href={data.issueLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="size-9 flex items-center justify-center bg-main/5 hover:bg-primary/10 text-muted hover:text-primary rounded-xl border border-border transition-all"
            title="View Reference"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <NodeLinkBadge nodeId={id} link={data.link} onLinkChange={data.onLinkChange} />

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-muted" />
      <Handle id="right" type="source" position={Position.Right} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-muted" />
    </motion.div>
  );
}
