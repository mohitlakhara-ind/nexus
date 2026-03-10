import React from 'react';
import { motion } from 'framer-motion';
import { X as XIcon, Edit3 } from 'lucide-react';

const GraphScratchpad = ({ isOpen, onClose, text, setText, setHasUnsavedChanges }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute right-6 bottom-24 w-80 bg-main/40 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
      style={{ minHeight: '300px', maxHeight: '500px' }}
    >
      {/* Header (Drag Handle) */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-main/50 cursor-move">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-muted" />
          <span className="text-sm font-semibold text-text-primary">Scratchpad</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors cursor-pointer"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setHasUnsavedChanges(true);
        }}
        placeholder="Jot down quick thoughts here..."
        className="flex-1 w-full bg-transparent p-4 text-sm text-text-secondary resize-none focus:outline-none focus:ring-0"
      />
    </motion.div>
  );
};

export default GraphScratchpad;
