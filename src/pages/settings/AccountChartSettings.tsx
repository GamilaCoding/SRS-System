import React, { useState, useEffect } from 'react';
import { Upload, Plus, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface AccountChart {
  id: number;
  account: string;
  created_at: string;
}

export default function AccountChartSettings() {
  const [accountChart, setAccountChart] = useState<AccountChart[]>([]);
  const [editingAccount, setEditingAccount] = useState<AccountChart | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchAccountChart();
  }, []);

  const fetchAccountChart = async () => {
    try {
      const response = await fetch('/api/account-chart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAccountChart(data);
      }
    } catch (error) {
      console.error('Error fetching account chart:', error);
      setError('Error al cargar las cuentas contables');
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

      const response = await fetch('/api/import/account-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: jsonData })
      });

      if (response.ok) {
        setSuccess('Cuentas contables importadas exitosamente');
        fetchAccountChart();
      } else {
        throw new Error('Error al importar cuentas contables');
      }
    } catch (error) {
      console.error('Error importing account chart:', error);
      setError('Error al importar cuentas contables');
    } finally {
      e.target.value = '';
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      const response = await fetch(`/api/account-chart/${editingAccount.id}`, {
        method: editingAccount.id === 0 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ account: editingAccount.account })
      });

      if (response.ok) {
        setSuccess(editingAccount.id === 0 ? 'Cuenta contable creada exitosamente' : 'Cuenta contable actualizada exitosamente');
        fetchAccountChart();
        setEditingAccount(null);
      } else {
        throw new Error('Error al guardar la cuenta contable');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar la cuenta contable');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta cuenta contable?')) return;

    try {
      const response = await fetch(`/api/account-chart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess('Cuenta contable eliminada exitosamente');
        fetchAccountChart();
      } else {
        throw new Error('Error al eliminar la cuenta contable');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar la cuenta contable');
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
          <h2 className="text-lg font-medium text-gray-900">Cuentas Contables</h2>
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
              onClick={() => setEditingAccount({ id: 0, account: '', created_at: '' })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </button>
          </div>
        </div>

        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuenta
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
              {accountChart.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
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
      {editingAccount && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAccount.id === 0 ? 'Nueva Cuenta' : 'Editar Cuenta'}
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Cuenta
                </label>
                <input
                  type="text"
                  value={editingAccount.account}
                  onChange={(e) => setEditingAccount({ ...editingAccount, account: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
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