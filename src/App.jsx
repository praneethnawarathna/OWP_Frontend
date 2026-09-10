import { useState, useEffect } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';
import LoginPage from './pages/LoginPage';

// Returns true only if a non-expired JWT token is stored in localStorage.
// Decodes the payload to check the `exp` claim — clears expired tokens automatically.
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && Date.now() / 1000 > payload.exp;
    if (isExpired) {
      // Auto-clear expired credentials so the user starts fresh
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch {
    // Malformed token — treat as unauthenticated
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

// Map browser URL paths to internal page state.
// Protected routes fall back to 'login' if no token is present.
const pathToPage = (path) => {
  if (path === '/login') return 'login';

  // Guard all dashboard routes — redirect to login if not authenticated
  if (!isAuthenticated()) return 'login';

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
  // Derive initial page from URL + auth state
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

  // Called by LoginPage on successful authentication
  const handleLoginSuccess = () => {
    handleNavigate('dashboard');
  };

  // Called to log out — clears stored credentials and returns to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleNavigate('login');
  };

  // 1. Standalone Login Page: Rendered full screen without Admin Sidebar/Header
  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Admin Portal: Wrapped cleanly inside AdminLayout (Sidebar + Header intact)
  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
      {currentPage === 'dashboard'        && <DashboardPage />}
      {currentPage === 'customers'        && <CustomerManagementPage />}
      {currentPage === 'listing-review'   && <ListingReviewPage />}
      {currentPage === 'admin-management' && <AdminManagementPage />}
    </AdminLayout>
  );
}