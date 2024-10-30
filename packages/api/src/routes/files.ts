import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { File } from '../models/File';
import { auth, AuthRequest } from '../middleware/auth';
import { validateFileUpload } from '../validators/file';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { error } = validateFileUpload(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { tags } = req.body;
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      owner: req.user.id,
      shareLink: crypto.randomBytes(16).toString('hex'),
    });

    await file.save();

    // Return formatted response
    res.status(201).json({
      id: file._id,
      name: file.originalName,
      url: `/uploads/${file.filename}`, // Remove the host part
      tags: file.tags,
      views: file.views,
      createdAt: file.createdAt
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get all files for the authenticated user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const files = await File.find({ owner: req.user.id })
      .sort({ position: 1 }); // Sort by position

    // Transform the files to include the full URL and ensure ID is a string
    const filesWithUrls = files.map(file => ({
      id: file._id.toString(), // Explicitly convert ObjectId to string
      name: file.originalName,
      url: `/uploads/${file.filename}`, // Remove the host part
      tags: file.tags,
      views: file.views,
      createdAt: file.createdAt,
      position: file.position || 0
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add tag to file
router.post('/:id/tags', auth, async (req: AuthRequest, res) => {
  try {
    const { tag } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user?.id },
      { $addToSet: { tags: tag } }, // $addToSet ensures no duplicate tags
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tag' });
  }
});

// Remove tag from file
router.delete('/:id/tags/:tag', auth, async (req: AuthRequest, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user?.id },
      { $pull: { tags: req.params.tag } },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error removing tag' });
  }
});

// Get shared file
router.get('/shared/:shareLink', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.shareLink });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment views
    file.views += 1;
    await file.save();

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file' });
  }
});

// Delete file
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user?.id });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the physical file
    const filePath = path.join(__dirname, '..', '..', file.path);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file from filesystem:', err);
    }

    // Delete the database record
    await File.findByIdAndDelete(file._id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Add tag update endpoint
router.patch('/:fileId/tags', auth, async (req: AuthRequest, res) => {
  try {
    const { fileId } = req.params;
    const { tags } = req.body;

    const file = await File.findOne({ _id: fileId, owner: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.tags = tags;
    await file.save();

    res.json({
      id: file._id,
      name: file.originalName,
      url: `${process.env.VITE_API_URL}/uploads/${file.filename}`,
      tags: file.tags,
      views: file.views,
      createdAt: file.createdAt
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ message: 'Error updating tags' });
  }
});

// Update file position
router.patch('/:fileId/position', auth, async (req: AuthRequest, res) => {
  try {
    const { fileId } = req.params;
    const { position } = req.body;

    // Get all files for the user, sorted by current position
    const files = await File.find({ owner: req.user.id }).sort({ position: 1 });

    // Find the moved file
    const movedFile = files.find(f => f._id.toString() === fileId);
    if (!movedFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    const oldPosition = movedFile.position;
    const newPosition = position;

    // Update positions for all affected files
    if (oldPosition < newPosition) {
      // Moving down: update positions of files between old and new position
      await File.updateMany(
        {
          owner: req.user.id,
          position: { $gt: oldPosition, $lte: newPosition }
        },
        { $inc: { position: -1 } }
      );
    } else {
      // Moving up: update positions of files between new and old position
      await File.updateMany(
        {
          owner: req.user.id,
          position: { $gte: newPosition, $lt: oldPosition }
        },
        { $inc: { position: 1 } }
      );
    }

    // Update the moved file's position
    movedFile.position = newPosition;
    await movedFile.save();

    // Get updated files list
    const updatedFiles = await File.find({ owner: req.user.id }).sort({ position: 1 });
    const filesWithUrls = updatedFiles.map(file => ({
      id: file._id.toString(),
      name: file.originalName,
      url: `${process.env.VITE_API_URL}/uploads/${file.filename}`,
      tags: file.tags,
      views: file.views,
      createdAt: file.createdAt,
      position: file.position
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error updating file position:', error);
    res.status(500).json({ message: 'Error updating file position' });
  }
});

// Generate share link
router.post('/:fileId/share', auth, async (req: AuthRequest, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, owner: req.user.id });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Generate share link if it doesn't exist
    if (!file.shareLink) {
      file.shareLink = crypto.randomBytes(16).toString('hex');
      await file.save();
    }

    res.json({ shareLink: file.shareLink });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ message: 'Error generating share link' });
  }
});

// Get shared file (no auth required)
router.get('/shared/:shareLink', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.shareLink });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment views
    file.views += 1;
    await file.save();

    // Include all necessary fields in the response
    res.json({
      id: file._id.toString(),
      name: file.originalName,
      url: `/uploads/${file.filename}`, // Remove the host part
      mimeType: file.mimeType,
      views: file.views,
      createdAt: file.createdAt,
      tags: file.tags,
      position: file.position
    });
  } catch (error) {
    console.error('Error fetching shared file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
});

// Add this new endpoint for getting a single file
router.get('/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment views
    file.views += 1;
    await file.save();

    // Return formatted response
    res.json({
      id: file._id.toString(),
      name: file.originalName,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimeType,
      views: file.views,
      createdAt: file.createdAt,
      tags: file.tags,
      position: file.position
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
});

export default router;
