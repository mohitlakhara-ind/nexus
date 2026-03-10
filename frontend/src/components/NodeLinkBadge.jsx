import { useState } from 'react';
import { Link2, ExternalLink, X } from 'lucide-react';

export default function NodeLinkBadge({ nodeId, link, onLinkChange }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(link || '');

    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    const handleSave = (e) => {
        e.stopPropagation();
        const val = inputValue.trim();
        // Auto-prepend https if missing
        const finalUrl = val && !val.match(/^https?:\/\//) ? `https://${val}` : val;
        onLinkChange?.(nodeId, finalUrl);
        setIsEditing(false);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onLinkChange?.(nodeId, '');
        setInputValue('');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(e); if (e.key === 'Escape') { setIsEditing(false); setInputValue(link || ''); } }}
                    placeholder="https://..."
                    className="flex-grow bg-main/10 border border-border rounded-md px-2 py-1 text-[10px] text-main focus:outline-none focus:border-primary/50 min-w-0"
                    autoFocus
                />
                <button onClick={handleSave} className="p-1 text-primary hover:bg-primary/10 rounded-md">
                    <Link2 size={10} />
                </button>
                <button onClick={() => { setIsEditing(false); setInputValue(link || ''); }} className="p-1 text-muted hover:bg-main/10 rounded-md">
                    <X size={10} />
                </button>
            </div>
        );
    }

    if (link) {
        return (
            <div className="flex items-center gap-1.5 mt-1">
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-[9px] font-bold uppercase tracking-wider transition-all border border-primary/20 truncate max-w-[160px]"
                    title={link}
                >
                    <ExternalLink size={9} />
                    {getDomain(link)}
                </a>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="p-0.5 text-muted hover:text-main transition-all opacity-0 group-hover:opacity-100"
                    title="Edit link"
                >
                    <Link2 size={9} />
                </button>
                <button
                    onClick={handleRemove}
                    className="p-0.5 text-muted hover:text-danger transition-all opacity-0 group-hover:opacity-100"
                    title="Remove link"
                >
                    <X size={9} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="flex items-center gap-1 text-[9px] text-muted hover:text-primary transition-colors mt-1 opacity-0 group-hover:opacity-100"
            title="Attach link"
        >
            <Link2 size={9} />
            <span className="uppercase tracking-widest font-bold">Add Link</span>
        </button>
    );
}
