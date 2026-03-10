import { useState } from 'react';
import { MessageCircle, Send, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NodeComments({ nodeId, comments = [], onAddComment }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text.trim()) return;
    onAddComment?.(nodeId, text.trim());
    setText('');
  };

  return (
    <div className="relative">
      {/* Comment toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`p-1 rounded-lg transition-all ${
          comments.length > 0
            ? 'text-amber-500 hover:bg-amber-500/10'
            : 'text-muted/50 hover:text-muted hover:bg-main/5'
        }`}
        title={`${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
      >
        <MessageCircle size={12} />
        {comments.length > 0 && (
          <span className="absolute -top-1 -right-1 size-3.5 bg-amber-500 text-background text-[7px] font-bold rounded-full flex items-center justify-center">
            {comments.length}
          </span>
        )}
      </button>

      {/* Comment thread popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-8 right-0 z-[100] w-64 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-main/5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Comments ({comments.length})</span>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-0.5 hover:bg-main/10 rounded-md text-muted">
                <XIcon size={12} />
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto p-2 space-y-2 scrollbar-hide">
              {comments.length === 0 ? (
                <p className="text-[10px] text-muted text-center py-4 italic">No comments yet</p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="bg-main/5 rounded-xl p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="size-4 rounded-md text-[7px] font-bold text-background flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${(c.username || 'A').charCodeAt(0) * 15}, 60%, 50%)` }}
                      >
                        {(c.username || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-[9px] font-bold text-main">{c.username}</span>
                      <span className="text-[8px] text-muted ml-auto">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-main/80 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-2 border-t border-border flex gap-1.5">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow bg-main/5 border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-main focus:outline-none focus:border-primary/40 placeholder:text-muted/50"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="p-1.5 bg-primary text-background rounded-lg disabled:opacity-30 hover:opacity-90 transition-all"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
