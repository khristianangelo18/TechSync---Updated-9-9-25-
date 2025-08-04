import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding
  if (user?.needsOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Syncing...</h2>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // If user needs onboarding, redirect to onboarding
    if (user?.needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    // Otherwise redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder components for other routes
const Projects = () => <div style={{ padding: '30px' }}><h2>Projects</h2><p>Your projects will appear here.</p></div>;
const Friends = () => <div style={{ padding: '30px' }}><h2>Friends</h2><p>Your friends and connections will appear here.</p></div>;
const Learns = () => <div style={{ padding: '30px' }}><h2>Learns</h2><p>Your learning modules and progress will appear here.</p></div>;
const Help = () => <div style={{ padding: '30px' }}><h2>Help Center</h2><p>Frequently asked questions and support resources.</p></div>;
const Profile = () => <div style={{ padding: '30px' }}><h2>Profile</h2><p>Your profile settings and information.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Onboarding Route (special case - no sidebar) */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes with Layout (sidebar) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/friends" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Friends />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/learns" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Learns />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Help />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;