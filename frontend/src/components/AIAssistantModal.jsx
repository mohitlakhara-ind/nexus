import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

export default function AIAssistantModal({ isOpen, onClose, nodes, edges, onApplySuggestions, onWorkingStateChange }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your brainstorm partner. I can see your map. What are we trying to solve today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    if (onWorkingStateChange) onWorkingStateChange(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        content: m.text 
      }));

      // Only pass necessary map context
      const mapContext = {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      };

      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history,
          mapContext
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
        
        // If the AI returned suggestions, trigger the callback to add them to the graph natively
        if (data.suggestions && (data.suggestions.newNodes?.length > 0 || data.suggestions.newEdges?.length > 0)) {
           onApplySuggestions(data.suggestions);
           toast.success('Brainstorm partner added components to the map!', { icon: '🤖' });
        }

      } else {
        toast.error('Assistant failed to respond.');
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an error processing your request.' }]);
      }
    } catch (err) {
      toast.error('Network Error');
      setMessages(prev => [...prev, { role: 'assistant', text: 'Network error connecting to my servers.' }]);
    } finally {
      setLoading(false);
      if (onWorkingStateChange) onWorkingStateChange(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 100 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) onClose();
        }}
        className="fixed sm:absolute bottom-0 sm:bottom-24 left-0 sm:left-auto right-0 sm:right-6 w-full sm:w-96 h-[80vh] sm:h-[70vh] sm:max-h-[500px] glass-panel border border-border/50 shadow-2xl z-50 rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0 bg-surface/50 backdrop-blur-md">
          <div className="w-12 h-1.5 bg-border rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 py-2 sm:py-3 border-b border-border/50 bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-1">
                  Brainstorm Partner
                  <Sparkles size={12} className="text-yellow-400" />
                </h3>
                <p className="text-[10px] text-text-muted leading-none">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-bg/40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-md ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : 'bg-main/10 text-main rounded-bl-sm'
                } border border-border`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 bg-main/5 text-muted rounded-2xl rounded-bl-sm border border-border animate-pulse uppercase text-[10px] font-bold tracking-widest">
                Analyzing neural patterns...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-main/5">
          <div className="relative">
            <input
              type="text"
              placeholder="Query the engine..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-background border border-border rounded-2xl py-4 pl-6 pr-14 text-main text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondary text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-all shadow-md"
            >
              <Send size={14} className={loading ? 'opacity-0' : 'opacity-100'} />
              {loading && <Loader2 size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
