# UTEQ DevOps Assessment

A simple web application built with Node.js and Express for DevOps evaluation.

## Project Structure

```
├── index.js              # Main application
├── package.json          # Project dependencies
├── Dockerfile           # Docker configuration
├── .env.example         # Environment variables example
├── .github/workflows/   # CI/CD workflows
├── tests/               # Test files
└── node_modules/        # Installed dependencies
```

## Requirements

- Node.js
- Docker

## Installation and Usage

### With Docker (Recommended)

```bash
# Build the image
docker build -t uteq-devops-assessment .

# Run the container
docker run -p 8082:8082 uteq-devops-assessment
```

### Local Development

```bash
# Install dependencies
npm install

# Run the application
npm start
```

The application will be available at `http://localhost:8082`

## Environment Variables

Copy `.env.example` to `.env` and configure the necessary variables.

## Technologies

- Node.js
- Express
- Docker