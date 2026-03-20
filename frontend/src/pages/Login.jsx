import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // toast is handled in store
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 rounded-[40px] border-border shadow-2xl relative overflow-hidden w-full max-w-md z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
          
          <div className="text-center mb-10">
            <div className="size-20 rounded-3xl bg-main/5 border border-border flex items-center justify-center mx-auto mb-8 shadow-inner group">
              <Logo className="size-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black text-main mb-3 uppercase italic tracking-tight">Sign In</h1>
            <p className="text-muted font-medium uppercase tracking-[0.2em] text-[10px]">Welcome Back to Nexus</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-main/5 border border-border rounded-2xl py-4 pl-12 pr-6 text-main focus:outline-none focus:border-primary/50 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-main/5 border border-border rounded-2xl py-4 pl-12 pr-12 text-main focus:outline-none focus:border-primary/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background py-4 rounded-2xl font-display font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-3 mt-8 group text-sm uppercase"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-10 text-muted font-medium text-xs">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-secondary transition-colors font-bold uppercase tracking-widest text-[10px]">
              Create One
            </Link>
          </p>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
          <ShieldCheck size={16} className="text-main" />
          <span className="text-[10px] font-bold text-main uppercase tracking-widest">Secure Authentication System</span>
        </div>
      </motion.div>
    </div>
  );
}
