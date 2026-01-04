import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import pages
import Dashboard from './Dashboard';
import Detection from './Detection';
import Batch from './Batch';
import History from './History';
import Monitoring from './Monitoring';
import Admin from './Admin';
import Reports from './Reports';
import Login from './Login';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

function App() {
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Check initial auth state
    const user = authService.getCurrentUser();
    if (user && authService.isAuthenticated()) {
      login(user);
    }
  }, [login]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {!isAuthenticated ? (
          <Login />
        ) : (
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/detection" element={<Detection />} />
              <Route path="/batch" element={<Batch />} />
              <Route path="/history" element={<History />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        )}
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
