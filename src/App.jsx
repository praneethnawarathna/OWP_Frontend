import './index.css';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AdminLayout>
      <DashboardPage />
    </AdminLayout>
  );
}
