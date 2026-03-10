import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Plus, Search, GitGraph, FileText, Layers, Globe, Clock,
  ArrowRight, Sparkles, Users, BarChart3, TrendingUp, X, ChevronRight,
  Network, Target, Folder as FolderIcon, FolderPlus, Settings, Zap,
  Activity, Bell, PieChart, MoreVertical, Copy, Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import OnboardingTour from '../components/OnboardingTour';
import UserBadge from '../components/UserBadge';
import useDebounce from '../hooks/useDebounce';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

const TEMPLATES = [
  {
    id: 'blank',
    title: 'New Blank Map',
    desc: 'Start from scratch',
    icon: PieChart,
    color: 'text-muted',
    label: 'Architecture'
  },
  {
    id: '5_whys',
    title: 'Root Cause',
    desc: 'Find the source of a problem',
    icon: Layers,
    color: 'text-warning',
    bg: 'bg-warning/10'
  },
  {
    id: 'pros_cons',
    title: 'Decision Maker',
    desc: 'Compare your options',
    icon: GitGraph,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    id: 'swot',
    title: 'SWOT Analysis',
    desc: 'Plan your next move',
    icon: Target,
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  },
  {
    id: 'fishbone',
    title: 'Fishbone',
    desc: 'Analyze cause and effect',
    icon: Network,
    color: 'text-accent',
    bg: 'bg-accent/10'
  }
];

