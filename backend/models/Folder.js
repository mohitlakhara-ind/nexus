const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: String, default: 'text-brand-400' } // for UI tinting
}, { timestamps: true });

const Folder = mongoose.model('Folder', folderSchema);
module.exports = Folder;
