import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './pages/Layout';
import ProjectLayout from './pages/ProjectLayout';
import LandingPage from './pages/LandingPage';
import DevelopersPage from './pages/DevelopersPage';
import Features from './pages/Features';
import AboutPage from './pages/AboutPage';
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


// Solo project components
import SoloProjectLayout from './pages/soloproject/SoloProjectLayout';
import SoloProjectDashboard from './pages/soloproject/SoloProjectDashboard';
import SoloProjectGoals from './pages/soloproject/SoloProjectGoals';
import SoloProjectInfo from './pages/soloproject/SoloProjectInfo';
import SoloProjectNotes from './pages/soloproject/SoloProjectNotes';
import SoloWeeklyChallenge from './pages/soloproject/SoloWeeklyChallenge';


// Project workspace components
import ProjectDashboard from './pages/project/ProjectDashboard';
import ProjectTasks from './pages/project/ProjectTasks';
import ProjectChats from './pages/project/ProjectChats';
import ProjectFiles from './pages/project/ProjectFiles';
import ProjectMembers from './pages/project/ProjectMembers';

// friends

import Friends from './pages/Friends';

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Placeholder components for missing pages
const Learns = () => <div style={{ padding: '30px' }}>Learning resources coming soon...</div>;
const Help = () => <div style={{ padding: '30px' }}>Help center coming soon...</div>;

// Themed Loading Component
const ThemedLoadingScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .loading-spinner {
            animation: rotate 2s linear infinite;
          }
          
          .loading-text {
            animation: pulse 1.5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Elements - same as landing page */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.02}
        />
        <path
          d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.015}
        />
      </svg>

      {/* Code symbols background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
        </div>
      </div>

      {/* Main Loading Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            borderRadius: '6px',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="loading-spinner">
            <div style={{
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '3px',
              transform: 'rotate(-45deg)'
            }} />
          </div>
          <span style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '-0.025em'
          }}>TechSync</span>
        </div>

        {/* Loading Text */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          color: '#d1d5db',
          margin: '0 0 1rem 0'
        }} className="loading-text">
          Loading...
        </h2>

        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '60px',
            height: '100%',
            backgroundColor: '#60a5fa',
            borderRadius: '2px',
            animation: 'slideProgress 1.5s ease-in-out infinite',
            background: 'linear-gradient(to right, #60a5fa, #3b82f6)'
          }} />
        </div>

        <style>
          {`
            @keyframes slideProgress {
              0% {
                transform: translateX(-100px);
              }
              50% {
                transform: translateX(140px);
              }
              100% {
                transform: translateX(-100px);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <ThemedLoadingScreen />;
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

// Public Route Component - UPDATED
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <ThemedLoadingScreen />;
  }
  
  // If authenticated and doesn't need onboarding, redirect to dashboard
  if (isAuthenticated && !user?.needsOnboarding) {
    return <Navigate to="/dashboard" replace />;
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
            <ScrollToTop />
            <div className="App">
              <Routes>
                {/* Landing Page Route - Shows to non-authenticated users */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/developerspage" 
                  element={
                    <PublicRoute>
                      <DevelopersPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/features" 
                  element={
                    <PublicRoute>
                      <Features />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/aboutpage" 
                  element={
                    <PublicRoute>
                      <AboutPage />
                    </PublicRoute>
                  } 
                />
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

                {/* Project Join Routes */}
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
                
                {/* Solo Project Workspace Routes with SoloProjectLayout */}
                <Route 
                  path="/soloproject/:projectId/dashboard" 
                  element={
                    <ProtectedRoute>
                      <SoloProjectLayout>
                        <SoloProjectDashboard />
                      </SoloProjectLayout>
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/soloproject/:projectId/goals" 
                  element={
                    <ProtectedRoute>
                      <SoloProjectLayout>
                        <SoloProjectGoals />
                      </SoloProjectLayout>
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/soloproject/:projectId/info" 
                  element={
                    <ProtectedRoute>
                      <SoloProjectLayout>
                        <SoloProjectInfo />
                      </SoloProjectLayout>
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/soloproject/:projectId/notes" 
                  element={
                    <ProtectedRoute>
                      <SoloProjectLayout>
                        <SoloProjectNotes />
                      </SoloProjectLayout>
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/soloproject/:projectId/challenge" 
                  element={
                    <ProtectedRoute>
                      <SoloProjectLayout>
                        <SoloWeeklyChallenge />
                      </SoloProjectLayout>
                    </ProtectedRoute>
                  } 
                />

                {/* Redirect /soloproject/:id to /soloproject/:id/dashboard */}
                <Route 
                  path="/soloproject/:projectId" 
                  element={<Navigate to="dashboard" replace />} 
                />
                
                {/* Dashboard route for authenticated users */}
                <Route 
                  path="/dashboard" 
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