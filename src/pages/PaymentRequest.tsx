import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save } from 'lucide-react';
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

interface AccountCode {
  id: number;
  code: string;
  description: string;
}

interface AccountChart {
  id: number;
  account: string;
  description: string;
}

interface PaymentAccount {
  accountCodeId: number;
  accountChartId: number;
  amount: number;
}

export default function PaymentRequest() {
  const { requisitionId } = useParams();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [accountCodes, setAccountCodes] = useState<AccountCode[]>([]);
  const [accountChart, setAccountChart] = useState<AccountChart[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([
    { accountCodeId: 0, accountChartId: 0, amount: 0 }
  ]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requisitionRes, accountCodesRes, accountChartRes] = await Promise.all([
          fetch(`/api/requisitions/${requisitionId}`),
          fetch('/api/account-codes'),
          fetch('/api/account-chart')
        ]);

        if (!requisitionRes.ok) {
          throw new Error('Error al cargar la requisición');
        }

        const requisitionData = await requisitionRes.json();
        const accountCodesData = await accountCodesRes.json();
        const accountChartData = await accountChartRes.json();

        setRequisition(requisitionData);
        setAccountCodes(accountCodesData);
        setAccountChart(accountChartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requisitionId]);

  const handleAccountChange = (index: number, field: keyof PaymentAccount, value: number) => {
    const newAccounts = [...accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setAccounts(newAccounts);

    if (field === 'amount') {
      const total = newAccounts.reduce((sum, account) => sum + account.amount, 0);
      setTotalAmount(total);
    }
  };

  const handleAddAccount = () => {
    setAccounts([...accounts, { accountCodeId: 0, accountChartId: 0, amount: 0 }]);
  };

  const handleRemoveAccount = (index: number) => {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
    const total = newAccounts.reduce((sum, account) => sum + account.amount, 0);
    setTotalAmount(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          requisitionId,
          totalAmount,
          accounts
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la solicitud de pago');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la solicitud de pago');
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
          <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Pago</h1>
          <p className="mt-1 text-sm text-gray-600">
            Requisición #{requisition.number} - {requisition.provider.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requisition Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Requisición</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <p className="mt-1 text-sm text-gray-900">{requisition.number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(requisition.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                <p className="mt-1 text-sm text-gray-900">{requisition.provider.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RUC</label>
                <p className="mt-1 text-sm text-gray-900">{requisition.provider.ruc}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ítems</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requisition.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Accounts */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Cuentas de Pago</h2>
              <button
                type="button"
                onClick={handleAddAccount}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Agregar Cuenta
              </button>
            </div>

            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <select
                      value={account.accountCodeId}
                      onChange={(e) => handleAccountChange(index, 'accountCodeId', Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value={0}>Seleccione un código</option>
                      {accountCodes.map((code) => (
                        <option key={code.id} value={code.id}>
                          {code.code} - {code.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Cuenta</label>
                    <select
                      value={account.accountChartId}
                      onChange={(e) => handleAccountChange(index, 'accountChartId', Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value={0}>Seleccione una cuenta</option>
                      {accountChart.map((chart) => (
                        <option key={chart.id} value={chart.id}>
                          {chart.account} - {chart.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      value={account.amount}
                      onChange={(e) => handleAccountChange(index, 'amount', Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(index)}
                      className="mt-6 text-red-600 hover:text-red-900"
                    >
                      <span className="sr-only">Eliminar cuenta</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <label className="block text-sm font-medium text-gray-700">Total</label>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Crear Solicitud de Pago
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}