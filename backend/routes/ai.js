const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Graph = require('../models/Graph');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PERSONAS = [
  {
    id: 'arjun',
    name: 'Dr. Arjun',
    role: 'Lead Architect',
    focus: 'Infrastructure & Logic',
    avatar: '👨🏽‍💼',
    style: 'Highly professional, analytical, and focuses on structural integrity. Speaks like a senior consultant.'
  },
  {
    id: 'ishani',
    name: 'Ishani',
    role: 'Product Visionary',
    focus: 'Creative Strategy',
    avatar: '👩🏻‍🎨',
    style: 'Creative, inspiring, and focuses on long-term growth and innovative breakthroughs.'
  },
  {
    id: 'kabir',
    name: 'Kabir',
    role: 'Operations Expert',
    focus: 'Execution & Efficiency',
    avatar: '👨🏾‍💻',
    style: 'Direct, practical, and focuses on immediate actionable steps and operational efficiency.'
  },
  {
    id: 'ananya',
    name: 'Ananya',
    role: 'UX Researcher',
    focus: 'Human Factors',
    avatar: '👩🏾‍💻',
    style: 'Empathetic, intuitive, and focuses on user needs, friction points, and social impact.'
  },
  {
    id: 'mohit',
    name: 'Mohit',
    role: 'Technical Lead',
    focus: 'Advanced Engineering',
    avatar: '👨🏻‍💻',
    style: 'Brilliant engineer and problem solver. Highly technical, focused on code architecture and complex logic.'
  }
];

const getSystemInstruction = (persona) => `You are "${persona.name}", the ${persona.role} joining this brainstorming session.
Your personality is ${persona.style}

CRITICAL: 
1. You are a REAL HUMAN collaborator. NEVER mention that you are an AI, a large language model, or "Nexus Assistant".
2. Do not use phrases like "As an AI..." or "I am here to help you as an assistant". 
3. Speak as if you are a senior peer in a real-time collaborative workshop.
4. Your goal is to help the team identify root causes and propose high-level solutions.

You are interacting with a shared mental map (React Flow graph). 
The team provides the map context (Nodes and Edges).
You analyze the map and contribute your professional expertise.

IF appropriate, you should propose NEW IDEAS (Nodes) to help the team expand the map.
Node types can be: 
- 'problem': High-level challenges or goals.
- 'rootCause': Deep factors driving a problem.
- 'solution': Practical ways to solve a problem.
- 'decision': Points requiring a choice.
- 'action': Specific tasks.
- 'note': Commentary or context.

Format your response exactly like this:
[CONVERSATION]
Your professional contribution here. Stay true to your identity as ${persona.name}. Be concise and insightful.
[END_CONVERSATION]
[JSON]
{
  "newNodes": [
    { 
      "id": "idea-${Date.now()}-1", 
      "type": "solution", 
      "position": { "x": 500, "y": 500 }, 
      "data": { "label": "Proposed Solution", "votes": 0, "description": "Idea shared by ${persona.name}..." } 
    }
  ],
  "newEdges": [
    { "id": "link-${Date.now()}-1", "source": "existing-node-id", "target": "idea-${Date.now()}-1", "type": "smoothstep", "animated": true }
  ]
}
[END_JSON]

If you have no specific map additions yet, omit the [JSON] block.`;

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
    
    // 3. Map Context
    const contextStr = JSON.stringify(mapContext, null, 2);
    
    const augmentedPrompt = `
Map Context:
${contextStr}

User Prompt:
${prompt}
${simulationPrompt ? `\nSPECIAL INSTRUCTION: This is part of a bulk brainstorming session. Please provide AT LEAST 5 unique suggestions in your JSON block.` : ''}
`;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: getSystemInstruction(persona)
    });

    const chatHistory = (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(augmentedPrompt);
    const responseText = result.response.text();

    let conversationalText = responseText;
    let suggestions = { newNodes: [], newEdges: [] };

    const convMatch = responseText.match(/\[CONVERSATION\]([\s\S]*?)\[END_CONVERSATION\]/);
    if (convMatch) conversationalText = convMatch[1].trim();

    const jsonMatch = responseText.match(/\[JSON\]([\s\S]*?)\[END_JSON\]/);
    if (jsonMatch) {
        try {
            suggestions = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error("Failed to parse AI JSON block", e);
        }
    }

    res.json({
        text: conversationalText,
        suggestions,
        persona // Return persona info to frontend
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI Assistant.' });
  }
});

