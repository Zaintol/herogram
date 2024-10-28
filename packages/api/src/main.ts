/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
  cors({
    origin: ['http://138.68.73.177:4200','*/*,*'], // Update this to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Specify allowed methods
    credentials: true, // If you're using cookies or sessions
  })
);


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/file-sharing-app?authSource=admin';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const port = process.env.BACKEND_PORT || 3000;
const server = app.listen(port, () => {
  console.log(`API is running at ${process.env.VITE_API_URL}:${port}/api`);
});

server.on('error', console.error);

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
