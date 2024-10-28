import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styles from './dashboard.module.css';
import FileUpload from '../FileUpload';
import { fileService } from '../../../services/fileService';
import { useNavigate } from 'react-router-dom';

interface File {
  id: string;
  name: string;
  url: string;
  tags: string[];
  views: number;
  createdAt: string;
  position: number;
  shareLink?: string; // Add shareLink to interface
}

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedFiles = await fileService.getAllFiles();
      // Ensure files are sorted by position
      const sortedFiles = [...fetchedFiles].sort((a, b) => a.position - b.position);
      setFiles(sortedFiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching files';
      setError(errorMessage);
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    try {
      const filesCopy = [...files];
      const [movedFile] = filesCopy.splice(sourceIndex, 1);
      filesCopy.splice(destinationIndex, 0, movedFile);

      // Optimistically update UI
      setFiles(filesCopy.map((file, index) => ({
        ...file,
        position: index
      })));

      // Update in backend and get the new order
      const updatedFiles = await fileService.updateFilePosition(
        movedFile.id,
        destinationIndex
      );
      // Update state with the response from the server
      setFiles(updatedFiles);
    } catch (err) {
      console.error('Error reordering files:', err);
      // Revert to original order on error
      fetchFiles();
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setFiles(prevFiles => [...prevFiles, uploadedFile]);
  };

  const handleAddTag = async (fileId: string) => {
    if (!newTag.trim()) return;

    try {
      const updatedFile = await fileService.updateFileTags(fileId, [...files.find(f => f.id === fileId)?.tags || [], newTag.trim()]);
      
      setFiles(prevFiles =>
        prevFiles.map(file => {
          if (file.id === fileId) {
            return updatedFile;
          }
          return file;
        })
      );
      setNewTag('');
      setEditingFileId(null);
    } catch (err) {
      console.error('Error adding tag:', err);
    }
  };

  const handleDeleteTag = async (fileId: string, tagToDelete: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      const updatedTags = file.tags.filter(tag => tag !== tagToDelete);
      const updatedFile = await fileService.updateFileTags(fileId, updatedTags);

      setFiles(prevFiles =>
        prevFiles.map(file => {
          if (file.id === fileId) {
            return updatedFile;
          }
          return file;
        })
      );
    } catch (err) {
      console.error('Error deleting tag:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === 'Enter') {
      handleAddTag(fileId);
    }
  };

  const handleView = (fileId: string) => {
    navigate(`/view/${fileId}`);
  };

  const handleShare = async (fileId: string) => {
    try {
      const shareLink = await fileService.getShareLink(fileId);
      const fullShareLink = `${window.location.origin}/files/${shareLink}`;

      // Try different sharing methods
      if (navigator.clipboard && window.isSecureContext) {
        // Modern browsers with secure context
        await navigator.clipboard.writeText(fullShareLink);
        alert('Share link copied to clipboard!');
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = fullShareLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          alert('Share link copied to clipboard!');
        } catch (err) {
          // If copy fails, at least show the link
          alert(`Share link: ${fullShareLink}`);
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Error sharing file:', err);
      alert('Failed to generate share link');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading files...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Files</h1>
      </div>

      <FileUpload onUpload={handleFileUpload} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="files">
          {(provided) => (
            <table className={styles.fileTable}>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Tags</th>
                  <th>Views</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {files.map((file, index) => {
                  // Ensure ID is a string
                  const stringId = file.id.toString();
                  return (
                    <Draggable 
                      key={stringId}
                      draggableId={stringId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          id={stringId}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.fileRow} ${snapshot.isDragging ? styles.dragging : ''}`}
                        >
                          <td {...provided.dragHandleProps} className={styles.dragHandle}>
                            ⋮⋮
                          </td>
                          <td>{file.name}</td>
                          <td>
                            <div className={styles.tagsContainer}>
                              {file.tags.map(tag => (
                                <span key={tag} className={styles.tag}>
                                  {tag}
                                  <button
                                    className={styles.deleteTag}
                                    onClick={() => handleDeleteTag(file.id, tag)}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              {editingFileId === file.id ? (
                                <div className={styles.addTagInput}>
                                  <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, file.id)}
                                    placeholder="Add tag..."
                                  />
                                  <button onClick={() => handleAddTag(file.id)}>Add</button>
                                </div>
                              ) : (
                                <button
                                  className={styles.addTagButton}
                                  onClick={() => setEditingFileId(file.id)}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </td>
                          <td>{file.views}</td>
                          <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button 
                                onClick={() => handleShare(file.id)}
                                className={styles.shareButton}
                              >
                                Share
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button 
                                onClick={() => handleView(file.id)}
                                className={styles.viewButton}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;
