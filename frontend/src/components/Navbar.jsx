import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Network, LogOut, User, Zap, Globe, LayoutDashboard, Sun, Moon, Save, Menu, X, Trophy } from 'lucide-react';
import NotificationBell from './NotificationBell';
import UserBadge from './UserBadge';
import { useState } from 'react';

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'vote', username: 'Alice', mapTitle: 'Q3 Revenue Drop', timeAgo: '2m ago' },
  { id: 2, type: 'comment', username: 'Bob', mapTitle: 'Supply Chain Issue', timeAgo: '14m ago' },
  { id: 3, type: 'join', username: 'Charlie', mapTitle: 'Q3 Revenue Drop', timeAgo: '1h ago' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout, updatePreferences } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleAutoSave = () => {
    if (user) {
      updatePreferences({ autoSave: !user.autoSave });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-[100] glass-panel border-b border-border h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="size-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all shadow-md">
                <Network className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-extrabold tracking-tighter text-main leading-none">
                  NEXUS
                </span>
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-primary leading-none mt-1">
                  PLATFORM
                </span>
              </div>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-muted hover:text-main hover:bg-main/5'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discover"
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive('/discover') ? 'text-secondary bg-secondary/10' : 'text-muted hover:text-main hover:bg-main/5'
                    }`}
                >
                  Discover
                </Link>
                <Link
                  to="/ranks"
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive('/ranks') ? 'text-warning bg-warning/10' : 'text-muted hover:text-main hover:bg-main/5'
                    }`}
                >
                  Ranks
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-main/5 border border-border text-muted hover:text-main hover:bg-main/10 transition-all"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAutoSave}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border text-xs font-bold ${user?.autoSave
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-main/5 text-muted border-border hover:bg-main/10 hover:text-main'
                    }`}
                  title={user?.autoSave ? "Auto-Save Enabled" : "Auto-Save Disabled"}
                >
                  <Save size={14} className={user?.autoSave ? "opacity-100" : "opacity-50"} />
                  <span className="hidden sm:inline">Auto-Save</span>
                </button>
                <div className="h-6 w-px bg-border mx-1" />
                <NotificationBell notifications={DEMO_NOTIFICATIONS} />
                <div className="h-6 w-px bg-border mx-1" />
                <Link
                  to={`/profile/${user?._id}`}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-main/5 transition-all border border-transparent hover:border-border group"
                >
                  <UserBadge level={user?.level || 1} size="sm" />
                  <span className="font-display font-bold text-sm text-muted group-hover:text-main transition-colors hidden sm:block">
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-display font-bold text-muted hover:text-main transition-all uppercase tracking-widest"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background rounded-xl font-display font-bold text-sm transition-all shadow-md hover:scale-105 active:scale-95 group uppercase tracking-widest"
                >
                  Join Nexus
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-muted hover:text-main"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-2xl z-50 p-4 flex flex-col gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-main/5 rounded-xl border border-border">
                <UserBadge level={user?.level || 1} size="md" />
                <div>
                  <span className="block font-display font-bold text-main">{user?.username}</span>
                  <span className="block text-xs text-muted uppercase tracking-widest">Lv. {user?.level || 1}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-muted hover:bg-main/5'
                    }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${isActive('/discover') ? 'text-secondary bg-secondary/10' : 'text-muted hover:bg-main/5'
                    }`}
                >
                  <Globe size={18} />
                  Discover
                </Link>
                <Link
                  to="/ranks"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${isActive('/ranks') ? 'text-warning bg-warning/10' : 'text-muted hover:bg-main/5'
                    }`}
                >
                  <Trophy size={18} />
                  Ranks
                </Link>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Auto-Save</span>
                <button
                  onClick={toggleAutoSave}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user?.autoSave ? 'bg-primary' : 'bg-main/20'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${user?.autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 text-danger hover:bg-danger/10 rounded-xl transition-all font-bold uppercase tracking-widest text-sm mt-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-center rounded-xl bg-main/5 text-sm font-display font-bold text-main uppercase tracking-widest"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-center bg-primary text-background rounded-xl font-display font-bold text-sm uppercase tracking-widest"
              >
                Join Nexus
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
