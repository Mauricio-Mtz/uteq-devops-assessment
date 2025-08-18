# API Endpoints

Base URL: `http://localhost:8082` (local) or your deployed Cloud Run URL

## Health Check

### GET /health
Check API health and database connection status.

```bash
curl -X GET http://localhost:8082/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "UTEQ DevOps Assessment API",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected",
  "totalComics": 3
}
```

## Root Endpoint

### GET /
Get API information and available endpoints.

```bash
curl -X GET http://localhost:8082/
```

## Comics

### GET /comics
Get all comics with optional filtering.

```bash
# Get all comics
curl -X GET http://localhost:8082/comics

# Filter by genre
curl -X GET "http://localhost:8082/comics?genre=Superhero"

# Filter by publisher
curl -X GET "http://localhost:8082/comics?publisher=Marvel"

# Filter by stock status
curl -X GET "http://localhost:8082/comics?inStock=true"

# Multiple filters
curl -X GET "http://localhost:8082/comics?genre=Superhero&publisher=DC&inStock=true"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1234567890abcdef12345",
      "title": "Spider-Man: No Way Home",
      "author": "Stan Lee",
      "publisher": "Marvel Comics",
      "year": 2021,
      "genre": "Superhero",
      "description": "Peter Parker's identity is revealed...",
      "price": 15.99,
      "inStock": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "total": 3,
  "filters": { "genre": "Superhero", "publisher": null, "inStock": null }
}
```

### POST /comics
Create a new comic.

```bash
curl -X POST http://localhost:8082/comics \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Spider-Man",
    "author": "Stan Lee",
    "publisher": "Marvel Comics",
    "year": 2024,
    "genre": "Superhero",
    "description": "New adventures of Spider-Man",
    "price": 19.99,
    "inStock": true
  }'
```

**Required fields:** `title`, `author`, `publisher`  
**Optional fields:** `year`, `genre`, `description`, `price`, `inStock`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1234567890abcdef12346",
    "title": "Amazing Spider-Man",
    "author": "Stan Lee",
    "publisher": "Marvel Comics",
    "year": 2024,
    "genre": "Superhero",
    "description": "New adventures of Spider-Man",
    "price": 19.99,
    "inStock": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Comic created successfully"
}
```

### GET /comics/:id
Get a specific comic by ID.

```bash
curl -X GET http://localhost:8082/comics/64f1234567890abcdef12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1234567890abcdef12345",
    "title": "Spider-Man: No Way Home",
    "author": "Stan Lee",
    "publisher": "Marvel Comics",
    "year": 2021,
    "genre": "Superhero",
    "description": "Peter Parker's identity is revealed...",
    "price": 15.99,
    "inStock": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /comics/:id
Update an existing comic.

```bash
curl -X PUT http://localhost:8082/comics/64f1234567890abcdef12345 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Comic Title",
    "price": 24.99,
    "inStock": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1234567890abcdef12345",
    "title": "Updated Comic Title",
    "author": "Stan Lee",
    "publisher": "Marvel Comics",
    "year": 2021,
    "genre": "Superhero",
    "description": "Peter Parker's identity is revealed...",
    "price": 24.99,
    "inStock": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z"
  },
  "message": "Comic updated successfully"
}
```

### DELETE /comics/:id
Delete a comic.

```bash
curl -X DELETE http://localhost:8082/comics/64f1234567890abcdef12345
```

**Response:**
```json
{
  "success": true,
  "message": "Comic deleted successfully",
  "data": {
    "_id": "64f1234567890abcdef12345",
    "title": "Spider-Man: No Way Home",
    "author": "Stan Lee",
    "publisher": "Marvel Comics",
    "year": 2021,
    "genre": "Superhero",
    "description": "Peter Parker's identity is revealed...",
    "price": 15.99,
    "inStock": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Data Validation

### Comic Schema
- **title**: String (required)
- **author**: String (required)
- **publisher**: String (required)
- **year**: Number (1900 - current year + 1)
- **genre**: String (default: "Unknown")
- **description**: String (default: "")
- **price**: Number (0 - 1000, default: 0)
- **inStock**: Boolean (default: true)