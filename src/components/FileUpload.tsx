import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { validateFile } from '../utils/fileUpload';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  error?: string;
}

export default function FileUpload({ onFileSelect, onFileRemove, selectedFile, error }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const error = validateFile(file);
    if (!error) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1
  });

  return (
    <div>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Subir archivo</span>
                <input {...getInputProps()} />
              </label>
              <p className="pl-1">o arrastrar y soltar</p>
            </div>
            <p className="text-xs text-gray-500">PDF hasta 2MB</p>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between p-4 border rounded-md bg-gray-50">
          <div className="flex items-center">
            <Upload className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{selectedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="text-red-600 hover:text-red-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}