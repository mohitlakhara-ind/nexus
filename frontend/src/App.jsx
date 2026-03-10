import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import useThemeStore from './store/themeStore';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import GraphEditor from './pages/GraphEditor';
import Profile from './pages/Profile';
import Ranks from './pages/Ranks';
import NotFound from './pages/NotFound';

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

function App() {
  const { fetchCurrentUser, loading, isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    fetchCurrentUser();
  }, [fetchCurrentUser, initTheme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-main flex flex-col font-sans transition-colors duration-300">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-tertiary)',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500'
            },
          }}
        />

        <ErrorBoundary>
          <Routes>
            {/* Main Layout Group */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/discover" element={isAuthenticated ? <Discover /> : <Navigate to="/login" />} />
              <Route path="/ranks" element={<Ranks />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Immersive Routes (No Navbar) */}
            <Route path="/graph/:id" element={<GraphEditor />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
