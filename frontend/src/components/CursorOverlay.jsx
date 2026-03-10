import React from 'react';
import { useStore } from '@xyflow/react';
import { motion } from 'framer-motion';

export default function CursorOverlay({ activeUsers, currentSocketId }) {
  // Extract transform [x, y, zoom] from React Flow Store
  const transform = useStore((s) => s.transform);
  const [tx, ty, tZoom] = transform;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {Object.entries(activeUsers).map(([socketId, data]) => {
        // Don't render our own cursor, and ensure user data exists
        if (socketId === currentSocketId || !data.user || data.x === undefined || data.y === undefined) return null;
        
        // Convert flow coordinates back to screen coordinates
        const screenX = data.x * tZoom + tx;
        const screenY = data.y * tZoom + ty;

        // Generate a pseudo-random color based on the username
        let hash = 0;
        for (let i = 0; i < data.user.username.length; i++) {
            hash = data.user.username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        const color = `hsl(${hue}, 80%, 50%)`;

        return (
          <motion.div
            key={socketId}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: screenX, y: screenY }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            className="absolute top-0 left-0 flex flex-col items-center select-none"
            style={{ x: screenX, y: screenY }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color }} className="drop-shadow-md origin-top-left -rotate-12 transform-gpu">
              <path d="M5.65376 21.2599L4.14811 2.91572C4.01353 1.2847 5.864 0.2878 7.15942 1.29177L21.4194 11.8906C22.6105 12.7847 22.2592 14.73 20.8066 15.197L15.3371 16.9298C14.9922 17.0384 14.6865 17.2514 14.4716 17.5332L11.2335 21.7589C10.3601 22.8981 8.52042 22.8464 7.747 21.6669L5.65376 21.2599Z" fill="currentColor" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <div 
               className="px-2 py-0.5 mt-0.5 rounded-md text-[10px] text-white font-bold tracking-wider shadow-md whitespace-nowrap -ml-2 border border-white/20"
               style={{ backgroundColor: color }}
            >
              {data.user.username}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
