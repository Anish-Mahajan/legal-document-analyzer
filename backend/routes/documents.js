const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Helper function to extract text from different file types
async function extractTextFromFile(file) {
  let text = '';
  let fileType = '';

  if (file.mimetype === 'application/pdf') {
    const pdfData = await pdfParse(file.buffer);
    text = pdfData.text;
    fileType = 'pdf';
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    text = result.value;
    fileType = 'docx';
  } else if (file.mimetype === 'text/plain') {
    text = file.buffer.toString('utf8');
    fileType = 'txt';
  }

  return { text, fileType };
}

// Upload and store document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { text, fileType } = await extractTextFromFile(req.file);

    if (!text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the document' });
    }

    const document = new Document({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      fileType: fileType,
      content: text
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: document._id,
      filename: document.filename,
      fileType: document.fileType,
      contentLength: text.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload document',
      details: error.message 
    });
  }
});

// Get all documents
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find()
      .select('-content') // Exclude content for list view
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments();

    res.json({
      documents,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;