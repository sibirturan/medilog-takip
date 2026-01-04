// Firebase yerine kendi sunucumuzu kullan
export const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://medilogapp.com/api/upload.php', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  
  return {
    url: data.url,
    name: data.name,
    size: data.size
  };
};

export const uploadMultipleFiles = async (files: File[]): Promise<Array<{ url: string; name: string; size: number }>> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return await Promise.all(uploadPromises);
};
