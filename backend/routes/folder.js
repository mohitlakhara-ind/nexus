const express = require('express');
const { protect } = require('../middleware/auth');
const Folder = require('../models/Folder');
const Graph = require('../models/Graph');

const router = express.Router();

// @route   GET /api/folders
// @desc    Get all folders for current user
router.get('/', protect, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user.id }).sort('-createdAt');
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/folders
// @desc    Create a new folder
router.post('/', protect, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    const newFolder = new Folder({
      name,
      owner: req.user.id,
      color: color || 'text-brand-400'
    });

    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/folders/:id
// @desc    Update a folder
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, color } = req.body;
    const folder = await Folder.findById(req.params.id);

    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    if (folder.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    if (name) folder.name = name;
    if (color) folder.color = color;

    await folder.save();
    res.json(folder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/folders/:id
// @desc    Delete a folder and remove reference from its maps
router.delete('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    if (folder.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    // Remove folder reference from all maps that belonged to this folder
    await Graph.updateMany({ folderId: folder._id }, { $set: { folderId: null } });
    
    await folder.deleteOne();
    res.json({ message: 'Folder deleted completely' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
