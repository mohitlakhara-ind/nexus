import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock, Shield, UserPlus, Webhook, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

export default function ShareModal({ isOpen, onClose, graph, token, userRole, onUpdate }) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('viewer');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [webhookSaving, setWebhookSaving] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    toast.error('Inviting collaborators is coming in a future update.');
  };

  const handleShare = (e) => {
    e.preventDefault();
    toast.error('Sharing features are coming in a future update.');
  };

  useEffect(() => {
    if (graph?.webhookUrl) {
      setWebhookUrl(graph.webhookUrl);
    }
  }, [graph]);

  if (!isOpen || !graph) return null;

  const isAdmin = userRole === 'admin';

  const handleToggleVisibility = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/graphs/${graph._id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: !graph.isPublic })
      });
      if (res.ok) {
        onUpdate({ ...graph, isPublic: !graph.isPublic });
        toast.success(`Map is now ${!graph.isPublic ? 'Public' : 'Private'}`);
      }
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  const handleSaveWebhook = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setWebhookSaving(true);
    try {
      const res = await fetch(`${API_URL}/graphs/${graph._id}/webhook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() })
      });
      
      if (res.ok) {
        toast.success('Webhook saved successfully!');
        onUpdate({ ...graph, webhookUrl: webhookUrl.trim() });
      } else {
        toast.error('Failed to save webhook');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setWebhookSaving(false);
    }
  };

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
        className="bg-bg border border-border sm:rounded-3xl rounded-t-3xl sm:rounded-b-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-border rounded-full"></div>
        </div>

        <div className="px-6 pt-4 sm:pt-6 pb-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
             <h2 className="text-xl font-heading font-bold text-text-main flex items-center gap-2">
               <Users className="text-brand-400" /> Share & Settings
             </h2>
             <p className="text-sm text-text-muted mt-0.5">Manage access and integrations</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow scrollbar-hide">
          {/* General Access Toggle */}
          <div className="flex items-center justify-between p-4 glass rounded-2xl border border-border mb-6">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${graph.isPublic ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                   {graph.isPublic ? <Globe size={20} /> : <Lock size={20} />}
                </div>
                <div>
                   <h4 className="font-bold text-text-main">{graph.isPublic ? 'Public Map' : 'Private Map'}</h4>
                   <p className="text-xs text-text-muted">{graph.isPublic ? 'Anyone with the link can view' : 'Only collaborators can view'}</p>
                </div>
             </div>
             {isAdmin && (
               <button 
                 onClick={handleToggleVisibility}
                 className="text-sm font-medium bg-surface hover:bg-surface-hover border border-border px-4 py-2 rounded-xl transition-colors text-text-main"
               >
                 Change
               </button>
             )}
          </div>

          {/* Webhook Settings */}
          {isAdmin && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Webhook size={14} /> Discord / Slack Webhook
              </label>
              <form onSubmit={handleSaveWebhook} className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://discord.com/api/webhooks/..." 
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="flex-grow bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl focus:outline-none focus:brand-500 transition-colors text-sm"
                />
                <button 
                  type="submit"
                  disabled={webhookSaving}
                  className="bg-surface hover:bg-brand-500/20 text-text-main border border-border px-3 py-2.5 rounded-xl font-medium transition-all"
                  title="Save Webhook"
                >
                  {webhookSaving ? '...' : <Check size={18} />}
                </button>
              </form>
              <p className="text-[10px] text-text-muted mt-1.5 ml-1">Fires automatically when the map is saved.</p>
            </div>
          )}

          <hr className="border-border my-6" />

          {/* Invite Form */}
          {isAdmin && (
            <form onSubmit={handleInvite} className="mb-6">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Invite Collaborator</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="flex-grow bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="bg-surface border border-border text-text-main px-3 py-2.5 rounded-xl outline-none focus:border-brand-500 transition-colors text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleShare}
                  disabled={sharing || shared}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-background px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center"
                >
                  {sharing ? 'Generating...' : shared ? 'Shared!' : 'Publish to Feed'}
                </button>
              </div>
            </form>
          )}

          {/* Collaborator List */}
          <div>
             <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">People with access</label>
             <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {/* Creator always admin */}
                <div className="flex items-center justify-between p-2">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                         {graph.creator.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <span className="font-semibold text-text-main block">{graph.creator.username}</span>
                         <span className="text-xs text-text-muted">{graph.creator.email || 'Owner'}</span>
                      </div>
                   </div>
                   <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md">Owner</span>
                </div>

                {/* Other collaborators */}
                {(graph.collaborators || []).map(collab => (
                  <div key={collab._id} className="flex items-center justify-between p-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-hover text-text-muted flex items-center justify-center font-bold text-sm">
                           {collab.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                           <span className="font-semibold text-text-main block">{collab.username}</span>
                        </div>
                     </div>
                     <span className="text-xs font-medium text-text-muted capitalize">{collab.role}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
