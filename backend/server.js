const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { extractText } = require('./fileUtils');
const { combinedScore } = require('./scoring');
const { initializeModel } = require('./embeddings');

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// In-memory storage (will be reset on server restart)
let memory = { jd: '', resumes: [] };

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running', service: 'AI ATS Resume Matcher' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Upload JD endpoint
app.post('/jd', upload.single('file'), async (req, res) => {
  try {
    const text = req.body.text;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({ detail: 'Provide either text or file' });
    }

    if (file) {
      memory.jd = await extractText(file.buffer, file.mimetype);
    } else {
      memory.jd = text.trim();
    }

    if (!memory.jd) {
      return res.status(400).json({ detail: 'Could not extract text from file' });
    }

    res.json({ message: 'JD saved', length: memory.jd.length });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Upload resumes endpoint
app.post('/resumes', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ detail: 'No files provided' });
    }

    let newCount = 0;
    const existingNames = memory.resumes.map(r => r.name);

    for (const file of files) {
      if (existingNames.includes(file.originalname)) {
        continue; // Skip duplicates
      }

      const text = await extractText(file.buffer, file.mimetype);

      if (text.trim()) {
        memory.resumes.push({
          name: file.originalname,
          text: text,
          file_data: file.buffer,
          content_type: file.mimetype
        });
        newCount++;
      }
    }

    if (newCount === 0) {
      return res.status(400).json({
        detail: 'Could not extract text from any resume or all files already uploaded'
      });
    }

    res.json({
      message: `${newCount} new resume(s) added. Total: ${memory.resumes.length} resumes`,
      count: memory.resumes.length,
      new_count: newCount
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Match endpoint
app.get('/match', async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 60;

    if (!memory.jd) {
      return res.status(400).json({ detail: 'Upload JD first' });
    }

    if (memory.resumes.length === 0) {
      return res.status(400).json({ detail: 'Upload resumes first' });
    }

    const results = [];

    for (const r of memory.resumes) {
      const s = await combinedScore(memory.jd, r.text);
      if (s.final >= threshold) {
        results.push({
          file: r.name,
          semantic: s.semantic,
          keywords: s.keywords,
          skills: s.skills,
          education: s.education,
          experience: s.experience,
          final: s.final
        });
      }
    }

    results.sort((a, b) => b.final - a.final);

    res.json({ count: results.length, selected: results, threshold });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Download resume endpoint
app.get('/download/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;

    const resume = memory.resumes.find(r => r.name === fileName);

    if (!resume) {
      return res.status(404).json({ detail: 'File not found' });
    }

    const fileData = resume.file_data;
    if (!fileData) {
      return res.status(404).json({ detail: 'File data not available' });
    }

    res.set({
      'Content-Type': resume.content_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${resume.name}"`
    });

    res.send(fileData);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Clear data endpoint (optional)
app.post('/clear', (req, res) => {
  memory = { jd: '', resumes: [] };
  res.json({ message: 'All data cleared' });
});

// Initialize model and start server
const PORT = process.env.PORT || 8000;

initializeModel().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize model:', error);
  // Start server anyway, embeddings will work with dummy values
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT} (embeddings may be limited)`);
  });
});

module.exports = app;
