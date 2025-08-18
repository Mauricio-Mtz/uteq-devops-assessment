import express from 'express';
import 'dotenv/config';

const app = express();

// Basic configuration
const PORT = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware for JSON parsing
app.use(express.json());

// In-memory storage for comics (for demo purposes)
let comics = [
  {
    id: 1,
    title: "Spider-Man: No Way Home",
    author: "Stan Lee",
    publisher: "Marvel Comics",
    year: 2021,
    genre: "Superhero",
    description: "Peter Parker's identity is revealed and he seeks help from Doctor Strange.",
    price: 15.99,
    inStock: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Batman: The Dark Knight Returns",
    author: "Frank Miller",
    publisher: "DC Comics",
    year: 1986,
    genre: "Superhero",
    description: "An aged Batman comes out of retirement in a dystopian future.",
    price: 24.99,
    inStock: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Watchmen",
    author: "Alan Moore",
    publisher: "DC Comics", 
    year: 1987,
    genre: "Superhero",
    description: "A complex tale of retired superheroes in an alternate 1985.",
    price: 29.99,
    inStock: false,
    createdAt: new Date().toISOString()
  }
];
let nextId = 4;

// Health endpoint required for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'UTEQ DevOps Assessment API',
    version: '1.0.0',
    environment: NODE_ENV,
    totalComics: comics.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'UTEQ DevOps Assessment - Comics API',
    environment: NODE_ENV,
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

// GET all comics
app.get('/comics', (req, res) => {
  const { genre, publisher, inStock } = req.query;
  let filteredComics = [...comics];

  // Apply filters if provided
  if (genre) {
    filteredComics = filteredComics.filter(comic => 
      comic.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  
  if (publisher) {
    filteredComics = filteredComics.filter(comic => 
      comic.publisher.toLowerCase().includes(publisher.toLowerCase())
    );
  }
  
  if (inStock !== undefined) {
    filteredComics = filteredComics.filter(comic => 
      comic.inStock === (inStock === 'true')
    );
  }

  res.status(200).json({
    success: true,
    data: filteredComics,
    count: filteredComics.length,
    total: comics.length,
    filters: { genre, publisher, inStock }
  });
});

// POST new comic
app.post('/comics', (req, res) => {
  const { title, author, publisher, year, genre, description, price, inStock } = req.body;
  
  // Basic validation
  if (!title || !author || !publisher) {
    return res.status(400).json({
      success: false,
      error: 'Title, author, and publisher are required fields'
    });
  }

  if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
    return res.status(400).json({
      success: false,
      error: 'Year must be between 1900 and next year'
    });
  }

  if (price && (price < 0 || price > 1000)) {
    return res.status(400).json({
      success: false,
      error: 'Price must be between 0 and 1000'
    });
  }

  const newComic = {
    id: nextId++,
    title,
    author,
    publisher,
    year: year || new Date().getFullYear(),
    genre: genre || 'Unknown',
    description: description || '',
    price: price || 0,
    inStock: inStock !== undefined ? inStock : true,
    createdAt: new Date().toISOString()
  };

  comics.push(newComic);

  res.status(201).json({
    success: true,
    data: newComic,
    message: 'Comic created successfully'
  });
});

// GET comic by ID
app.get('/comics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid comic ID. Must be a number'
    });
  }

  const comic = comics.find(c => c.id === id);

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
});

// PUT update comic by ID
app.put('/comics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid comic ID. Must be a number'
    });
  }

  const comicIndex = comics.findIndex(c => c.id === id);

  if (comicIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Comic not found'
    });
  }

  const { title, author, publisher, year, genre, description, price, inStock } = req.body;

  // Validation for update
  if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
    return res.status(400).json({
      success: false,
      error: 'Year must be between 1900 and next year'
    });
  }

  if (price && (price < 0 || price > 1000)) {
    return res.status(400).json({
      success: false,
      error: 'Price must be between 0 and 1000'
    });
  }

  // Update only provided fields
  const updatedComic = {
    ...comics[comicIndex],
    ...(title && { title }),
    ...(author && { author }),
    ...(publisher && { publisher }),
    ...(year && { year }),
    ...(genre && { genre }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
    ...(inStock !== undefined && { inStock }),
    updatedAt: new Date().toISOString()
  };

  comics[comicIndex] = updatedComic;

  res.status(200).json({
    success: true,
    data: updatedComic,
    message: 'Comic updated successfully'
  });
});

// DELETE comic by ID
app.delete('/comics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid comic ID. Must be a number'
    });
  }

  const comicIndex = comics.findIndex(c => c.id === id);

  if (comicIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Comic not found'
    });
  }

  const deletedComic = comics.splice(comicIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: 'Comic deleted successfully',
    data: deletedComic
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Comics API: http://localhost:${PORT}/comics`);
});

export default app;