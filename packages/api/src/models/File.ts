import mongoose from 'mongoose';

interface IFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  tags: string[];
  owner: mongoose.Types.ObjectId;
  shareLink: string;
  views: number;
  position: number;
  createdAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  position: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const File = mongoose.model<IFile>('File', fileSchema);
