const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Graph = require('../models/Graph');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('actor', 'username')
      .sort('-createdAt')
      .limit(50); // Optional: add pagination

    // Format for the frontend
    const formatted = notifications.map(notif => ({
      id: notif._id,
      type: notif.type,
      username: notif.actor ? notif.actor.username : 'Unknown User',
      mapTitle: notif.graphTitle,
      timeAgo: notif.createdAt, // Frontend handles relative time parsing usually, or format here
      isRead: notif.isRead,
      graphId: notif.graphId,
      nodeId: notif.nodeId
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for the user
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a specific notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification (used internally or by specific actions on frontend)
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, type, graphId, graphTitle, nodeId } = req.body;

    // Don't notify yourself
    if (recipientId === req.user.id) {
       return res.status(200).json({ message: 'Self-action, no notification sent' });
    }

    const newNotification = new Notification({
      recipient: recipientId,
      actor: req.user.id,
      type,
      graphId,
      graphTitle,
      nodeId
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
