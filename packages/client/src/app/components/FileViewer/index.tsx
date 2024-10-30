import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { fileService } from '../../../services/fileService';


interface FileDetails {
  id: string;
  name: string;
  url: string;
  path?: string;
  mimeType: string;
  views: number;
  createdAt: string;
  tags: string[];
}


const FileViewer: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        if (!fileId) return;
        const fileData = await fileService.getFile(fileId);
        console.log('Fetched file data:', fileData); // Debug log
        setFile(fileData);
      } catch (err) {
        console.error('Error fetching file:', err); // Debug log
        setError(err instanceof Error ? err.message : 'Error loading file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !file) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error || 'File not found'}</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    if (file.mimeType.startsWith('video/')) {
      return (
        <Box sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <video 
            controls 
            style={{ width: '100%', maxHeight: '500px' }}
            src={`${process.env.NX_PUBLIC_API_URL}${file.url}`}
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    } else if (file.mimeType.startsWith('image/')) {
      return (
        <Box sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <img 
            src={`${process.env.NX_PUBLIC_API_URL}${file.url}`}
            alt={file.name}
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>
      );
    }
    
    return (
      <Typography>
        This file type cannot be previewed
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {file.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Views: {file.views}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Uploaded: {new Date(file.createdAt).toLocaleDateString()}
        </Typography>
        {file.tags.length > 0 && (
          <Typography variant="body1" gutterBottom>
            Tags: {file.tags.join(', ')}
          </Typography>
        )}
      </Paper>
      
      {renderContent()}
    </Box>
  );
};

export default FileViewer;
