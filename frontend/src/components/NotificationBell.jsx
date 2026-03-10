import { useState, useRef, useEffect } from 'react';
import { Bell, GitGraph, ThumbsUp, MessageSquare, UserPlus, Circle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// Demo activity data — in a real app this would be fetched from the API
const ACTIVITY_TYPES = {
  vote: { icon: ThumbsUp, color: 'text-green-400', bg: 'bg-green-500/10', label: 'voted on' },
  comment: { icon: MessageSquare, color: 'text-brand-400', bg: 'bg-brand-500/10', label: 'commented on' },
  join: { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'joined' },
  edit: { icon: GitGraph, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'edited' },
};

export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    // Mark all as read when panel opens
    if (!open) {
      setReadIds(new Set(notifications.map(n => n.id)));
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell size={20} className="text-muted group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-background text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-text-main">Activity</h3>
            <span className="text-xs text-text-muted">{notifications.length} recent</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center justify-center bg-surface/30">
                <div className="relative mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Bell size={20} className="text-brand-400" />
                  </div>
                  <Sparkles size={12} className="text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-text-main mb-1">You're all caught up!</h4>
                <p className="text-xs text-text-muted">No new activity to show right now.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const type = ACTIVITY_TYPES[notif.type] || ACTIVITY_TYPES.edit;
                const Icon = type.icon;
                const isUnread = !readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${isUnread ? 'bg-brand-500/5' : ''}`}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${type.bg}`}>
                      <Icon size={13} className={type.color} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-text-main leading-relaxed">
                        <span className="font-medium">{notif.username}</span>
                        {' '}{type.label}{' '}
                        <span className="text-brand-400 font-medium truncate">{notif.mapTitle}</span>
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                        {isUnread && <Circle size={5} className="fill-brand-400 text-brand-400" />}
                        {notif.timeAgo}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <Link to="/dashboard" className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                View all activity →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
