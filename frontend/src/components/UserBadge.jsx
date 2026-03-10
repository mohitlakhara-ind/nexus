import React from 'react';
import { Shield, Star, Award, Crown, Zap } from 'lucide-react';

const UserBadge = ({ level, size = "md", showLabel = false }) => {
  // Determine badge styling based on level
  const getBadgeStyle = (lvl) => {
    if (lvl < 5) return {
      name: "Novice",
      colors: "from-amber-700 to-amber-900 border-amber-600/50 text-amber-100",
      glow: "shadow-md",
      icon: Shield
    };
    if (lvl < 10) return {
      name: "Apprentice",
      colors: "from-slate-300 to-slate-500 border-slate-200/50 text-slate-900",
      glow: "shadow-md",
      icon: Star
    };
    if (lvl < 25) return {
      name: "Adept",
      colors: "from-yellow-400 to-yellow-600 border-yellow-300/50 text-yellow-950",
      glow: "shadow-md",
      icon: Award
    };
    if (lvl < 50) return {
      name: "Master",
      colors: "from-emerald-400 to-emerald-600 border-emerald-300/50 text-emerald-950",
      glow: "shadow-md",
      icon: Crown
    };
    return {
      name: "Grandmaster",
      colors: "from-purple-500 via-fuchsia-500 to-pink-500 border-fuchsia-300/50 text-white",
      glow: "shadow-md animate-pulse",
      icon: Zap
    };
  };

  const style = getBadgeStyle(level);
  const Icon = style.icon;

  const sizeClasses = {
    sm: "size-6 text-[10px]",
    md: "size-10 text-xs",
    lg: "size-16 text-lg",
    xl: "size-24 text-2xl"
  };

  const iconSizes = {
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48
  };

  return (
    <div className={`flex items-center gap-3 ${showLabel ? '' : 'justify-center'}`}>
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br border-2 ${style.colors} ${style.glow} ${sizeClasses[size]}`}
        title={`Level ${level} ${style.name}`}
      >
        <Icon size={iconSizes[size]} className="drop-shadow-md z-10" />
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-[10px] bg-white opacity-20 mix-blend-overlay" />
        
        {/* Level Number Overlay (optional, depending on design preference) */}
        {size !== 'sm' && (
          <div className="absolute -bottom-1.5 -right-1.5 bg-background border border-border rounded-full size-5 flex items-center justify-center text-[10px] font-bold text-main shadow-md z-20">
            {level}
          </div>
        )}
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-main leading-tight">Level {level}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70" style={{ color: `var(--${style.colors.split(' ')[0].replace('from-', '')})` }}>
            {style.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserBadge;
