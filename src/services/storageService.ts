// src/services/storageService.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number }> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `device-documents/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  return {
    url,
    name: file.name,
    size: file.size
  };
};

export const uploadMultipleFiles = async (files: File[]): Promise<Array<{ url: string; name: string; size: number }>> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return await Promise.all(uploadPromises);
};
