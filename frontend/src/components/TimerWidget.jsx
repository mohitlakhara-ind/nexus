import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, X as XIcon } from 'lucide-react';

const PRESETS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
];

export default function TimerWidget({ isOpen, onClose }) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Create audio on mount
  useEffect(() => {
    // Simple oscillator beep
    audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playNotification = useCallback(() => {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining, playNotification]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const reset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setRemaining(totalSeconds);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[90] bg-background/90 backdrop-blur-xl border border-border rounded-3xl p-5 shadow-2xl w-64"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Timer size={16} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Focus Timer</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-main/5 rounded-lg text-muted"><XIcon size={14} /></button>
        </div>

        {/* Progress ring */}
        <div className="relative flex items-center justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className={remaining === 0 ? 'text-accent' : 'text-primary'}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-2xl font-mono font-bold ${remaining === 0 ? 'text-accent animate-pulse' : 'text-main'}`}>
              {formatTime(remaining)}
            </span>
            {remaining === 0 && <span className="text-[9px] text-accent font-bold uppercase tracking-widest mt-1">Done!</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={reset} className="p-2.5 rounded-xl bg-main/5 hover:bg-main/10 text-muted hover:text-main transition-all border border-border">
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => { if (remaining === 0) { setRemaining(totalSeconds); } setIsRunning(!isRunning); }}
            className={`p-3 rounded-2xl transition-all shadow-lg ${
              isRunning
                ? 'bg-warning text-background hover:bg-warning/80'
                : 'bg-primary text-background hover:bg-primary/80'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setTotalSeconds(p.seconds); setRemaining(p.seconds); setIsRunning(false); clearInterval(intervalRef.current); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-all ${
                totalSeconds === p.seconds
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-main/5 text-muted border-border hover:text-main'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
