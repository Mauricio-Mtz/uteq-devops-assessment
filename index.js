import express from 'express';
import 'dotenv/config';

const app = express();

// Basic configuration
const PORT = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware for JSON parsing
app.use(express.json());

// Health endpoint required for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'UTEQ DevOps Assessment API',
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'UTEQ DevOps Assessment API',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      comments: '/api/comments (coming soon)'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;