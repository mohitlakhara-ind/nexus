import { create } from 'zustand';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('nexus_token') || null,
  isAuthenticated: !!localStorage.getItem('nexus_token'),
  error: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('nexus_token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      toast.success(`Welcome back, ${data.username}!`);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message);
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('nexus_token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      toast.success(`Welcome to Nexus, ${data.username}!`);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message);
      return false;
    }
  },

  updatePreferences: async (preferences) => {
    const token = localStorage.getItem('nexus_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/preferences`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(preferences)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to update preferences');
      
      set(state => ({ user: { ...state.user, ...data } }));
      toast.success('Preferences updated!');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  },

  awardXP: async (amount) => {
    const token = localStorage.getItem('nexus_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/xp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to award XP');
      
      if (data.leveledUp) {
         toast.success(`🎉 Level Up! You are now Level ${data.level}!`, { duration: 4000, icon: '🌟' });
      }

      set(state => ({ user: { ...state.user, xp: data.xp, level: data.level } }));
      return data;
    } catch (err) {
      console.error('XP Error:', err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('nexus_token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('nexus_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data, isAuthenticated: true });
      } else {
        localStorage.removeItem('nexus_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  }
}));
