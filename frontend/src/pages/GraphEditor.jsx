import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import CursorOverlay from '../components/CursorOverlay';
import {
  Plus,
  Save,
  Layout,
  Maximize2,
  Minimize2,
  Download,
  FileText,
  Brain,
  MessageSquare,
  GitBranch,
  Trash,
  ArrowLeft,
  X as XIcon,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  Search,
  Zap,
  Sparkles,
  ShieldCheck,
  Layers,
  HelpCircle,
  CheckSquare,
  Flashlight,
  StickyNote,
  Grid,
  AlertCircle,
  Network,
  Send,
  Timer,
  BarChart3,
  Eye,
  EyeOff,
  User as UserIcon,
  Monitor,
  Users,
  Edit3,
  Command,
  Bookmark,
  Maximize2 as MaximizeIcon,
  Pin,
  ArrowUpToLine,
  ArrowDownToLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useAuthStore } from '../store/authStore';
import useThemeStore from '../store/themeStore';
import toast from 'react-hot-toast';
import { createNotification } from '../services/notifications';

// Custom Nodes
import ProblemNode from '../components/nodes/ProblemNode';
import RootCauseNode from '../components/nodes/RootCauseNode';
import SolutionNode from '../components/nodes/SolutionNode';
import SWOTNode from '../components/nodes/SWOTNode';
import FishboneNode from '../components/nodes/FishboneNode';
import DecisionNode from '../components/nodes/DecisionNode';
import ActionItemNode from '../components/nodes/ActionItemNode';
import NoteNode from '../components/nodes/NoteNode';
import ImageNode from '../components/nodes/ImageNode';
import GroupNode from '../components/nodes/GroupNode';
import GraphScratchpad from '../components/GraphScratchpad';
import CommandPalette from '../components/CommandPalette';
import TemplateModal from '../components/TemplateModal';
import useHistory from '../hooks/useHistory';
import TimerWidget from '../components/TimerWidget';
import MapStats from '../components/MapStats';

const nodeTypes = {
  problem: ProblemNode,
  rootCause: RootCauseNode,
  solution: SolutionNode,
  swot: SWOTNode,
  fishbone: FishboneNode,
  decision: DecisionNode,
  action: ActionItemNode,
  note: NoteNode,
  image: ImageNode,
  group: GroupNode
};

const initialNodes = [];
const initialEdges = [];

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com';

const GraphEditorInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [graphCreatorId, setGraphCreatorId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [spotlightMode, setSpotlightMode] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [animatedEdges, setAnimatedEdges] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [searchMatchIds, setSearchMatchIds] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInputValue, setAiInputValue] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [currentCollaborator, setCurrentCollaborator] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [edgeType, setEdgeType] = useState('default'); // 'default' | 'smoothstep' | 'step' | 'straight'
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const searchInputRef = useRef(null);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const socketRef = useRef();
  const { setViewport, getViewport, setCenter, screenToFlowPosition } = useReactFlow();
  const [activeUsers, setActiveUsers] = useState({});
  const history = useHistory();

  // Handlers
  const handleVote = useCallback((nodeId) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        const updatedNode = {
          ...node,
          data: { ...node.data, votes: (node.data.votes || 0) + 1, lastTouched: Date.now() }
        };
        socketRef.current.emit('node-update', { roomId: id, node: updatedNode });

        // Gamification: Award XP for voting
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().awardXP(5);
        }

        // Notification: Notify map creator about the vote
        if (graphCreatorId && useAuthStore.getState().isAuthenticated && user?._id !== graphCreatorId) {
          createNotification({
            recipientId: graphCreatorId,
            type: 'vote',
            graphId: id,
            graphTitle: mapTitle,
            nodeId: nodeId
          }).catch(console.error);
        }

        return updatedNode;
      }
      return node;
    }));
  }, [id, setNodes, graphCreatorId, mapTitle, user]);

  const deleteNode = useCallback((nodeId) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setHasUnsavedChanges(true);
    socketRef.current?.emit('node-delete', { roomId: id, nodeId });
  }, [id, setNodes]);

  const updateNodeLabel = useCallback((nodeId, newLabel, newDesc) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        const updatedNode = {
          ...node,
          data: { ...node.data, label: newLabel, ...(newDesc !== undefined ? { description: newDesc } : {}), lastTouched: Date.now() }
        };
        socketRef.current?.emit('node-update', { roomId: id, node: updatedNode });
        return updatedNode;
      }
      return node;
    }));
    setHasUnsavedChanges(true);
  }, [id, setNodes]);

  const addComment = useCallback((nodeId, text) => {
    const commentEntry = {
      username: user?.username || 'Anonymous',
      text,
      createdAt: new Date().toISOString()
    };
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        const updatedComments = [...(node.data.comments || []), commentEntry];
        return { ...node, data: { ...node.data, comments: updatedComments, lastTouched: Date.now() } };
      }
      return node;
    }));
    setHasUnsavedChanges(true);

    // Notification: Notify map creator about the comment
    if (graphCreatorId && useAuthStore.getState().isAuthenticated && user?._id !== graphCreatorId) {
      createNotification({
        recipientId: graphCreatorId,
        type: 'comment',
        graphId: id,
        graphTitle: mapTitle,
        nodeId: nodeId
      }).catch(console.error);
    }
  }, [setNodes, user, graphCreatorId, id, mapTitle]);

  // FEATURE: Node Link Attachments
  const updateNodeLink = useCallback((nodeId, link) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        const updatedNode = {
          ...node,
          data: { ...node.data, link, lastTouched: Date.now() }
        };
        socketRef.current?.emit('node-update', { roomId: id, node: updatedNode });
        return updatedNode;
      }
      return node;
    }));
    setHasUnsavedChanges(true);
  }, [id, setNodes]);

  const injectHandlers = useCallback((node) => {
    return {
      ...node,
      data: {
        ...node.data,
        onVote: handleVote,
        onDelete: deleteNode,
        onLabelChange: updateNodeLabel,
        onAddComment: addComment,
        onLinkChange: updateNodeLink
      }
    };
  }, [handleVote, deleteNode, updateNodeLabel, addComment, updateNodeLink]);

  const addNode = useCallback((type) => {
    const newNode = injectHandlers({
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100 + Math.random() * 350, y: 100 + Math.random() * 350 },
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        votes: 0,
        description: '',
        lastTouched: Date.now()
      },
    });
    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
    socketRef.current?.emit('node-add', { roomId: id, node: newNode });

    // Gamification: Award XP for contributing to the map
    if (useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().awardXP(10);
    }
  }, [id, injectHandlers, setNodes]);

  // FEATURE: AI Idea Expansion

  const handleExpandIdea = async () => {
    if (selectedNodeIds.length !== 1 || isExpanding) return;
    const nodeId = selectedNodeIds[0];
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data?.label || !isPublic) {
      if (!isPublic) toast.error('Brainstorming requires a public map.');
      return;
    }

    setIsExpanding(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(`${API_BASE_URL}/ai/expand`, {
        nodeId,
        nodeText: node.data.label,
        mapContext: { nodes, edges }
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const { suggestions } = res.data;
      if (suggestions?.newNodes?.length) {
        const radius = 250;
        const newNodes = suggestions.newNodes.map((n, i) => {
          const angle = (i / suggestions.newNodes.length) * Math.PI * 2;
          return injectHandlers({
            ...n,
            position: {
              x: node.position.x + Math.cos(angle) * radius,
              y: node.position.y + Math.sin(angle) * radius + 150
            }
          });
        });

        setNodes(prev => [...prev, ...newNodes]);
        if (suggestions.newEdges?.length) {
          setEdges(prev => [...prev, ...suggestions.newEdges]);
          socketRef.current?.emit('edges_change', { graphId: id, changes: suggestions.newEdges });
        }

        newNodes.forEach(nn => socketRef.current?.emit('node-add', { roomId: id, node: nn }));
        setHasUnsavedChanges(true);
        toast.success('Idea expanded!', { icon: '✨' });
      } else {
        toast.error('AI could not generate ideas.');
      }
    } catch (err) {
      toast.error('Failed to expand idea. Ensure map is public.');
      console.error(err);
    } finally {
      setIsExpanding(false);
    }
  };

  // FEATURE: AI Assistant Core Logic
  const handleAiChat = async (e) => {
    if (e) e.preventDefault();
    if (!aiInputValue.trim() || isAiThinking) return;

    const userMessage = { role: 'user', content: aiInputValue };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInputValue('');
    setIsAiThinking(true);

    try {
      const token = useAuthStore.getState().token;
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        prompt: aiInputValue,
        history: aiMessages.map(m => ({ role: m.role, content: m.content })),
        mapContext: { nodes, edges },
        graphId: id
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const aiResponse = {
        role: 'model',
        content: response.data.text,
        suggestions: response.data.suggestions,
        persona: response.data.persona
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setCurrentCollaborator(response.data.persona);
    } catch (err) {
      console.error('AI Error:', err);
      if (err.response?.data?.isPrivate) {
        toast.error(err.response.data.message, { duration: 4000 });
      } else {
        toast.error('AI is currently unavailable');
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  const applyAiSuggestions = useCallback((suggestions) => {
    if (!suggestions || (!suggestions.newNodes?.length && !suggestions.newEdges?.length)) return;

    const timestamp = Date.now();
    const nodesToAdd = suggestions.newNodes.map((n, i) => injectHandlers({
      ...n,
      id: `ai-${timestamp}-${i}` // Ensure unique stable IDs
    }));

    // Map old suggestion IDs to new stable IDs for edge linking
    const idMap = suggestions.newNodes.reduce((acc, n, i) => {
      acc[n.id] = nodesToAdd[i].id;
      return acc;
    }, {});

    const edgesToAdd = suggestions.newEdges.map((e, i) => ({
      ...e,
      id: `ai-edge-${timestamp}-${i}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'var(--text-secondary)', strokeWidth: 1.5 }
    }));

    setNodes(nds => [...nds, ...nodesToAdd]);
    setEdges(eds => [...eds, ...edgesToAdd]);
    setHasUnsavedChanges(true);

    nodesToAdd.forEach(n => socketRef.current?.emit('node-add', { roomId: id, node: n }));
    edgesToAdd.forEach(e => socketRef.current?.emit('edge-add', { roomId: id, edge: e }));

    toast.success('AI suggestions applied to map', { icon: '✨' });
    return nodesToAdd; // Return for simulation chain
  }, [id, setNodes, setEdges, injectHandlers]);

  // FEATURE: Team Simulation Mode
  const runTeamSimulation = async () => {
    if (isSimulating || !isPublic) return;
    setIsSimulating(true);
    setAiMessages([]);

    const steps = [
      { personaId: 'arjun', prompt: "Identify 5 major technical problems in our current domain map.", type: 'Problems' },
      { personaId: 'ishani', prompt: "Dream big! What are 5 future risks or high-level challenges we might face?", type: 'Visionary Risks' },
      { personaId: 'mohit', prompt: "Technical deep-dive! Provide 5 programming-level solutions for the identified problems.", type: 'Tech Solutions' },
      { personaId: 'kabir', prompt: "Practicality check! Give us 5 immediate actionable steps to solve the main issues.", type: 'Action Items' },
      { personaId: 'ananya', prompt: "How will this affect our users? Add 5 sticky notes explaining the human impact.", type: 'Human Context' }
    ];

    try {
      for (const step of steps) {
        setIsAiThinking(true);
        const token = useAuthStore.getState().token;
        const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
          prompt: step.prompt,
          history: [],
          mapContext: { nodes, edges },
          graphId: id,
          forcedPersonaId: step.personaId,
          simulationPrompt: true
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const aiResponse = {
          role: 'model',
          content: response.data.text,
          persona: response.data.persona,
          suggestions: response.data.suggestions
        };

        setAiMessages(prev => [...prev, aiResponse]);
        setCurrentCollaborator(response.data.persona);

        // Auto-apply suggestions in simulation
        if (response.data.suggestions) {
          applyAiSuggestions(response.data.suggestions);
        }

        await new Promise(r => setTimeout(r, 3000)); // Pause between agents
      }

      // Final Step: Community Voting Simulation
      toast.info("Simulating community upvoting...", { icon: '👥' });
      const nodesToVote = [...nodes].sort(() => 0.5 - Math.random()).slice(0, 10);
      for (const node of nodesToVote) {
        handleVote(node.id);
        await new Promise(r => setTimeout(r, 800));
      }

      toast.success("Team Brainstorming Simulation Complete!", { duration: 5000 });
    } catch (err) {
      console.error('Simulation Error:', err);
      toast.error('Simulation interrupted.');
    } finally {
      setIsSimulating(false);
      setIsAiThinking(false);
      setCurrentCollaborator(null);
    }
  };

  // FEATURE: Live Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || user?.autoSave === false) return;
    const autoSaveTimer = setTimeout(() => {
      saveMap(true);
    }, 30000);
    return () => clearTimeout(autoSaveTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, nodes, edges, mapTitle]);

  // Keyboard shortcuts: Ctrl+S = save, Ctrl+F / Cmd+F = search, Escape = close search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveMap();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => {
          if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100);
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
        setSearchMatchIds([]);
        setShowShortcuts(false);
      }
      if (e.key === '?') {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, mapTitle]);

  // Node Search Logic
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchMatchIds([]); return; }
    const q = query.toLowerCase();
    const matches = nodes.filter(n =>
      n.data.label?.toLowerCase().includes(q) ||
      n.data.description?.toLowerCase().includes(q)
    ).map(n => n.id);
    setSearchMatchIds(matches);
    setSearchIndex(0);
    if (matches.length > 0) {
      const node = nodes.find(n => n.id === matches[0]);
      if (node) setCenter(node.position.x + 150, node.position.y + 80, { zoom: 1.2, duration: 600 });
    }
  }, [nodes, setCenter]);

  const jumpToSearchResult = useCallback((dir) => {
    if (!searchMatchIds.length) return;
    const newIdx = (searchIndex + dir + searchMatchIds.length) % searchMatchIds.length;
    setSearchIndex(newIdx);
    const node = nodes.find(n => n.id === searchMatchIds[newIdx]);
    if (node) setCenter(node.position.x + 150, node.position.y + 80, { zoom: 1.2, duration: 500 });
  }, [searchMatchIds, searchIndex, nodes, setCenter]);

  // FEATURE: Find & Replace
  const handleReplaceAll = useCallback(() => {
    if (!searchQuery.trim() || !replaceQuery.trim()) return;
    const count = searchMatchIds.length;
    if (count === 0) return;

    setNodes(nds => nds.map(node => {
      if (searchMatchIds.includes(node.id)) {
        const newLabel = node.data.label.replace(new RegExp(searchQuery, 'gi'), replaceQuery);
        const updatedNode = { ...node, data: { ...node.data, label: newLabel } };
        socketRef.current?.emit('node-update', { roomId: id, node: updatedNode });
        return updatedNode;
      }
      return node;
    }));
    setHasUnsavedChanges(true);
    toast.success(`Replaced in ${count} nodes`);
    setSearchQuery('');
    setReplaceQuery('');
    setSearchMatchIds([]);
    setShowSearch(false);
  }, [searchQuery, replaceQuery, searchMatchIds, id, setNodes]);

  // FEATURE: Auto Arrange
  const autoArrange = useCallback(() => {
    const horizontalSpacing = 350;
    const verticalSpacing = 200;
    const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));

    setNodes(nds => nds.map((node, i) => {
      const row = Math.floor(i / nodesPerRow);
      const col = i % nodesPerRow;
      const newPos = { x: col * horizontalSpacing + 100, y: row * verticalSpacing + 100 };
      socketRef.current?.emit('node-move', { roomId: id, nodeId: node.id, position: newPos });
      return { ...node, position: newPos };
    }));
    setHasUnsavedChanges(true);
    toast.success('Nodes re-arranged');
  }, [nodes.length, id, setNodes]);

  // FEATURE: AI Smart Arrange
  const handleSmartArrange = useCallback(async () => {
    if (nodes.length === 0) return;
    toast.loading('AI is arranging...', { id: 'smart-arrange' });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(`${API_BASE_URL}/ai/layout`, {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: { label: n.data?.label } })),
        edges: edges.map(e => ({ source: e.source, target: e.target }))
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const { positions } = res.data;
      if (positions) {
        setNodes(nds => nds.map(node => {
          const pos = positions[node.id];
          if (pos) {
            socketRef.current?.emit('node-move', { roomId: id, nodeId: node.id, position: pos });
            return { ...node, position: pos };
          }
          return node;
        }));
        setHasUnsavedChanges(true);
        toast.success('AI layout applied!', { id: 'smart-arrange', icon: '\u2728' });
      } else {
        toast.error('AI could not arrange nodes.', { id: 'smart-arrange' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Smart arrange failed.', { id: 'smart-arrange' });
    }
  }, [nodes, edges, id, setNodes]);

  // FEATURE: Export to PNG
  const exportToPng = useCallback(() => {
    const element = document.querySelector('.react-flow__viewport');
    if (!element) return;

    toast.loading('Capturing map...', { id: 'export-png' });
    toPng(element, {
      backgroundColor: isDarkMode ? '#0a0a0c' : '#f8fafc',
      quality: 1,
      pixelRatio: 2,
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `${mapTitle.replace(/\s+/g, '_')}_Nexus.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Map exported!', { id: 'export-png' });
    }).catch(() => {
      toast.error('Export failed', { id: 'export-png' });
    });
  }, [mapTitle, isDarkMode]);

  // Socket Connection & Real-time Collab
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (id) {
      socketRef.current.emit('join_graph', { graphId: id, user });
      socketRef.current.emit('join-room', id);

      socketRef.current.on('presence_update', (users) => {
        setActiveUsers(users);
        
        // Notification: If I just joined, and I'm not the creator, notify the creator
        // (This might trigger too often if not careful, but for a demo it's fine)
        // Better: Only trigger once on successful fetchMap completion.
      });
      socketRef.current.on('cursor-move', ({ socketId, x, y }) => {
        setActiveUsers(prev => {
          if (!prev[socketId]) return prev;
          return { ...prev, [socketId]: { ...prev[socketId], x, y } };
        });
      });

      socketRef.current.on('node-move', ({ nodeId, position }) => {
        setNodes(nds => nds.map(node =>
          node.id === nodeId ? { ...node, position } : node
        ));
      });

      socketRef.current.on('node-add', (newNode) => {
        setNodes(nds => [...nds, injectHandlers(newNode)]);
      });

      socketRef.current.on('edge-add', (newEdge) => {
        setEdges(eds => [...eds, newEdge]);
      });

      socketRef.current.on('node-delete', (nodeId) => {
        setNodes(nds => nds.filter(node => node.id !== nodeId));
      });

      socketRef.current.on('node-update', (updatedNode) => {
        setNodes(nds => nds.map(node =>
          node.id === updatedNode.id ? injectHandlers(updatedNode) : node
        ));
      });

      // FEATURE: Map Chat Listener
      socketRef.current.on('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id, setNodes, setEdges, injectHandlers]);

  // Handle Drag & Drop and Paste events for Multi-Modal Inputs
  const parseMarkdownToNodes = useCallback((markdownText, startPos) => {
    const lines = markdownText.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return;

    let parentStack = []; // stores { id, level }
    const newNodes = [];
    const newEdges = [];
    let currentY = startPos.y;

    lines.forEach((line, index) => {
      let level = 0;
      let label = line.trim();
      let type = 'note';

      // Detect Headers
      if (line.startsWith('#')) {
        const match = line.match(/^(#+)\s(.*)/);
        if (match) {
          level = match[1].length;
          label = match[2];
          type = level === 1 ? 'problem' : level === 2 ? 'solution' : 'note';
        }
      }
      // Detect Lists
      else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        level = (line.match(/^\s*/)[0].length / 2) + 2; // Rough indentation to level
        label = line.replace(/^\s*[-*]\s/, '');
      }

      if (label) {
        const nodeId = `md-node-${Date.now()}-${index}`;

        // Find parent
        while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
          parentStack.pop();
        }

        const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;
        const xPos = startPos.x + (level * 250); // Indent based on level

        const node = injectHandlers({
          id: nodeId,
          type: type,
          position: { x: xPos, y: currentY },
          data: { label, lastTouched: Date.now() }
        });

        newNodes.push(node);
        socketRef.current?.emit('node-add', { roomId: id, node });

        if (parentId) {
          const edge = {
            id: `md-edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            animated: animatedEdges,
            style: { stroke: 'var(--border-color)', strokeWidth: 2 }
          };
          newEdges.push(edge);
          socketRef.current?.emit('edge-add', { roomId: id, edge });
        }

        parentStack.push({ id: nodeId, level });
        currentY += 100;
      }
    });

    if (newNodes.length > 0) {
      setNodes(nds => [...nds, ...newNodes]);
      if (newEdges.length > 0) setEdges(eds => [...eds, ...newEdges]);
      setHasUnsavedChanges(true);
      toast.success(`Imported ${newNodes.length} nodes from Markdown`);
    } else {
      toast.error('Could not parse Markdown text');
    }
  }, [id, setNodes, setEdges, injectHandlers, animatedEdges]);

  useEffect(() => {
    const handlePaste = async (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      let handledImage = false;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          e.preventDefault();
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target.result;
            const newNode = injectHandlers({
              id: `image-${Date.now()}`,
              type: 'image',
              position: { x: getViewport().x * -1 + 200, y: getViewport().y * -1 + 200 }, // Paste near top-left of viewport
              data: { src: base64Data, fileName: 'Pasted Image', isUploading: false, lastTouched: Date.now() },
            });
            setNodes((nds) => [...nds, newNode]);
            setHasUnsavedChanges(true);
            socketRef.current?.emit('node-add', { roomId: id, node: newNode });
          };
          reader.readAsDataURL(file);
          handledImage = true;
          break; // only handle first image
        }
      }

      if (!handledImage) {
        const text = e.clipboardData.getData('text');
        if (text && (text.includes('#') || text.includes('- '))) {
          e.preventDefault();
          // Try parsing as markdown
          const position = { x: getViewport().x * -1 + 200, y: getViewport().y * -1 + 200 };
          parseMarkdownToNodes(text, position);
        }
      }
    };

    const handleDrop = async (e) => {
      // Only intercept if dropping directly onto the ReactFlow canvas
      if (!e.target.closest('.react-flow__pane')) return;
      e.preventDefault();

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target.result;
            const bounds = e.target.getBoundingClientRect();
            const position = {
              x: (e.clientX - bounds.left - getViewport().x) / getViewport().zoom,
              y: (e.clientY - bounds.top - getViewport().y) / getViewport().zoom
            };

            const newNode = injectHandlers({
              id: `image-${Date.now()}`,
              type: 'image',
              position,
              data: { src: base64Data, fileName: file.name, isUploading: false, lastTouched: Date.now() },
            });
            setNodes((nds) => [...nds, newNode]);
            setHasUnsavedChanges(true);
            socketRef.current?.emit('node-add', { roomId: id, node: newNode });
          };
          reader.readAsDataURL(file);
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target.result;
            const bounds = e.target.getBoundingClientRect();
            const position = {
              x: (e.clientX - bounds.left - getViewport().x) / getViewport().zoom,
              y: (e.clientY - bounds.top - getViewport().y) / getViewport().zoom
            };
            parseMarkdownToNodes(text, position);
          };
          reader.readAsText(file);
        }
      }
    };

    const handleDragOver = (e) => {
      if (e.target.closest('.react-flow__pane')) e.preventDefault();
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragOver);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [id, getViewport, injectHandlers, setNodes, socketRef, setHasUnsavedChanges, parseMarkdownToNodes]);


  // Load Data
  useEffect(() => {
    const fetchMap = async () => {
      try {
        setIsLoading(true);
        const token = useAuthStore.getState().token;
        const response = await axios.get(`${API_BASE_URL}/graphs/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const { graph, nodes: fetchedNodes, edges: fetchedEdges } = response.data;
        const { title, viewport, isPublic: graphIsPublic, scratchpadText: fetchedScratchpadText, creator } = graph;
        setMapTitle(title || 'Untitled Map');
        setGraphCreatorId(creator?._id || creator);
        setIsPublic(graphIsPublic !== false);
        if (fetchedScratchpadText) setScratchpadText(fetchedScratchpadText);

        // Remap rfId → id (ReactFlow requires `id`).
        // MongoDB stores the ReactFlow id as `rfId`; strip Mongoose internals.
        const rfNodes = (fetchedNodes || []).map(n => ({
          id: n.rfId,
          type: n.type,
          position: n.position,
          data: n.data,
        }));

        const rfEdges = (fetchedEdges || []).map(e => ({
          id: e.rfId,
          source: e.source,
          target: e.target,
          type: e.type,
          animated: e.animated,
        }));

        setNodes(rfNodes.map(node => injectHandlers(node)));
        setEdges(rfEdges);

        if (viewport) {
          setViewport(viewport, { duration: 800 });
        }

        // Notification: Notify creator that someone joined (if not the creator themselves)
        if (creator?._id && useAuthStore.getState().isAuthenticated && user?._id !== (creator?._id || creator)) {
          createNotification({
            recipientId: creator?._id || creator,
            type: 'join',
            graphId: id,
            graphTitle: title || 'Untitled Map'
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Error fetching map:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchMap();
  }, [id, setNodes, setEdges, setViewport, injectHandlers]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeIds(selectedNodes.map(n => n.id));
  }, []);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e-${Date.now()}`,
        animated: animatedEdges,
        label: '',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'var(--text-secondary)', strokeWidth: 1.5 },
        labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: 'var(--bg-secondary)', fillOpacity: 0.9, stroke: 'var(--border-color)', strokeWidth: 1, rx: 6 },
        labelBgPadding: [6, 4]
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setHasUnsavedChanges(true);
      socketRef.current?.emit('edge-add', { roomId: id, edge: newEdge });
    },
    [id, setEdges, animatedEdges]
  );

  // FEATURE: Edge Labels — double click to edit
  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    const currentLabel = edge.label || '';
    const newLabel = prompt('Edge label:', currentLabel);
    if (newLabel !== null) {
      setEdges(eds => eds.map(e => {
        if (e.id === edge.id) {
          return {
            ...e,
            label: newLabel || undefined,
            labelStyle: newLabel ? { fill: 'var(--text-primary)', fontWeight: 600, fontSize: 11 } : undefined,
            labelBgStyle: newLabel ? { fill: 'var(--bg-secondary)', fillOpacity: 0.9, stroke: 'var(--border-color)', strokeWidth: 1, rx: 6 } : undefined,
            labelBgPadding: newLabel ? [6, 4] : undefined
          };
        }
        return e;
      }));
      setHasUnsavedChanges(true);
    }
  }, [setEdges]);

  // Toggle animation on existing edges
  const toggleEdgeAnimation = useCallback(() => {
    const next = !animatedEdges;
    setAnimatedEdges(next);
    setEdges(eds => eds.map(e => ({ ...e, animated: next })));
  }, [animatedEdges, setEdges]);

  // Cycle edge routing type
  const cycleEdgeType = useCallback(() => {
    const types = ['default', 'smoothstep', 'step', 'straight'];
    const currentIdx = types.indexOf(edgeType);
    const next = types[(currentIdx + 1) % types.length];
    setEdgeType(next);
    setEdges(eds => eds.map(e => ({ ...e, type: next })));
    setHasUnsavedChanges(true);
    toast.success(`Edge style: ${next}`, { icon: '🔀' });
  }, [edgeType, setEdges]);

  // Presentation Mode toggle
  const togglePresentationMode = useCallback(() => {
    setPresentationMode(prev => {
      const next = !prev;
      if (next) {
        setShowUI(false);
        setActivePanel(null);
        setShowScratchpad(false);
        setShowSearch(false);
        setShowShortcuts(false);
        toast('Presentation Mode — press Escape to exit', { icon: '🎬', duration: 3000 });
      } else {
        setShowUI(true);
      }
      return next;
    });
  }, []);

  // Keyboard shortcuts: Escape exits Presentation Mode, Ctrl+Z/Ctrl+Shift+Z for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && presentationMode) {
        setPresentationMode(false);
        setShowUI(true);
        return;
      }
      // Undo: Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        const snapshot = history.undo();
        if (snapshot) {
          setNodes(snapshot.nodes.map(n => injectHandlers(n)));
          setEdges(snapshot.edges);
          toast('Undo', { icon: '↩️', duration: 1000 });
        }
        return;
      }
      // Redo: Ctrl+Shift+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        const snapshot = history.redo();
        if (snapshot) {
          setNodes(snapshot.nodes.map(n => injectHandlers(n)));
          setEdges(snapshot.edges);
          toast('Redo', { icon: '↪️', duration: 1000 });
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, history, setNodes, setEdges, injectHandlers]);

  const onNodeDragStop = useCallback(
    (event, node) => {
      socketRef.current?.emit('node-move', {
        roomId: id,
        nodeId: node.id,
        position: node.position
      });
      setHasUnsavedChanges(true);
    },
    [id]
  );

  const saveMap = async (isAutoSave = false) => {
    if (isSaving || isLoading) return;
    setIsSaving(true);
    try {
      // Strip injected runtime handlers (functions) from node.data before sending to backend.
      const sanitizedNodes = nodes.map(n => ({
        ...n,
        data: {
          label: n.data.label,
          votes: n.data.votes ?? 0,
          description: n.data.description ?? '',

          noteColor: n.data.noteColor ?? 0,
          priority: n.data.priority ?? 'medium',
          completed: n.data.completed ?? false,
        }
      }));

      await axios.put(`${API_BASE_URL}/graphs/${id}/save`, {
        title: mapTitle,
        nodes: sanitizedNodes,
        edges,
        viewport: getViewport(),
        scratchpadText
      }, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (!isAutoSave) toast.success('Map saved!', { icon: '💾', duration: 1500 });
    } catch (error) {
      console.error('Error saving map:', error.response?.data || error.message);
      toast.error('Failed to save map');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToMarkdown = useCallback(() => {
    let markdown = `# ${mapTitle}\n\n`;

    // Group nodes by type for better organization
    const groupedNodes = nodes.reduce((acc, node) => {
      const type = node.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(node);
      return acc;
    }, {});

    const typeLabels = {
      problem: 'Main Goals',
      rootCause: 'Reasons / Root Causes',
      solution: 'Results / Solutions',
      swot: 'Strategies (SWOT)',
      decision: 'Decisions',
      action: 'Action Items',
      note: 'Notes'
    };

    Object.keys(groupedNodes).forEach(type => {
      markdown += `## ${typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}\n`;
      groupedNodes[type].forEach(node => {
        markdown += `### ${node.data.label || 'Untitled'}\n`;
        if (node.data.votes) markdown += `*Votes: ${node.data.votes}*\n`;
        if (node.data.description) markdown += `\n${node.data.description}\n`;

        // Find connected nodes
        const connections = edges.filter(e => e.source === node.id || e.target === node.id);
        if (connections.length > 0) {
          markdown += `\n**Connections:**\n`;
          connections.forEach(edge => {
            const otherNodeId = edge.source === node.id ? edge.target : edge.source;
            const otherNode = nodes.find(n => n.id === otherNodeId);
            if (otherNode) {
              markdown += `- ${edge.source === node.id ? '->' : '<-'} ${otherNode.data.label || 'Untitled'}\n`;
            }
          });
        }
        markdown += `\n---\n\n`;
      });
    });

    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${mapTitle.replace(/\s+/g, '_')}_Nexus_Export.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [mapTitle, nodes, edges]);


  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      user: user.username,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user._id
    };

    socketRef.current.emit('chat-message', { roomId: id, message: messageData });
    setChatMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const commandActions = [
    { id: 'add-goal', label: 'Add Main Goal', icon: ShieldCheck, action: () => addNode('problem'), keywords: ['problem', 'objective', 'start'] },
    { id: 'add-reason', label: 'Add Reason', icon: Search, action: () => addNode('rootCause'), keywords: ['why', 'cause'] },
    { id: 'add-result', label: 'Add Result', icon: Zap, action: () => addNode('solution'), keywords: ['solution', 'outcome'] },
    { id: 'add-decision', label: 'Add Decision', icon: HelpCircle, action: () => addNode('decision'), keywords: ['choice'] },
    { id: 'add-strategy', label: 'Add Strategy', icon: Layers, action: () => addNode('swot'), keywords: ['swot'] },
    { id: 'add-factor', label: 'Add Factor', icon: Network, action: () => addNode('fishbone'), keywords: ['ishikawa'] },
    { id: 'add-action', label: 'Add Action Item', icon: CheckSquare, action: () => addNode('action'), keywords: ['task', 'todo'] },
    { id: 'add-note', label: 'Add Note', icon: StickyNote, action: () => addNode('note'), keywords: ['text', 'comment'] },
    { id: 'auto-arrange', label: 'Auto Arrange Map', icon: Layout, action: autoArrange },
    { id: 'export-png', label: 'Export as PNG', icon: Download, action: exportToPng },
    { id: 'export-md', label: 'Export as Markdown Docs', icon: FileText, action: exportToMarkdown },
    { id: 'toggle-focus', label: focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode', icon: focusMode ? EyeOff : Eye, action: () => setFocusMode(!focusMode) },
    { id: 'toggle-scratchpad', label: showScratchpad ? 'Hide Scratchpad' : 'Open Scratchpad', icon: Edit3, action: () => setShowScratchpad(!showScratchpad) },
    { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', icon: isDarkMode ? Sun : Moon, action: toggleTheme },
    { id: 'find-replace', label: 'Find & Replace', icon: Search, action: () => setShowSearch(true), shortcut: ['Ctrl', 'F'] },
  ];

  const handlePointerMove = useCallback((e) => {
    if (spotlightMode) {
      setSpotlightPos({ x: e.clientX, y: e.clientY });
    }
    if (!socketRef.current || !showUI) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    socketRef.current.emit('cursor-move', { roomId: id, x: position.x, y: position.y });
  }, [id, screenToFlowPosition, showUI, spotlightMode]);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative" onPointerMove={handlePointerMove}>
      <CursorOverlay activeUsers={activeUsers} currentSocketId={socketRef.current?.id} />
      <ReactFlow
        nodes={nodes.map(n => {
          let targetOpacity = 1;

          // Time-based decay feature (decay older than 5 minutes)
          if (n.data?.lastTouched && !selectedNodeIds.includes(n.id)) {
            const age = Date.now() - n.data.lastTouched;
            // Start fading after 2 minutes, max fade at 5 minutes
            const fadeStart = 2 * 60 * 1000;
            const fadeMax = 5 * 60 * 1000;
            if (age > fadeStart) {
              const fadeRatio = Math.min(1, (age - fadeStart) / (fadeMax - fadeStart));
              targetOpacity = 1 - (fadeRatio * 0.6); // Fade to 40% minimum
            }
          }

          if (focusMode && selectedNodeIds.length > 0) {
            const isSelected = selectedNodeIds.includes(n.id);
            const isConnected = edges.some(e =>
              (e.source === n.id && selectedNodeIds.includes(e.target)) ||
              (e.target === n.id && selectedNodeIds.includes(e.source))
            );
            targetOpacity = isSelected || isConnected ? 1 : 0.15;
          }

          return {
            ...n,
            style: { ...n.style, opacity: targetOpacity, transition: 'opacity 0.5s ease-in-out' }
          };
        })}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={snapToGrid}
        snapGrid={[24, 24]}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        deleteKeyCode="Delete"
      >
        <Background
          variant="lines"
          color={isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.1)'}
          gap={24}
          lineWidth={0.5}
        />
        <Background
          variant="dots"
          color={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.25)'}
          gap={240}
          size={2.5}
        />
        <Controls className="!bg-main/30 !backdrop-blur-md !border !border-border !rounded-2xl overflow-hidden shadow-2xl" />

        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'problem': return 'var(--node-problem-border)';
              case 'rootCause': return 'var(--node-root-border)';
              case 'solution': return 'var(--node-solution-border)';
              case 'swot': return 'var(--node-swot-border)';
              case 'fishbone': return 'var(--node-primary-border)';
              case 'decision': return 'var(--node-decision-border)';
              case 'action': return 'var(--node-action-border)';
              case 'note': return 'var(--node-note-border)';
              default: return 'var(--glass-border)';
            }
          }}
          maskColor="var(--bg-primary)"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            opacity: 0.8
          }}
          pannable
          zoomable
        />

        {/* Bulk-selection context toolbar */}
        {selectedNodeIds.length > 0 && (
          <Panel position="top-center" className="mt-4">
            <div className="bg-main/30 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xl border border-border animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="text-xs font-bold text-muted">{selectedNodeIds.length} selected</span>

              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => {
                  setNodes(nds => nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, style: { ...n.style, zIndex: (n.style?.zIndex || 0) + 10 } } : n));
                  setHasUnsavedChanges(true);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-main/10 text-main rounded-xl transition-all text-xs font-bold"
                title="Bring Forward"
              >
                <ArrowUpToLine size={14} />
              </button>
              <button
                onClick={() => {
                  setNodes(nds => nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, style: { ...n.style, zIndex: Math.max(0, (n.style?.zIndex || 0) - 10) } } : n));
                  setHasUnsavedChanges(true);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-main/10 text-main rounded-xl transition-all text-xs font-bold"
                title="Send Backward"
              >
                <ArrowDownToLine size={14} />
              </button>

              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => {
                  setNodes(nds => nds.map(n => {
                    if (selectedNodeIds.includes(n.id)) {
                      const isCurrentlyPinned = n.data?.isPinned || false;
                      return {
                        ...n,
                        draggable: isCurrentlyPinned, // If it was pinned, make it draggable again
                        data: { ...n.data, isPinned: !isCurrentlyPinned }
                      };
                    }
                    return n;
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-main/10 text-main rounded-xl transition-all text-xs font-bold"
                title="Toggle Pin"
              >
                <Pin size={14} />
              </button>

              <div className="h-4 w-px bg-border" />

              <button
                onClick={() => {
                  // Ensure we don't delete pinned nodes
                  const unpinnedSelectedIds = nodes.filter(n => selectedNodeIds.includes(n.id) && !n.data?.isPinned).map(n => n.id);
                  if (unpinnedSelectedIds.length > 0) {
                    setNodes(nds => nds.filter(node => !unpinnedSelectedIds.includes(node.id)));
                    setHasUnsavedChanges(true);
                    unpinnedSelectedIds.forEach(id => socketRef.current?.emit('node-delete', { roomId: id, nodeId: id }));
                  } else {
                    toast.error('Cannot delete pinned nodes.');
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition-all text-xs font-bold border border-danger/20"
              >
                <Trash size={14} />
                Delete
              </button>
            </div>
          </Panel>
        )}

        {/* Top Navigation - Simplified Language */}
        {showUI && (
          <Panel position="top-left" className="m-2 sm:m-4 flex items-center gap-2 sm:gap-4 max-w-[calc(100vw-80px)]">
            <div className="bg-main/30 backdrop-blur-md rounded-2xl flex items-center p-1.5 shadow-2xl border border-border">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-1 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all group shrink-0"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="h-6 w-px bg-border mx-1 sm:mx-2 shrink-0" />
              <div className="px-1 sm:px-3 flex flex-col shrink-0">
                <input
                  value={mapTitle}
                  onChange={(e) => setMapTitle(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-main font-display font-semibold text-xs sm:text-sm p-0 w-[80px] sm:w-[180px] placeholder:text-muted truncate"
                  placeholder="Map Title..."
                />
                <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                  <div className={`size-1.5 rounded-full ${isSaving ? 'bg-primary animate-pulse shadow-sm shadow-primary/50' : hasUnsavedChanges ? 'bg-warning animate-pulse' : 'bg-accent'}`} />
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted font-bold transition-all truncate max-w-[60px] sm:max-w-[none]">
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? `${nodes.length}n · Unsaved` : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : `${nodes.length} nodes`}
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-border mx-1 sm:mx-2 shrink-0 hidden sm:block" />
              <button
                onClick={() => saveMap()}
                disabled={isSaving}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all border group shrink-0 ${hasUnsavedChanges
                  ? 'bg-warning/10 hover:bg-warning/20 text-warning border-warning/30'
                  : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
                  }`}
                title="Save (Ctrl+S)"
              >
                <Save size={16} className={isSaving ? 'animate-spin' : ''} />
                <span className="text-xs font-bold">{hasUnsavedChanges ? 'Save*' : 'Save'}</span>
              </button>
              {/* Mobile Save Button (Icon Only) */}
              <button
                onClick={() => saveMap()}
                disabled={isSaving}
                className={`sm:hidden p-2 rounded-xl transition-all border shrink-0 mx-1 ${hasUnsavedChanges
                  ? 'bg-warning/10 text-warning border-warning/30'
                  : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                title="Save (Ctrl+S)"
              >
                <Save size={14} className={isSaving ? 'animate-spin' : ''} />
              </button>
              <div className="h-6 w-px bg-border mx-1 sm:mx-2 shrink-0" />
              <button
                onClick={exportToMarkdown}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl transition-all border border-secondary/20 group shrink-0"
                title="Export as Markdown"
              >
                <FileText size={16} />
                <span className="hidden sm:inline text-xs font-bold font-display uppercase tracking-widest">Docs</span>
              </button>
            </div>
          </Panel>
        )}

        {showUI && (
          <Panel position="top-right" className="m-2 sm:m-4 flex items-center gap-1 sm:gap-3">
            <div className="bg-main/30 backdrop-blur-md rounded-2xl p-1.5 flex items-center gap-0.5 sm:gap-1 shadow-2xl border border-border">
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden sm:block"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden sm:block ${snapToGrid ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Snap to Grid"
              >
                <Grid size={18} />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={toggleEdgeAnimation}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden md:block ${animatedEdges ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Animate Edges"
              >
                <GitBranch size={18} />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <button
                onClick={autoArrange}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden sm:block"
                title="Auto Arrange Nodes"
              >
                <Layout size={18} />
              </button>
              <button
                onClick={handleSmartArrange}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden md:block"
                title="AI Smart Arrange"
              >
                <Brain size={18} />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={exportToPng}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden md:block"
                title="Export as PNG"
              >
                <Download size={18} />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <button
                onClick={() => { setShowSearch(s => { const next = !s; if (next) setTimeout(() => searchInputRef.current?.focus(), 100); return next; }); }}
                className={`p-2 sm:p-2.5 rounded-xl transition-all ${showSearch ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Search & Replace (Ctrl+F)"
              >
                <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden md:block"
                title="Keyboard Shortcuts (?)"
              >
                <HelpCircle size={18} />
              </button>
              <button
                onClick={() => setSpotlightMode(!spotlightMode)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden lg:block ${spotlightMode ? 'bg-warning text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Spotlight Mode"
              >
                <Flashlight size={18} />
              </button>

              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={togglePresentationMode}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden md:block ${presentationMode ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Presentation Mode"
              >
                {presentationMode ? <Eye size={18} /> : <Monitor size={18} />}
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden lg:block ${focusMode ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Focus Mode"
              >
                {focusMode ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={cycleEdgeType}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-main/5 text-muted hover:text-main transition-all hidden md:block"
                title={`Edge Style: ${edgeType}`}
              >
                <GitBranch size={18} className="rotate-90" />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <button
                onClick={() => setShowScratchpad(!showScratchpad)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden sm:block ${showScratchpad ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Scratchpad"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => setShowTimer(!showTimer)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden md:block ${showTimer ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Focus Timer"
              >
                <Timer size={18} />
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all hidden md:block ${showStats ? 'bg-main text-background shadow-lg' : 'hover:bg-main/5 text-muted hover:text-main'}`}
                title="Map Stats"
              >
                <BarChart3 size={18} />
              </button>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              {/* Force show Chat button on mobile, but compact */}
              <button
                onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center gap-1 sm:gap-2 ${activePanel === 'chat' ? 'bg-main text-background shadow-lg' : 'hover:bg-main/10 text-main'}`}
                title="Team Chat"
              >
                <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest leading-none">Chat</span>
              </button>
              {/* AI Features temporarily hidden 
              <div className="h-6 w-px bg-border mx-1" />
              <button 
                onClick={() => setActivePanel(activePanel === 'ai' ? null : 'ai')}
                className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${activePanel === 'ai' ? 'bg-main text-background shadow-lg' : 'hover:bg-main/10 text-main'}`}
                title="Team Workshop"
              >
                <Users size={18} />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">Workshop</span>
              </button>
              */}
            </div>
          </Panel>
        )}

        {/* Search Panel */}
        <AnimatePresence>
          {showSearch && (
            <Panel position="top-center" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-main/30 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl border border-border"
              >
                <Search size={16} className="text-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Find..."
                  className="bg-transparent border-none focus:ring-0 text-main text-sm w-32 placeholder:text-muted outline-none"
                />
                <div className="h-6 w-px bg-border" />
                <input
                  value={replaceQuery}
                  onChange={e => setReplaceQuery(e.target.value)}
                  placeholder="Replace with..."
                  className="bg-transparent border-none focus:ring-0 text-main text-sm w-32 placeholder:text-muted outline-none"
                />
                <button
                  onClick={handleReplaceAll}
                  disabled={!searchQuery || !replaceQuery || searchMatchIds.length === 0}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/30 disabled:opacity-30"
                >
                  Replace All
                </button>
                {searchMatchIds.length > 0 && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
                    {searchIndex + 1}/{searchMatchIds.length}
                  </span>
                )}
                {searchQuery && searchMatchIds.length === 0 && (
                  <span className="text-[10px] font-bold text-danger uppercase tracking-widest whitespace-nowrap">No match</span>
                )}
                <div className="flex gap-1">
                  <button onClick={() => jumpToSearchResult(-1)} className="p-1 hover:bg-main/10 rounded-lg text-muted" title="Prev"><ChevronUp size={14} /></button>
                  <button onClick={() => jumpToSearchResult(1)} className="p-1 hover:bg-main/10 rounded-lg text-muted" title="Next"><ChevronDown size={14} /></button>
                </div>
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchMatchIds([]); }} className="p-1 hover:bg-main/10 rounded-lg text-muted"><XIcon size={14} /></button>
              </motion.div>
            </Panel>
          )}
        </AnimatePresence>

        {/* Shortcut Help Modal */}
        <AnimatePresence>
          {showShortcuts && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md glass-panel border border-border rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                      <Logo className="size-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-main">Keyboard Shortcuts</h2>
                      <p className="text-xs text-muted font-mono uppercase tracking-widest">Master the Engine</p>
                    </div>
                  </div>
                  <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-main/5 rounded-xl text-muted"><XIcon size={20} /></button>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'Ctrl + S', desc: 'Save Workflow' },
                    { key: 'Ctrl + F', desc: 'Find & Replace' },
                    { key: '?', desc: 'Show this menu' },
                    { key: 'Shift + Click', desc: 'Multi-select' },
                    { key: 'Backspace / Del', desc: 'Remove Selection' },
                    { key: 'Escape', desc: 'Close Panels' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-main/10 border border-border/40">
                      <span className="text-sm font-bold text-main">{s.desc}</span>
                      <kbd className="px-3 py-1 bg-background border border-border rounded-lg text-[10px] font-mono font-bold text-primary shadow-sm">{s.key}</kbd>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowShortcuts(false)}
                  className="w-full mt-8 py-4 bg-primary text-background rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-display"
                >
                  Continue Mapping
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Dock - Simplified Language */}
        {showUI && (
          <Panel position="bottom-center" className="mb-4 sm:mb-6 w-full max-w-[95vw] sm:max-w-max pointer-events-none">
            <div className="flex flex-col items-center gap-2 sm:gap-4 pointer-events-auto relative">

              {/* AI Brainstorm floating action */}
              <AnimatePresence>
                {selectedNodeIds.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute -top-14 bg-main/30 backdrop-blur-xl border border-primary/40 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] rounded-2xl p-1 z-50 pointer-events-auto flex items-center gap-2"
                  >
                    <button
                      onClick={handleExpandIdea}
                      disabled={isExpanding}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-xl hover:opacity-90 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <Sparkles size={14} className={isExpanding ? "animate-spin" : ""} />
                      {isExpanding ? 'Brainstorming...' : 'Expand Idea'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>



              <div className="bg-main/30 backdrop-blur-md rounded-3xl p-1.5 sm:p-2 flex items-center shadow-2xl border border-border overflow-x-auto max-w-full scrollbar-hide shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-main/20 rounded-2xl border border-border mr-1 sm:mr-2 shrink-0">
                  <Logo className="size-4 text-main" />
                  {/* Hide text on very small screens, keep icon */}
                  <span className="hidden sm:inline text-[10px] uppercase font-display font-bold tracking-widest text-main">Add Element</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 px-1">
                  <button
                    onClick={() => addNode('problem')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[70px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Goal</span>
                  </button>

                  <button
                    onClick={() => addNode('rootCause')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[70px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <Search size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Reason</span>
                  </button>

                  <button
                    onClick={() => addNode('solution')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[70px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <Zap size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Result</span>
                  </button>

                  <div className="h-6 sm:h-8 w-px bg-border mx-0.5 sm:mx-1 shrink-0" />

                  <button
                    onClick={() => addNode('decision')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <HelpCircle size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Decision</span>
                  </button>

                  <button
                    onClick={() => addNode('swot')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0 hidden md:flex"
                  >
                    <Layers size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Strategy</span>
                  </button>

                  <button
                    onClick={() => addNode('fishbone')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0 hidden sm:flex"
                  >
                    <Network size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Factor</span>
                  </button>

                  <button
                    onClick={() => addNode('action')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <CheckSquare size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Action</span>
                  </button>

                  <button
                    onClick={() => addNode('note')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0"
                  >
                    <StickyNote size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Note</span>
                  </button>

                  <button
                    onClick={() => addNode('group')}
                    className="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px] rounded-2xl hover:bg-main/20 text-main transition-all border border-transparent group hover:shadow-lg shrink-0 hidden sm:flex"
                  >
                    <MaximizeIcon size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter">Frame</span>
                  </button>

                  <button
                    className="p-2 sm:p-3 bg-secondary/20 text-secondary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg ml-1 border border-secondary/30 shrink-0"
                    onClick={() => setShowTemplates(true)}
                    title="Templates"
                  >
                    <Bookmark size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </button>

                  <button
                    className="p-2 sm:p-3 bg-main text-background rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md ml-1 sm:ml-2 border border-border shrink-0"
                    onClick={() => addNode('problem')}
                  >
                    <Plus size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* FEATURE: Spotlight Mode Overlay */}
      {spotlightMode && (
        <div
          className="fixed inset-0 pointer-events-none z-[60] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 180px at ${spotlightPos.x}px ${spotlightPos.y}px, transparent 0%, transparent 60%, rgba(0,0,0,0.75) 100%)`
          }}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApplyTemplate={(template) => {
          const ts = Date.now();
          const newNodes = template.nodes.map(n => injectHandlers({ ...n, id: `${n.id}-${ts}` }));
          const newEdges = template.edges.map(e => ({ ...e, id: `${e.id}-${ts}`, source: `${e.source}-${ts}`, target: `${e.target}-${ts}` }));
          setNodes(prev => [...prev, ...newNodes]);
          setEdges(prev => [...prev, ...newEdges]);
          setHasUnsavedChanges(true);
          toast.success(`Template "${template.name}" applied!`, { icon: '🧩' });
        }}
      />

      {/* Empty State Overlay — fixed full-screen so it's always perfectly centered */}
      {nodes.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 text-center w-[90vw] max-w-[420px] border-border shadow-md flex flex-col items-center pointer-events-auto"
          >

            <div className={`size-20 rounded-[28px] flex items-center justify-center mb-8 border transition-transform hover:-translate-y-1 ${isDarkMode
              ? 'bg-secondary/15 border-secondary/30 shadow-lg shadow-secondary/20'
              : 'bg-secondary/10 border-secondary/25 shadow-md shadow-secondary/10'
              }`}>
              <GitBranch size={32} className="text-secondary" />
            </div>
            <h2 className={`text-3xl font-display font-extrabold uppercase italic tracking-tighter mb-4 ${isDarkMode
              ? 'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'
              : 'text-main'
              }`}>Canvas Initialized</h2>
            <p className="text-muted/80 text-sm font-medium leading-relaxed mb-10">
              Your workspace is live. Start mapping by selecting an element from the dock below or use the <span className="text-primary font-bold">Quick Goal</span> button.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => addNode('problem')}
                className="w-full py-4 bg-primary text-background rounded-2xl font-display font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/30"
              >
                Define Core Goal
              </button>
              <div className={`flex items-center gap-2 py-3 px-4 border border-border rounded-xl ${isDarkMode ? 'bg-main/5' : 'bg-surface'
                }`}>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Shift + Select</span>
                <span className="text-[10px] font-bold text-muted/40 lowercase">for multi-edit</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Scratchpad */}
      <GraphScratchpad
        isOpen={showScratchpad}
        onClose={() => setShowScratchpad(false)}
        text={scratchpadText}
        setText={setScratchpadText}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        actions={commandActions}
      />

      {/* Side Panels - Unified Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-main/30 backdrop-blur-md shadow-2xl border-l border-border z-[100] transform transition-transform duration-500 overflow-hidden flex flex-col ${activePanel ? 'translate-x-0' : 'translate-x-full'}`}>


        {/* AI Panel Content */}
        {activePanel === 'ai' && (
          <div className="p-0 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <Users className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-main tracking-tight italic">Collaboration Room</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-1.5 mt-0.5 italic">
                    Live Strategy Session
                  </p>
                </div>
              </div>
              <button onClick={() => setActivePanel(null)} className="p-2 hover:bg-main/5 rounded-xl text-muted hover:text-main transition-all">
                <Minimize2 size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {aiMessages.length === 0 ? (
                <div className="bg-main/5 rounded-3xl p-6 border border-border/50 text-center space-y-4">
                  <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
                    <Users className="text-secondary" size={24} />
                  </div>
                  <p className="text-sm text-main leading-relaxed font-medium">
                    {!isPublic
                      ? "Our expert collaborators only join public brainstorming sessions. Make this map public to invite the team!"
                      : "Welcome to the workshop! Our team can help analyze your map, find missing links, or propose strategic steps. What's on your mind?"}
                  </p>
                  {isPublic && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <button
                        disabled={isSimulating}
                        onClick={runTeamSimulation}
                        className="w-full text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-2xl bg-secondary text-background hover:scale-[1.02] shadow-md shadow-secondary/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={14} fill="currentColor" />
                        Start Team Workshop
                      </button>
                      <button
                        onClick={() => { setAiInputValue('Suggest 3 potential solutions for my current challenges.'); setTimeout(() => handleAiChat(), 0); }}
                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all"
                      >
                        Propose Solutions
                      </button>
                      <button
                        onClick={() => { setAiInputValue('What are the potential risks in my plan?'); setTimeout(() => handleAiChat(), 0); }}
                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all"
                      >
                        Identify Risks
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                aiMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'model' && msg.persona && (
                      <div className="flex items-center gap-2 mb-1.5 ml-2">
                        <span className="text-lg">{msg.persona.avatar}</span>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{msg.persona.name}</span>
                        <span className="text-[8px] text-muted font-bold uppercase tracking-tighter opacity-70"> • {msg.persona.role}</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] font-medium leading-relaxed ${msg.role === 'user'
                      ? 'bg-main/10 border border-border text-main rounded-tr-none'
                      : 'bg-secondary/10 border border-secondary/20 text-main rounded-tl-none shadow-[0_4px_20px_rgba(var(--secondary-rgb),0.05)]'
                      }`}>
                      {msg.content}

                      {msg.suggestions && (msg.suggestions.newNodes?.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-secondary/20">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Proposed Ideas</p>
                          <button
                            onClick={() => applyAiSuggestions(msg.suggestions)}
                            className="w-full bg-secondary text-background py-2.5 rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-sm shadow-secondary/30 flex items-center justify-center gap-2"
                          >
                            <Plus size={14} strokeWidth={3} />
                            ADOPT THESE IDEAS
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isAiThinking && (
                <div className="flex items-center gap-2 text-secondary animate-pulse px-2">
                  <div className="size-1.5 rounded-full bg-current" />
                  <div className="size-1.5 rounded-full bg-current" style={{ animationDelay: '0.2s' }} />
                  <div className="size-1.5 rounded-full bg-current" style={{ animationDelay: '0.4s' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest ml-2">
                    {currentCollaborator ? `${currentCollaborator.name} is typing...` : "Typing..."}
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAiChat} className="p-6 border-t border-border bg-background/50 backdrop-blur-xl">
              {!isPublic ? (
                <div className="h-[100px] flex items-center justify-center bg-red-500/5 rounded-xl border border-red-500/20 px-4 text-center">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Map is private. Team unavailable.</p>
                </div>
              ) : (
                <div className="relative group">
                  <textarea
                    value={aiInputValue}
                    onChange={(e) => setAiInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiChat(); } }}
                    placeholder="Share your thoughts with the team..."
                    className="w-full bg-main/5 border border-border rounded-xl p-4 pr-14 text-sm text-main focus:outline-none focus:border-secondary/50 transition-all min-h-[100px] max-h-[200px] resize-none font-medium placeholder:text-muted"
                    rows="3"
                  />
                  <button
                    type="submit"
                    disabled={!aiInputValue.trim() || isAiThinking}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all ${aiInputValue.trim() && !isAiThinking
                      ? 'bg-secondary text-background hover:scale-110 shadow-sm shadow-secondary/40'
                      : 'bg-secondary/20 text-secondary/40'
                      }`}
                  >
                    <Zap size={18} fill="currentColor" />
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* FEATURE: Team Chat Content */}
        {activePanel === 'chat' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <MessageSquare className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-main tracking-tight uppercase italic">Team Chat</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    Real-Time Online
                  </p>
                </div>
              </div>
              <button onClick={() => setActivePanel(null)} className="p-2 hover:bg-main/5 rounded-xl text-secondary hover:text-main transition-all">
                <Minimize2 size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <MessageSquare size={48} className="mb-4 text-secondary" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Start a Conversation</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.userId === user?._id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">{msg.user}</span>
                      <span className="text-[8px] text-muted/60 font-bold">{msg.time}</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] font-medium ${msg.userId === user?._id
                      ? 'bg-primary text-background rounded-tr-none shadow-sm shadow-primary/30'
                      : 'bg-surface-elevated border border-border text-main rounded-tl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-6 border-t border-border shrink-0 bg-background/50 backdrop-blur-xl">
              <div className="relative group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-main/10 border border-border rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-main/50 transition-all font-medium placeholder:text-main/50"
                />
                <button
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${newMessage.trim() ? 'bg-primary text-background hover:scale-110 shadow-sm shadow-primary/40' : 'text-secondary/30'
                    }`}
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} strokeWidth={3} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GraphEditor() {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
}