const SIDEBAR_LINKS = [
  { label: 'All Maps', id: 'all', icon: Globe },
  { label: 'My Maps', id: 'mine', icon: FileText },
  { label: 'Trending', id: 'trending', icon: TrendingUp },
];

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="glass-panel rounded-2xl px-6 py-5 flex items-center gap-5 group hover:border-border/50 transition-all cursor-default">
      <div className={`size-12 rounded-xl flex items-center justify-center bg-main/5 border border-border group-hover:bg-main/10 transition-colors`}>
        <Icon size={22} className={colorClass} />
      </div>
      <div>
        <p className="text-2xl font-display font-extrabold text-main leading-none tracking-tight">{value}</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function MapCard({ graph, user, onDelete, onDuplicate, onEdit }) {
  const isOwn = graph.creator?._id === user?._id;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
    >
      <Link
        to={`/graph/${graph._id}`}
        className="glass-card rounded-2xl p-6 flex flex-col h-full border-border hover:border-primary/40 transition-all duration-300 group block relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <GitGraph size={20} className="text-primary" />
          </div>
          <div className="flex items-center gap-2 pr-8">
            {/* Node & Edge count badges */}
            <span className="text-[9px] font-mono font-bold text-muted bg-main/5 border border-border px-2 py-0.5 rounded-full">
              {graph.nodes?.length ?? 0}n · {graph.edges?.length ?? 0}e
            </span>
          </div>
        </div>

        <h3 className="font-display font-bold text-main text-lg mb-2 line-clamp-1 leading-tight group-hover:text-primary transition-colors">{graph.title}</h3>

        {graph.tags && graph.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {graph.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[9px] uppercase font-bold tracking-widest bg-main/5 text-muted px-2 py-1 rounded-md border border-border group-hover:border-primary/20 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted line-clamp-2 mb-6 flex-grow leading-relaxed">{graph.description || 'No description provided.'}</p>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] uppercase tracking-widest font-bold font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <Clock size={12} />
            {new Date(graph.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            {isOwn && <span className="text-secondary tracking-widest">OWNED</span>}
            <div className="flex items-center gap-1.5 text-muted">
              <span className="max-w-[80px] truncate">{graph.creator?.username}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 3-dot context menu – outside the Link so clicks don't navigate */}
      <div ref={menuRef} className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(m => !m); }}
          className="p-1.5 rounded-xl text-muted hover:bg-main/10 hover:text-main transition-all"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 glass-panel border border-border rounded-xl shadow-2xl overflow-hidden z-30">
            <button
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); onDuplicate(graph._id); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-main hover:bg-main/10 transition-all"
            >
              <Copy size={14} className="text-secondary" />
              Duplicate
            </button>
            {isOwn && (
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); onEdit(graph); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-main hover:bg-main/10 transition-all border-t border-border"
              >
                <Settings size={14} className="text-primary" />
                Edit Details
              </button>
            )}
            {isOwn && (
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); onDelete(graph._id, graph.title); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-danger hover:bg-danger/10 transition-all border-t border-border"
              >
                <Trash2 size={14} />
                Delete Map
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActivityItem({ title, time, type }) {
  return (
    <div className="flex gap-4 p-3 rounded-xl hover:bg-main/5 transition-colors border border-transparent hover:border-border group">
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${type === 'create' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
        }`}>
        {type === 'create' ? <Plus size={14} /> : <Zap size={14} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-main truncate">{title}</p>
        <p className="text-[10px] text-muted font-medium uppercase tracking-widest mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const [graphs, setGraphs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [creating, setCreating] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most-nodes

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [editingGraphId, setEditingGraphId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  // Reset modal state when opening
  useEffect(() => {
    if (isModalOpen && !editingGraphId) {
      setNewTitle('');
      setNewDesc('');
      setNewTags('');
      setSelectedFolder('');
      // Keep selectedTemplate if it was set via template button, otherwise blank
    }
  }, [isModalOpen, editingGraphId]);

  const handleEditClick = (graph) => {
    setEditingGraphId(graph._id);
    setNewTitle(graph.title);
    setNewDesc(graph.description || '');
    setNewTags(graph.tags?.join(', ') || '');
    setSelectedFolder(graph.folderId || '');
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [graphsRes, foldersRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/graphs`),
        token ? fetch(`${API_URL}/folders`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
        fetch(`${API_URL}/activity`)
      ]);

      if (graphsRes.ok) {
        setGraphs(await graphsRes.json());
      }
      if (foldersRes && foldersRes.ok) {
        setFolders(await foldersRes.json());
      }
      if (activityRes && activityRes.ok) {
        setActivities(await activityRes.json());
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) { toast.error('Folder name required'); return; }
    setCreatingFolder(true);

    try {
      const res = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newFolderName })
      });
      if (res.ok) {
        const newFolder = await res.json();
        setFolders([newFolder, ...folders]);
        toast.success('Folder created');
        setIsFolderModalOpen(false);
        setNewFolderName('');
      } else {
        toast.error('Failed to create folder');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreateGraph = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error('Please provide a title'); return; }
    setCreating(true);
    try {
      const url = editingGraphId ? `${API_URL}/graphs/${editingGraphId}` : `${API_URL}/graphs`;
      const method = editingGraphId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          template: !editingGraphId && selectedTemplate !== 'blank' ? selectedTemplate : undefined,
          tags: newTags.split(',').map(t => t.trim()).filter(t => t),
          folderId: selectedFolder || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingGraphId ? 'Map updated!' : 'Map created!');
        setIsModalOpen(false);
        setEditingGraphId(null);
        setNewTitle(''); setNewDesc(''); setNewTags(''); setSelectedFolder('');
        if (!editingGraphId) {
          navigate(`/graph/${data._id}`);
        } else {
          setGraphs(prev => prev.map(g => g._id === editingGraphId ? { ...g, ...data } : g));
        }
      } else {
        toast.error(data.message || 'Failed to process request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const myMaps = graphs.filter(g => g.creator?._id === user?._id);

  const handleDeleteGraph = async (graphId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/graphs/${graphId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setGraphs(prev => prev.filter(g => g._id !== graphId));
        toast.success('Map deleted');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDuplicateGraph = async (graphId) => {
    try {
      const res = await fetch(`${API_URL}/graphs/${graphId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const newGraph = await res.json();
        setGraphs(prev => [{ ...newGraph, creator: { _id: user?._id, username: user?.username } }, ...prev]);
        toast.success('Map duplicated!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to duplicate');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const sortedGraphs = [...graphs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'most-nodes') return (b.nodes?.length || 0) - (a.nodes?.length || 0);
    return 0;
  });

  const filteredGraphs = sortedGraphs.filter(g => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(searchLower) ||
      g.description?.toLowerCase().includes(searchLower) ||
      g.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    if (filter === 'mine') return matchesSearch && g.creator?._id === user?._id;
    if (filter === 'trending') return matchesSearch;
    if (filter !== 'all') {
      return matchesSearch && g.folderId === filter && g.creator?._id === user?._id;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Simplified */}
      <aside className="hidden lg:flex flex-col w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] glass-panel border-r border-border px-6 py-8 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-6 px-2">QUICK LINKS</p>
        <nav className="space-y-2 mb-10">
          {SIDEBAR_LINKS.map(({ label, id, icon: LinkIcon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-bold transition-all ${filter === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted hover:bg-main/5 hover:text-main border border-transparent'
                }`}
            >
              <LinkIcon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {token && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">FOLDERS</p>
              <button onClick={() => setIsFolderModalOpen(true)} className="text-primary hover:text-secondary transition-colors p-1" title="New Folder">
                <FolderPlus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {folders.length === 0 ? (
                <p className="text-[10px] text-muted/60 px-2 italic uppercase tracking-widest">No folders</p>
              ) : (
                folders.map(f => (
                  <button
                    key={f._id}
                    onClick={() => setFilter(f._id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group ${filter === f._id ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'text-muted hover:bg-main/5 hover:text-main border border-transparent'
                      }`}
                  >
                    <FolderIcon size={14} className={f.color || 'text-secondary'} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-4 px-2">Community Activity</p>
          <div className="space-y-4 px-2">
            {activities.length === 0 ? (
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest italic opacity-50 px-1">No Recent Waves</p>
            ) : (
              activities.map((act, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className={`mt-1.5 size-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${act.type === 'new_map' ? 'text-primary' : 'text-secondary'}`} />
                  <div className="flex flex-col">
                    <p className="text-[11px] text-main font-bold leading-tight group-hover:text-primary transition-colors cursor-default">
                      <span className="opacity-70">{act.user}</span>
                      {act.type === 'new_map' ? ' mapped ' : ' trending: '}
                      <span className="italic">{act.title}</span>
                    </p>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-muted mt-1 opacity-50">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mb-10">
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-4 px-2">TEMPLATES</p>
          <div className="space-y-1">
            {TEMPLATES.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setIsModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-muted/60 hover:bg-main/5 hover:text-muted transition-all border border-transparent"
                >
                  <Icon size={14} className={t.color} />
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>

        {user && (
          <div className="mt-auto flex flex-col gap-3 p-4 rounded-2xl bg-main/5 border border-border group relative overflow-hidden">
            {/* Background Glow based on level */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <UserBadge level={user.level || 1} size="lg" showLabel={false} />

              <div className="overflow-hidden flex-grow">
                <p className="text-lg font-display font-extrabold text-main truncate tracking-tight">{user.username}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Lv. {user.level || 1}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted">{user.xp || 0} XP</p>
                </div>
                {/* Progress bar to next level */}
                <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${((user.xp || 0) % 50) / 50 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to={`/profile/${user._id}`}
              className="w-full text-center py-2 bg-background/50 hover:bg-main/10 rounded-xl text-xs font-bold font-display uppercase tracking-widest text-muted hover:text-main transition-colors mt-2"
            >
              View Profile
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content - Expanded with Activity Feed */}
      <main className="flex-grow lg:pl-64 pr-0 flex min-h-screen">
        <div className="flex-grow px-4 sm:px-8 lg:pl-14 lg:pr-8 pt-24 pb-12 overflow-y-auto w-full max-w-[100vw] overflow-x-hidden">
          <OnboardingTour isDashboard={true} />
          <div className="max-w-5xl mx-auto w-full">

            {/* Header - Simplified Text */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary">Workspace</span>
                  <div className="h-px w-10 bg-primary/30" />
                </div>
                <h1 className="text-4xl font-display font-extrabold text-main">
                  Hello, <span className="gradient-text uppercase tracking-tight">{user?.username}</span>
                </h1>
                <p className="text-muted text-sm mt-2 font-medium">Create your maps and find better solutions together.</p>
              </div>
              <button
                id="tour-new-map"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-background px-8 py-4 rounded-2xl font-display font-bold transition-all shadow-md hover:scale-105 active:scale-95 text-sm w-full lg:w-auto"
              >
                <Plus size={20} strokeWidth={3} />
                CREATE NEW MAP
              </button>
            </div>

            {/* Mobile-only Filter Bar since Sidebar is hidden */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {SIDEBAR_LINKS.map(({ label, id, icon: LinkIcon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === id
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-main/5 text-muted hover:text-main border-transparent'
                    }`}
                >
                  <LinkIcon size={14} />
                  {label}
                </button>
              ))}
              {/* Quick add folder button on mobile */}
              {token && (
                <button onClick={() => setIsFolderModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-main/5 text-muted hover:text-main transition-all border border-transparent">
                  <FolderPlus size={14} />
                  New Folder
                </button>
              )}
            </div>

            {/* Stats Strip - Simplified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <StatCard label="Total Maps" value={graphs.length} icon={GitGraph} colorClass="text-primary" />
              <StatCard label="My Maps" value={myMaps.length} icon={FileText} colorClass="text-secondary" />
              <StatCard label="Shared" value={graphs.length - myMaps.length} icon={Globe} colorClass="text-accent" />
              <StatCard label="Points" value="1,240" icon={Zap} colorClass="text-warning" />
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12" id="tour-search">
              <div className="relative flex-grow w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full glass-panel border-border text-main pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:border-primary/50 text-sm transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-main/5 border border-border px-4 py-2 rounded-2xl shrink-0">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-main outline-none focus:ring-0 cursor-pointer py-1 pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-nodes">Most Nodes</option>
                </select>
              </div>
            </div>

            {/* Maps Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card rounded-2xl p-6 h-64 animate-pulse relative overflow-hidden bg-main/5" />
                ))}
              </div>
            ) : filteredGraphs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl py-32 text-center border-border relative overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="size-20 rounded-3xl bg-main/5 border border-border flex items-center justify-center mx-auto mb-8 group overflow-hidden relative">
                  <Sparkles size={32} className="text-primary animate-pulse relative z-10" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all" />
                </div>
                <h3 className="font-display font-extrabold text-main mb-3 text-2xl tracking-tight">{searchTerm ? 'NO RESULTS FOUND' : 'START YOUR FIRST PROJECT'}</h3>
                <p className="text-muted text-sm mb-10 max-w-sm mx-auto font-medium">{searchTerm ? 'Try a different search term.' : 'Begin your journey by creating a new visual map for your ideas.'}</p>

                {!searchTerm && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-primary text-background px-10 py-5 rounded-2xl font-display font-bold transition-all shadow-md mx-auto"
                  >
                    <Plus size={20} strokeWidth={3} />
                    NEW BLANK MAP
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGraphs.map(graph => (
                  <MapCard
                    key={graph._id}
                    graph={graph}
                    user={user}
                    onDelete={handleDeleteGraph}
                    onDuplicate={handleDuplicateGraph}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FEATURE: Dashboard Activity Feed (Right Rail) */}
        <aside className="hidden xl:flex flex-col w-80 glass-panel border-l border-border px-6 pt-24 pb-12 shrink-0 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Activity size={18} className="text-primary" />
            <h2 className="text-xs font-bold text-main uppercase tracking-[0.2em]">Recent Activity</h2>
          </div>

          <div className="space-y-4 mb-10">
            {graphs.slice(0, 5).map((g, i) => (
              <ActivityItem
                key={g._id}
                title={g.title}
                time={i === 0 ? "JUST NOW" : `${i * 2}H AGO`}
                type={i % 2 === 0 ? 'create' : 'update'}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mb-8 pt-8 border-t border-border">
            <Bell size={18} className="text-secondary" />
            <h2 className="text-xs font-bold text-main uppercase tracking-[0.2em]">Announcements</h2>
          </div>
          <div className="glass-card p-5 rounded-2xl border-border bg-main/5">
            <p className="text-[10px] uppercase font-black text-secondary tracking-widest mb-2">Nexus v4.0.2</p>
            <p className="text-xs text-muted leading-relaxed">Improved AI synthesis latency and new methodology icons added.</p>
          </div>
        </aside>
      </main>

      {/* Simplified Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 z-[200]" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel border-border sm:rounded-3xl rounded-t-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-8 pt-8 pb-6 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-display font-extrabold text-main uppercase tracking-tight italic">
                  {editingGraphId ? 'Edit Map Details' : 'Create New Map'}
                </h2>
                <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-bold">Start visualizing your next big idea</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGraph} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
              {!editingGraphId && (
                <div>
                  <label className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-4">Choose a Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {TEMPLATES.map(tmpl => {
                      const Icon = tmpl.icon;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-center ${selectedTemplate === tmpl.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-main/5 hover:border-border/50'
                            }`}
                        >
                          <div className={`p-2.5 rounded-xl ${tmpl.bg} mb-2`}>
                            <Icon size={18} className={tmpl.color} />
                          </div>
                          <span className="text-[10px] font-bold text-main uppercase tracking-wider">{tmpl.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-3">Map Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-main/5 border border-border text-main px-5 py-3.5 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-medium"
                    placeholder="Project Name"
                    autoFocus
                  />
                </div>
                {token && folders.length > 0 && (
                  <div>
                    <label className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-3">Folders</label>
                    <div className="relative">
                      <select
                        value={selectedFolder}
                        onChange={e => setSelectedFolder(e.target.value)}
                        className="w-full bg-main/5 border border-border text-main px-5 py-3.5 rounded-2xl focus:outline-none focus:border-primary/50 text-sm appearance-none"
                      >
                        <option value="" className="bg-background">Root Folder</option>
                        {folders.map(f => (
                          <option key={f._id} value={f._id} className="bg-background">{f.name}</option>
                        ))}
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none rotate-90" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-3">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-main/5 border border-border text-main px-5 py-3.5 rounded-2xl focus:outline-none focus:border-primary/50 text-sm resize-none"
                  placeholder="What is this map about?"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingGraphId(null); }}
                  className="px-6 py-3 text-sm font-display font-bold text-muted hover:text-main transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-primary text-background px-10 py-3.5 rounded-2xl font-display font-bold hover:scale-105 active:scale-95 disabled:opacity-50 text-sm shadow-md"
                >
                  {creating ? (editingGraphId ? 'SAVING...' : 'CREATING...') : (editingGraphId ? 'SAVE CHANGES' : 'CREATE MAP')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Simplified Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 z-[200]" onClick={(e) => e.target === e.currentTarget && setIsFolderModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-panel border-border sm:rounded-3xl rounded-t-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 pt-8 pb-6 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="text-lg font-display font-extrabold text-main uppercase tracking-tight">New Folder</h2>
              <button onClick={() => setIsFolderModalOpen(false)} className="p-2 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-8 space-y-6 flex-grow">
              <div>
                <label className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-3">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full bg-main/5 border border-border text-main px-5 py-3.5 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-medium"
                  placeholder="e.g. My Projects"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-5 py-3 text-xs font-display font-bold text-muted hover:text-main transition-all">
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="bg-secondary text-background px-8 py-3 rounded-2xl font-display font-bold hover:scale-105 active:scale-95 disabled:opacity-50 text-xs shadow-md"
                >
                  {creatingFolder ? 'CREATING...' : 'CREATE FOLDER'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
