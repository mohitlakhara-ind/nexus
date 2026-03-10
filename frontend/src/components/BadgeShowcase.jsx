import { useState } from 'react';
import BADGES, { RARITY_STYLES } from '../data/badges';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

/**
 * Renders a grid of all badges, highlighting earned ones.
 * Props:
 *   stats — user stats object for computing which badges are earned
 *   compact — smaller layout for embedding in profiles
 */
export default function BadgeShowcase({ stats = {}, compact = false }) {
    const [hoveredBadge, setHoveredBadge] = useState(null);
    const [filter, setFilter] = useState('all'); // all, earned, locked

    const badgesWithStatus = BADGES.map(badge => ({
        ...badge,
        earned: badge.check(stats),
    }));

    const earnedCount = badgesWithStatus.filter(b => b.earned).length;
    const totalCount = badgesWithStatus.length;

    const filteredBadges = badgesWithStatus.filter(b => {
        if (filter === 'earned') return b.earned;
        if (filter === 'locked') return !b.earned;
        return true;
    });

    return (
        <div className={compact ? '' : 'space-y-6'}>
            {/* Header */}
            {!compact && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-display font-extrabold text-main uppercase tracking-wider">
                            Badges
                        </h3>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                            {earnedCount} / {totalCount} earned
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {['all', 'earned', 'locked'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${filter === f
                                        ? 'bg-primary/10 text-primary border border-primary/30'
                                        : 'text-muted hover:text-main hover:bg-main/5 border border-transparent'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {!compact && (
                <div className="w-full h-2 bg-main/10 rounded-full overflow-hidden border border-border">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                        style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                    />
                </div>
            )}

            {/* Badge Grid */}
            <div className={`grid gap-3 ${compact ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'}`}>
                {filteredBadges.map(badge => {
                    const Icon = badge.icon;
                    const rarity = RARITY_STYLES[badge.rarity];
                    const isHovered = hoveredBadge === badge.id;

                    return (
                        <motion.div
                            key={badge.id}
                            onMouseEnter={() => setHoveredBadge(badge.id)}
                            onMouseLeave={() => setHoveredBadge(null)}
                            className="relative"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div
                                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-default ${badge.earned
                                        ? 'bg-opacity-100'
                                        : 'opacity-30 grayscale'
                                    }`}
                                style={{
                                    borderColor: badge.earned ? `${badge.color}50` : 'var(--border-color)',
                                    background: badge.earned ? `${badge.color}10` : 'var(--bg-tertiary)',
                                    boxShadow: badge.earned ? rarity.glow : 'none',
                                }}
                            >
                                {/* Badge Icon */}
                                <div
                                    className="size-10 rounded-xl flex items-center justify-center mb-2"
                                    style={{
                                        background: badge.earned ? `${badge.color}20` : 'var(--bg-secondary)',
                                        border: `1px solid ${badge.earned ? `${badge.color}30` : 'var(--border-color)'}`,
                                    }}
                                >
                                    {badge.earned ? (
                                        <Icon size={20} style={{ color: badge.color }} />
                                    ) : (
                                        <Lock size={16} className="text-muted" />
                                    )}
                                </div>

                                {/* Badge Name */}
                                <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${badge.earned ? 'text-main' : 'text-muted'
                                    }`}>
                                    {badge.name}
                                </span>

                                {/* Rarity Dot */}
                                <div
                                    className="size-1.5 rounded-full mt-1.5"
                                    style={{ background: badge.earned ? rarity.border : 'var(--text-muted)' }}
                                    title={rarity.label}
                                />
                            </div>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-3 rounded-xl border shadow-2xl pointer-events-none"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            borderColor: badge.earned ? `${badge.color}40` : 'var(--border-color)',
                                            boxShadow: badge.earned
                                                ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${badge.color}20`
                                                : '0 8px 32px rgba(0,0,0,0.4)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Icon size={12} style={{ color: badge.color }} />
                                            <span className="text-[10px] font-display font-bold text-main uppercase tracking-wider">
                                                {badge.name}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-muted leading-relaxed mb-2">
                                            {badge.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: rarity.border,
                                                    background: rarity.bg,
                                                    border: `1px solid ${rarity.border}40`,
                                                }}
                                            >
                                                {rarity.label}
                                            </span>
                                            {badge.earned ? (
                                                <span className="text-[8px] font-bold text-accent uppercase tracking-widest">✓ Earned</span>
                                            ) : (
                                                <span className="text-[8px] font-bold text-muted uppercase tracking-widest">Locked</span>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
