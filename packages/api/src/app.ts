import express from 'express';
import path from 'path';

// ... other imports

const app = express();

// ... other middleware

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ... rest of your app configuration
