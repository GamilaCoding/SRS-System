import React, { useState, useEffect } from 'react';
import { Database, Upload, Download, Trash2, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

interface Backup {
  filename: string;
  size: number;
  created_at: string;
}

export default function Backups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      setError('Error al obtener respaldos');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await fetchBackups();
      } else {
        throw new Error('Error al crear respaldo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear respaldo');
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!window.confirm('¿Está seguro de restaurar este respaldo? Esta acción reemplazará todos los datos actuales.')) {
      return;
    }

    setRestoring(true);
    try {
      const response = await fetch(`/api/backups/${filename}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        alert('Respaldo restaurado exitosamente');
        window.location.reload();
      } else {
        throw new Error('Error al restaurar respaldo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al restaurar respaldo');
    } finally {
      setRestoring(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!window.confirm('¿Está seguro de eliminar este respaldo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/backups/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await fetchBackups();
      } else {
        throw new Error('Error al eliminar respaldo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar respaldo');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-gray-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Respaldos de Base de Datos</h1>
          </div>
          <button
            onClick={createBackup}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-5 w-5 mr-2" />
            Crear Respaldo
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {restoring && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-4 text-center text-gray-700">
                Restaurando respaldo...
              </p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.filename}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {backup.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(backup.size / 1024).toFixed(2)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => restoreBackup(backup.filename)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Restaurar"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.filename)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay respaldos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}