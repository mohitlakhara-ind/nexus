import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, RotateCcw, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

export default function GraphHistoryModal({ isOpen, onClose, graphId, token, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versionName, setVersionName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, graphId, token]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/graphs/${graphId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setVersions(await res.json());
      }
    } catch (err) {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async (e) => {
    e.preventDefault();
    if (!versionName.trim()) return;
    
    setSaving(true);
    try {
      // First, get current live nodes/edges to save
      const graphRes = await fetch(`${API_URL}/graphs/${graphId}`);
      const graphData = await graphRes.json();
      
      const res = await fetch(`${API_URL}/graphs/${graphId}/versions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
           versionName: versionName.trim(),
           nodes: graphData.nodes,
           edges: graphData.edges
        })
      });
      
      if (res.ok) {
        toast.success('Version saved!');
        setVersionName('');
        fetchVersions();
      }
    } catch (err) {
      toast.error('Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (version) => {
    if (window.confirm(`Are you sure you want to restore "${version.versionName}"? This will overwrite the current live map.`)) {
       // We pass the raw nodes and edges back to the editor to apply
       onRestore(version.nodes, version.edges);
       onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) onClose();
        }}
        className="bg-bg border border-border sm:rounded-3xl rounded-t-3xl sm:rounded-b-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-border rounded-full"></div>
        </div>

        <div className="px-6 pt-4 sm:pt-6 pb-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-heading font-bold text-text-main flex items-center gap-2">
              <Clock className="text-brand-400" /> Map History
            </h2>
            <p className="text-sm text-text-muted mt-0.5">Save snapshots and restore previous versions</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {/* Create new snapshot */}
          <form onSubmit={handleSaveVersion} className="mb-8 flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="v1.0 - Initial Feedback" 
              value={versionName}
              onChange={e => setVersionName(e.target.value)}
              className="flex-grow bg-surface border border-border text-text-main px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
            <button 
              onClick={handleRestore}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-background px-5 py-3 rounded-xl font-medium transition-all text-sm"
            >
              <History size={18} />
 Save Snapshot
            </button>
          </form>

          {/* List versions */}
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Version History</h3>
          
          {loading ? (
             <div className="text-center py-8 text-text-muted">Loading history...</div>
          ) : versions.length === 0 ? (
             <div className="text-center py-12 glass border border-border/50 rounded-2xl">
                <Clock className="mx-auto text-text-muted/50 mb-3" size={32} />
                <p className="text-text-main font-bold">No versions saved yet</p>
                <p className="text-sm text-text-muted mt-1">Create a snapshot above to save the current state.</p>
             </div>
          ) : (
             <div className="space-y-3">
               {versions.map((v) => (
                 <div key={v._id} className="glass p-4 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-brand-500/50 transition-colors">
                   <div>
                     <h4 className="font-bold text-text-main">{v.versionName}</h4>
                     <div className="text-xs text-text-muted mt-1 flex flex-wrap items-center gap-2">
                       <span>{new Date(v.createdAt).toLocaleString()}</span>
                       <span className="hidden sm:inline">•</span>
                       <span>Saved by {v.savedBy?.username || 'Unknown'}</span>
                       <span className="hidden sm:inline">•</span>
                       <span className="bg-surface px-2 py-0.5 rounded-md">{v.nodes?.length || 0} nodes</span>
                     </div>
                   </div>
                    <button 
                     onClick={() => setPreviewVersion(version)}
                     className="flex items-center justify-center gap-2 bg-main/5 hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/20 text-main px-4 py-2 rounded-xl text-sm font-medium transition-all sm:opacity-0 sm:group-hover:opacity-100"
                    >
                     <RotateCcw size={14} /> Restore
                   </button>
                 </div>
               ))}
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
