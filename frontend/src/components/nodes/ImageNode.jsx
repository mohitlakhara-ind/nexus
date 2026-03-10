import { useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Trash2, Image as ImageIcon, Pin, Maximize2, Minimize2 } from 'lucide-react';

export default function ImageNode({ id, data }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imgRef = useRef(null);

  return (
    <div 
      className={`relative group transition-all duration-300 ${isExpanded ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
         boxShadow: isExpanded ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-primary" />
      
      {/* Top Toolbar */}
      <div 
        className={`absolute -top-10 left-0 right-0 flex justify-between items-center bg-surface-elevated/90 backdrop-blur border border-border rounded-lg p-1.5 transition-all duration-200 ${isHovered || isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <div className="flex items-center gap-2 px-1">
           <ImageIcon size={14} className="text-primary" />
           <span className="text-[10px] font-bold text-muted uppercase tracking-wider truncate max-w-[100px]">
             {data.fileName || 'Image'}
           </span>
           {data.isPinned && <Pin size={10} className="text-muted ml-1" />}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1.5 hover:bg-main/10 rounded-md text-muted hover:text-main transition-all"
            title={isExpanded ? "Shrink" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          {!data.isPinned && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}
              className="p-1.5 hover:bg-danger/20 rounded-md text-muted hover:text-danger transition-all block"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div 
        className={`bg-surface-elevated border-2 rounded-xl overflow-hidden transition-all duration-300 ${
           data.isUploading ? 'animate-pulse border-primary/50' : 'border-border'
        }`}
        style={{
          width: isExpanded ? '800px' : (data.width || '250px'),
          height: isExpanded ? 'auto' : (data.height || 'auto'),
          maxHeight: isExpanded ? '80vh' : '400px',
          borderColor: data.color || 'var(--border-color)',
        }}
      >
        {data.isUploading ? (
          <div className="w-full h-[150px] flex flex-col items-center justify-center gap-3">
             <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             <span className="text-xs font-bold text-muted">Processing Image...</span>
          </div>
        ) : (
          <img 
            ref={imgRef}
            src={data.src} 
            alt={data.fileName || 'Canvas Node Image'}
            className="w-full h-full object-contain bg-black/5"
            onLoad={() => {
              // Optionally trigger a resize/update event if we want the node to auto-fit
            }}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIi8+PHBhdGggZD0ibTIxIDE1LTMuMDgtMy4wOGExLjIgMS4yIDAgMCAwLTEuNjkgMEw5IDE4Ii8+PHBhdGggZD0iTTE4IDE4IDMgMyIvPjwvc3ZnPg=='; // Broken image icon
            }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity !bg-primary" />
    </div>
  );
}
