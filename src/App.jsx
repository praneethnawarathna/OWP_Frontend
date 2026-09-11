import { useEffect, useState } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import LoginPage from './pages/LoginPage';
import VendorDashboardPage from './pages/VendorDashboardPage';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const isVendor = (role) => String(role || '').toUpperCase() === 'VENDOR';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && Date.now() / 1000 > payload.exp;
    if (isExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

// Map browser URL paths to internal page state.
const pathToPage = (path) => {
  if (path === '/login') return 'login';
  if (!isAuthenticated()) return 'login';

  const vendor = isVendor(getUserRole());
  if (vendor) {
    if (path === '/vendor-dashboard' || path === '/' || path === '/dashboard') return 'vendor-dashboard';
    if (path === '/vendor-performance') return 'vendor-performance';
    if (path === '/vendor-notifications') return 'vendor-notifications';
    if (path === '/vendor-profile') return 'vendor-profile';
    if (path === '/vendor-ratings') return 'vendor-ratings';
    return 'vendor-dashboard';
  }

  if (path === '/customer-management' || path === '/customers') return 'customers';
  if (path === '/listing-review' || path === '/listings') return 'listing-review';
  if (path === '/admin-management' || path === '/admins') return 'admin-management';
  if (path === '/settings') return 'settings';
  return 'dashboard'; // Default route for '/' or '/dashboard'
};

const pageToPath = (page) => {
  if (page === 'login') return '/login';
  if (page === 'vendor-dashboard') return '/vendor-dashboard';
  if (page === 'vendor-performance') return '/vendor-performance';
  if (page === 'vendor-notifications') return '/vendor-notifications';
  if (page === 'vendor-profile') return '/vendor-profile';
  if (page === 'vendor-ratings') return '/vendor-ratings';
  if (page === 'customers') return '/customer-management';
  if (page === 'listing-review') return '/listing-review';
  if (page === 'admin-management') return '/admin-management';
  if (page === 'settings') return '/settings';
  return '/';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => pathToPage(window.location.pathname));
  const [userRole, setUserRole] = useState(() => getUserRole());

  // Sync state if user clicks Browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
      setUserRole(getUserRole());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    const newPath = pageToPath(page);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  const handleLoginSuccess = () => {
    const role = getUserRole();
    setUserRole(role);
    handleNavigate(isVendor(role) ? 'vendor-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole('ADMIN');
    handleNavigate('login');
  };

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Vendor users get their own layout shell
  if (isVendor(userRole)) {
    return (
      <VendorLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {currentPage === 'vendor-dashboard' && <VendorDashboardPage />}
        {currentPage === 'vendor-performance' && <div className="p-8 text-[#737373]">Vendor Performance — coming soon.</div>}
        {currentPage === 'vendor-notifications' && <div className="p-8 text-[#737373]">Notifications — coming soon.</div>}
        {currentPage === 'vendor-profile' && <div className="p-8 text-[#737373]">Business Profile — coming soon.</div>}
        {currentPage === 'vendor-ratings' && <div className="p-8 text-[#737373]">Add Ratings — coming soon.</div>}
      </VendorLayout>
    );
  }

  // Admin Portal: Wrapped inside AdminLayout
  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRole={userRole}
    >
      {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentPage === 'customers' && <CustomerManagementPage />}
      {currentPage === 'listing-review' && <ListingReviewPage />}
      {currentPage === 'admin-management' && <AdminManagementPage />}
      {currentPage === 'settings' && <AdminSettingsPage />}
    </AdminLayout>
  );
}