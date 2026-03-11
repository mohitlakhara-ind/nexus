import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Network, LogOut, User, Globe, LayoutDashboard, Sun, Moon, Save, Menu, X, Trophy } from 'lucide-react';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import UserBadge from './UserBadge';
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
              <Logo className="size-8 text-primary fill-primary/20" />
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
                <NotificationBell />
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[140]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-[280px] bg-background border-l border-border shadow-2xl z-[150] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-muted">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-main/5 text-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 p-4 bg-main/5 rounded-2xl border border-border mb-6">
                    <UserBadge level={user?.level || 1} size="md" />
                    <div className="overflow-hidden">
                      <span className="block font-display font-bold text-main truncate">{user?.username}</span>
                      <span className="block text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Level {user?.level || 1}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <MobileNavLink
                      to="/dashboard"
                      icon={LayoutDashboard}
                      label="Dashboard"
                      active={isActive('/dashboard')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      color="text-primary"
                    />
                    <MobileNavLink
                      to="/discover"
                      icon={Globe}
                      label="Discover"
                      active={isActive('/discover')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      color="text-secondary"
                    />
                    <MobileNavLink
                      to="/ranks"
                      icon={Trophy}
                      label="Ranks"
                      active={isActive('/ranks')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      color="text-warning"
                    />
                  </div>

                  <div className="mt-auto pt-6 space-y-4">
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between px-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest">
                        <Save size={14} />
                        Auto-Save
                      </div>
                      <button
                        onClick={toggleAutoSave}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user?.autoSave ? 'bg-primary' : 'bg-main/20'}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${user?.autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 text-danger hover:bg-danger/10 rounded-2xl transition-all font-bold uppercase tracking-[0.2em] text-xs"
                    >
                      <LogOut size={18} />
                      Logout Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center rounded-2xl bg-main/5 text-xs font-display font-black text-main uppercase tracking-[0.2em] border border-border"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center bg-primary text-background rounded-2xl font-display font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                  >
                    Join Nexus
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ to, icon: Icon, label, active, onClick, color }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${active ? `${color} bg-main/5 border border-border` : 'text-muted hover:bg-main/5 hover:text-main'
        }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
