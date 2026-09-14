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
import VendorContentPage from './pages/VendorContentPage';
import VendorProfilePage from './pages/VendorProfilePage';

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
    if (path === '/vendor-profile') return 'vendor-profile';
    if (path === '/vendor-services') return 'vendor-services';
    if (path === '/vendor-ratings' || path === '/vendor-performance') return 'vendor-ratings';
    if (path === '/vendor-notifications') return 'vendor-notifications';
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
  if (page === 'vendor-profile') return '/vendor-profile';
  if (page === 'vendor-services') return '/vendor-services';
  if (page === 'vendor-ratings') return '/vendor-ratings';
  if (page === 'vendor-notifications') return '/vendor-notifications';
  if (page === 'customers') return '/customer-management';
  if (page === 'listing-review') return '/listing-review';
  if (page === 'admin-management') return '/admin-management';
  if (page === 'settings') return '/settings';
  return '/';
};

// Placeholder for vendor sub-pages not yet built
function ComingSoon({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
      <div className="h-16 w-16 rounded-2xl bg-[#FDF0F4] border border-[#F1E5EC] flex items-center justify-center mb-4">
        <span className="text-3xl">🚀</span>
      </div>
      <h2
        className="text-xl font-bold text-[#1E293B] mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
      <p className="text-sm text-[#737373] max-w-xs">{desc}</p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full border border-[#F1E5EC] bg-[#FDF0F4] text-xs font-medium text-[#8E406F]">
        Coming soon
      </span>
    </div>
  );
}

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
        {currentPage === 'vendor-dashboard' && <VendorDashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'vendor-profile' && <VendorProfilePage onNavigate={handleNavigate} />}
        {currentPage === 'vendor-services' && <VendorContentPage type="services" />}
        {currentPage === 'vendor-ratings' && <VendorContentPage type="performance" />}
        {currentPage === 'vendor-notifications' && <VendorContentPage type="notifications" />}
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