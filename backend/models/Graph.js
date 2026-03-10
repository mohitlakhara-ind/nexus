const mongoose = require('mongoose');

const graphSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }],
  edges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Edge' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  aiVisited: { type: Boolean, default: false }, // Track if the AI auto-visited
  tags: [{ type: String }], // Map categorization tags
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  isPublic: { type: Boolean, default: true },
  theme: { type: String, default: 'neon-dark' },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String }, // For easier frontend display
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' }
  }],
  webhookUrl: { type: String, default: '' },
  scratchpadText: { type: String, default: '' },
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  },
}, { timestamps: true });

const Graph = mongoose.model('Graph', graphSchema);
module.exports = Graph;
