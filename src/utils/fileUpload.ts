import { FileRejection } from 'react-dropzone';

export const validateFile = (file: File): string | null => {
  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    return 'El archivo debe ser menor a 2MB';
  }

  // Check file type
  if (file.type !== 'application/pdf') {
    return 'Solo se permiten archivos PDF';
  }

  return null;
};

export const handleFileUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al subir el archivo');
  }

  const data = await response.json();
  return data.filename;
};

export const getFileErrors = (fileRejections: FileRejection[]): string[] => {
  return fileRejections.map(rejection => {
    const error = rejection.errors[0];
    return error.message;
  });
};