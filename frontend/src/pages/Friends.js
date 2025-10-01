// frontend/src/pages/Friends.js - ALIGNED WITH DASHBOARD THEME AND ANIMATED BACKGROUND
import React, { useState, useEffect } from 'react';
import { friendsService } from '../services/friendsService';
import { Users, UserPlus, UserCheck, UserX, User, Clock, Mail } from 'lucide-react';

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
      @keyframes globalLogoRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .global-loading-spinner {
        animation: globalLogoRotate 2s linear infinite;
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
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '52.81%', top: '48.12%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '28.19%', top: '71.22%', color: '#292A2E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '95.09%', top: '48.12%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '86.46%', top: '15.33%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '7.11%', top: '80.91%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '48.06%', top: '8.5%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '72.84%', top: '4.42%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '9.6%', top: '0%', color: '#1F232E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '31.54%', top: '54.31%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '25.28%', top: '15.89%', color: '#1F232E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '48.55%', top: '82.45%', color: '#292A2E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '24.41%', top: '92.02%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '0%', top: '12.8%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '81.02%', top: '94.27%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '96.02%', top: '0%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '0.07%', top: '41.2%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '15%', top: '35%', color: '#3A4158'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '65%', top: '25%', color: '#5A6B8C'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '85%', top: '65%', color: '#2B2F3E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '42%', top: '35%', color: '#4F5A7A'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '12%', top: '60%', color: '#8A94B8'
      }}>&#60;/&#62;</div>
    </div>
  </>
);

