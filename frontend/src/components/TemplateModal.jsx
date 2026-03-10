import { motion, AnimatePresence } from 'framer-motion';
import { X as XIcon, Zap, Search, ShieldCheck, Layers, Network, CheckSquare, HelpCircle } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Strengths, Weaknesses, Opportunities & Threats',
    icon: Layers,
    color: '#a855f7',
    nodes: [
      { id: 'tpl-swot-center', type: 'problem', position: { x: 350, y: 250 }, data: { label: 'SWOT Analysis', votes: 0, description: 'Central topic for your SWOT' } },
      { id: 'tpl-swot-s', type: 'solution', position: { x: 100, y: 50 }, data: { label: 'Strengths', votes: 0, description: 'What advantages do you have?' } },
      { id: 'tpl-swot-w', type: 'rootCause', position: { x: 600, y: 50 }, data: { label: 'Weaknesses', votes: 0, description: 'What could be improved?' } },
      { id: 'tpl-swot-o', type: 'solution', position: { x: 100, y: 450 }, data: { label: 'Opportunities', votes: 0, description: 'What trends can you leverage?' } },
      { id: 'tpl-swot-t', type: 'rootCause', position: { x: 600, y: 450 }, data: { label: 'Threats', votes: 0, description: 'What obstacles do you face?' } },
    ],
    edges: [
      { id: 'tpl-swot-e1', source: 'tpl-swot-center', target: 'tpl-swot-s', type: 'smoothstep', animated: true },
      { id: 'tpl-swot-e2', source: 'tpl-swot-center', target: 'tpl-swot-w', type: 'smoothstep', animated: true },
      { id: 'tpl-swot-e3', source: 'tpl-swot-center', target: 'tpl-swot-o', type: 'smoothstep', animated: true },
      { id: 'tpl-swot-e4', source: 'tpl-swot-center', target: 'tpl-swot-t', type: 'smoothstep', animated: true },
    ]
  },
  {
    id: '5whys',
    name: '5 Whys',
    description: 'Drill down to the root cause of any problem',
    icon: Search,
    color: '#f59e0b',
    nodes: [
      { id: 'tpl-5w-problem', type: 'problem', position: { x: 300, y: 50 }, data: { label: 'The Problem', votes: 0, description: 'State the problem clearly' } },
      { id: 'tpl-5w-why1', type: 'rootCause', position: { x: 300, y: 200 }, data: { label: 'Why? (1st)', votes: 0, description: '' } },
      { id: 'tpl-5w-why2', type: 'rootCause', position: { x: 300, y: 350 }, data: { label: 'Why? (2nd)', votes: 0, description: '' } },
      { id: 'tpl-5w-why3', type: 'rootCause', position: { x: 300, y: 500 }, data: { label: 'Why? (3rd)', votes: 0, description: '' } },
      { id: 'tpl-5w-why4', type: 'rootCause', position: { x: 300, y: 650 }, data: { label: 'Why? (4th)', votes: 0, description: '' } },
      { id: 'tpl-5w-why5', type: 'rootCause', position: { x: 300, y: 800 }, data: { label: 'Root Cause', votes: 0, description: 'The deepest Why' } },
    ],
    edges: [
      { id: 'tpl-5w-e1', source: 'tpl-5w-problem', target: 'tpl-5w-why1', type: 'smoothstep' },
      { id: 'tpl-5w-e2', source: 'tpl-5w-why1', target: 'tpl-5w-why2', type: 'smoothstep' },
      { id: 'tpl-5w-e3', source: 'tpl-5w-why2', target: 'tpl-5w-why3', type: 'smoothstep' },
      { id: 'tpl-5w-e4', source: 'tpl-5w-why3', target: 'tpl-5w-why4', type: 'smoothstep' },
      { id: 'tpl-5w-e5', source: 'tpl-5w-why4', target: 'tpl-5w-why5', type: 'smoothstep' },
    ]
  },
  {
    id: 'procon',
    name: 'Pro / Con List',
    description: 'Weigh the pros and cons of a decision',
    icon: HelpCircle,
    color: '#06b6d4',
    nodes: [
      { id: 'tpl-pc-decision', type: 'decision', position: { x: 300, y: 50 }, data: { label: 'Decision', votes: 0, description: 'What are you deciding?' } },
      { id: 'tpl-pc-pro1', type: 'solution', position: { x: 50, y: 250 }, data: { label: 'Pro 1', votes: 0, description: '' } },
      { id: 'tpl-pc-pro2', type: 'solution', position: { x: 50, y: 400 }, data: { label: 'Pro 2', votes: 0, description: '' } },
      { id: 'tpl-pc-pro3', type: 'solution', position: { x: 50, y: 550 }, data: { label: 'Pro 3', votes: 0, description: '' } },
      { id: 'tpl-pc-con1', type: 'rootCause', position: { x: 550, y: 250 }, data: { label: 'Con 1', votes: 0, description: '' } },
      { id: 'tpl-pc-con2', type: 'rootCause', position: { x: 550, y: 400 }, data: { label: 'Con 2', votes: 0, description: '' } },
      { id: 'tpl-pc-con3', type: 'rootCause', position: { x: 550, y: 550 }, data: { label: 'Con 3', votes: 0, description: '' } },
    ],
    edges: [
      { id: 'tpl-pc-e1', source: 'tpl-pc-decision', target: 'tpl-pc-pro1', type: 'smoothstep' },
      { id: 'tpl-pc-e2', source: 'tpl-pc-decision', target: 'tpl-pc-pro2', type: 'smoothstep' },
      { id: 'tpl-pc-e3', source: 'tpl-pc-decision', target: 'tpl-pc-pro3', type: 'smoothstep' },
      { id: 'tpl-pc-e4', source: 'tpl-pc-decision', target: 'tpl-pc-con1', type: 'smoothstep' },
      { id: 'tpl-pc-e5', source: 'tpl-pc-decision', target: 'tpl-pc-con2', type: 'smoothstep' },
      { id: 'tpl-pc-e6', source: 'tpl-pc-decision', target: 'tpl-pc-con3', type: 'smoothstep' },
    ]
  },
  {
    id: 'retro',
    name: 'Sprint Retrospective',
    description: 'What went well, what didn\'t, and action items',
    icon: CheckSquare,
    color: '#22c55e',
    nodes: [
      { id: 'tpl-retro-title', type: 'problem', position: { x: 300, y: 50 }, data: { label: 'Sprint Retro', votes: 0, description: 'Sprint #' } },
      { id: 'tpl-retro-good1', type: 'solution', position: { x: 50, y: 250 }, data: { label: '✅ Went Well', votes: 0, description: '' } },
      { id: 'tpl-retro-good2', type: 'solution', position: { x: 50, y: 400 }, data: { label: '✅ Went Well', votes: 0, description: '' } },
      { id: 'tpl-retro-bad1', type: 'rootCause', position: { x: 550, y: 250 }, data: { label: '❌ Needs Work', votes: 0, description: '' } },
      { id: 'tpl-retro-bad2', type: 'rootCause', position: { x: 550, y: 400 }, data: { label: '❌ Needs Work', votes: 0, description: '' } },
      { id: 'tpl-retro-action1', type: 'action', position: { x: 200, y: 600 }, data: { label: '🎯 Action Item', votes: 0, description: '' } },
      { id: 'tpl-retro-action2', type: 'action', position: { x: 450, y: 600 }, data: { label: '🎯 Action Item', votes: 0, description: '' } },
    ],
    edges: [
      { id: 'tpl-retro-e1', source: 'tpl-retro-title', target: 'tpl-retro-good1', type: 'smoothstep' },
      { id: 'tpl-retro-e2', source: 'tpl-retro-title', target: 'tpl-retro-good2', type: 'smoothstep' },
      { id: 'tpl-retro-e3', source: 'tpl-retro-title', target: 'tpl-retro-bad1', type: 'smoothstep' },
      { id: 'tpl-retro-e4', source: 'tpl-retro-title', target: 'tpl-retro-bad2', type: 'smoothstep' },
      { id: 'tpl-retro-e5', source: 'tpl-retro-bad1', target: 'tpl-retro-action1', type: 'smoothstep', animated: true },
      { id: 'tpl-retro-e6', source: 'tpl-retro-bad2', target: 'tpl-retro-action2', type: 'smoothstep', animated: true },
    ]
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Radial brainstorming from a central idea',
    icon: Network,
    color: '#ec4899',
    nodes: [
      { id: 'tpl-mm-center', type: 'problem', position: { x: 350, y: 300 }, data: { label: 'Central Idea', votes: 0, description: 'Your main topic' } },
      { id: 'tpl-mm-b1', type: 'solution', position: { x: 100, y: 100 }, data: { label: 'Branch 1', votes: 0, description: '' } },
      { id: 'tpl-mm-b2', type: 'solution', position: { x: 600, y: 100 }, data: { label: 'Branch 2', votes: 0, description: '' } },
      { id: 'tpl-mm-b3', type: 'rootCause', position: { x: 100, y: 500 }, data: { label: 'Branch 3', votes: 0, description: '' } },
      { id: 'tpl-mm-b4', type: 'rootCause', position: { x: 600, y: 500 }, data: { label: 'Branch 4', votes: 0, description: '' } },
    ],
    edges: [
      { id: 'tpl-mm-e1', source: 'tpl-mm-center', target: 'tpl-mm-b1', type: 'default', animated: true },
      { id: 'tpl-mm-e2', source: 'tpl-mm-center', target: 'tpl-mm-b2', type: 'default', animated: true },
      { id: 'tpl-mm-e3', source: 'tpl-mm-center', target: 'tpl-mm-b3', type: 'default', animated: true },
      { id: 'tpl-mm-e4', source: 'tpl-mm-center', target: 'tpl-mm-b4', type: 'default', animated: true },
    ]
  }
];

export default function TemplateModal({ isOpen, onClose, onApplyTemplate }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl glass-panel border border-border rounded-3xl p-8 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Zap size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-main">Quick-Start Templates</h2>
                <p className="text-xs text-muted font-mono uppercase tracking-widest">Pick a blueprint to begin</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-main/5 rounded-xl text-muted"><XIcon size={20} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 scrollbar-hide">
            {TEMPLATES.map(template => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onApplyTemplate(template); onClose(); }}
                className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-main/5 hover:bg-main/10 hover:border-main/20 transition-all text-left group shadow-sm"
              >
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${template.color}15`, borderColor: `${template.color}30`, color: template.color }}
                >
                  <template.icon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-main mb-1">{template.name}</h3>
                  <p className="text-xs text-muted leading-relaxed">{template.description}</p>
                  <p className="text-[10px] text-muted/60 mt-2 font-mono">{template.nodes.length} nodes · {template.edges.length} edges</p>
                </div>
              </motion.button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-main/10 hover:bg-main/15 text-main rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border border-border"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
