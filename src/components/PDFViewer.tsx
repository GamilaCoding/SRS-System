import React from 'react';
import { X } from 'lucide-react';

interface PDFViewerProps {
  pdfData: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfData, onClose }: PDFViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Vista Previa del PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={pdfData}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
        <div className="p-4 border-t flex justify-end space-x-4">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = pdfData;
              link.download = 'documento.pdf';
              link.click();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Descargar PDF
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}