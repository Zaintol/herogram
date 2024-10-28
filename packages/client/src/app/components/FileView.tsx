import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { fileService } from '../../services/fileService';

interface FileData {
  name: string;
  path: string;
  mimeType: string;
  views: number;
}

const FileView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        if (!shareId) return;
        const fileData = await fileService.getSharedFile(shareId);
        setFile({
          name: fileData.name,
          path: fileData.path, // Using url as path since it's required
          mimeType: fileData.mimeType,
          views: fileData.views
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [shareId]);

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

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {file.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Views: {file.views}
        </Typography>
        {file.mimeType.startsWith('image/') ? (
          <Box mt={2}>
            <img 
              src={`${file.path}`} 
              alt={file.name} 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        ) : (
          <Box mt={2}>
            <video 
              controls 
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              <source src={`${file.path}`} type={file.mimeType} />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FileView;
