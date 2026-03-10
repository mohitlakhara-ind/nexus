import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Medal, Star, Zap, MapPin, Heart, ArrowUp, TrendingUp, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RANK_TIERS = [
    { name: 'Bronze', minLevel: 1, color: '#cd7f32', glow: 'rgba(205,127,50,0.3)', icon: Medal },
    { name: 'Silver', minLevel: 3, color: '#c0c0c0', glow: 'rgba(192,192,192,0.3)', icon: Medal },
    { name: 'Gold', minLevel: 5, color: '#ffd700', glow: 'rgba(255,215,0,0.3)', icon: Star },
    { name: 'Platinum', minLevel: 8, color: '#00cec9', glow: 'rgba(0,206,201,0.3)', icon: Crown },
    { name: 'Diamond', minLevel: 12, color: '#a855f7', glow: 'rgba(168,85,247,0.3)', icon: Crown },
    { name: 'Master', minLevel: 18, color: '#ef4444', glow: 'rgba(239,68,68,0.3)', icon: Flame },
    { name: 'Legend', minLevel: 25, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', icon: Sparkles },
];

function getTier(level) {
    let tier = RANK_TIERS[0];
    for (const t of RANK_TIERS) {
        if (level >= t.minLevel) tier = t;
    }
    return tier;
}

function getXpForNextLevel(level) {
    // Matches backend formula: level = floor(sqrt(xp / 50)) + 1
    // So xp for level L = (L-1)^2 * 50
    return level * level * 50;
}

export default function Ranks() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('xp');
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get(`${API}/api/auth/leaderboard`);
                setLeaderboard(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const sortedUsers = [...leaderboard].sort((a, b) => {
        if (selectedTab === 'xp') return b.xp - a.xp;
        if (selectedTab === 'level') return b.level - a.level;
        if (selectedTab === 'maps') return b.graphCount - a.graphCount;
        if (selectedTab === 'reputation') return b.reputation - a.reputation;
        return 0;
    });

    const myRank = sortedUsers.findIndex(u => u._id === user?._id) + 1;

    return (
        <div className="min-h-screen bg-background pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-warning/10 border border-warning/20 rounded-full mb-6">
                        <Trophy size={16} className="text-warning" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-warning">Global Rankings</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-main tracking-tight mb-4 uppercase italic">
                        Leaderboard
                    </h1>
                    <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                        Climb the ranks by creating maps, earning votes, and collaborating. Every action earns XP.
                    </p>
                </motion.div>

                {/* Rank Tiers Display */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10"
                >
                    {RANK_TIERS.map((tier, i) => {
                        const TierIcon = tier.icon;
                        return (
                            <div
                                key={tier.name}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105"
                                style={{
                                    borderColor: `${tier.color}40`,
                                    color: tier.color,
                                    background: `${tier.color}10`,
                                    boxShadow: `0 0 15px ${tier.glow}`
                                }}
                            >
                                <TierIcon size={12} />
                                {tier.name}
                                <span className="opacity-50">Lv.{tier.minLevel}+</span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Your Rank Card */}
                {user && myRank > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="mb-8 p-5 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md flex items-center justify-between"
                        style={{ boxShadow: '0 0 30px rgba(var(--color-primary), 0.1)' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-display font-extrabold text-lg border border-primary/30">
                                #{myRank}
                            </div>
                            <div>
                                <span className="text-sm font-display font-bold text-main">{user.username}</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                                        <Zap size={10} fill="currentColor" /> {user.xp || 0} XP
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getTier(user.level || 1).color }}>
                                        {getTier(user.level || 1).name} · Lv.{user.level || 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Next Level</div>
                            <div className="w-32 h-2 bg-main/10 rounded-full overflow-hidden border border-border">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(((user.xp || 0) / getXpForNextLevel(user.level || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="text-[9px] text-muted mt-1 font-mono">{user.xp || 0} / {getXpForNextLevel(user.level || 1)}</div>
                        </div>
                    </motion.div>
                )}

                {/* Sort Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    {[
                        { key: 'xp', label: 'XP', icon: Zap },
                        { key: 'level', label: 'Level', icon: TrendingUp },
                        { key: 'maps', label: 'Maps', icon: MapPin },
                        { key: 'reputation', label: 'Votes', icon: Heart },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all border ${selectedTab === tab.key
                                    ? 'bg-primary/10 text-primary border-primary/30 shadow-md'
                                    : 'bg-main/5 text-muted border-border hover:bg-main/10 hover:text-main'
                                }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                    </div>
                ) : sortedUsers.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy size={48} className="text-muted mx-auto mb-4 opacity-30" />
                        <p className="text-sm text-muted font-bold uppercase tracking-widest">No users yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedUsers.map((entry, index) => {
                            const tier = getTier(entry.level);
                            const TierIcon = tier.icon;
                            const isMe = entry._id === user?._id;
                            const isTop3 = index < 3;

                            return (
                                <motion.div
                                    key={entry._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link
                                        to={`/profile/${entry._id}`}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] group ${isMe
                                                ? 'border-primary/30 bg-primary/5'
                                                : isTop3
                                                    ? 'border-warning/20 bg-warning/5 hover:bg-warning/10'
                                                    : 'border-border bg-main/5 hover:bg-main/10'
                                            }`}
                                        style={isTop3 ? { boxShadow: `0 4px 20px ${tier.glow}` } : {}}
                                    >
                                        {/* Rank Number */}
                                        <div className={`size-10 rounded-xl flex items-center justify-center font-display font-extrabold text-sm shrink-0 border ${index === 0 ? 'bg-warning/20 text-warning border-warning/30' :
                                                index === 1 ? 'bg-zinc-300/20 text-zinc-400 border-zinc-400/30' :
                                                    index === 2 ? 'bg-amber-700/20 text-amber-600 border-amber-600/30' :
                                                        'bg-main/10 text-muted border-border'
                                            }`}>
                                            {index === 0 ? <Crown size={18} className="text-warning" /> :
                                                index === 1 ? <Medal size={18} /> :
                                                    index === 2 ? <Medal size={18} /> :
                                                        `#${index + 1}`}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-display font-bold text-sm truncate ${isMe ? 'text-primary' : 'text-main'}`}>
                                                    {entry.username}
                                                </span>
                                                {isMe && (
                                                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
                                                    style={{ color: tier.color }}
                                                >
                                                    <TierIcon size={9} />
                                                    {tier.name} · Lv.{entry.level}
                                                </span>
                                                <span className="text-[9px] text-muted font-mono">{entry.graphCount} maps</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Votes</div>
                                                <div className="text-sm font-mono font-bold text-main flex items-center gap-1 justify-end">
                                                    <ArrowUp size={12} className="text-accent" />
                                                    {entry.reputation}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-bold text-muted uppercase tracking-widest">XP</div>
                                                <div className="text-sm font-mono font-extrabold text-primary flex items-center gap-1 justify-end">
                                                    <Zap size={12} fill="currentColor" />
                                                    {entry.xp.toLocaleString()}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
