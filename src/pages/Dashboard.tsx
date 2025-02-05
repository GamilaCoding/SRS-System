import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import PDFViewer from '../components/PDFViewer';

interface Requisition {
  id: number;
  number: string;
  date: string;
  provider: {
    name: string;
  };
  status: string;
  signed_file?: string;
}

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canCreateRequisition = ['promotor', 'tecnico', 'coordinacion'].includes(user.role);

  useEffect(() => {
    fetchRequisitions();
  }, [filters]);

  const fetchRequisitions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/requisitions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadPdf = async (requisitionId: number) => {
    try {
      const response = await fetch(`/api/requisitions/${requisitionId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPdfPreview(true);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al descargar el PDF');
    }
  };

  const handleUploadSignedPdf = async () => {
    if (!signedFile || !selectedRequisition) return;

    try {
      const formData = new FormData();
      formData.append('signed_file', signedFile);

      const response = await fetch(`/api/requisitions/${selectedRequisition.id}/signed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir el PDF firmado');
      }

      await fetchRequisitions();
      setShowUploadModal(false);
      setSignedFile(null);
      setSelectedRequisition(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al subir el PDF firmado');
    }
  };

  const handleSubmitForReview = async (requisitionId: number) => {
    try {
      const response = await fetch(`/api/requisitions/${requisitionId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al enviar la requisición para revisión');
      }

      await fetchRequisitions();
    } catch (error) {
      console.error('Error:', error);
      setError('Error al enviar la requisición para revisión');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'correction':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'correction':
        return 'Corrección';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Requisiciones</h1>
          {canCreateRequisition && (
            <button
              onClick={() => navigate('/requisition/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Requisición
            </button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="correction">Corrección</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Desde</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisitions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay requisiciones para mostrar
                    </td>
                  </tr>
                ) : (
                  requisitions.map((requisition) => (
                    <tr key={requisition.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {requisition.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(requisition.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {requisition.provider.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
                          {getStatusText(requisition.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadPdf(requisition.id)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Descargar PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        {requisition.status === 'pending' && !requisition.signed_file && (
                          <button
                            onClick={() => {
                              setSelectedRequisition(requisition);
                              setShowUploadModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-2"
                            title="Subir PDF Firmado"
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                        )}
                        {requisition.status === 'pending' && requisition.signed_file && (
                          <button
                            onClick={() => handleSubmitForReview(requisition.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Enviar para Revisión"
                          >
                            Enviar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Subir PDF Firmado
            </h3>
            <FileUpload
              onFileSelect={(file) => setSignedFile(file)}
              onFileRemove={() => setSignedFile(null)}
              selectedFile={signedFile}
              error={error}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSignedFile(null);
                  setSelectedRequisition(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadSignedPdf}
                disabled={!signedFile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfPreview && (
        <PDFViewer
          pdfData={pdfUrl}
          onClose={() => {
            setShowPdfPreview(false);
            setPdfUrl('');
          }}
        />
      )}
    </Layout>
  );
}