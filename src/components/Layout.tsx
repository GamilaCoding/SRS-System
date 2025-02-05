import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ClipboardList, 
  FileCheck, 
  Users, 
  Settings, 
  LogOut,
  BarChart2,
  History,
  Database
} from 'lucide-react';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Definir roles que pueden crear requisiciones y solicitudes
  const canCreateProcesses = ['promotor', 'tecnico', 'coordinacion', 'administrador', 'superusuario'].includes(user.role);
  const isAdmin = ['administrador', 'superusuario'].includes(user.role);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">FEDACC SRS</h1>
              </div>
            </div>
            <div className="flex items-center">
              <NotificationBell />
              <div className="ml-4 flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {user.name} {user.lastname}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {canCreateProcesses && (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Requisiciones
                </button>
                <button
                  onClick={() => navigate('/payment-requests')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <ClipboardList className="h-5 w-5 mr-3" />
                  Solicitudes de Pago
                </button>
                <button
                  onClick={() => navigate('/records')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FileCheck className="h-5 w-5 mr-3" />
                  Actas
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Reportes
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/users')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Users className="h-5 w-5 mr-3" />
                  Usuarios
                </button>
                <button
                  onClick={() => navigate('/audit-logs')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <History className="h-5 w-5 mr-3" />
                  Auditoría
                </button>
                <button
                  onClick={() => navigate('/backups')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Database className="h-5 w-5 mr-3" />
                  Respaldos
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Configuración
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}