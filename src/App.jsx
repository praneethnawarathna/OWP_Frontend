import { useState } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'customers' && <CustomerManagementPage />}
    </AdminLayout>
  );
}
