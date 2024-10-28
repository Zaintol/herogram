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

// Update CORS configuration
app.use(cors({
  origin: `${process.env.VITE_CLIENT_URL}:${process.env.FRONTEND_PORT}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

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
