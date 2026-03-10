import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GitGraph, Star, Trophy, Clock, ArrowRight, User, Plus, Sparkles, ShieldCheck, Zap, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import BadgeShowcase from '../components/BadgeShowcase';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      } else {
        toast.error('User not found');
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [id, fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-6">
          <div className="size-12 rounded-2xl bg-main/5 border border-border flex items-center justify-center animate-pulse">
            <User size={24} className="text-muted" />
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted px-6">
        <div className="size-20 rounded-3xl bg-main/5 border border-border flex items-center justify-center mb-6">
          <User size={32} />
        </div>
        <h3 className="text-xl font-display font-bold text-main uppercase tracking-tight mb-2">User Not Found</h3>
        <p className="text-muted text-sm mb-10 max-w-xs text-center">The profile you are looking for does not exist.</p>
        <Link to="/" className="bg-main/5 border border-border text-main px-8 py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-main/10 transition-all">
          Go Home
        </Link>
      </div>
    );
  }

  const { user, graphs, reputation, stats } = profile;
  const isOwnProfile = currentUser?._id === id;
  const isCurrentUser = isOwnProfile; // Renamed for consistency with diff

  const getTier = (rep) => {
    if (rep >= 100) return { label: 'Expert', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20 shadow-md' };
    if (rep >= 50) return { label: 'Synthesizer', color: 'text-primary', bg: 'bg-primary/10 border-primary/20 shadow-md' };
    if (rep >= 20) return { label: 'Analyst', color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20 shadow-md' };
    return { label: 'Beginner', color: 'text-muted', bg: 'bg-main/5 border-border shadow-none' };
  };

  const tier = getTier(reputation);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20 pt-16">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 size-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[32px] p-8 sm:p-12 mb-12 flex flex-col md:flex-row items-center md:items-start gap-10 border-border"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="size-32 rounded-[32px] flex items-center justify-center text-5xl font-display font-extrabold text-main shadow-2xl relative z-10 overflow-hidden bg-main/5 border border-border">
              {user.username?.[0].toUpperCase()}
            </div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-display font-extrabold text-main tracking-tight uppercase">{user.username}</h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mt-6">
              <div className="flex flex-col items-center md:items-start">
                <p className="text-3xl font-display font-extrabold text-main tracking-tight">{reputation}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={10} className="text-primary fill-primary/20" /> Reputation
                </p>
              </div>
              <div className="size-px h-12 bg-main/5 mx-2 hidden sm:block" />

              <div className="flex flex-col items-center md:items-start">
                <p className="text-3xl font-display font-extrabold text-main tracking-tight">{graphs.length}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layout size={10} className="text-secondary fill-secondary/20" /> Total Maps
                </p>
              </div>
              <div className="size-px h-12 bg-main/5 mx-2 hidden sm:block" />

              <div className="flex flex-col items-center md:items-start flex-grow">
                <BadgeShowcase stats={stats} compact={true} />
                <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2 mt-3">
                  <Star size={10} className="text-muted" /> Achievements
                </p>
              </div>
            </div>
          </div>

          {isCurrentUser && (
            <Link to="/dashboard" className="bg-main/5 border border-border text-main px-8 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-main/10 transition-all self-center md:self-start group">
              <span className="flex items-center gap-3">
                Create New Map <Plus size={14} className="group-hover:text-primary transition-colors text-muted" />
              </span>
            </Link>
          )}
        </motion.div>

        {/* Projects Grid */}
        <div className="space-y-8">
          <div className="flex items-center mb-10 px-2 lg:px-0">
            <h2 className="text-xs font-bold text-muted uppercase tracking-[0.4em]">
              MAPPING PROJECTS ({graphs.length})
            </h2>
            <div className="h-px flex-grow bg-main/5 ml-6" />
          </div>

          {graphs.length === 0 ? (
            <div className="glass-card rounded-[40px] py-24 text-center border-border relative overflow-hidden group">
              <div className="size-20 rounded-[28px] bg-main/5 border border-border flex items-center justify-center mx-auto mb-8 relative group-hover:bg-main/10 transition-all duration-500">
                <GitGraph size={32} className="text-muted group-hover:text-primary transition-colors duration-500" />
              </div>
              <h3 className="font-display font-extrabold text-main mb-3 text-2xl uppercase tracking-tight">
                No maps found
              </h3>
              <p className="text-muted text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                {isCurrentUser ? "You haven't created any maps yet. Start by creating your first visualization!" : "This user has not published any maps yet."}
              </p>

              {isOwnProfile && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-3 bg-primary text-background px-10 py-4 rounded-2xl font-display font-bold transition-all shadow-md hover:scale-105 active:scale-95 text-xs uppercase tracking-widest group"
                >
                  Create Map
                  <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {graphs.map((graph, idx) => (
                <motion.div
                  key={graph._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/graph/${graph._id}`}
                    key={graph._id}
                    className="glass-card rounded-[32px] p-8 border-border hover:border-primary/30 transition-all duration-500 group flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                      <ArrowRight size={20} className="text-primary" />
                    </div>

                    <div className="size-14 rounded-2xl bg-main/5 border border-border flex items-center justify-center mb-6 shadow-inner group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                      <GitGraph size={24} className="text-muted group-hover:text-primary transition-colors" />
                    </div>

                    <h3 className="font-display font-extrabold text-main text-xl uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-primary transition-colors">{graph.title}</h3>

                    <div className="flex-grow">
                      <p className="text-muted text-sm font-medium line-clamp-2 mb-8 flex-grow leading-relaxed">{graph.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center gap-2 text-muted">
                        <Star size={14} className="group-hover:text-amber-400 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{graph.stars || 0}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
