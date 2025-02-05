import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewRequisition from './pages/NewRequisition';
import PaymentRequest from './pages/PaymentRequest';
import PaymentRequests from './pages/PaymentRequests';
import Record from './pages/Record';
import Records from './pages/Records';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Backups from './pages/Backups';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/" />;
  }

  const isAdmin = ['administrador', 'superusuario'].includes(user.role);
  const isProcessUser = ['promotor', 'tecnico', 'coordinacion', 'administrador', 'superusuario'].includes(user.role);

  const adminRoutes = ['/users', '/audit-logs', '/backups', '/settings'];
  const processRoutes = ['/dashboard', '/requisition', '/payment-request', '/payment-requests', '/record', '/records'];

  const currentPath = window.location.pathname;

  if (adminRoutes.some(route => currentPath.startsWith(route)) && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (processRoutes.some(route => currentPath.startsWith(route)) && !isProcessUser) {
    return <Navigate to="/reports" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/requisition/new"
          element={
            <PrivateRoute>
              <NewRequisition />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-requests"
          element={
            <PrivateRoute>
              <PaymentRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-request/:requisitionId"
          element={
            <PrivateRoute>
              <PaymentRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/records"
          element={
            <PrivateRoute>
              <Records />
            </PrivateRoute>
          }
        />
        <Route
          path="/record/:requisitionId"
          element={
            <PrivateRoute>
              <Record />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <PrivateRoute>
              <AuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/backups"
          element={
            <PrivateRoute>
              <Backups />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;