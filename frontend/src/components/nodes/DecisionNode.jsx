import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, Trash2, Edit3, ArrowUp, ChevronDown, ChevronUp, FileText, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';


export default function DecisionNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label || 'Decision?');
  const [editDesc, setEditDesc] = useState(data.description || '');
  const [showDesc, setShowDesc] = useState(false);
  const votes = data.votes || 0;
  const accentColor = data.color || 'var(--node-decision-border)';

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
      className="relative flex items-center justify-center w-[160px] h-[160px] group transition-all duration-300"
    >
      {/* Background Square Rotated 45deg (Diamond) */}
      <div
        className="absolute inset-[15%] glass-card border-2 shadow-2xl transition-transform duration-300 group-hover:scale-110 rounded-lg"
        style={{
          transform: 'rotate(45deg)',
          borderColor: accentColor,
          boxShadow: `0 8px 32px -8px ${accentColor}66`,
          background: 'var(--node-decision-bg)'
        }}
      />

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: accentColor, borderColor: 'var(--node-decision-bg)' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !border-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: accentColor, borderColor: 'var(--node-decision-bg)' }} />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !border-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: accentColor, borderColor: 'var(--node-decision-bg)' }} />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !border-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: accentColor, borderColor: 'var(--node-decision-bg)' }} />

      {/* Content Container */}
      <div className="relative z-10 p-4 flex flex-col items-center justify-center text-center w-full h-full overflow-hidden">
        <div className="absolute -top-12 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-main/10 backdrop-blur-md rounded-lg p-1 border border-border">
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowDesc(true); }} className="p-1.5 hover:bg-main/20 rounded-md transition-all text-muted hover:text-main"><Edit3 size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }} className="p-1.5 hover:bg-danger/20 text-danger rounded-md transition-all"><Trash2 size={12} /></button>
        </div>

        <HelpCircle size={20} className="mb-2 opacity-80" style={{ color: accentColor }} />

        {isEditing ? (
          <div className="flex flex-col gap-2 w-full" onClick={e => e.stopPropagation()}>
            <textarea
              autoFocus
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full bg-main/20 border border-border rounded-lg p-2 text-xs focus:outline-none text-center resize-none h-16"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Notes..."
              className="w-full bg-main/20 border border-border rounded-lg p-2 text-[10px] focus:outline-none text-center resize-none h-14"
            />
            <div className="flex justify-center gap-1">
              <button onClick={handleCancel} className="p-1 hover:bg-main/20 rounded text-muted"><X size={12} /></button>
              <button onClick={handleSave} className="p-1 hover:bg-primary/20 rounded text-primary"><Check size={12} /></button>
            </div>
          </div>
        ) : (
          <>
            <div className="font-display font-bold text-sm leading-snug break-words line-clamp-2" onDoubleClick={() => setIsEditing(true)}>
              {data.label || 'Decision Point'}
            </div>
            {data.description && (
              <button onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }} className="mt-1 flex items-center gap-1 text-[9px] text-muted hover:text-main shrink-0">
                <FileText size={9} /> {showDesc ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              </button>
            )}
            {showDesc && data.description && (
              <div className="absolute top-[110%] w-[200px] z-20 bg-background/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl text-[11px] text-left text-muted leading-relaxed whitespace-pre-wrap">
                {data.description}
              </div>
            )}
          </>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); data.onVote?.(id); }}
          className="absolute -bottom-10 flex items-center gap-1 px-2.5 py-1.5 bg-main/10 backdrop-blur-md hover:bg-main/20 rounded-xl transition-all border border-border opacity-0 group-hover:opacity-100"
        >
          <ArrowUp size={12} className="text-main" />
          <span className="text-[10px] font-mono font-bold text-main">{votes}</span>
        </button>
      </div>
    </motion.div>
  );
}
