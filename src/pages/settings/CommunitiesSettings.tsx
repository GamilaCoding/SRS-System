import React, { useState, useEffect } from 'react';
import { Upload, Plus, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface Community {
  id: number;
  name: string;
  created_at: string;
}

export default function CommunitiesSettings() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      setError('Error al cargar las comunidades');
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

      const response = await fetch('/api/import/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: jsonData })
      });

      if (response.ok) {
        setSuccess('Comunidades importadas exitosamente');
        fetchCommunities();
      } else {
        throw new Error('Error al importar comunidades');
      }
    } catch (error) {
      console.error('Error importing communities:', error);
      setError('Error al importar comunidades');
    } finally {
      e.target.value = '';
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommunity) return;

    try {
      const response = await fetch(`/api/communities/${editingCommunity.id}`, {
        method: editingCommunity.id === 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingCommunity.name })
      });

      if (response.ok) {
        setSuccess(editingCommunity.id === 0 ? 'Comunidad creada exitosamente' : 'Comunidad actualizada exitosamente');
        fetchCommunities();
        setEditingCommunity(null);
      } else {
        throw new Error('Error al guardar la comunidad');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar la comunidad');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta comunidad?')) return;

    try {
      const response = await fetch(`/api/communities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Comunidad eliminada exitosamente');
        fetchCommunities();
      } else {
        throw new Error('Error al eliminar la comunidad');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar la comunidad');
    }
  };

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
          <h2 className="text-lg font-medium text-gray-900">Comunidades</h2>
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
              onClick={() => setEditingCommunity({ id: 0, name: '', created_at: '' })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Comunidad
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
              {communities.map((community) => (
                <tr key={community.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(community.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingCommunity(community)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(community.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCommunity && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCommunity.id === 0 ? 'Nueva Comunidad' : 'Editar Comunidad'}
              </h3>
              <button
                onClick={() => setEditingCommunity(null)}
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
                  value={editingCommunity.name}
                  onChange={(e) => setEditingCommunity({ ...editingCommunity, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCommunity(null)}
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