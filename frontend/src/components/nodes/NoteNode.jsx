import { useState } from 'react';
import { Trash2, Edit3, Check, X, StickyNote, Pin } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';


const NOTE_COLORS = [
  { label: 'Yellow', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { label: 'Blue', bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  { label: 'Green', bg: '#dcfce7', border: '#22c55e', text: '#14532d' },
  { label: 'Pink', bg: '#fce7f3', border: '#ec4899', text: '#831843' },
  { label: 'Purple', bg: '#f3e8ff', border: '#a855f7', text: '#581c87' },
];

export default function NoteNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label || '');
  const [editColor, setEditColor] = useState(data.noteColor || 0);

  const color = NOTE_COLORS[editColor] || NOTE_COLORS[0];
  const savedColor = NOTE_COLORS[data.noteColor ?? 0] || NOTE_COLORS[0];

  const handleSave = () => {
    data.onLabelChange?.(id, editLabel, editLabel, editColor);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-4 min-w-[200px] max-w-[260px] group transition-all duration-300 hover:shadow-xl rounded-sm border-t-[10px] relative"
      style={{
        backgroundColor: savedColor.bg,
        borderTopColor: savedColor.border,
        boxShadow: `4px 4px 20px ${savedColor.border}40`,
        color: savedColor.text,
      }}
    >
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: savedColor.border }} />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: savedColor.border }} />

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <StickyNote size={12} style={{ color: savedColor.border }} />
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: savedColor.border }}>Note</span>
          {data.isPinned && <Pin size={10} className="text-muted ml-1" style={{ color: savedColor.border }} />}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1 hover:bg-black/10 rounded-md transition-all"
          >
            <Edit3 size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}
            className="p-1 hover:bg-red-200 rounded-md transition-all text-red-600"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          <textarea
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full min-h-[80px] bg-white/60 border border-black/10 rounded resize-none focus:outline-none focus:ring-1 text-sm leading-relaxed p-2"
            style={{ color: savedColor.text }}
            autoFocus
          />
          {/* Color Picker */}
          <div className="flex gap-1.5 mt-1">
            {NOTE_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setEditColor(i)}
                className="size-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: c.bg, borderColor: i === editColor ? c.border : 'transparent' }}
                title={c.label}
              />
            ))}
          </div>
          <div className="flex justify-end gap-1 mt-1">
            <button onClick={() => { setIsEditing(false); setEditLabel(data.label || ''); setEditColor(data.noteColor ?? 0); }} className="p-1.5 hover:bg-black/10 rounded-md"><X size={11} /></button>
            <button onClick={handleSave} className="p-1.5 hover:bg-black/10 rounded-md"><Check size={11} /></button>
          </div>
        </div>
      ) : (
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap min-h-[50px] cursor-pointer font-medium"
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          style={{ color: savedColor.text }}
        >
          {data.label || <span className="opacity-40 italic">Double-click to write...</span>}
        </div>
      )}

    </motion.div>
  );
}
