const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const nodeSchema = new mongoose.Schema({
  graphId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Graph',
    required: true
  },
  rfId: { // React Flow Node ID
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['problem', 'rootCause', 'solution', 'fishbone', 'swot', 'decision', 'action', 'note'],
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, required: true },
    votes: { type: Number, default: 0 },
    description: { type: String, default: '' },
    color: { type: String, default: '' },
    noteColor: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    completed: { type: Boolean, default: false }
  },
  comments: [commentSchema]
}, { timestamps: true });

// Ensure unique rfId per graph
nodeSchema.index({ graphId: 1, rfId: 1 }, { unique: true });

module.exports = mongoose.model('Node', nodeSchema);
