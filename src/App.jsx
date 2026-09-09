import { useState, useEffect } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';
import LoginPage from './pages/LoginPage';

// Map browser URL paths to internal page state
const pathToPage = (path) => {
  if (path === '/login') return 'login';
  if (path === '/customer-management' || path === '/customers') return 'customers';
  if (path === '/listing-review' || path === '/listings') return 'listing-review';
  if (path === '/admin-management' || path === '/admins') return 'admin-management';
  return 'dashboard'; // Default route for '/' or '/dashboard'
};

// Map internal page state to clean URL paths
const pageToPath = (page) => {
  if (page === 'login') return '/login';
  if (page === 'customers') return '/customer-management';
  if (page === 'listing-review') return '/listing-review';
  if (page === 'admin-management') return '/admin-management';
  return '/';
};

export default function App() {
  // Read initial page directly from the address bar
  const [currentPage, setCurrentPage] = useState(() => pathToPage(window.location.pathname));

  // Sync state if user clicks Browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update both React state AND the address bar when navigating
  const handleNavigate = (page) => {
    setCurrentPage(page);
    const newPath = pageToPath(page);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // 1. Standalone Login Page: Rendered full screen without Admin Sidebar/Header
  if (currentPage === 'login') {
    return <LoginPage onLogin={() => handleNavigate('dashboard')} />;
  }

  // 2. Admin Portal: Wrapped cleanly inside AdminLayout (Sidebar + Header intact)
  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'dashboard'        && <DashboardPage />}
      {currentPage === 'customers'        && <CustomerManagementPage />}
      {currentPage === 'listing-review'   && <ListingReviewPage />}
      {currentPage === 'admin-management' && <AdminManagementPage />}
    </AdminLayout>
  );
}