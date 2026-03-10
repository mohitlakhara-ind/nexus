const mongoose = require('mongoose');

const edgeSchema = new mongoose.Schema({
  graphId: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph', required: true },
  rfId: { type: String, required: true }, // React Flow Edge ID
  source: { type: String, required: true }, // Node rfId
  target: { type: String, required: true }, // Node rfId
  type: { type: String, default: 'default' },
  animated: { type: Boolean, default: false }
}, { timestamps: true });

const EdgeModel = mongoose.model('Edge', edgeSchema);
module.exports = EdgeModel;
