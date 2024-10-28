import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileService } from '../../../services/fileService';
import styles from './fileupload.module.css';

interface FileUploadProps {
  onUpload: (file: any) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      setIsUploading(true);

      try {
        // Filter for image and video files and check file size
        const validFiles = acceptedFiles.filter(file => {
          const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
          const isValidSize = file.size <= MAX_FILE_SIZE;

          if (!isValidType) {
            setError('Only image and video files are allowed');
            return false;
          }

          if (!isValidSize) {
            setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
            return false;
          }

          return true;
        });

        if (validFiles.length === 0) {
          setIsUploading(false);
          return;
        }

        // Upload files sequentially
        for (const file of validFiles) {
          try {
            const uploadedFile = await fileService.uploadFile(file);
            onUpload(uploadedFile);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
            console.error('Error uploading file:', file.name, err);
            setError(`${errorMessage} (${file.name})`);
            break; // Stop uploading remaining files if one fails
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error uploading files';
        setError(errorMessage);
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    disabled: isUploading,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div>
      <div 
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${isUploading ? styles.uploading : ''}`} 
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className={styles.uploadingMessage}>
            Uploading files...
          </div>
        ) : (
          <div>
            <p>
              {isDragActive
                ? 'Drop your files here...'
                : 'Drag and drop files here, or click to select files'}
            </p>
            <p className={styles.subtitle}>
              (Only images and videos up to 10MB are allowed)
            </p>
          </div>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FileUpload;
