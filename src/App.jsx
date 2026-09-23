import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';

// Admin Pages
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ReportAnalyticsPage from './pages/ReportAnalyticsPage';
import VendorDirectoryPage from './pages/VendorDirectoryPage';

// Vendor Pages
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorContentPage from './pages/VendorContentPage';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorListingsPage from './pages/VendorListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import VendorNotificationsPage from './pages/VendorNotificationsPage';
<<<<<<< Updated upstream
=======
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import ReportAnalyticsPage from './pages/ReportAnalyticsPage';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};
>>>>>>> Stashed changes

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
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return user?.role || 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

<<<<<<< Updated upstream
// Map route path to page ID expected by Sidebar/Header
const pathToPageId = (path) => {
  if (path.includes('customer')) return 'customers';
  if (path.includes('listing-review') || path.includes('listings')) return 'listing-review';
  if (path.includes('all-vendors') || path.includes('vendor-directory')) return 'all-vendors';
  if (path.includes('admin-management') || path.includes('admins')) return 'admin-management';
  if (path.includes('report-analytics')) return 'analytics';
  if (path.includes('settings')) return 'settings';
  if (path.includes('vendor-profile')) return 'vendor-profile';
  if (path.includes('vendor-services')) return 'vendor-services';
  if (path.includes('vendor-listing-editor')) return 'vendor-listing-editor';
  if (path.includes('vendor-ratings') || path.includes('vendor-performance')) return 'vendor-ratings';
  if (path.includes('vendor-notifications')) return 'vendor-notifications';
  if (path.includes('vendor-dashboard')) return 'vendor-dashboard';
  return 'dashboard';
};

