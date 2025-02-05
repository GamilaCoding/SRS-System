import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import SearchableSelect from '../components/SearchableSelect';
import MultiSearchableSelect from '../components/MultiSearchableSelect';

interface Provider {
  id: number;
  name: string;
  ruc: string;
}

interface ProgramModel {
  id: number;
  name: string;
}

interface Community {
  id: number;
  name: string;
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

interface RequisitionItem {
  itemNumber: number;
  quantity: number;
  description: string;
}

interface CompanySettings {
  ruc: string;
  name: string;
}

export default function NewRequisition() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [programModels, setProgramModels] = useState<ProgramModel[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [accountCodes, setAccountCodes] = useState<AccountCode[]>([]);
  const [accountChart, setAccountChart] = useState<AccountChart[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [requisitionNumber, setRequisitionNumber] = useState<string>('');

  const [selectedProvider, setSelectedProvider] = useState<number>(0);
  const [selectedProgramModel, setSelectedProgramModel] = useState<number>(0);
  const [selectedCommunity, setSelectedCommunity] = useState<number>(0);
  const [executionDate, setExecutionDate] = useState<string>('');
  const [planningFile, setPlanningFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<string>('');
  const [items, setItems] = useState<RequisitionItem[]>([{ itemNumber: 1, quantity: 0, description: '' }]);
  const [selectedAccountCodes, setSelectedAccountCodes] = useState<number[]>([]);
  const [selectedAccountCharts, setSelectedAccountCharts] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const requesterName = `${user.name} ${user.lastname}`;
  const currentDate = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const [
          providersRes, 
          programModelsRes, 
          communitiesRes, 
          accountCodesRes, 
          accountChartRes,
          settingsRes,
          lastRequisitionRes
        ] = await Promise.all([
          fetch('/api/providers', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/program-models', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/communities', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/account-codes', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/account-chart', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/requisitions/last-number', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const [
          providers,
          programModels,
          communities,
          accountCodes,
          accountChart,
          settings,
          lastNumber
        ] = await Promise.all([
          providersRes.json(),
          programModelsRes.json(),
          communitiesRes.json(),
          accountCodesRes.json(),
          accountChartRes.json(),
          settingsRes.json(),
          lastRequisitionRes.json()
        ]);

        setProviders(providers);
        setProgramModels(programModels);
        setCommunities(communities);
        setAccountCodes(accountCodes);
        setAccountChart(accountChart);
        setCompanySettings(settings);

        // Format requisition number with leading zeros (e.g., 001, 002, etc.)
        const nextNumber = (lastNumber.number + 1).toString().padStart(3, '0');
        setRequisitionNumber(nextNumber);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFileChange = (file: File) => {
    setPlanningFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('number', requisitionNumber);
      formData.append('provider_id', selectedProvider.toString());
      formData.append('program_model_id', selectedProgramModel.toString());
      formData.append('execution_date', executionDate);
      formData.append('community_id', selectedCommunity.toString());
      formData.append('detail', detail);
      formData.append('items', JSON.stringify(items));
      formData.append('account_codes', JSON.stringify(selectedAccountCodes));
      formData.append('account_charts', JSON.stringify(selectedAccountCharts));
      
      if (planningFile) {
        formData.append('planning_file', planningFile);
      }

      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al crear la requisición');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear la requisición');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { itemNumber: items.length + 1, quantity: 0, description: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RequisitionItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Requisición</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete todos los campos requeridos para crear una nueva requisición.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{companySettings?.name}</h2>
              <p className="text-sm text-gray-600">RUC: {companySettings?.ruc}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Requisición</label>
                <input
                  type="text"
                  value={requisitionNumber}
                  disabled
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <input
                  type="text"
                  value={currentDate}
                  disabled
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Requester Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Solicitante</label>
                <input
                  type="text"
                  value={requesterName}
                  disabled
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 rounded-md"
                />
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                <SearchableSelect
                  options={providers.map(p => ({ id: p.id, label: p.name }))}
                  value={selectedProvider}
                  onChange={setSelectedProvider}
                  placeholder="Seleccione un proveedor"
                  required
                  className="mt-1"
                />
              </div>

              {/* Program Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo de Programa</label>
                <SearchableSelect
                  options={programModels.map(p => ({ id: p.id, label: p.name }))}
                  value={selectedProgramModel}
                  onChange={setSelectedProgramModel}
                  placeholder="Seleccione un modelo"
                  required
                  className="mt-1"
                />
              </div>

              {/* Execution Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Ejecución</label>
                <input
                  type="date"
                  value={executionDate}
                  onChange={(e) => setExecutionDate(e.target.value)}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>

              {/* Community Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Comunidad</label>
                <SearchableSelect
                  options={communities.map(c => ({ id: c.id, label: c.name }))}
                  value={selectedCommunity}
                  onChange={setSelectedCommunity}
                  placeholder="Seleccione una comunidad"
                  required
                  className="mt-1"
                />
              </div>

              {/* Account Codes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Códigos</label>
                <MultiSearchableSelect
                  options={accountCodes.map(code => ({ id: code.id, label: code.code }))}
                  values={selectedAccountCodes}
                  onChange={setSelectedAccountCodes}
                  placeholder="Seleccione códigos"
                  required
                  className="mt-1"
                />
              </div>

              {/* Account Chart */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cuentas Contables</label>
                <MultiSearchableSelect
                  options={accountChart.map(account => ({ id: account.id, label: account.account }))}
                  values={selectedAccountCharts}
                  onChange={setSelectedAccountCharts}
                  placeholder="Seleccione cuentas contables"
                  required
                  className="mt-1"
                />
              </div>

              {/* Planning File */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Archivo de Planificación</label>
                <FileUpload
                  onFileSelect={handleFileChange}
                  onFileRemove={() => setPlanningFile(null)}
                  selectedFile={planningFile}
                  error={error}
                />
              </div>

              {/* Detail */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Detalle</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese el detalle de la requisición"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Ítems</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ítem
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700">Ítem</label>
                    <input
                      type="number"
                      value={item.itemNumber}
                      disabled
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      required
                      min="1"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  {items.length > 1 && (
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="mb-1 p-2 text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
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
              Crear Requisición
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}