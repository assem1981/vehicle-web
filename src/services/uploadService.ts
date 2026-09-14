import axios from 'axios';
import { API_BASE_URL } from './api';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    // eslint-disable-next-line no-console
    console.log('Upload response:', response.status, response.data);

    const data = response.data;
    const imageUrl =
      (typeof data === 'string' ? data : data?.imageUrl || data?.url) as string | undefined;
    if (!imageUrl) {
      throw Object.assign(new Error('Server did not return an image URL.'), {
        response: { status: response.status, data: response.data }
      });
    }
    return imageUrl;
  }
};
