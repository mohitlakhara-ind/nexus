import { useState, useRef } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { Edit3, Check, X, Maximize2 } from 'lucide-react';

export default function GroupNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label || 'Group');
  const inputRef = useRef(null);

  const accentColor = data.color || '#6366f1';

  const handleSave = () => {
    data.onLabelChange?.(id, editLabel);
    setIsEditing(false);
  };

  return (
    <>
      <NodeResizer 
        minWidth={200} 
        minHeight={150} 
        isVisible={selected}
        lineClassName="!border-primary/40"
        handleClassName="!w-3 !h-3 !bg-primary !border-2 !border-background !rounded-md"
      />
      <div
        className="w-full h-full rounded-3xl border-2 border-dashed transition-all relative"
        style={{
          borderColor: `${accentColor}50`,
          backgroundColor: `${accentColor}08`,
          minWidth: 200,
          minHeight: 150,
        }}
      >
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !opacity-0" />

        {/* Label bar */}
        <div
          className="absolute -top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-lg border shadow-sm backdrop-blur-md"
          style={{
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}30`,
          }}
        >
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditLabel(data.label); setIsEditing(false); } }}
                className="bg-transparent border-none text-xs font-bold text-main focus:outline-none w-24"
                autoFocus
              />
              <button onClick={handleSave} className="p-0.5 text-accent hover:text-main"><Check size={10} /></button>
              <button onClick={() => { setEditLabel(data.label); setIsEditing(false); }} className="p-0.5 text-muted hover:text-danger"><X size={10} /></button>
            </div>
          ) : (
            <>
              <Maximize2 size={10} style={{ color: accentColor }} />
              <span
                className="text-[10px] font-bold uppercase tracking-widest cursor-default"
                style={{ color: accentColor }}
                onDoubleClick={() => setIsEditing(true)}
              >
                {data.label}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="p-0.5 text-muted hover:text-main opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 size={9} />
              </button>
            </>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !opacity-0" />
      </div>
    </>
  );
}
