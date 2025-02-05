import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { generateReportPDF } from '../utils/pdfGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportData {
  requisitionsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    correction: number;
  };
  requisitionsByMonth: {
    [key: string]: number;
  };
  paymentsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  totalAmountByMonth: {
    [key: string]: number;
  };
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  community: string;
  programModel: string;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    community: '',
    programModel: ''
  });
  const [communities, setCommunities] = useState<string[]>([]);
  const [programModels, setProgramModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        community: filters.community,
        programModel: filters.programModel
      });

      const [reportsRes, communitiesRes, programModelsRes] = await Promise.all([
        fetch(`/api/reports?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/communities'),
        fetch('/api/program-models')
      ]);

      const [reportsData, communitiesData, programModelsData] = await Promise.all([
        reportsRes.json(),
        communitiesRes.json(),
        programModelsRes.json()
      ]);

      setReportData(reportsData);
      setCommunities(communitiesData.map((c: any) => c.name));
      setProgramModels(programModelsData.map((p: any) => p.name));
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    const pdfData = generateReportPDF(reportData, filters);
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = 'reporte.pdf';
    link.click();
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
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar Reporte
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Comunidad</label>
              <select
                name="community"
                value={filters.community}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {communities.map(community => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Modelo de Programa</label>
              <select
                name="programModel"
                value={filters.programModel}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {programModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requisitions by Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Requisiciones</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: ['Pendiente', 'Aprobado', 'Rechazado', 'Corrección'],
                    datasets: [{
                      data: [
                        reportData.requisitionsByStatus.pending,
                        reportData.requisitionsByStatus.approved,
                        reportData.requisitionsByStatus.rejected,
                        reportData.requisitionsByStatus.correction
                      ],
                      backgroundColor: [
                        '#FCD34D',
                        '#34D399',
                        '#F87171',
                        '#60A5FA'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            {/* Requisitions by Month */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requisiciones por Mes</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: Object.keys(reportData.requisitionsByMonth),
                    datasets: [{
                      label: 'Requisiciones',
                      data: Object.values(reportData.requisitionsByMonth),
                      backgroundColor: '#60A5FA'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Payments by Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Pagos</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: ['Pendiente', 'Aprobado', 'Rechazado'],
                    datasets: [{
                      data: [
                        reportData.paymentsByStatus.pending,
                        reportData.paymentsByStatus.approved,
                        reportData.paymentsByStatus.rejected
                      ],
                      backgroundColor: [
                        '#FCD34D',
                        '#34D399',
                        '#F87171'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            {/* Total Amount by Month */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monto Total por Mes</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: Object.keys(reportData.totalAmountByMonth),
                    datasets: [{
                      label: 'Monto Total ($)',
                      data: Object.values(reportData.totalAmountByMonth),
                      backgroundColor: '#34D399'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}