// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './pages/Layout';
import ProjectLayout from './pages/ProjectLayout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import ChallengeManagement from './pages/ChallengeManagement';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers'; // New import

// Project workspace components
import ProjectDashboard from './pages/project/ProjectDashboard';
import ProjectTasks from './pages/project/ProjectTasks';
import ProjectChats from './pages/project/ProjectChats';
import ProjectFiles from './pages/project/ProjectFiles';
import ProjectMembers from './pages/project/ProjectMembers';

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

// Public Route Component
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
    if (user?.needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder components for main app routes
const Friends = () => <div style={{ padding: '30px' }}><h2>Friends</h2><p>Your friends and connections will appear here.</p></div>;
const Learns = () => <div style={{ padding: '30px' }}><h2>Learns</h2><p>Your learning modules and progress will appear here.</p></div>;
const Help = () => <div style={{ padding: '30px' }}><h2>Help Center</h2><p>Frequently asked questions and support resources.</p></div>;

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
            
            {/* Onboarding Route */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Main App Routes with Regular Layout */}
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

            {/* Project Workspace Routes with Project Layout */}
            <Route 
              path="/project/:projectId/dashboard" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <ProjectDashboard />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/project/:projectId/tasks" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <ProjectTasks />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/project/:projectId/chats" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <ProjectChats />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/project/:projectId/files" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <ProjectFiles />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/project/:projectId/members" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <ProjectMembers />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/project/:projectId/help" 
              element={
                <ProtectedRoute>
                  <ProjectLayout>
                    <Help />
                  </ProjectLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
                path="/challenges" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChallengeManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ManageUsers />
                  </Layout>
                </ProtectedRoute>
              } 
            />
                        
            {/* Redirect /project/:id to /project/:id/dashboard */}
            <Route 
              path="/project/:projectId" 
              element={<Navigate to="dashboard" replace />} 
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