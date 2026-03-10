const express = require('express');
const { protect } = require('../middleware/auth');
const Graph = require('../models/Graph');
const NodeModel = require('../models/Node');
const EdgeModel = require('../models/Edge');
const GraphVersion = require('../models/GraphVersion');
const User = require('../models/User'); // Required for user lookup during invites
const { triggerWebhook } = require('../utils/webhook'); // Outbound notification helper

const router = express.Router();

// @route   GET /api/graphs
// @desc    Get all public graphs + private graphs the user has access to
router.get('/', async (req, res) => {
  try {
    // Note: since this is an open endpoint (no protect middleware), we primarily
    // return public maps. If a user token was provided, we would use it to fetch
    // their private maps. For now, just return public maps for the generic dashboard list
    const graphs = await Graph.find({ isPublic: true })
      .populate('creator', 'username')
      .sort('-createdAt');
    res.json(graphs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/graphs
// @desc    Create a new graph map
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, isPublic, template, tags, folderId } = req.body;

    const newGraph = new Graph({
      title,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      creator: req.user.id,
      tags: tags || [],
      folderId: folderId || null,
      collaborators: [{
        user: req.user.id,
        username: req.user.username,
        role: 'admin'
      }]
    });

    await newGraph.save();

    // Check if the user selected a specific template
    if (template === '5_whys') {
      const coreProblem = new NodeModel({ graphId: newGraph._id, rfId: 'node-core', type: 'problem', position: { x: 400, y: 50 }, data: { label: title || 'Core Problem', votes: 0, description: '' } });
      const why1 = new NodeModel({ graphId: newGraph._id, rfId: 'node-w1', type: 'rootCause', position: { x: 400, y: 200 }, data: { label: 'Why 1?', votes: 0, description: '' } });
      const why2 = new NodeModel({ graphId: newGraph._id, rfId: 'node-w2', type: 'rootCause', position: { x: 400, y: 350 }, data: { label: 'Why 2?', votes: 0, description: '' } });
      const why3 = new NodeModel({ graphId: newGraph._id, rfId: 'node-w3', type: 'rootCause', position: { x: 400, y: 500 }, data: { label: 'Why 3?', votes: 0, description: '' } });
      const why4 = new NodeModel({ graphId: newGraph._id, rfId: 'node-w4', type: 'rootCause', position: { x: 400, y: 650 }, data: { label: 'Why 4?', votes: 0, description: '' } });
      const why5 = new NodeModel({ graphId: newGraph._id, rfId: 'node-w5', type: 'rootCause', position: { x: 400, y: 800 }, data: { label: 'Why 5? (Root)', votes: 0, description: '' } });

      const nodes = await NodeModel.insertMany([coreProblem, why1, why2, why3, why4, why5]);
      newGraph.nodes = nodes.map(n => n._id);

      const edgesToInsert = [
        { graphId: newGraph._id, rfId: 'e-core-w1', source: 'node-core', target: 'node-w1', animated: true },
        { graphId: newGraph._id, rfId: 'e-w1-w2', source: 'node-w1', target: 'node-w2', animated: true },
        { graphId: newGraph._id, rfId: 'e-w2-w3', source: 'node-w2', target: 'node-w3', animated: true },
        { graphId: newGraph._id, rfId: 'e-w3-w4', source: 'node-w3', target: 'node-w4', animated: true },
        { graphId: newGraph._id, rfId: 'e-w4-w5', source: 'node-w4', target: 'node-w5', animated: true }
      ];

      const edges = await EdgeModel.insertMany(edgesToInsert);
      newGraph.edges = edges.map(e => e._id);
    } else if (template === 'pros_cons') {
      const coreDec = new NodeModel({ graphId: newGraph._id, rfId: 'node-dec', type: 'problem', position: { x: 400, y: 50 }, data: { label: title || 'Decision Matrix', votes: 0, description: '' } });
      const prosNode = new NodeModel({ graphId: newGraph._id, rfId: 'node-pros', type: 'solution', position: { x: 200, y: 250 }, data: { label: 'Pros', votes: 0, description: '' } });
      const consNode = new NodeModel({ graphId: newGraph._id, rfId: 'node-cons', type: 'rootCause', position: { x: 600, y: 250 }, data: { label: 'Cons', votes: 0, description: '' } });

      const nodes = await NodeModel.insertMany([coreDec, prosNode, consNode]);
      newGraph.nodes = nodes.map(n => n._id);

      const edgesToInsert = [
        { graphId: newGraph._id, rfId: 'e-dec-pros', source: 'node-dec', target: 'node-pros', animated: true },
        { graphId: newGraph._id, rfId: 'e-dec-cons', source: 'node-dec', target: 'node-cons', animated: true }
      ];
      const edges = await EdgeModel.insertMany(edgesToInsert);
      newGraph.edges = edges.map(e => e._id);
    } else if (template === 'fishbone') {
      const coreDec = new NodeModel({ graphId: newGraph._id, rfId: 'node-head', type: 'problem', position: { x: 800, y: 300 }, data: { label: title || 'Problem Statement', votes: 0, description: '' } });
      const spine1 = new NodeModel({ graphId: newGraph._id, rfId: 'node-spine1', type: 'fishbone', position: { x: 500, y: 100 }, data: { label: 'People / Methods', votes: 0, description: '' } });
      const spine2 = new NodeModel({ graphId: newGraph._id, rfId: 'node-spine2', type: 'fishbone', position: { x: 500, y: 500 }, data: { label: 'Materials / Machines', votes: 0, description: '' } });
      const spine3 = new NodeModel({ graphId: newGraph._id, rfId: 'node-spine3', type: 'fishbone', position: { x: 200, y: 300 }, data: { label: 'Environment / Measurement', votes: 0, description: '' } });

      const nodes = await NodeModel.insertMany([coreDec, spine1, spine2, spine3]);
      newGraph.nodes = nodes.map(n => n._id);

      const edgesToInsert = [
        { graphId: newGraph._id, rfId: 'e-head-spine1', source: 'node-head', target: 'node-spine1', animated: true },
        { graphId: newGraph._id, rfId: 'e-head-spine2', source: 'node-head', target: 'node-spine2', animated: true },
        { graphId: newGraph._id, rfId: 'e-head-spine3', source: 'node-head', target: 'node-spine3', animated: true }
      ];
      const edges = await EdgeModel.insertMany(edgesToInsert);
      newGraph.edges = edges.map(e => e._id);
    } else if (template === 'swot') {
      const coreDec = new NodeModel({ graphId: newGraph._id, rfId: 'node-swot', type: 'problem', position: { x: 400, y: 300 }, data: { label: title || 'Strategic Objective', votes: 0, description: '' } });
      const s = new NodeModel({ graphId: newGraph._id, rfId: 'node-s', type: 'swot', position: { x: 200, y: 100 }, data: { label: 'Strengths', votes: 0, description: '' } });
      const w = new NodeModel({ graphId: newGraph._id, rfId: 'node-w', type: 'swot', position: { x: 600, y: 100 }, data: { label: 'Weaknesses', votes: 0, description: '' } });
      const o = new NodeModel({ graphId: newGraph._id, rfId: 'node-o', type: 'swot', position: { x: 200, y: 500 }, data: { label: 'Opportunities', votes: 0, description: '' } });
      const t = new NodeModel({ graphId: newGraph._id, rfId: 'node-t', type: 'swot', position: { x: 600, y: 500 }, data: { label: 'Threats', votes: 0, description: '' } });

      const nodes = await NodeModel.insertMany([coreDec, s, w, o, t]);
      newGraph.nodes = nodes.map(n => n._id);

      const edgesToInsert = [
        { graphId: newGraph._id, rfId: 'e-swot-s', source: 'node-swot', target: 'node-s', animated: true },
        { graphId: newGraph._id, rfId: 'e-swot-w', source: 'node-swot', target: 'node-w', animated: true },
        { graphId: newGraph._id, rfId: 'e-swot-o', source: 'node-swot', target: 'node-o', animated: true },
        { graphId: newGraph._id, rfId: 'e-swot-t', source: 'node-swot', target: 'node-t', animated: true }
      ];
      const edges = await EdgeModel.insertMany(edgesToInsert);
      newGraph.edges = edges.map(e => e._id);
    }

    if (template && template !== 'blank') {
      await newGraph.save();
    }

    res.status(201).json(newGraph);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/graphs/:id
// @desc    Get complete graph state including nodes and edges
router.get('/:id', async (req, res) => {
  try {
    const graph = await Graph.findById(req.params.id)
      .populate('creator', 'username')
      .populate('collaborators.user', 'username email');

    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    // Auth Check
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) { }
    }

    if (!graph.isPublic) {
      if (!userId) {
        return res.status(401).json({ message: 'Not authorized for this private map' });
      }
      const isCollab = graph.collaborators.some(c => c.user._id.toString() === userId);
      const isCreator = graph.creator._id.toString() === userId;
      if (!isCollab && !isCreator) {
        return res.status(403).json({ message: 'Access denied to this private map' });
      }
    }

    // Pass user's explicit role if they are logged in
    let userRole = 'viewer';
    if (userId) {
      const collab = graph.collaborators.find(c => c.user._id.toString() === userId);
      if (collab) userRole = collab.role;
      if (graph.creator._id.toString() === userId) userRole = 'admin';
    } else if (graph.isPublic) {
      // Open public editing is allowed by default unless we specifically want to lock public maps to viewers
      userRole = 'editor';
    }

    const nodes = await NodeModel.find({ graphId: req.params.id });
    const edges = await EdgeModel.find({ graphId: req.params.id });

    res.json({ graph, nodes, edges, userRole });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id/save
// @desc    Save graph detailed state (nodes and edges)
router.put('/:id/save', protect, async (req, res) => {
  try {
    const { title, nodes, edges, viewport, scratchpadText } = req.body;
    const graphId = req.params.id;

    const graph = await Graph.findById(graphId);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const userId = req.user._id.toString();
    const isCreator = graph.creator.toString() === userId;
    const collab = graph.collaborators.find(c => c.user.toString() === userId);

    if (!graph.isPublic && !isCreator && !collab) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const role = isCreator ? 'admin' : (collab ? collab.role : (graph.isPublic ? 'editor' : 'viewer'));
    if (role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot save changes' });
    }

    // Persist title and viewport
    if (title) graph.title = title;
    if (viewport) graph.viewport = viewport;
    if (scratchpadText !== undefined) graph.scratchpadText = scratchpadText;

    // Replace all nodes/edges (simplest way to sync state for demo, though less efficient)
    await NodeModel.deleteMany({ graphId });
    await EdgeModel.deleteMany({ graphId });

    if (nodes && nodes.length > 0) {
      const nodeDocs = nodes.map(n => ({
        graphId,
        rfId: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        comments: n.comments || []
      }));
      const insertedNodes = await NodeModel.insertMany(nodeDocs);
      graph.nodes = insertedNodes.map(n => n._id);
    } else {
      graph.nodes = [];
    }

    if (edges && edges.length > 0) {
      const edgeDocs = edges.map(e => ({
        graphId,
        rfId: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        animated: e.animated
      }));
      const insertedEdges = await EdgeModel.insertMany(edgeDocs);
      graph.edges = insertedEdges.map(e => e._id);
    } else {
      graph.edges = [];
    }

    await graph.save();

    // Optionally fire webhook
    if (graph.webhookUrl) {
      triggerWebhook(graph.webhookUrl, graph.title, 'updated', req.user.username);
    }

    res.json({ message: 'Graph saved successfully' });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/graphs/:id/versions
// @desc    Save a named version snapshot of the graph
router.post('/:id/versions', protect, async (req, res) => {
  try {
    const { versionName, nodes, edges } = req.body;
    const graphId = req.params.id;

    const graph = await Graph.findById(graphId);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const newVersion = new GraphVersion({
      graphId,
      versionName: versionName || `Version ${new Date().toLocaleString()}`,
      savedBy: req.user._id,
      nodes: nodes || [],
      edges: edges || []
    });

    await newVersion.save();

    // Also update the live graph state
    await NodeModel.deleteMany({ graphId });
    await EdgeModel.deleteMany({ graphId });

    if (nodes && nodes.length > 0) {
      const nodeDocs = nodes.map(n => ({
        graphId,
        rfId: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        comments: n.comments || []
      }));
      const insertedNodes = await NodeModel.insertMany(nodeDocs);
      graph.nodes = insertedNodes.map(n => n._id);
    } else {
      graph.nodes = [];
    }

    if (edges && edges.length > 0) {
      const edgeDocs = edges.map(e => ({
        graphId,
        rfId: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        animated: e.animated
      }));
      const insertedEdges = await EdgeModel.insertMany(edgeDocs);
      graph.edges = insertedEdges.map(e => e._id);
    } else {
      graph.edges = [];
    }

    await graph.save();

    res.status(201).json(newVersion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/graphs/:id/collaborators
// @desc    Add or update a collaborator
router.post('/:id/collaborators', protect, async (req, res) => {
  try {
    const { username, role } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    // Only admin or creator can add collaborators
    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can manage collaborators' });
    }

    const userToAdd = await User.findOne({ username });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const existingCollabIndex = graph.collaborators.findIndex(c => c.user.toString() === userToAdd._id.toString());

    if (existingCollabIndex >= 0) {
      graph.collaborators[existingCollabIndex].role = role;
    } else {
      graph.collaborators.push({
        user: userToAdd._id,
        username: userToAdd.username,
        role: role || 'viewer'
      });
    }

    await graph.save();
    res.json(graph.collaborators);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id/visibility
// @desc    Toggle public/private status
router.put('/:id/visibility', protect, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    // Only admin or creator can change visibility
    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can change map visibility' });
    }

    graph.isPublic = isPublic;
    await graph.save();
    res.json({ isPublic: graph.isPublic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id/folder
// @desc    Move graph to a different folder
router.put('/:id/folder', protect, async (req, res) => {
  try {
    const { folderId } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    // Only admin or creator can move maps
    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can move this map' });
    }

    graph.folderId = folderId || null;
    await graph.save();
    res.json({ folderId: graph.folderId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id/webhook
// @desc    Update webhook url
router.put('/:id/webhook', protect, async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can set a webhook endpoint' });
    }

    graph.webhookUrl = webhookUrl;
    await graph.save();
    res.json({ webhookUrl: graph.webhookUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id/theme
// @desc    Update graph theme
router.put('/:id/theme', protect, async (req, res) => {
  try {
    const { theme } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can change map theme' });
    }

    graph.theme = theme || 'neon-dark';
    await graph.save();
    res.json({ theme: graph.theme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/graphs/:id
// @desc    Update graph metadata (title, description, tags)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const isCreator = graph.creator.toString() === req.user._id.toString();
    const collab = graph.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isAdmin = isCreator || (collab && collab.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can edit map metadata' });
    }

    if (title) graph.title = title;
    if (description !== undefined) graph.description = description;
    if (tags) graph.tags = tags;

    await graph.save();
    res.json(graph);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/graphs/:id
// @desc    Permanently delete a graph and all its nodes/edges (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const graph = await Graph.findById(req.params.id);
    if (!graph) return res.status(404).json({ message: 'Graph not found' });

    const isCreator = graph.creator.toString() === req.user._id.toString();
    if (!isCreator) return res.status(403).json({ message: 'Only the creator can delete this map' });

    await NodeModel.deleteMany({ graphId: req.params.id });
    await EdgeModel.deleteMany({ graphId: req.params.id });
    await Graph.findByIdAndDelete(req.params.id);

    res.json({ message: 'Graph deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/graphs/:id/duplicate
// @desc    Clone a graph with all nodes and edges for the requesting user
router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const source = await Graph.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Graph not found' });

    // Check access
    const userId = req.user._id.toString();
    const isCollab = source.collaborators.some(c => c.user.toString() === userId);
    const isCreator = source.creator.toString() === userId;
    if (!source.isPublic && !isCreator && !isCollab) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clone graph
    const cloned = new Graph({
      title: `${source.title} (Copy)`,
      description: source.description,
      isPublic: false, // duplicates start private
      creator: req.user._id,
      tags: source.tags,
      collaborators: [{ user: req.user._id, username: req.user.username, role: 'admin' }]
    });
    await cloned.save();

    // Clone nodes
    const sourceNodes = await NodeModel.find({ graphId: source._id });
    if (sourceNodes.length > 0) {
      const clonedNodeDocs = sourceNodes.map(n => ({
        graphId: cloned._id,
        rfId: n.rfId,
        type: n.type,
        position: n.position,
        data: n.data,
        comments: []
      }));
      const insertedNodes = await NodeModel.insertMany(clonedNodeDocs);
      cloned.nodes = insertedNodes.map(n => n._id);
    }

    // Clone edges
    const sourceEdges = await EdgeModel.find({ graphId: source._id });
    if (sourceEdges.length > 0) {
      const clonedEdgeDocs = sourceEdges.map(e => ({
        graphId: cloned._id,
        rfId: e.rfId,
        source: e.source,
        target: e.target,
        type: e.type,
        animated: e.animated
      }));
      const insertedEdges = await EdgeModel.insertMany(clonedEdgeDocs);
      cloned.edges = insertedEdges.map(e => e._id);
    }

    await cloned.save();
    res.status(201).json(cloned);
  } catch (err) {
    console.error('Duplicate error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

