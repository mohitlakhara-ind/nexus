const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        autoSave: user.autoSave,
        xp: user.xp,
        level: user.level,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        autoSave: user.autoSave,
        xp: user.xp,
        level: user.level,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences (like autoSave)
router.put('/preferences', protect, async (req, res) => {
  try {
    const { autoSave } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      if (autoSave !== undefined) user.autoSave = autoSave;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        autoSave: updatedUser.autoSave,
        xp: updatedUser.xp,
        level: updatedUser.level,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile/:id
// @desc    Get public profile of a user + their graphs + reputation
router.get('/profile/:id', async (req, res) => {
  try {
    const Graph = require('../models/Graph');
    const NodeModel = require('../models/Node');

    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's public graphs
    const graphs = await Graph.find({ creator: user._id, isPublic: true }).sort('-createdAt').limit(10);

    // Calculate reputation: sum all votes on all nodes created in their graphs
    const graphIds = graphs.map(g => g._id);
    const nodes = await NodeModel.find({ graphId: { $in: graphIds } });
    const reputation = nodes.reduce((acc, n) => acc + (n.data?.votes || 0), 0);

    // Badge Stats
    const stats = {
      level: user.level || 1,
      xp: user.xp || 0,
      graphCount: graphs.length,
      reputation,
      nodeCount: nodes.length,
      solutionCount: nodes.filter(n => n.type === 'solution').length,
      collabCount: await Graph.countDocuments({ 'collaborators.user': user._id, creator: { $ne: user._id } }),
      accountAgeDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    };

    res.json({ user, graphs, reputation, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/xp
// @desc    Award XP to a user and calculate level ups
router.post('/xp', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid XP amount' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp += amount;

    // Simple leveling formula: Level = floor(sqrt(XP / 100)) + 1
    // Lvl 1: 0-399 XP
    // Lvl 2: 400-899 XP
    // Lvl 3: 900-1599 XP 
    // etc. (Let's use a slightly faster curve for testing)
    const newLevel = Math.floor(Math.sqrt(user.xp / 50)) + 1;

    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
    }

    await user.save();

    res.json({
      xp: user.xp,
      level: user.level,
      leveledUp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/leaderboard
// @desc    Get top users ranked by XP
router.get('/leaderboard', async (req, res) => {
  try {
    const Graph = require('../models/Graph');
    const NodeModel = require('../models/Node');

    // Get top 50 users by XP
    const users = await User.find({})
      .select('username xp level createdAt')
      .sort('-xp')
      .limit(50);

    // Enrich with graph counts and reputation
    const leaderboard = await Promise.all(users.map(async (u, index) => {
      const graphCount = await Graph.countDocuments({ creator: u._id });
      const publicGraphs = await Graph.find({ creator: u._id, isPublic: true }).select('_id');
      const graphIds = publicGraphs.map(g => g._id);

      let reputation = 0;
      if (graphIds.length > 0) {
        const nodes = await NodeModel.find({ graphId: { $in: graphIds } });
        reputation = nodes.reduce((acc, n) => acc + (n.data?.votes || 0), 0);
      }

      return {
        _id: u._id,
        username: u.username,
        xp: u.xp,
        level: u.level,
        rank: index + 1,
        graphCount,
        reputation,
        joinedAt: u.createdAt
      };
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
