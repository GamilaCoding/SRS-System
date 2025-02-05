import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface CompanySettings {
  ruc: string;
  name: string;
}

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    ruc: '',
    name: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Error al cargar la configuración');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la configuración');
      }

      // Fetch the latest data after successful update
      await fetchSettings();
      setSuccess('Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar la configuración');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RUC
            </label>
            <input
              type="text"
              value={settings.ruc}
              onChange={(e) => setSettings({ ...settings, ruc: e.target.value })}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}