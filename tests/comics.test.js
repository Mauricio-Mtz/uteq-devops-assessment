const request = require('supertest');
const app = require('../index.js');

describe('Comics API', () => {
  
  // Tests para el endpoint de salud
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('UTEQ DevOps Assessment API');
      expect(response.body.totalComics).toBeGreaterThan(0);
    });
  });

  // Tests para obtener todos los comics
  describe('GET /comics', () => {
    it('should return all comics', async () => {
      const response = await request(app)
        .get('/comics')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should filter comics by genre', async () => {
      const response = await request(app)
        .get('/comics?genre=Superhero')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(comic => comic.genre === 'Superhero')).toBe(true);
    });

    it('should filter comics by publisher', async () => {
      const response = await request(app)
        .get('/comics?publisher=Marvel')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(comic => 
        comic.publisher.toLowerCase().includes('marvel')
      )).toBe(true);
    });

    it('should filter comics by stock status', async () => {
      const response = await request(app)
        .get('/comics?inStock=true')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(comic => comic.inStock === true)).toBe(true);
    });
  });

  // Tests para crear un nuevo comic
  describe('POST /comics', () => {
    it('should create a new comic with valid data', async () => {
      const newComic = {
        title: 'Test Comic',
        author: 'Test Author',
        publisher: 'Test Publisher',
        year: 2023,
        genre: 'Action',
        description: 'A test comic for testing purposes',
        price: 19.99,
        inStock: true
      };

      const response = await request(app)
        .post('/comics')
        .send(newComic)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newComic.title);
      expect(response.body.data.author).toBe(newComic.author);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should create comic with minimal required fields', async () => {
      const minimalComic = {
        title: 'Minimal Comic',
        author: 'Minimal Author',
        publisher: 'Minimal Publisher'
      };

      const response = await request(app)
        .post('/comics')
        .send(minimalComic)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.genre).toBe('Unknown');
      expect(response.body.data.price).toBe(0);
      expect(response.body.data.inStock).toBe(true);
    });

    it('should return error when missing required fields', async () => {
      const incompleteComic = {
        title: 'Incomplete Comic'
        // Missing author and publisher
      };

      const response = await request(app)
        .post('/comics')
        .send(incompleteComic)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should return error for invalid year', async () => {
      const invalidComic = {
        title: 'Invalid Comic',
        author: 'Test Author',
        publisher: 'Test Publisher',
        year: 1800 // Invalid year
      };

      const response = await request(app)
        .post('/comics')
        .send(invalidComic)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Year must be between');
    });

    it('should return error for invalid price', async () => {
      const invalidComic = {
        title: 'Invalid Comic',
        author: 'Test Author',
        publisher: 'Test Publisher',
        price: -10 // Invalid negative price
      };

      const response = await request(app)
        .post('/comics')
        .send(invalidComic)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Price must be between');
    });
  });

  // Tests para obtener comic por ID
  describe('GET /comics/:id', () => {
    it('should return comic by valid ID', async () => {
      const response = await request(app)
        .get('/comics/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.title).toBeDefined();
    });

    it('should return 404 for non-existent comic', async () => {
      const response = await request(app)
        .get('/comics/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Comic not found');
    });

    it('should return error for invalid ID format', async () => {
      const response = await request(app)
        .get('/comics/invalid-id')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid comic ID');
    });
  });

  // Tests para actualizar comic
  describe('PUT /comics/:id', () => {
    it('should update comic with valid data', async () => {
      const updateData = {
        title: 'Updated Comic Title',
        price: 25.99
      };

      const response = await request(app)
        .put('/comics/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent comic update', async () => {
      const response = await request(app)
        .put('/comics/999')
        .send({ title: 'Updated Title' })
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Comic not found');
    });

    it('should return error for invalid year in update', async () => {
      const response = await request(app)
        .put('/comics/1')
        .send({ year: 1800 })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Year must be between');
    });
  });

  // Tests para eliminar comic
  describe('DELETE /comics/:id', () => {
    it('should delete comic by valid ID', async () => {
      // First create a comic to delete
      const createResponse = await request(app)
        .post('/comics')
        .send({
          title: 'Comic to Delete',
          author: 'Test Author',
          publisher: 'Test Publisher'
        });
      
      const comicId = createResponse.body.data.id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/comics/${comicId}`)
        .expect(200);
      
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted successfully');
      
      // Verify it's actually deleted
      await request(app)
        .get(`/comics/${comicId}`)
        .expect(404);
    });

    it('should return 404 for non-existent comic deletion', async () => {
      const response = await request(app)
        .delete('/comics/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Comic not found');
    });

    it('should return error for invalid ID format in deletion', async () => {
      const response = await request(app)
        .delete('/comics/invalid-id')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid comic ID');
    });
  });

  // Tests para el endpoint raíz
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.message).toContain('Comics API');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.comics).toBeDefined();
    });
  });
});