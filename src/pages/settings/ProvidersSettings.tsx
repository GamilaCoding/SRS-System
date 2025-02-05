import React, { useState, useEffect } from 'react';
import { Upload, Plus, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface Provider {
  id: number;
  name: string;
  created_at: string;
}

export default function ProvidersSettings() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/providers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los proveedores');
      }

      const data = await response.json();
      setProviders(data);
      setError('');
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setError('');
    setSuccess('');

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      const response = await fetch('/api/import/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: jsonData })
      });

      if (!response.ok) {
        throw new Error('Error al importar proveedores');
      }

      const result = await response.json();
      setSuccess('Proveedores importados exitosamente');
      await fetchProviders();
    } catch (error) {
      console.error('Error importing providers:', error);
      setError('Error al importar proveedores');
    } finally {
      e.target.value = '';
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    try {
      const response = await fetch(`/api/providers/${editingProvider.id}`, {
        method: editingProvider.id === 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingProvider.name })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el proveedor');
      }

      setSuccess(editingProvider.id === 0 ? 'Proveedor creado exitosamente' : 'Proveedor actualizado exitosamente');
      await fetchProviders();
      setEditingProvider(null);
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este proveedor?')) return;

    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proveedor');
      }

      setSuccess('Proveedor eliminado exitosamente');
      await fetchProviders();
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el proveedor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Proveedores</h2>
          <div className="flex space-x-2">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
            <button
              onClick={() => setEditingProvider({ id: 0, name: '', created_at: '' })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </button>
          </div>
        </div>

        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
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
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(provider.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProvider.id === 0 ? 'Nuevo Proveedor' : 'Editar Proveedor'}
              </h3>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}