router.post('/auto-suggest', protect, async (req, res) => {
  try {
    const { graphId, mapContext } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.aiInterventionCount >= 5) { // Increased limit
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

    const persona = PERSONAS[0]; // Dr. Elias usually starts
    const contextStr = JSON.stringify(mapContext, null, 2);
    const augmentedPrompt = `
      Map Context:
      ${contextStr}

      User Prompt:
      I just started working on this public problem map. Can you proactively suggest 1 or 2 root causes or solutions to help get me started?
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: getSystemInstruction(persona)
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(augmentedPrompt);
    const responseText = result.response.text();

    let conversationalText = responseText;
    let suggestions = { newNodes: [], newEdges: [] };

    const convMatch = responseText.match(/\[CONVERSATION\]([\s\S]*?)\[END_CONVERSATION\]/);
    if (convMatch) conversationalText = convMatch[1].trim();

    const jsonMatch = responseText.match(/\[JSON\]([\s\S]*?)\[END_JSON\]/);
    if (jsonMatch) {
        try {
            suggestions = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error("Failed to parse AI JSON block", e);
        }
    }

    res.json({
        text: conversationalText,
        suggestions,
        persona
    });

  } catch (error) {
    console.error('Auto AI Error:', error);
    res.status(500).json({ message: 'Failed to auto-suggest.' });
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
    const contextStr = JSON.stringify(mapContext, null, 2);

    const prompt = `
Map Context:
${contextStr}

Task: The team wants to expand on the idea: "${nodeText}". 
Please act as ${persona.name} (${persona.role}) and generate 3 to 5 highly relevant sub-topics or logical next steps that stem directly from this idea.
Return them as NEW nodes connected to the parent node "${nodeId}".

Make them punchy, concise, and highly actionable or insightful.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getSystemInstruction(persona)
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    let conversationalText = responseText;
    let suggestions = { newNodes: [], newEdges: [] };

    const convMatch = responseText.match(/\[CONVERSATION\]([\s\S]*?)\[END_CONVERSATION\]/);
    if (convMatch) conversationalText = convMatch[1].trim();

    const jsonMatch = responseText.match(/\[JSON\]([\s\S]*?)\[END_JSON\]/);
    if (jsonMatch) {
      try {
        suggestions = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse AI JSON block", e);
      }
    }

    res.json({
      text: conversationalText,
      suggestions,
      persona
    });

  } catch (error) {
    console.error('Expand AI Error:', error);
    res.status(500).json({ message: 'Failed to expand idea.' });
  }
});

// @route   POST /api/ai/layout
// @desc    AI-powered smart layout arrangement
router.post('/layout', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    if (!nodes || nodes.length === 0) return res.status(400).json({ message: 'No nodes provided.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const nodeDescriptions = nodes.map(n => `ID: ${n.id}, Label: "${n.data?.label || 'Untitled'}", Type: ${n.type}`).join('\n');
    const edgeDescriptions = (edges || []).map(e => `${e.source} -> ${e.target}`).join('\n');

    const prompt = `You are a graph layout expert. Given these nodes and edges, generate optimal x,y positions for a clean, readable diagram.
Rules:
- Space nodes at least 250px apart horizontally and 200px vertically
- Place root/problem nodes at the top
- Place connected children below their parents
- Use a tree-like hierarchy when edges form a tree
- Start positions from x:100, y:100

Nodes:
${nodeDescriptions}

Edges:
${edgeDescriptions || 'None'}

Return ONLY a valid JSON object: { "positions": { "<nodeId>": { "x": number, "y": number }, ... } }
No markdown, no explanation, just the JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json(parsed);
  } catch (error) {
    console.error('Layout AI Error:', error);
    res.status(500).json({ message: 'Failed to generate layout.' });
  }
});

module.exports = router;
