import React, { useState, useEffect } from 'react';
import { History, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

interface AuditLog {
  id: number;
  user_name: string;
  user_lastname: string;
  user_email: string;
  action_type: string;
  entity_type: string;
  entity_id: number;
  old_values: string;
  new_values: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    userId: '',
    actionType: '',
    entityType: '',
    entityId: ''
  });
  const [users, setUsers] = useState<Array<{ id: number; name: string; lastname: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
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
        <div className="flex items-center mb-6">
          <History className="h-6 w-6 text-gray-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Registros de Auditoría</h1>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Acción</label>
              <select
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="create">Crear</option>
                <option value="update">Actualizar</option>
                <option value="delete">Eliminar</option>
                <option value="login">Inicio de Sesión</option>
                <option value="logout">Cierre de Sesión</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Entidad</label>
              <select
                name="entityType"
                value={filters.entityType}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="user">Usuario</option>
                <option value="requisition">Requisición</option>
                <option value="payment_request">Solicitud de Pago</option>
                <option value="record">Acta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID de Entidad</label>
              <input
                type="text"
                name="entityId"
                value={filters.entityId}
                onChange={handleFilterChange}
                placeholder="Ej: 123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user_name} {log.user_lastname}
                      </div>
                      <div className="text-sm text-gray-500">{log.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.action_type === 'create' ? 'bg-green-100 text-green-800' :
                        log.action_type === 'update' ? 'bg-yellow-100 text-yellow-800' :
                        log.action_type === 'delete' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.old_values && (
                        <details className="mb-2">
                          <summary className="cursor-pointer text-blue-600">Valores Anteriores</summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                            {formatValue(log.old_values)}
                          </pre>
                        </details>
                      )}
                      {log.new_values && (
                        <details>
                          <summary className="cursor-pointer text-blue-600">Valores Nuevos</summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                            {formatValue(log.new_values)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}