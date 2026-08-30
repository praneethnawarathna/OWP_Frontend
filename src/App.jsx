import { useState } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard'      && <DashboardPage />}
      {currentPage === 'customers'      && <CustomerManagementPage />}
      {currentPage === 'listing-review' && <ListingReviewPage />}
    </AdminLayout>
  );
}
