import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const CommandPalette = ({ isOpen, onClose, actions }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    (action.keywords && action.keywords.some(k => k.toLowerCase().includes(debouncedQuery.toLowerCase())))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[selectedIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-main/10 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header & Search */}
          <div className="flex items-center px-4 py-4 border-b border-border/50 bg-main/5">
            <Command size={20} className="text-muted mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none focus:outline-none text-main placeholder-muted/60 text-lg font-medium"
            />
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-widest bg-main/10 px-2 py-1 rounded">
              <kbd>ESC</kbd> to close
            </div>
          </div>

          {/* Action List */}
          <div 
            ref={listRef}
            className="overflow-y-auto overflow-x-hidden max-h-[50vh] scrollbar-hide py-2"
          >
            {filteredActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <Search size={32} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No results found for "{query}"</p>
              </div>
            ) : (
              filteredActions.map((action, index) => {
                const Icon = action.icon;
                const isActive = index === selectedIndex;
                
                return (
                  <div
                    key={action.id || action.label}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => { action.action(); onClose(); }}
                    className={`flex items-center justify-between px-4 py-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-primary/20 text-primary border border-primary/20' 
                        : 'text-main hover:bg-main/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-main/10 text-muted'}`}>
                          <Icon size={16} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-main'}`}>
                          {action.label}
                        </span>
                        {action.description && (
                          <span className="text-xs text-muted/80">{action.description}</span>
                        )}
                      </div>
                    </div>
                    {action.shortcut && (
                      <div className="flex gap-1">
                        {action.shortcut.map((key, i) => (
                          <kbd 
                            key={i} 
                            className={`px-2 py-1 text-[10px] font-medium rounded border ${
                              isActive 
                                ? 'bg-primary/10 border-primary/30 text-primary' 
                                : 'bg-main/5 border-border text-muted'
                            }`}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
