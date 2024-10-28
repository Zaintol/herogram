import axios from 'axios';

// Make sure this matches your backend URL
const API_URL = process.env.NX_API_URL || 'http://localhost:3333/api';

export interface UploadResponse {
  id: string;
  name: string;
  url: string;
  path: string;
  tags: string[];
  views: number;
  createdAt: string;
  position: number;
  mimeType: string; // Add mimeType to the interface
}

export const fileService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(
        `${API_URL}/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Add any auth headers if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to the server. Please check if the server is running.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Please check your credentials.');
        }
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to upload file');
        }
        if (error.request) {
          throw new Error('No response received from the server');
        }
      }
      throw new Error('An unexpected error occurred while uploading the file');
    }
  },

  async updateFileTags(fileId: string, tags: string[]): Promise<UploadResponse> {
    try {
      const response = await axios.patch<UploadResponse>(
        `${API_URL}/files/${fileId}/tags`,
        { tags },
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update tags');
        }
      }
      throw new Error('Failed to update tags');
    }
  },

  async getAllFiles(): Promise<UploadResponse[]> {
    try {
      const response = await axios.get<UploadResponse[]>(
        `${API_URL}/files`,
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch files');
        }
      }
      throw new Error('Failed to fetch files');
    }
  },

  async updateFilePosition(fileId: string, position: number): Promise<UploadResponse[]> {
    try {
      const response = await axios.patch<UploadResponse[]>(
        `${API_URL}/files/${fileId}/position`,
        { position },
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update file position');
        }
      }
      throw new Error('Failed to update file position');
    }
  },

  async getShareLink(fileId: string): Promise<string> {
    try {
      const response = await axios.post<{ shareLink: string }>(
        `${API_URL}/files/${fileId}/share`,
        {},
        {
          withCredentials: true
        }
      );
      return response.data.shareLink;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to generate share link');
        }
      }
      throw new Error('Failed to generate share link');
    }
  },

  async getSharedFile(shareLink: string): Promise<UploadResponse> {
    try {
      const response = await axios.get<UploadResponse>(
        `${API_URL}/files/shared/${shareLink}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch shared file');
        }
      }
      throw new Error('Failed to fetch shared file');
    }
  }
};
