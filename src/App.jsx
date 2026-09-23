import { useEffect, useState } from 'react';
import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import ListingReviewPage from './pages/ListingReviewPage';
import AdminManagementPage from './pages/AdminManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import VendorDirectoryPage from './pages/VendorDirectoryPage';
import LoginPage from './pages/LoginPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorContentPage from './pages/VendorContentPage';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorListingsPage from './pages/VendorListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import VendorNotificationsPage from './pages/VendorNotificationsPage';
<<<<<<< Updated upstream
import AdminNotificationsPage from './pages/AdminNotificationsPage';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};
=======

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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = String(user.role || '').toUpperCase();
    if (role.includes('SUPER')) return 'SUPER_ADMIN';
    return user.role || 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

<<<<<<< Updated upstream
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
  return '/';
=======
// Map route path to page ID expected by Sidebar/Header
const pathToPageId = (path) => {
  if (path.includes('customer')) return 'customers';
  if (path.includes('listing-review') || path.includes('listings')) return 'listing-review';
  if (path.includes('all-vendors') || path.includes('vendor-directory') || path === '/vendors' || path.startsWith('/vendors/')) return 'all-vendors';
  if (path.includes('admin-management') || path.includes('admins')) return 'admin-management';
  if (path.includes('report-analytics')) return 'analytics';
  if (path.includes('settings')) return 'settings';
  if (path.includes('vendor-notifications')) return 'vendor-notifications';
  if (path.includes('notifications') || path.includes('admin-notifications')) return 'notifications';
  if (path.includes('vendor-profile')) return 'vendor-profile';
  if (path.includes('vendor-services')) return 'vendor-services';
  if (path.includes('vendor-listing-editor')) return 'vendor-listing-editor';
  if (path.includes('vendor-ratings') || path.includes('vendor-performance')) return 'vendor-ratings';
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
  'notifications': '/notifications',
  'vendor-dashboard': '/vendor-dashboard',
  'vendor-profile': '/vendor-profile',
  'vendor-services': '/vendor-services',
  'vendor-listing-editor': '/vendor-listing-editor',
  'vendor-ratings': '/vendor-ratings',
  'vendor-notifications': '/vendor-notifications',
>>>>>>> Stashed changes
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
        {currentPage === 'vendor-services' && <VendorListingsPage onNavigate={handleNavigate} />}
        {currentPage === 'vendor-listing-editor' && <CreateListingPage onNavigate={handleNavigate} />}
        {currentPage === 'vendor-ratings' && <VendorContentPage type="performance" />}
        {currentPage === 'vendor-notifications' && <VendorNotificationsPage onNavigate={handleNavigate} />}
      </VendorLayout>
    );
  }

  // Admin Portal: Wrapped inside AdminLayout
  return (
<<<<<<< Updated upstream
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
    </AdminLayout>
=======
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
                  <VendorDirectoryPage onNavigate={handleNavigate} />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/vendors" element={<Navigate to="/all-vendors" replace />} />
        <Route path="/vendor-directory" element={<Navigate to="/all-vendors" replace />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                currentPage="notifications"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userRole={userRole}
              >
                <PageTransition>
                  <AdminNotificationsPage onNavigate={handleNavigate} />
                </PageTransition>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admin-notifications" element={<Navigate to="/notifications" replace />} />
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
>>>>>>> Stashed changes
  );
}