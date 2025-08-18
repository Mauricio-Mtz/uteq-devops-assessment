const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Basic configuration
const PORT = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware for JSON parsing
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Comic Schema
const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  year: { type: Number, default: () => new Date().getFullYear() },
  genre: { type: String, default: 'Unknown' },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Comic = mongoose.model('Comic', comicSchema);

// Initialize database with seed data if empty
const seedComics = async () => {
  try {
    const count = await Comic.countDocuments();
    if (count === 0) {
      console.log('Seeding initial comics data...');
      await Comic.insertMany([
        {
          title: "Spider-Man: No Way Home",
          author: "Stan Lee",
          publisher: "Marvel Comics",
          year: 2021,
          genre: "Superhero",
          description: "Peter Parker's identity is revealed and he seeks help from Doctor Strange.",
          price: 15.99,
          inStock: true
        },
        {
          title: "Batman: The Dark Knight Returns",
          author: "Frank Miller",
          publisher: "DC Comics",
          year: 1986,
          genre: "Superhero",
          description: "An aged Batman comes out of retirement in a dystopian future.",
          price: 24.99,
          inStock: true
        },
        {
          title: "Watchmen",
          author: "Alan Moore",
          publisher: "DC Comics",
          year: 1987,
          genre: "Superhero",
          description: "A complex tale of retired superheroes in an alternate 1985.",
          price: 29.99,
          inStock: false
        }
      ]);
      console.log('Comics seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding comics:', error);
  }
};

seedComics();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const totalComics = await Comic.countDocuments();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'UTEQ DevOps Assessment API',
      version: '1.0.0',
      environment: NODE_ENV,
      database: dbStatus,
      totalComics
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'UTEQ DevOps Assessment - Comics API',
    environment: NODE_ENV,
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      comics: {
        getAll: 'GET /comics',
        create: 'POST /comics',
        getById: 'GET /comics/:id',
        update: 'PUT /comics/:id',
        delete: 'DELETE /comics/:id'
      }
    }
  });
});

// GET all comics with optional filtering
app.get('/comics', async (req, res) => {
  try {
    const { genre, publisher, inStock } = req.query;
    let filter = {};

    if (genre) {
      filter.genre = new RegExp(genre, 'i');
    }
    
    if (publisher) {
      filter.publisher = new RegExp(publisher, 'i');
    }
    
    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    const comics = await Comic.find(filter).sort({ createdAt: -1 });
    const total = await Comic.countDocuments();

    res.status(200).json({
      success: true,
      data: comics,
      count: comics.length,
      total,
      filters: { genre, publisher, inStock }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST new comic
app.post('/comics', async (req, res) => {
  try {
    const { title, author, publisher, year, genre, description, price, inStock } = req.body;
    
    // Validate required fields
    if (!title || !author || !publisher) {
      return res.status(400).json({
        success: false,
        error: 'Title, author, and publisher are required fields'
      });
    }

    // Validate year range
    if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        success: false,
        error: 'Year must be between 1900 and next year'
      });
    }

    // Validate price range
    if (price && (price < 0 || price > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be between 0 and 1000'
      });
    }

    const newComic = new Comic({
      title,
      author,
      publisher,
      year,
      genre,
      description,
      price,
      inStock
    });

    const savedComic = await newComic.save();

    res.status(201).json({
      success: true,
      data: savedComic,
      message: 'Comic created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET comic by ID
app.get('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid comic ID format'
      });
    }

    const comic = await Comic.findById(id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: comic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update comic by ID
app.put('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid comic ID format'
      });
    }

    const { year, price } = req.body;

    // Validate year if provided
    if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        success: false,
        error: 'Year must be between 1900 and next year'
      });
    }

    // Validate price if provided
    if (price && (price < 0 || price > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be between 0 and 1000'
      });
    }

    const updatedComic = await Comic.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedComic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedComic,
      message: 'Comic updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE comic by ID
app.delete('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid comic ID format'
      });
    }

    const deletedComic = await Comic.findByIdAndDelete(id);

    if (!deletedComic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comic deleted successfully',
      data: deletedComic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Database: MongoDB`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Comics API: http://localhost:${PORT}/comics`);
  });
}

module.exports = app;