const pageIdToPath = {
  'landing': '/',
  'login': '/login',
  'dashboard': '/dashboard',
  'customers': '/customer-management',
  'listing-review': '/listing-review',
  'all-vendors': '/all-vendors',
  'admin-management': '/admin-management',
  'analytics': '/report-analytics',
  'settings': '/settings',
  'vendor-dashboard': '/vendor-dashboard',
  'vendor-profile': '/vendor-profile',
  'vendor-services': '/vendor-services',
  'vendor-listing-editor': '/vendor-listing-editor',
  'vendor-ratings': '/vendor-ratings',
  'vendor-notifications': '/vendor-notifications',
=======
// Map browser URL paths to internal page state.
const pathToPage = (path) => {
  if (path === '/login') return 'login';
  if (!isAuthenticated()) return 'login';

  const vendor = isVendor(getUserRole());
  if (vendor) {
    if (path === '/vendor-dashboard' || path === '/' || path === '/dashboard') return 'vendor-dashboard';
    if (path === '/vendor-profile') return 'vendor-profile';
    if (path === '/vendor-services') return 'vendor-services';
    if (path === '/vendor-listing-editor') return 'vendor-listing-editor';
    if (path === '/vendor-ratings' || path === '/vendor-performance') return 'vendor-ratings';
    if (path === '/vendor-notifications') return 'vendor-notifications';
    return 'vendor-dashboard';
  }

  if (path === '/customer-management' || path === '/customers') return 'customers';
  if (path === '/listing-review' || path === '/listings') return 'listing-review';
  if (path === '/all-vendors' || path === '/vendor-directory' || path === '/vendors') return 'all-vendors';
  if (path === '/admin-management' || path === '/admins') return 'admin-management';
  if (path === '/settings') return 'settings';
  if (path === '/notifications' || path === '/admin-notifications') return 'notifications';
  if (path === '/report-analytics' || path === '/analytics') return 'analytics';
  return 'dashboard'; // Default route for '/' or '/dashboard'
};

const pageToPath = (page) => {
  if (page === 'login') return '/login';
  if (page === 'vendor-dashboard') return '/vendor-dashboard';
  if (page === 'vendor-profile') return '/vendor-profile';
  if (page === 'vendor-services') return '/vendor-services';
  if (page === 'vendor-listing-editor') return '/vendor-listing-editor';
  if (page === 'vendor-ratings') return '/vendor-ratings';
  if (page === 'vendor-notifications') return '/vendor-notifications';
  if (page === 'customers') return '/customer-management';
  if (page === 'listing-review') return '/listing-review';
  if (page === 'all-vendors' || page === 'vendor-directory') return '/all-vendors';
  if (page === 'admin-management') return '/admin-management';
  if (page === 'settings') return '/settings';
  if (page === 'notifications') return '/notifications';
  if (page === 'analytics') return '/report-analytics';
  return '/';
>>>>>>> Stashed changes
};

// Smooth page transition wrapper
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const currentRole = getUserRole();
  if (requiredRole === 'vendor' && !isVendor(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (requiredRole === 'admin' && isVendor(currentRole)) {
    return <Navigate to="/vendor-dashboard" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(() => getUserRole());

  useEffect(() => {
    setUserRole(getUserRole());
  }, [location.pathname]);

  const handleNavigate = (pageOrPath) => {
    if (pageOrPath.startsWith('/')) {
      navigate(pageOrPath);
    } else {
      navigate(pageIdToPath[pageOrPath] || `/${pageOrPath}`);
    }
  };

  const handleLoginSuccess = () => {
    const role = getUserRole();
    setUserRole(role);
    navigate(isVendor(role) ? '/vendor-dashboard' : '/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole('ADMIN');
    navigate('/login');
  };

  const currentPageId = pathToPageId(location.pathname);

  return (
<<<<<<< Updated upstream
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated() ? (
              <Navigate to={isVendor(getUserRole()) ? "/vendor-dashboard" : "/dashboard"} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/landing" element={<LandingPage />} />

        {/* Admin Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage={currentPageId}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <DashboardPage onNavigate={handleNavigate} />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-management"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="customers"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <CustomerManagementPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/customers" element={<Navigate to="/customer-management" replace />} />
        <Route
          path="/listing-review"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="listing-review"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <ListingReviewPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/listings" element={<Navigate to="/listing-review" replace />} />
        <Route
          path="/admin-management"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="admin-management"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <AdminManagementPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admins" element={<Navigate to="/admin-management" replace />} />
        <Route
          path="/all-vendors"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="all-vendors"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <VendorDirectoryPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/vendor-directory" element={<Navigate to="/all-vendors" replace />} />
        <Route path="/vendors" element={<Navigate to="/all-vendors" replace />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="settings"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <AdminSettingsPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="analytics"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <ReportAnalyticsPage />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Vendor Protected Routes */}
        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage={currentPageId}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <VendorDashboardPage onNavigate={handleNavigate} />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-profile"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage="vendor-profile"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <VendorProfilePage onNavigate={handleNavigate} />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-services"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage="vendor-services"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <VendorListingsPage onNavigate={handleNavigate} />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-listing-editor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage="vendor-listing-editor"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <CreateListingPage onNavigate={handleNavigate} />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ratings"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage="vendor-ratings"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <VendorContentPage type="performance" />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/vendor-performance" element={<Navigate to="/vendor-ratings" replace />} />
        <Route
          path="/vendor-notifications"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout
                currentPage="vendor-notifications"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              >
                <PageTransition>
                  <VendorNotificationsPage onNavigate={handleNavigate} />
                </PageTransition>
              </VendorLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
=======
    <AdminLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRole={userRole}
    >
      {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentPage === 'customers' && <CustomerManagementPage />}
      {currentPage === 'listing-review' && <ListingReviewPage />}
      {(currentPage === 'all-vendors' || currentPage === 'vendor-directory') && <VendorDirectoryPage />}
      {currentPage === 'admin-management' && <AdminManagementPage />}
      {currentPage === 'settings' && <AdminSettingsPage />}
      {currentPage === 'notifications' && <AdminNotificationsPage onNavigate={handleNavigate} />}
      {currentPage === 'analytics' && <ReportAnalyticsPage />}
    </AdminLayout>
>>>>>>> Stashed changes
  );
}