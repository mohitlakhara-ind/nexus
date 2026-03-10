import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckSquare, Square, Trash2, Edit3, ArrowUp, Calendar, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import NodeLinkBadge from '../NodeLinkBadge';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function ActionItemNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label || '');
  const [editDesc, setEditDesc] = useState(data.description || '');
  const [editPriority, setEditPriority] = useState(data.priority || 'medium');
  const [isCompleted, setIsCompleted] = useState(data.completed || false);
  const [showDesc, setShowDesc] = useState(false);
  const votes = data.votes || 0;
  const accentColor = data.color || 'var(--node-action-border)';
  const priorityColor = PRIORITY_COLORS[data.priority || 'medium'];

  const handleSave = () => {
    data.onLabelChange?.(id, editLabel, editDesc);
    setIsEditing(false);
  };

  const toggleCompletion = (e) => {
    e.stopPropagation();
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    data.onStatusChange?.(id, newStatus);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`glass-card rounded-lg p-3 min-w-[220px] max-w-[290px] group transition-all duration-300 hover:scale-[1.02] border-l-4 ${isCompleted ? 'opacity-60 saturate-50' : ''}`}
      style={{
        borderLeftColor: isCompleted ? '#22c55e' : accentColor,
        boxShadow: `0 4px 24px -8px ${accentColor}55`,
        color: 'var(--node-action-text)'
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accentColor }} />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accentColor }} />

      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          onClick={toggleCompletion}
          className="mt-0.5 hover:scale-110 transition-transform shrink-0"
          style={{ color: isCompleted ? '#22c55e' : 'var(--text-muted)' }}
        >
          {isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>

        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: priorityColor }}>
              ● {data.priority || 'medium'} priority
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={(e) => { e.stopPropagation(); data.onVote?.(id); }} className="p-1 hover:bg-main/10 rounded-md text-muted">
                <ArrowUp size={10} />
              </button>
              <span className="text-[9px] font-mono text-muted">{votes}</span>
              <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 hover:bg-main/10 rounded-md text-muted ml-1">
                <Edit3 size={11} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }} className="p-1 hover:bg-danger/20 text-danger rounded-md">
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2 mt-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full bg-main/10 border border-border rounded-md p-1.5 text-xs focus:outline-none focus:border-main/50"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Details / notes..."
                className="w-full bg-main/10 border border-border rounded-md p-1.5 text-xs focus:outline-none focus:border-main/50 resize-none h-14"
              />
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Priority:</span>
                {Object.keys(PRIORITY_COLORS).map(p => (
                  <button key={p} onClick={() => setEditPriority(p)} className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border transition-all" style={{ borderColor: editPriority === p ? PRIORITY_COLORS[p] : 'transparent', color: PRIORITY_COLORS[p], background: editPriority === p ? `${PRIORITY_COLORS[p]}20` : 'transparent' }}>{p}</button>
                ))}
              </div>
              <div className="flex justify-end gap-1">
                <button onClick={() => { setIsEditing(false); setEditLabel(data.label); setEditDesc(data.description || ''); setEditPriority(data.priority || 'medium'); }} className="p-1.5 hover:bg-main/5 rounded-lg text-muted"><X size={11} /></button>
                <button onClick={handleSave} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary"><Check size={11} /></button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`font-display font-medium text-sm leading-snug break-words cursor-pointer ${isCompleted ? 'line-through text-muted' : ''}`}
                onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              >
                {data.label || 'New Action Item'}
              </div>

              {data.description && (
                <button onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }} className="flex items-center gap-1 text-[9px] text-muted hover:text-main mt-1 w-full">
                  <span className="uppercase tracking-widest font-bold">Details</span>
                  {showDesc ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                </button>
              )}
              {showDesc && data.description && (
                <div className="text-[10px] text-muted mt-1 px-2 py-1 bg-main/5 rounded border border-border whitespace-pre-wrap">
                  {data.description}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: isCompleted ? '#22c55e' : 'var(--text-muted)' }}>
              {isCompleted ? '✓ Done' : '⏳ Pending'}
            </span>
            {data.dueDate && (
              <div className="flex items-center gap-1 text-[9px] text-muted">
                <Calendar size={9} />
                {data.dueDate}
              </div>
            )}
          </div>
          <NodeLinkBadge nodeId={id} link={data.link} onLinkChange={data.onLinkChange} />
        </div>
      </div>
    </motion.div>
  );
}
