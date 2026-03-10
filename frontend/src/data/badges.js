import {
    Flame, Map, Crown, Users, MessageSquare, Zap, Target, Rocket,
    Award, Shield, Star, Heart, Eye, Sparkles, GraduationCap, Gem
} from 'lucide-react';

/**
 * All available badges in the Nexus platform.
 * Badges are computed dynamically based on user stats.
 */
const BADGES = [
    // ─── Map Creation ─────────────────────────────────────
    {
        id: 'first_map',
        name: 'First Map',
        description: 'Create your first mind map',
        icon: Map,
        color: '#22c55e',
        rarity: 'common',
        check: (stats) => stats.graphCount >= 1,
    },
    {
        id: 'cartographer',
        name: 'Cartographer',
        description: 'Create 5 mind maps',
        icon: Map,
        color: '#3b82f6',
        rarity: 'uncommon',
        check: (stats) => stats.graphCount >= 5,
    },
    {
        id: 'world_builder',
        name: 'World Builder',
        description: 'Create 15 mind maps',
        icon: Sparkles,
        color: '#a855f7',
        rarity: 'rare',
        check: (stats) => stats.graphCount >= 15,
    },

    // ─── Reputation & Votes ───────────────────────────────
    {
        id: 'upvoted',
        name: 'Upvoted',
        description: 'Receive 10 total votes on your nodes',
        icon: Heart,
        color: '#ef4444',
        rarity: 'common',
        check: (stats) => stats.reputation >= 10,
    },
    {
        id: 'thought_leader',
        name: 'Thought Leader',
        description: 'Receive 50 total votes',
        icon: Award,
        color: '#f59e0b',
        rarity: 'uncommon',
        check: (stats) => stats.reputation >= 50,
    },
    {
        id: 'visionary',
        name: 'Visionary',
        description: 'Receive 200 total votes',
        icon: Eye,
        color: '#ec4899',
        rarity: 'legendary',
        check: (stats) => stats.reputation >= 200,
    },

    // ─── XP & Level ───────────────────────────────────────
    {
        id: 'spark',
        name: 'Spark',
        description: 'Earn 100 XP',
        icon: Zap,
        color: '#eab308',
        rarity: 'common',
        check: (stats) => stats.xp >= 100,
    },
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: Star,
        color: '#06b6d4',
        rarity: 'uncommon',
        check: (stats) => stats.level >= 5,
    },
    {
        id: 'elite',
        name: 'Elite',
        description: 'Reach Level 10',
        icon: Crown,
        color: '#f59e0b',
        rarity: 'rare',
        check: (stats) => stats.level >= 10,
    },
    {
        id: 'legend',
        name: 'Legend',
        description: 'Reach Level 20',
        icon: Gem,
        color: '#a855f7',
        rarity: 'legendary',
        check: (stats) => stats.level >= 20,
    },

    // ─── Collaboration ────────────────────────────────────
    {
        id: 'collaborator',
        name: 'Collaborator',
        description: 'Be added as a collaborator on a map',
        icon: Users,
        color: '#14b8a6',
        rarity: 'common',
        check: (stats) => stats.collabCount >= 1,
    },
    {
        id: 'team_player',
        name: 'Team Player',
        description: 'Collaborate on 5 different maps',
        icon: Users,
        color: '#8b5cf6',
        rarity: 'uncommon',
        check: (stats) => stats.collabCount >= 5,
    },

    // ─── Content ──────────────────────────────────────────
    {
        id: 'node_master',
        name: 'Node Master',
        description: 'Create 50 nodes across all maps',
        icon: Target,
        color: '#f97316',
        rarity: 'uncommon',
        check: (stats) => stats.nodeCount >= 50,
    },
    {
        id: 'problem_solver',
        name: 'Problem Solver',
        description: 'Create 10 solution nodes',
        icon: Rocket,
        color: '#10b981',
        rarity: 'uncommon',
        check: (stats) => stats.solutionCount >= 10,
    },

    // ─── Special ──────────────────────────────────────────
    {
        id: 'veteran',
        name: 'Veteran',
        description: 'Member for 30+ days',
        icon: Shield,
        color: '#64748b',
        rarity: 'common',
        check: (stats) => stats.accountAgeDays >= 30,
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Earn 5,000 XP',
        icon: GraduationCap,
        color: '#0ea5e9',
        rarity: 'rare',
        check: (stats) => stats.xp >= 5000,
    },
    {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Earn 1,000 XP in a single account',
        icon: Flame,
        color: '#ef4444',
        rarity: 'rare',
        check: (stats) => stats.xp >= 1000,
    },
];

export const RARITY_STYLES = {
    common: { label: 'Common', border: '#52525b', bg: 'rgba(82,82,91,0.1)', glow: 'none' },
    uncommon: { label: 'Uncommon', border: '#22c55e', bg: 'rgba(34,197,94,0.08)', glow: '0 0 10px rgba(34,197,94,0.2)' },
    rare: { label: 'Rare', border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', glow: '0 0 15px rgba(59,130,246,0.25)' },
    epic: { label: 'Epic', border: '#a855f7', bg: 'rgba(168,85,247,0.1)', glow: '0 0 20px rgba(168,85,247,0.3)' },
    legendary: { label: 'Legendary', border: '#f59e0b', bg: 'rgba(245,158,11,0.1)', glow: '0 0 25px rgba(245,158,11,0.4)' },
};

export function computeBadges(stats) {
    return BADGES.filter(badge => badge.check(stats)).map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        rarity: b.rarity,
        color: b.color,
    }));
}

export function getAllBadges() {
    return BADGES.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        rarity: b.rarity,
        color: b.color,
        icon: b.icon,
    }));
}

export default BADGES;
