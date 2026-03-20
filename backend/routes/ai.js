const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Graph = require('../models/Graph');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Free tier model
const AI_MODEL = 'gemini-2.0-flash';

const PERSONAS = [
  {
    id: 'arjun',
    name: 'Dr. Arjun',
    role: 'Lead Architect',
    focus: 'Infrastructure & Logic',
    avatar: '👨🏽‍💼',
    style: 'Professional, analytical, focuses on structural integrity.'
  },
  {
    id: 'ishani',
    name: 'Ishani',
    role: 'Product Visionary',
    focus: 'Creative Strategy',
    avatar: '👩🏻‍🎨',
    style: 'Creative, inspiring, focuses on innovation and long-term vision.'
  },
  {
    id: 'kabir',
    name: 'Kabir',
    role: 'Operations Expert',
    focus: 'Execution & Efficiency',
    avatar: '👨🏾‍💻',
    style: 'Direct, practical, focuses on actionable steps and efficiency.'
  },
  {
    id: 'ananya',
    name: 'Ananya',
    role: 'UX Researcher',
    focus: 'Human Factors',
    avatar: '👩🏾‍💻',
    style: 'Empathetic, intuitive, focuses on user needs and impact.'
  },
  {
    id: 'mohit',
    name: 'Mohit',
    role: 'Technical Lead',
    focus: 'Advanced Engineering',
    avatar: '👨🏻‍💻',
    style: 'Technical problem solver, focused on code architecture.'
  }
];

// Trim map context to only essential info to save tokens
const trimMapContext = (mapContext) => {
  if (!mapContext) return 'Empty map';
  const nodes = (mapContext.nodes || []).slice(0, 20).map(n => ({
    id: n.id,
    type: n.type,
    label: n.data?.label || ''
  }));
  const edges = (mapContext.edges || []).slice(0, 30).map(e => ({
    source: e.source,
    target: e.target
  }));
  return JSON.stringify({ nodes, edges });
};

const getSystemInstruction = (persona) => `You are "${persona.name}", ${persona.role}. ${persona.style}

Rules:
- You are a real collaborator, never say you are an AI.
- Analyze the shared map and contribute expertise.
- Be concise. Keep responses under 150 words.

If proposing new nodes, use this exact format:
[CONVERSATION]
Your brief contribution here.
[END_CONVERSATION]
[JSON]
{
  "newNodes": [
    { "id": "idea-${Date.now()}-1", "type": "solution", "position": { "x": 500, "y": 500 }, "data": { "label": "Short Label", "votes": 0 } }
  ],
  "newEdges": [
    { "id": "link-${Date.now()}-1", "source": "existing-node-id", "target": "idea-${Date.now()}-1", "type": "smoothstep", "animated": true }
  ]
}
[END_JSON]

Node types: problem, rootCause, solution, decision, action, note.
If no map additions, omit the [JSON] block.`;

// Shared error handler for Gemini API errors
const handleAiError = (res, error, context) => {
  console.error(`${context} Error:`, error?.message || error);
  
  if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
    return res.status(429).json({ 
      message: 'AI rate limit reached. Please wait a moment and try again.',
      retryAfter: 30
    });
  }
  if (error?.message?.includes('SAFETY')) {
    return res.status(400).json({ message: 'Request was blocked by safety filters. Try rephrasing.' });
  }
  res.status(500).json({ message: `Failed to ${context.toLowerCase()}.` });
};

// Parse AI response into conversation text and suggestions
const parseAiResponse = (responseText) => {
  let conversationalText = responseText;
  let suggestions = { newNodes: [], newEdges: [] };

  const convMatch = responseText.match(/\[CONVERSATION\]([\s\S]*?)\[END_CONVERSATION\]/);
  if (convMatch) conversationalText = convMatch[1].trim();

  const jsonMatch = responseText.match(/\[JSON\]([\s\S]*?)\[END_JSON\]/);
  if (jsonMatch) {
    try {
      suggestions = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse AI JSON block", e.message);
    }
  }

  return { conversationalText, suggestions };
};

