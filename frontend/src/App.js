// frontend/src/App.js - COMPLETE FIXED VERSION WITH PROJECT JOIN ROUTES
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './pages/Layout';
import ProjectLayout from './pages/ProjectLayout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import ChallengeManagement from './pages/ChallengeManagement';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ProjectJoinPage from './pages/ProjectJoinPage';
import TaskDetail from './pages/project/TaskDetail';
import GitHubOAuthCallback from './components/GitHubOAuthCallback';

// Project workspace components
import ProjectDashboard from './pages/project/ProjectDashboard';
import ProjectTasks from './pages/project/ProjectTasks';
import ProjectChats from './pages/project/ProjectChats';
import ProjectFiles from './pages/project/ProjectFiles';
import ProjectMembers from './pages/project/ProjectMembers';

// Placeholder components for missing pages
const Friends = () => <div style={{ padding: '30px' }}>Friends feature coming soon...</div>;
const Learns = () => <div style={{ padding: '30px' }}>Learning resources coming soon...</div>;
const Help = () => <div style={{ padding: '30px' }}>Help center coming soon...</div>;

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
        <h2>Loading...</h2>
      </div>
    );
  }
  
  // If authenticated and doesn't need onboarding, redirect to dashboard
  if (isAuthenticated && !user?.needsOnboarding) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but needs onboarding, allow access to onboarding
  if (isAuthenticated && user?.needsOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
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

                <Route 
                  path="/onboarding" 
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } 
                />

                {/* Project Join Routes - FIXED: Added missing routes */}
                <Route 
                  path="/join/:inviteCode" 
                  element={
                    <ProtectedRoute>
                      <ProjectJoinPage />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/projects/:projectId/join" 
                  element={
                    <ProtectedRoute>
                      <ProjectJoinPage />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/projects/:projectId/challenge" 
                  element={
                    <ProtectedRoute>
                      <ProjectJoinPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Task Detail Route */}
                <Route 
                  path="/task/:taskId" 
                  element={
                    <ProtectedRoute>
                      <TaskDetail />
                    </ProtectedRoute>
                  } 
                />

                {/* GitHub OAuth Callback Route */}
                <Route 
                  path="/auth/github/callback" 
                  element={
                    <ProtectedRoute>
                      <GitHubOAuthCallback />
                    </ProtectedRoute>
                  } 
                />

                {/* Project Workspace Routes with ProjectLayout */}
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
                              
                {/* Redirect /project/:id to /project/:id/dashboard */}
                <Route 
                  path="/project/:projectId" 
                  element={<Navigate to="dashboard" replace />} 
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
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;