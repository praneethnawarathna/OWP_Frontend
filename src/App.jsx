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

// Vendor Pages
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorContentPage from './pages/VendorContentPage';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorListingsPage from './pages/VendorListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import VendorNotificationsPage from './pages/VendorNotificationsPage';

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
    return user?.role || 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

// Map route path to page ID expected by Sidebar/Header
const pathToPageId = (path) => {
  if (path.includes('customer')) return 'customers';
  if (path.includes('listing-review') || path.includes('listings')) return 'listing-review';
  if (path.includes('admin-management') || path.includes('admins')) return 'admin-management';
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
  'admin-management': '/admin-management',
  'settings': '/settings',
  'vendor-dashboard': '/vendor-dashboard',
  'vendor-profile': '/vendor-profile',
  'vendor-services': '/vendor-services',
  'vendor-listing-editor': '/vendor-listing-editor',
  'vendor-ratings': '/vendor-ratings',
  'vendor-notifications': '/vendor-notifications',
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
  );
}