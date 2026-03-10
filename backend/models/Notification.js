const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['vote', 'comment', 'join', 'edit'],
    required: true
  },
  graphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Graph',
    required: true
  },
  graphTitle: {
    type: String,
    required: true
  },
  nodeId: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying by recipient and unread status
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
