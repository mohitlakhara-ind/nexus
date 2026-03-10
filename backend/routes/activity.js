const express = require('express');
const Graph = require('../models/Graph');
const Node = require('../models/Node');
const router = express.Router();

// @route   GET /api/activity
// @desc    Get recent global activity (new maps, popular nodes)
router.get('/', async (req, res) => {
  try {
    // Get 5 most recent public graphs
    const recentGraphs = await Graph.find({ isPublic: true })
      .populate('creator', 'username')
      .sort('-createdAt')
      .limit(5);

    // Get 5 most voted nodes in public graphs
    const topNodes = await Node.find()
      .populate({
        path: 'graphId',
        match: { isPublic: true },
        select: 'title'
      })
      .sort('-data.votes')
      .limit(10);

    // Filter out nodes whose graph is not public (due to populate match)
    const filteredTopNodes = topNodes.filter(n => n.graphId).slice(0, 5);

    const activities = [
      ...recentGraphs.map(g => ({
        id: g._id,
        type: 'new_map',
        user: g.creator?.username || 'Anonymous',
        title: g.title,
        timestamp: g.createdAt
      })),
      ...filteredTopNodes.map(n => ({
        id: n._id,
        type: 'top_vote',
        user: 'Community',
        title: n.data.label,
        mapTitle: n.graphId.title,
        votes: n.data.votes,
        timestamp: n.updatedAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 8));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
