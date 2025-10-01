// frontend/src/pages/Profile.js - COMPLETE WITH ANIMATED BACKGROUND
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { User, Settings, Shield, Calendar, Target, Users, Eye, EyeOff, SquarePen } from 'lucide-react';

// Background symbols component with animations - MATCHING DASHBOARD
const BackgroundSymbols = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes floatAround1 {
        0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
        25% { transform: translate(30px, -20px) rotate(-5deg); }
        50% { transform: translate(-15px, 25px) rotate(-15deg); }
        75% { transform: translate(20px, 10px) rotate(-8deg); }
      }
      @keyframes floatAround2 {
        0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
        33% { transform: translate(-25px, 15px) rotate(-30deg); }
        66% { transform: translate(35px, -10px) rotate(-45deg); }
      }
      @keyframes floatAround3 {
        0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
        20% { transform: translate(-20px, -30px) rotate(40deg); }
        40% { transform: translate(25px, 20px) rotate(28deg); }
        60% { transform: translate(-10px, -15px) rotate(38deg); }
        80% { transform: translate(15px, 25px) rotate(30deg); }
      }
      @keyframes floatAround4 {
        0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
        50% { transform: translate(-40px, 30px) rotate(35deg); }
      }
      @keyframes floatAround5 {
        0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
        25% { transform: translate(20px, -25px) rotate(30deg); }
        50% { transform: translate(-30px, 20px) rotate(18deg); }
        75% { transform: translate(25px, 15px) rotate(28deg); }
      }
      @keyframes floatAround6 {
        0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
        33% { transform: translate(-15px, -20px) rotate(30deg); }
        66% { transform: translate(30px, 25px) rotate(20deg); }
      }
      @keyframes driftSlow {
        0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
        25% { transform: translate(-35px, 20px) rotate(-25deg); }
        50% { transform: translate(20px, -30px) rotate(-15deg); }
        75% { transform: translate(-10px, 35px) rotate(-22deg); }
      }
      @keyframes gentleDrift {
        0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
        50% { transform: translate(25px, -40px) rotate(-2deg); }
      }
      @keyframes spiralFloat {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(20px, -20px) rotate(5deg); }
        50% { transform: translate(0px, -40px) rotate(10deg); }
        75% { transform: translate(-20px, -20px) rotate(5deg); }
      }
      @keyframes waveMotion {
        0%, 100% { transform: translate(0, 0) rotate(15deg); }
        25% { transform: translate(30px, 10px) rotate(20deg); }
        50% { transform: translate(15px, -25px) rotate(10deg); }
        75% { transform: translate(-15px, 10px) rotate(18deg); }
      }
      @keyframes circularDrift {
        0%, 100% { transform: translate(0, 0) rotate(-45deg); }
        25% { transform: translate(25px, 0px) rotate(-40deg); }
        50% { transform: translate(25px, 25px) rotate(-50deg); }
        75% { transform: translate(0px, 25px) rotate(-42deg); }
      }
      .floating-symbol {
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }
      .floating-symbol:nth-child(1) { animation: floatAround1 15s infinite; }
      .floating-symbol:nth-child(2) { animation: floatAround2 18s infinite; animation-delay: -2s; }
      .floating-symbol:nth-child(3) { animation: floatAround3 12s infinite; animation-delay: -5s; }
      .floating-symbol:nth-child(4) { animation: floatAround4 20s infinite; animation-delay: -8s; }
      .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -3s; }
      .floating-symbol:nth-child(6) { animation: floatAround6 14s infinite; animation-delay: -7s; }
      .floating-symbol:nth-child(7) { animation: driftSlow 22s infinite; animation-delay: -10s; }
      .floating-symbol:nth-child(8) { animation: gentleDrift 19s infinite; animation-delay: -1s; }
      .floating-symbol:nth-child(9) { animation: spiralFloat 17s infinite; animation-delay: -6s; }
      .floating-symbol:nth-child(10) { animation: waveMotion 13s infinite; animation-delay: -4s; }
      .floating-symbol:nth-child(11) { animation: circularDrift 21s infinite; animation-delay: -9s; }
      .floating-symbol:nth-child(12) { animation: floatAround1 16s infinite; animation-delay: -2s; }
      .floating-symbol:nth-child(13) { animation: floatAround2 18s infinite; animation-delay: -11s; }
      .floating-symbol:nth-child(14) { animation: floatAround3 14s infinite; animation-delay: -5s; }
      .floating-symbol:nth-child(15) { animation: floatAround4 19s infinite; animation-delay: -7s; }
      .floating-symbol:nth-child(16) { animation: floatAround5 23s infinite; animation-delay: -3s; }
      .floating-symbol:nth-child(17) { animation: driftSlow 15s infinite; animation-delay: -8s; }
      .floating-symbol:nth-child(18) { animation: gentleDrift 17s infinite; animation-delay: -1s; }
      .floating-symbol:nth-child(19) { animation: spiralFloat 20s infinite; animation-delay: -12s; }
      .floating-symbol:nth-child(20) { animation: waveMotion 18s infinite; animation-delay: -6s; }
      .floating-symbol:nth-child(21) { animation: circularDrift 16s infinite; animation-delay: -4s; }
    `}} />
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      {[
        { left: '52.81%', top: '48.12%', color: '#2E3344' },
        { left: '28.19%', top: '71.22%', color: '#292A2E' },
        { left: '95.09%', top: '48.12%', color: '#ABB5CE' },
        { left: '86.46%', top: '15.33%', color: '#2E3344' },
        { left: '7.11%', top: '80.91%', color: '#ABB5CE' },
        { left: '48.06%', top: '8.5%', color: '#ABB5CE' },
        { left: '72.84%', top: '4.42%', color: '#2E3344' },
        { left: '9.6%', top: '0%', color: '#1F232E' },
        { left: '31.54%', top: '54.31%', color: '#6C758E' },
        { left: '25.28%', top: '15.89%', color: '#1F232E' },
        { left: '48.55%', top: '82.45%', color: '#292A2E' },
        { left: '24.41%', top: '92.02%', color: '#2E3344' },
        { left: '0%', top: '12.8%', color: '#ABB5CE' },
        { left: '81.02%', top: '94.27%', color: '#6C758E' },
        { left: '96.02%', top: '0%', color: '#2E3344' },
        { left: '0.07%', top: '41.2%', color: '#6C758E' },
        { left: '15%', top: '35%', color: '#3A4158' },
        { left: '65%', top: '25%', color: '#5A6B8C' },
        { left: '85%', top: '65%', color: '#2B2F3E' },
        { left: '42%', top: '35%', color: '#4F5A7A' },
        { left: '12%', top: '60%', color: '#8A94B8' }
      ].map((pos, i) => (
        <div key={i} className="floating-symbol" style={{
          position: 'absolute',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontStyle: 'normal',
          fontWeight: 900,
          fontSize: '24px',
          lineHeight: '29px',
          userSelect: 'none',
          pointerEvents: 'none',
          ...pos
        }}>&#60;/&#62;</div>
      ))}
    </div>
  </>
);

function Profile() {
  const { user, updateUser } = useAuth();
  const [editingSections, setEditingSections] = useState({
    personal: false,
    social: false
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: '',
    years_experience: 0
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [projectStats, setProjectStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    friends: 0,
    learningModules: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        github_username: user.github_username || '',
        linkedin_url: user.linkedin_url || '',
        years_experience: user.years_experience || 0
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingStats(true);
        const response = await projectService.getUserProjects();
        const projects = response.data.projects || [];
        
        const stats = {
          activeProjects: projects.filter(p => 
            p.status === 'active' || p.status === 'recruiting'
          ).length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          friends: 0,
          learningModules: 0
        };
        
        setProjectStats(stats);
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProjectStats();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const toggleSectionEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveProfile = async (section) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const cleanedData = {
        full_name: formData.full_name || '',
        bio: formData.bio || '',
        github_username: formData.github_username || '',
        linkedin_url: formData.linkedin_url || '',
        years_experience: formData.years_experience || 0
      };
      
      const response = await authService.updateProfile(cleanedData, token);
      
      if (response.success && response.data && response.data.user) {
        // Use updateUser with completeReplace flag
        await updateUser(response.data.user, true);
        
        setEditingSections(prev => ({
          ...prev,
          [section]: false
        }));
        showNotification('Profile updated successfully!', 'success');
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, token);
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setShowPasswords({ current: false, new: false, confirm: false });
      showNotification('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!user) return 0;
    
    const fields = [
      user.full_name,
      user.bio,
      user.github_username,
      user.years_experience > 0,
      user.programming_languages?.length > 0,
      user.topics?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px',
      marginLeft: '-150px'
    },
    notification: {
      padding: '12px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    notificationSuccess: {
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))',
      color: '#4ade80',
      borderColor: 'rgba(34, 197, 94, 0.3)'
    },
    notificationError: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    profileHeader: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '30px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    avatarLarge: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      flexShrink: 0,
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
    },
    userDetails: {
      flex: 1
    },
    userName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0'
    },
    userMeta: {
      color: '#9ca3af',
      fontSize: '14px',
      margin: '0 0 16px 0'
    },
    progressContainer: {
      marginTop: '12px'
    },
    progressLabel: {
      fontSize: '14px',
      color: '#d1d5db',
      marginBottom: '6px'
    },
    progressBar: {
      width: '200px',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      transition: 'width 0.3s ease'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
      alignItems: 'start'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    section: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#d1d5db'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)'
    },
    primaryButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginRight: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    changePasswordButton: {
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      backdropFilter: 'blur(20px)',
      padding: '16px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#3b82f6',
      margin: '0 0 4px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#9ca3af',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    overviewSection: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    overviewTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userInfoContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    userInfoSection: {
      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
      border: '1px solid rgba(51, 65, 85, 0.25)',
      borderRadius: '12px',
      padding: '16px',
      backdropFilter: 'blur(20px)'
    },
    userInfoTitle: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white'
    },
    userInfoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '12px'
    },
    userInfoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    userInfoLabel: {
      fontSize: '12px',
      color: '#9ca3af',
      fontWeight: '500'
    },
    userInfoValue: {
      fontSize: '14px',
      color: '#d1d5db',
      fontWeight: '400'
    },
    bioSection: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    bioText: {
      margin: '4px 0 0 0',
      fontSize: '14px',
      color: '#d1d5db',
      lineHeight: '1.4'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    languageTag: {
      display: 'inline-flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
      color: '#93c5fd',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      gap: '4px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    topicTag: {
      display: 'inline-flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
      color: '#4ade80',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      gap: '4px',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    },
    skillLevel: {
      fontSize: '10px',
      opacity: 0.8
    },
    emptySkills: {
      color: '#9ca3af',
      fontSize: '14px',
      fontStyle: 'italic'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    dashboardStatCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#3b82f6',
      marginBottom: '5px'
    },
    statLabelDashboard: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    activitySection: {
      background: 'rgba(26, 28, 32, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      backdropFilter: 'blur(20px)'
    },
    emptyState: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '14px',
      padding: '40px 20px'
    },
    passwordSection: {
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
      borderRadius: '12px',
      border: '1px solid rgba(51, 65, 85, 0.25)',
      backdropFilter: 'blur(20px)'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%',
      padding: '12px 50px 12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)'
    },
    eyeToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.3s ease',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <BackgroundSymbols />

      {notification.message && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? 
            styles.notificationSuccess : styles.notificationError)
        }}>
          {notification.message}
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>
            <User size={28} style={{ color: '#3b82f6' }} />
            Profile
          </h1>
        </div>

        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 
             user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={styles.userDetails}>
            <h2 style={styles.userName}>
              {user?.full_name || user?.username || 'User'}
            </h2>
            <p style={styles.userMeta}>
              @{user?.username} • Joined {new Date(user?.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div style={styles.progressContainer}>
              <div style={styles.progressLabel}>
                Profile Completion: {getProfileCompletionPercentage()}%
              </div>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${getProfileCompletionPercentage()}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.overviewSection}>
        <h3 style={styles.overviewTitle}>
          <Target size={20} style={{ color: '#3b82f6' }} />
          Dashboard Overview
        </h3>
        
        <div style={styles.userInfoContainer}>
          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>
              <User size={16} style={{ color: '#3b82f6', marginRight: '8px' }} />
              Profile Info
            </h4>
            <div style={styles.userInfoGrid}>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Experience:</span>
                <span style={styles.userInfoValue}>{user?.years_experience || 0} years</span>
              </div>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Username:</span>
                <span style={styles.userInfoValue}>@{user?.username}</span>
              </div>
              <div style={styles.userInfoItem}>
                <span style={styles.userInfoLabel}>Email:</span>
                <span style={styles.userInfoValue}>{user?.email}</span>
              </div>
              {user?.github_username && (
                <div style={styles.userInfoItem}>
                  <span style={styles.userInfoLabel}>GitHub:</span>
                  <span style={styles.userInfoValue}>@{user.github_username}</span>
                </div>
              )}
            </div>
            
            {user?.bio && (
              <div style={styles.bioSection}>
                <span style={styles.userInfoLabel}>Bio:</span>
                <p style={styles.bioText}>{user.bio}</p>
              </div>
            )}
          </div>

          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>Programming Languages</h4>
            {user?.programming_languages && user.programming_languages.length > 0 ? (
              <div style={styles.skillsContainer}>
                {user.programming_languages.map(lang => (
                  <span key={lang.id} style={styles.languageTag}>
                    {lang.programming_languages?.name || lang.name}
                    <span style={styles.skillLevel}>({lang.proficiency_level})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.emptySkills}>No programming languages added yet</p>
            )}
          </div>

          <div style={styles.userInfoSection}>
            <h4 style={styles.userInfoTitle}>Areas of Interest</h4>
            {user?.topics && user.topics.length > 0 ? (
              <div style={styles.skillsContainer}>
                {user.topics.map(topic => (
                  <span key={topic.id} style={styles.topicTag}>
                    {topic.topics?.name || topic.name}
                    <span style={styles.skillLevel}>({topic.interest_level})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.emptySkills}>No topics selected yet</p>
            )}
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.activeProjects}
            </div>
            <div style={styles.statLabelDashboard}>Active Projects</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.completedProjects}
            </div>
            <div style={styles.statLabelDashboard}>Completed Projects</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.friends}
            </div>
            <div style={styles.statLabelDashboard}>Friends</div>
          </div>
          <div style={styles.dashboardStatCard}>
            <div style={styles.statValue}>
              {loadingStats ? '...' : projectStats.learningModules}
            </div>
            <div style={styles.statLabelDashboard}>Learning Modules</div>
          </div>
        </div>

        <div style={styles.activitySection}>
          <h3 style={styles.sectionTitle}>
            <Target size={18} style={{ color: '#10b981' }} />
            Recent Activity
          </h3>
          <div style={styles.emptyState}>
            No recent activity yet. Start by joining a project or connecting with other developers!
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.mainContent}>
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{...styles.sectionTitle, margin: 0}}>
                <User size={18} style={{ color: '#3b82f6' }} />
                Personal Information
              </h3>
              <button
                onClick={() => toggleSectionEdit('personal')}
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.25)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <SquarePen size={16} />
              </button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              {editingSections.personal ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your full name"
                />
              ) : (
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                  {user?.full_name || 'Not specified'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              {editingSections.personal ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>
                  {user?.bio || 'No bio provided'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Years of Experience</label>
              {editingSections.personal ? (
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="0"
                  max="50"
                />
              ) : (
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                  {user?.years_experience || 0} years
                </p>
              )}
            </div>

            {editingSections.personal && (
              <div>
                <button
                  style={styles.primaryButton}
                  onClick={() => handleSaveProfile('personal')}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => toggleSectionEdit('personal')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{...styles.sectionTitle, margin: 0}}>
                <Users size={18} style={{ color: '#10b981' }} />
                Social Links
              </h3>
              <button
                onClick={() => toggleSectionEdit('social')}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.25)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <SquarePen size={16} />
              </button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>GitHub Username</label>
              {editingSections.social ? (
                <input
                  type="text"
                  name="github_username"
                  value={formData.github_username}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your GitHub username"
                />
              ) : (
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                  {user?.github_username ? (
                    <a 
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      @{user.github_username}
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>LinkedIn URL</label>
              {editingSections.social ? (
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                  {user?.linkedin_url ? (
                    <a 
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      View LinkedIn Profile
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>

            {editingSections.social && (
              <div>
                <button
                  style={styles.primaryButton}
                  onClick={() => handleSaveProfile('social')}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => toggleSectionEdit('social')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Shield size={18} style={{ color: '#f59e0b' }} />
              Security
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>••••••••</span>
                <button
                  style={styles.changePasswordButton}
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>

            {showChangePassword && (
              <div style={styles.passwordSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={styles.passwordInput}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      style={styles.eyeToggle}
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#9ca3af';
                      }}
                    >
                      {showPasswords.current ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={styles.passwordInput}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      style={styles.eyeToggle}
                      onClick={() => setShowPasswords(prev => ({ 
                        ...prev, 
                        new: !prev.new,
                        confirm: !prev.confirm 
                      }))}
                      onMouseEnter={(e) => { e.target.style.color = '#d1d5db'; }}
                      onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; }}
                    >
                      {showPasswords.new ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={styles.passwordInput}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      style={styles.eyeToggle}
                      onClick={() => setShowPasswords(prev => ({ 
                        ...prev, 
                        new: !prev.new,
                        confirm: !prev.new 
                      }))}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#9ca3af';
                      }}
                    >
                      {showPasswords.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    style={styles.primaryButton}
                    onClick={handleChangePassword}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#4b5563';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#6b7280';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Settings size={18} style={{ color: '#8b5cf6' }} />
              Quick Stats
            </h3>
            
            <div style={styles.statCard}>
              <h4 style={styles.statNumber}>{getProfileCompletionPercentage()}%</h4>
              <p style={styles.statLabel}>Profile Complete</p>
            </div>
            
            <div style={{ marginTop: '12px', ...styles.statCard }}>
              <h4 style={styles.statNumber}>
                {user?.years_experience || 0}
              </h4>
              <p style={styles.statLabel}>Years Experience</p>
            </div>

            <div style={{ marginTop: '12px', ...styles.statCard }}>
              <h4 style={styles.statNumber}>
                {new Date().getFullYear() - new Date(user?.created_at).getFullYear()}
              </h4>
              <p style={styles.statLabel}>Years on Platform</p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Calendar size={18} style={{ color: '#06b6d4' }} />
              Account Information
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Member Since</label>
              <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Last Updated</label>
              <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                {new Date(user?.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label style={styles.label}>Account ID</label>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace' }}>
                {user?.id}
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Profile Tips</h3>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(20px)'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '500', color: '#d1d5db' }}>
                Complete your profile to:
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6', color: '#9ca3af' }}>
                <li>Get better project recommendations</li>
                <li>Connect with like-minded collaborators</li>
                <li>Showcase your skills and experience</li>
                <li>Build your professional network</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .content {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;