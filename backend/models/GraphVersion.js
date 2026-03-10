const mongoose = require('mongoose');

const graphVersionSchema = new mongoose.Schema({
  graphId: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph', required: true },
  versionName: { type: String, required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nodes: { type: Array, required: true }, // Store the raw JSON snapshot of nodes
  edges: { type: Array, required: true }, // Store the raw JSON snapshot of edges
}, { timestamps: true });

const GraphVersion = mongoose.model('GraphVersion', graphVersionSchema);
module.exports = GraphVersion;
