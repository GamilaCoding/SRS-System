import React, { useState } from 'react';
import { Settings as SettingsIcon, Users, Box, MapPin, FileCode, FileSpreadsheet } from 'lucide-react';
import Layout from '../components/Layout';
import CompanySettings from './settings/CompanySettings';
import ProvidersSettings from './settings/ProvidersSettings';
import ProgramModelsSettings from './settings/ProgramModelsSettings';
import CommunitiesSettings from './settings/CommunitiesSettings';
import AccountCodesSettings from './settings/AccountCodesSettings';
import AccountChartSettings from './settings/AccountChartSettings';

type Module = 'company' | 'providers' | 'programs' | 'communities' | 'codes' | 'chart';

export default function Settings() {
  const [activeModule, setActiveModule] = useState<Module>('company');

  const modules = [
    {
      id: 'company',
      name: 'Datos de la Empresa',
      icon: SettingsIcon,
      component: CompanySettings
    },
    {
      id: 'providers',
      name: 'Proveedores',
      icon: Users,
      component: ProvidersSettings
    },
    {
      id: 'programs',
      name: 'Modelos de Programa',
      icon: Box,
      component: ProgramModelsSettings
    },
    {
      id: 'communities',
      name: 'Comunidades',
      icon: MapPin,
      component: CommunitiesSettings
    },
    {
      id: 'codes',
      name: 'Códigos',
      icon: FileCode,
      component: AccountCodesSettings
    },
    {
      id: 'chart',
      name: 'Cuentas Contables',
      icon: FileSpreadsheet,
      component: AccountChartSettings
    }
  ];

  const ActiveComponent = modules.find(m => m.id === activeModule)?.component || CompanySettings;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administre la configuración general del sistema
          </p>
        </div>

        <div className="flex space-x-6">
          {/* Navigation Sidebar */}
          <div className="w-64 bg-white shadow rounded-lg p-6 h-fit">
            <nav className="space-y-2">
              {modules.map(module => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id as Module)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      activeModule === module.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {module.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </Layout>
  );
}