const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg|ppt|pptx|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, Images, PPT, Excel'));
    }
  }
});

// Upload resource
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category } = req.body;

    const resource = new Resource({
      title: title || req.file.originalname,
      description: description || '',
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname),
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      uploaderName: req.body.uploaderName || 'Unknown',
      category: category || 'other'
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading resource', error: error.message });
  }
});

// Get all resources
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Download resource (increment download count)
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({ fileUrl: resource.fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error downloading resource' });
  }
});

// Delete resource
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is the uploader
    if (resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

module.exports = router;