function Friends() {
  const [friendsData, setFriendsData] = useState({
    friends: [],
    sentRequests: [],
    receivedRequests: [],
    counts: { friends: 0, sentRequests: 0, receivedRequests: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const colorVariants = ['slate', 'zinc', 'neutral', 'stone', 'gray', 'blue'];

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await friendsService.getFriends();
      
      if (response.success) {
        setFriendsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError(error.response?.data?.message || 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      const response = await friendsService.acceptFriendRequest(friendshipId);
      
      if (response.success) {
        await fetchFriends();
      } else {
        alert(response.message || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert(error.response?.data?.message || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      const response = await friendsService.rejectFriendRequest(friendshipId);
      
      if (response.success) {
        await fetchFriends();
      } else {
        alert(response.message || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert(error.response?.data?.message || 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    try {
      const response = await friendsService.removeFriend(friendshipId);
      
      if (response.success) {
        await fetchFriends();
      } else {
        alert(response.message || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert(error.response?.data?.message || 'Failed to remove friend');
    }
  };

  const handleViewProfile = (friend) => {
    setSelectedFriend(friend);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedFriend(null);
  };

  const renderFriendCard = (friend, index) => {
    const colorVariant = colorVariants[index % colorVariants.length];
    const cardColorStyles = styles.cardVariants[colorVariant] || styles.cardVariants.slate;

    return (
      <div
        key={friend.id}
        style={{
          ...styles.friendCard,
          ...cardColorStyles.base
        }}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, cardColorStyles.hover);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, cardColorStyles.base);
        }}
      >
        <div style={styles.friendHeader}>
          <div 
            style={styles.clickableSection}
            onClick={() => handleViewProfile(friend)}
          >
            <div style={styles.friendAvatar}>
              {friend.avatar_url ? (
                <img 
                  src={friend.avatar_url} 
                  alt={friend.full_name} 
                  style={{width: '100%', height: '100%', borderRadius: '50%'}} 
                />
              ) : (
                (friend.full_name || friend.username || 'F').charAt(0).toUpperCase()
              )}
            </div>
            <div style={styles.friendInfo}>
              <h3 style={styles.friendName}>{friend.full_name || friend.username}</h3>
              <div style={styles.friendMeta}>
                <div style={styles.metaItem}>
                  <User size={14} />
                  <span>GitHub: {friend.github_username || 'Not provided'}</span>
                </div>
                <div style={styles.metaItem}>
                  <Clock size={14} />
                  <span>Experience: {friend.years_experience ? `${friend.years_experience} years` : 'Not specified'}</span>
                </div>
                <div style={{...styles.metaItem, ...styles.friendsSince}}>
                  <UserCheck size={14} />
                  <span>Friends since: {new Date(friend.friendsSince).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            style={styles.removeButton}
            onClick={() => handleRemoveFriend(friend.friendshipId, friend.full_name || friend.username)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#c53030';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc3545';
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  const renderRequestCard = (request, index, type) => {
    const colorVariant = colorVariants[index % colorVariants.length];
    const cardColorStyles = styles.cardVariants[colorVariant] || styles.cardVariants.slate;

    return (
      <div
        key={request.id}
        style={{
          ...styles.requestCard,
          ...cardColorStyles.base
        }}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, cardColorStyles.hover);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, cardColorStyles.base);
        }}
      >
        <div style={styles.requestHeader}>
          <div 
            style={styles.clickableSection}
            onClick={() => handleViewProfile(request)}
          >
            <div style={styles.requestAvatar}>
              {request.avatar_url ? (
                <img 
                  src={request.avatar_url} 
                  alt={request.full_name} 
                  style={{width: '100%', height: '100%', borderRadius: '50%'}} 
                />
              ) : (
                (request.full_name || request.username || 'R').charAt(0).toUpperCase()
              )}
            </div>
            <div style={styles.requestInfo}>
              <h3 style={styles.requestName}>{request.full_name || request.username}</h3>
              <div style={styles.requestMeta}>
                <div style={styles.metaItem}>
                  <User size={14} />
                  <span>GitHub: {request.github_username || 'Not provided'}</span>
                </div>
                <div style={styles.metaItem}>
                  <Clock size={14} />
                  <span>Experience: {request.years_experience ? `${request.years_experience} years` : 'Not specified'}</span>
                </div>
                <div style={{...styles.metaItem, ...styles.requestDate}}>
                  <Mail size={14} />
                  <span>
                    {type === 'received' ? 'Requested' : 'Sent'}: {' '}
                    {new Date(type === 'received' ? request.requestReceived : request.requestSent).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.requestActions}>
            {type === 'received' ? (
              <>
                <button
                  style={styles.acceptButton}
                  onClick={() => handleAcceptRequest(request.friendshipId)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#22c55e';
                  }}
                >
                  Accept
                </button>
                <button
                  style={styles.rejectButton}
                  onClick={() => handleRejectRequest(request.friendshipId)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c53030';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                  }}
                >
                  Reject
                </button>
              </>
            ) : (
              <span style={styles.pendingLabel}>
                <Clock size={14} />
                Pending
              </span>
            )}
          </div>
        </div>
      </div>
    );
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
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 10px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#d1d5db',
      margin: '0',
      lineHeight: '1.6'
    },
    loadingMessage: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#9ca3af'
    },
    errorMessage: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      padding: '15px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      backdropFilter: 'blur(20px)'
    },
    stats: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      backdropFilter: 'blur(20px)',
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#60a5fa',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#d1d5db',
      fontWeight: '500'
    },
    tabs: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      marginBottom: '30px',
      gap: '12px'
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      color: '#E8EDF9',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeTab: {
      backgroundColor: '#1a1d24',
      color: '#E8EDF9'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      minHeight: '400px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '16px',
      lineHeight: '1.6'
    },
    friendsGrid: {
      display: 'grid',
      gap: '20px'
    },
    requestsGrid: {
      display: 'grid',
      gap: '20px'
    },
    friendCard: {
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    requestCard: {
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    cardVariants: {
      slate: {
        base: {
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
          border: '1px solid rgba(51, 65, 85, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(51, 65, 85, 0.25)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.18), rgba(30, 41, 59, 0.12))'
        }
      },
      zinc: {
        base: {
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.12), rgba(39, 39, 42, 0.08))',
          border: '1px solid rgba(63, 63, 70, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(63, 63, 70, 0.25)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.18), rgba(39, 39, 42, 0.12))'
        }
      },
      neutral: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        }
      },
      stone: {
        base: {
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.12), rgba(41, 37, 36, 0.08))',
          border: '1px solid rgba(68, 64, 60, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(68, 64, 60, 0.25)',
          border: '1px solid rgba(68, 64, 60, 0.4)',
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.18), rgba(41, 37, 36, 0.12))'
        }
      },
      gray: {
        base: {
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.12), rgba(31, 41, 55, 0.08))',
          border: '1px solid rgba(55, 65, 81, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(55, 65, 81, 0.25)',
          border: '1px solid rgba(55, 65, 81, 0.4)',
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.18), rgba(31, 41, 55, 0.12))'
        }
      },
      blue: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        }
      }
    },
    friendHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    requestHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    friendAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)'
    },
    requestAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)'
    },
    friendInfo: {
      flex: 1,
      minWidth: 0
    },
    requestInfo: {
      flex: 1,
      minWidth: 0
    },
    friendName: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 8px 0'
    },
    requestName: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 8px 0'
    },
    friendMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    requestMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      color: '#d1d5db'
    },
    friendsSince: {
      color: '#10b981'
    },
    requestDate: {
      color: '#f59e0b'
    },
    removeButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    requestActions: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    acceptButton: {
      backgroundColor: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    rejectButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    pendingLabel: {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
      color: '#fbbf24',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    clickableSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flex: 1,
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
      borderRadius: '12px',
      padding: '4px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#1a1c20',
      borderRadius: '16px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 24px 0 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#9ca3af',
      padding: '0',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.3s ease'
    },
    profileContent: {
      padding: '24px'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '30px'
    },
    profileAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      flexShrink: 0,
      border: '3px solid rgba(96, 165, 250, 0.3)'
    },
    profileInfo: {
      flex: 1
    },
    profileName: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 5px 0'
    },
    profileUsername: {
      fontSize: '16px',
      color: '#9ca3af',
      margin: 0
    },
    profileDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    detailSection: {
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '16px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 12px 0'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    detailLabel: {
      fontSize: '14px',
      color: '#9ca3af',
      fontWeight: '500',
      minWidth: '120px'
    },
    detailValue: {
      fontSize: '14px',
      color: '#d1d5db',
      textAlign: 'right',
      flex: 1,
      wordBreak: 'break-word'
    },
    profileLink: {
      color: '#60a5fa',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loadingMessage}>
          <div style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="global-loading-spinner">
            <img 
              src="/images/logo/TechSyncLogo.png" 
              alt="TechSync Logo" 
              style={{
                width: '125%',
                height: '125%',
                objectFit: 'contain'
              }}
            />
          </div>
          <span>Loading friends...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <BackgroundSymbols />

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Users size={28} style={{ color: '#3b82f6' }} />
          Friends
        </h1>
        <p style={styles.subtitle}>
          Manage your friends and friend requests
        </p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <div style={styles.stats}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{friendsData.counts.friends}</div>
          <div style={styles.statLabel}>Friends</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{friendsData.counts.receivedRequests}</div>
          <div style={styles.statLabel}>Pending Requests</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={styles.statNumber}>{friendsData.counts.sentRequests}</div>
          <div style={styles.statLabel}>Sent Requests</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'friends' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('friends')}
        >
          <UserCheck size={16} />
          Friends ({friendsData.counts.friends})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'received' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('received')}
        >
          <UserPlus size={16} />
          Requests ({friendsData.counts.receivedRequests})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'sent' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('sent')}
        >
          <Clock size={16} />
          Sent ({friendsData.counts.sentRequests})
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'friends' && (
          <div>
            {friendsData.friends.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👥</div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                  You don't have any friends yet.
                </div>
                <p style={{ margin: 0 }}>
                  Add friends by going to projects and sending friend requests to other members!
                </p>
              </div>
            ) : (
              <div style={styles.friendsGrid}>
                {friendsData.friends.map((friend, index) => renderFriendCard(friend, index))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div>
            {friendsData.receivedRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📨</div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                  No pending friend requests.
                </div>
              </div>
            ) : (
              <div style={styles.requestsGrid}>
                {friendsData.receivedRequests.map((request, index) => renderRequestCard(request, index, 'received'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div>
            {friendsData.sentRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📤</div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                  No sent requests.
                </div>
              </div>
            ) : (
              <div style={styles.requestsGrid}>
                {friendsData.sentRequests.map((request, index) => renderRequestCard(request, index, 'sent'))}
              </div>
            )}
          </div>
        )}
      </div>

      {showProfileModal && selectedFriend && (
        <div style={styles.modalOverlay} onClick={closeProfileModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>User Profile</h2>
              <button 
                style={styles.closeButton} 
                onClick={closeProfileModal}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.profileContent}>
              <div style={styles.profileHeader}>
                <div style={styles.profileAvatar}>
                  {selectedFriend.avatar_url ? (
                    <img 
                      src={selectedFriend.avatar_url} 
                      alt={selectedFriend.full_name} 
                      style={{width: '100%', height: '100%', borderRadius: '50%'}} 
                    />
                  ) : (
                    (selectedFriend.full_name || selectedFriend.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={styles.profileInfo}>
                  <h3 style={styles.profileName}>
                    {selectedFriend.full_name || selectedFriend.username}
                  </h3>
                  <p style={styles.profileUsername}>@{selectedFriend.username}</p>
                </div>
              </div>

              <div style={styles.profileDetails}>
                <div style={styles.detailSection}>
                  <h4 style={styles.sectionTitle}>About</h4>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Bio:</span>
                    <span style={styles.detailValue}>
                      {selectedFriend.bio || 'No bio provided'}
                    </span>
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h4 style={styles.sectionTitle}>Experience</h4>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Years of Experience:</span>
                    <span style={styles.detailValue}>
                      {selectedFriend.years_experience ? `${selectedFriend.years_experience} years` : 'Not specified'}
                    </span>
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h4 style={styles.sectionTitle}>Links</h4>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>GitHub:</span>
                    <span style={styles.detailValue}>
                      {selectedFriend.github_username ? (
                        <a 
                          href={`https://github.com/${selectedFriend.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.profileLink}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#93c5fd';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#60a5fa';
                          }}
                        >
                          {selectedFriend.github_username}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>LinkedIn:</span>
                    <span style={styles.detailValue}>
                      {selectedFriend.linkedin_url ? (
                        <a 
                          href={selectedFriend.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.profileLink}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#93c5fd';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#60a5fa';
                          }}
                        >
                          View Profile
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </span>
                  </div>
                </div>

                {selectedFriend.friendsSince && (
                  <div style={styles.detailSection}>
                    <h4 style={styles.sectionTitle}>Friendship</h4>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Friends since:</span>
                      <span style={styles.detailValue}>
                        {new Date(selectedFriend.friendsSince).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;