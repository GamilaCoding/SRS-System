import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save, Package, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

interface Requisition {
  id: number;
  number: string;
  date: string;
  provider: {
    name: string;
    ruc: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
  }>;
}

interface User {
  id: number;
  name: string;
  lastname: string;
  role: string;
}

interface RecordItem {
  requisitionItemId: number;
  quantity: number;
}

export default function Record() {
  const { requisitionId } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [type, setType] = useState<'entrada' | 'salida'>('entrada');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [delivererId, setDelivererId] = useState<number>(0);
  const [receiverId, setReceiverId] = useState<number>(0);
  const [items, setItems] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requisitionRes, usersRes] = await Promise.all([
          fetch(`/api/requisitions/${requisitionId}`),
          fetch('/api/users')
        ]);

        if (!requisitionRes.ok) {
          throw new Error('Error al cargar la requisición');
        }

        const requisitionData = await requisitionRes.json();
        const usersData = await usersRes.json();

        setRequisition(requisitionData);
        setUsers(usersData);
        setItems(requisitionData.items.map((item: any) => ({
          requisitionItemId: item.id,
          quantity: item.quantity
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requisitionId]);

  const handleItemChange = (requisitionItemId: number, quantity: number) => {
    setItems(items.map(item => 
      item.requisitionItemId === requisitionItemId 
        ? { ...item, quantity } 
        : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          requisitionId,
          type,
          deliveryDate,
          delivererId,
          receiverId,
          items
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el acta');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el acta');
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!requisition) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Requisición no encontrada</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Acta</h1>
          <p className="mt-1 text-sm text-gray-600">
            Requisición #{requisition.number} - {requisition.provider.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles del Acta</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'entrada' | 'salida')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Entregado por</label>
                <select
                  value={delivererId}
                  onChange={(e) => setDelivererId(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={0}>Seleccione una persona</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.lastname} - {user.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recibido por</label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={0}>Seleccione una persona</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.lastname} - {user.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ítems</h2>
            <div className="space-y-4">
              {requisition.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">{item.description}</p>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">Cantidad Original</label>
                    <p className="mt-1 text-sm text-gray-900">{item.quantity}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700">Cantidad a {type === 'entrada' ? 'Recibir' : 'Entregar'}</label>
                    <input
                      type="number"
                      step="0.01"
                      max={item.quantity}
                      value={items.find(i => i.requisitionItemId === item.id)?.quantity || 0}
                      onChange={(e) => handleItemChange(item.id, Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Crear Acta
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}