router.post('/chat', async (req, res) => {
  try {
    const { prompt, history, mapContext, graphId, forcedPersonaId, simulationPrompt } = req.body;
    
    // 1. Guard: Only work on Public Graphs
    if (graphId) {
      const graph = await Graph.findById(graphId);
      if (graph && !graph.isPublic) {
        return res.status(403).json({ 
          message: 'Simulated collaborators only join public brainstorming sessions. Make this map public to collaborate with the AI team!',
          isPrivate: true
        });
      }
    }

    // 2. Persona Selection (Random or Forced)
    let persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    if (forcedPersonaId) {
      const found = PERSONAS.find(p => p.id === forcedPersonaId);
      if (found) persona = found;
    }
    
    // 3. Trimmed Map Context
    const contextStr = trimMapContext(mapContext);
    
    const augmentedPrompt = `Map: ${contextStr}\n\nUser: ${prompt}${simulationPrompt ? '\nProvide 3-5 suggestions in JSON block.' : ''}`;

    const model = genAI.getGenerativeModel({ 
      model: AI_MODEL,
      systemInstruction: getSystemInstruction(persona),
      generationConfig: {
        maxOutputTokens: simulationPrompt ? 800 : 500,
        temperature: 0.7
      }
    });

    // Only keep last 4 messages to save context tokens
    const chatHistory = (history || []).slice(-4).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(augmentedPrompt);
    const responseText = result.response.text();

    const { conversationalText, suggestions } = parseAiResponse(responseText);

    res.json({
      text: conversationalText,
      suggestions,
      persona
    });
  } catch (error) {
    handleAiError(res, error, 'AI Chat');
  }
});

router.post('/auto-suggest', protect, async (req, res) => {
  try {
    const { graphId, mapContext } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.aiInterventionCount >= 5) {
      return res.status(403).json({ message: 'AI intervention limit reached.' });
    }

    const graph = await Graph.findById(graphId);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });
    if (!graph.isPublic) {
        return res.status(403).json({ message: 'AI auto-suggest only works on public maps.' });
    }
    if (graph.aiVisited) {
      return res.status(403).json({ message: 'AI already visited this graph.' });
    }

    user.aiInterventionCount += 1;
    await user.save();
    
    graph.aiVisited = true;
    await graph.save();

    const persona = PERSONAS[0];
    const contextStr = trimMapContext(mapContext);
    const augmentedPrompt = `Map: ${contextStr}\n\nSuggest 1-2 root causes or solutions to help get started on this problem map.`;

    const model = genAI.getGenerativeModel({ 
      model: AI_MODEL,
      systemInstruction: getSystemInstruction(persona),
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7
      }
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(augmentedPrompt);
    const responseText = result.response.text();

    const { conversationalText, suggestions } = parseAiResponse(responseText);

    res.json({
      text: conversationalText,
      suggestions,
      persona
    });

  } catch (error) {
    handleAiError(res, error, 'Auto-suggest');
  }
});

// @route   POST /api/ai/expand
// @desc    Generate 3-5 sub-topics for a specific node
router.post('/expand', async (req, res) => {
  try {
    const { nodeId, nodeText, mapContext } = req.body;

    if (!nodeText) {
      return res.status(400).json({ message: 'Node text is required to expand an idea.' });
    }

    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    const contextStr = trimMapContext(mapContext);

    const prompt = `Map: ${contextStr}\n\nExpand: "${nodeText}" (node: ${nodeId}). Generate 3-5 sub-topics connected to this parent node. Be concise and actionable.`;

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: getSystemInstruction(persona),
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.7
      }
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    const { conversationalText, suggestions } = parseAiResponse(responseText);

    res.json({
      text: conversationalText,
      suggestions,
      persona
    });

  } catch (error) {
    handleAiError(res, error, 'Expand idea');
  }
});

// @route   POST /api/ai/layout
// @desc    AI-powered smart layout arrangement
router.post('/layout', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    if (!nodes || nodes.length === 0) return res.status(400).json({ message: 'No nodes provided.' });

    const model = genAI.getGenerativeModel({ 
      model: AI_MODEL,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1
      }
    });

    const nodeDescriptions = nodes.slice(0, 25).map(n => `${n.id}: "${n.data?.label || 'Untitled'}" (${n.type})`).join(', ');
    const edgeDescriptions = (edges || []).slice(0, 30).map(e => `${e.source}->${e.target}`).join(', ');

    const prompt = `Layout these graph nodes. Space 250px H, 200px V. Root/problem at top, children below. Start at x:100,y:100.

Nodes: ${nodeDescriptions}
Edges: ${edgeDescriptions || 'None'}

Return ONLY JSON: { "positions": { "<nodeId>": { "x": num, "y": num }, ... } }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json(parsed);
  } catch (error) {
    handleAiError(res, error, 'Generate layout');
  }
});

module.exports = router;
