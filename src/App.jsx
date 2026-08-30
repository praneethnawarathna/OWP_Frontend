import { useState } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('ADMIN'); // 'ADMIN' | 'SUPER_ADMIN'

  const toggleRole = () =>
    setUserRole(r => (r === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'));

  // Guard: if we're on admin-management and role switches back to ADMIN, redirect home
  const handleRoleToggle = () => {
    if (userRole === 'SUPER_ADMIN' && currentPage === 'admin-management') {
      setCurrentPage('dashboard');
    }
    toggleRole();
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userRole={userRole}
      onRoleToggle={handleRoleToggle}
    >
      {currentPage === 'dashboard'          && <DashboardPage />}
      {currentPage === 'customers'          && <CustomerManagementPage />}
      {currentPage === 'listing-review'     && <ListingReviewPage />}
      {currentPage === 'admin-management'   && userRole === 'SUPER_ADMIN' && <AdminManagementPage />}
    </AdminLayout>
  );
}
