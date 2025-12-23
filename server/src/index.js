import express from 'express';
import cors from 'cors';
import { improvePrompt } from './improver.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React dev server
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Improve prompt endpoint
app.post('/api/improve', (req, res) => {
  try {
    const { idea } = req.body;

    // Validation
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({
        error: {
          message: 'Idea is required and must be a string',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 10) {
      return res.status(400).json({
        error: {
          message: 'Idea must be at least 10 characters long',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    if (trimmedIdea.length > 1000) {
      return res.status(400).json({
        error: {
          message: 'Idea must be at most 1000 characters long',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Process the idea
    const result = improvePrompt(trimmedIdea);

    res.json({
      improvedPrompt: result.prompt,
      meta: {
        detectedIndustry: result.industry,
        detectedAudience: result.audience,
        tone: result.tone
      }
    });
  } catch (error) {
    console.error('Error improving prompt:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

