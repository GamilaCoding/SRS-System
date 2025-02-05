import React, { useState, useEffect } from 'react';
import { Upload, Plus, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface ProgramModel {
  id: number;
  name: string;
  created_at: string;
}

export default function ProgramModelsSettings() {
  const [programModels, setProgramModels] = useState<ProgramModel[]>([]);
  const [editingModel, setEditingModel] = useState<ProgramModel | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchProgramModels();
  }, []);

  const fetchProgramModels = async () => {
    try {
      const response = await fetch('/api/program-models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProgramModels(data);
      }
    } catch (error) {
      console.error('Error fetching program models:', error);
      setError('Error al cargar los modelos de programa');
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

      const response = await fetch('/api/import/program-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: jsonData })
      });

      if (response.ok) {
        setSuccess('Modelos de programa importados exitosamente');
        fetchProgramModels();
      } else {
        throw new Error('Error al importar modelos de programa');
      }
    } catch (error) {
      console.error('Error importing program models:', error);
      setError('Error al importar modelos de programa');
    } finally {
      e.target.value = '';
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    try {
      const response = await fetch(`/api/program-models/${editingModel.id}`, {
        method: editingModel.id === 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingModel.name })
      });

      if (response.ok) {
        setSuccess(editingModel.id === 0 ? 'Modelo creado exitosamente' : 'Modelo actualizado exitosamente');
        fetchProgramModels();
        setEditingModel(null);
      } else {
        throw new Error('Error al guardar el modelo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el modelo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este modelo?')) return;

    try {
      const response = await fetch(`/api/program-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Modelo eliminado exitosamente');
        fetchProgramModels();
      } else {
        throw new Error('Error al eliminar el modelo');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el modelo');
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
          <h2 className="text-lg font-medium text-gray-900">Modelos de Programa</h2>
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
              onClick={() => setEditingModel({ id: 0, name: '', created_at: '' })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Modelo
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
              {programModels.map((model) => (
                <tr key={model.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(model.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingModel(model)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
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
      {editingModel && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingModel.id === 0 ? 'Nuevo Modelo' : 'Editar Modelo'}
              </h3>
              <button
                onClick={() => setEditingModel(null)}
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
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
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