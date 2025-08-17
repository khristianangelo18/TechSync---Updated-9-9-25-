// frontend/src/pages/Friends.js
import React, { useState, useEffect } from 'react';
import { friendsService } from '../services/friendsService';

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
        await fetchFriends(); // Refresh the data
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
        await fetchFriends(); // Refresh the data
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
        await fetchFriends(); // Refresh the data
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading friends...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Friends</h1>
        <p style={styles.subtitle}>
          Manage your friends and friend requests
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{friendsData.counts.friends}</div>
          <div style={styles.statLabel}>Friends</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{friendsData.counts.receivedRequests}</div>
          <div style={styles.statLabel}>Pending Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{friendsData.counts.sentRequests}</div>
          <div style={styles.statLabel}>Sent Requests</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'friends' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friendsData.counts.friends})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'received' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('received')}
        >
          Requests ({friendsData.counts.receivedRequests})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'sent' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({friendsData.counts.sentRequests})
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'friends' && (
          <div>
            {friendsData.friends.length === 0 ? (
              <div style={styles.emptyState}>
                <p>You don't have any friends yet.</p>
                <p>Add friends by going to projects and sending friend requests to other members!</p>
              </div>
            ) : (
              <div style={styles.friendsGrid}>
                {friendsData.friends.map((friend) => (
                  <div key={friend.id} style={styles.friendCard}>
                    <div style={styles.friendHeader}>
                      <div 
                        style={styles.clickableSection}
                        onClick={() => handleViewProfile(friend)}
                      >
                        <div style={styles.friendAvatar}>
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt={friend.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                          ) : (
                            (friend.full_name || friend.username || 'F').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div style={styles.friendInfo}>
                          <h3 style={styles.friendName}>{friend.full_name || friend.username}</h3>
                          <div style={styles.friendMeta}>
                            <div>GitHub: {friend.github_username || 'Not provided'}</div>
                            <div>Experience: {friend.years_experience ? `${friend.years_experience} years` : 'Not specified'}</div>
                            <div style={styles.friendsSince}>
                              Friends since: {new Date(friend.friendsSince).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        style={styles.removeButton}
                        onClick={() => handleRemoveFriend(friend.friendshipId, friend.full_name || friend.username)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div>
            {friendsData.receivedRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No pending friend requests.</p>
              </div>
            ) : (
              <div style={styles.requestsGrid}>
                {friendsData.receivedRequests.map((request) => (
                  <div key={request.id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <div 
                        style={styles.clickableSection}
                        onClick={() => handleViewProfile(request)}
                      >
                        <div style={styles.requestAvatar}>
                          {request.avatar_url ? (
                            <img src={request.avatar_url} alt={request.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                          ) : (
                            (request.full_name || request.username || 'R').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div style={styles.requestInfo}>
                          <h3 style={styles.requestName}>{request.full_name || request.username}</h3>
                          <div style={styles.requestMeta}>
                            <div>GitHub: {request.github_username || 'Not provided'}</div>
                            <div>Experience: {request.years_experience ? `${request.years_experience} years` : 'Not specified'}</div>
                            <div style={styles.requestDate}>
                              Requested: {new Date(request.requestReceived).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={styles.requestActions}>
                        <button
                          style={styles.acceptButton}
                          onClick={() => handleAcceptRequest(request.friendshipId)}
                        >
                          Accept
                        </button>
                        <button
                          style={styles.rejectButton}
                          onClick={() => handleRejectRequest(request.friendshipId)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div>
            {friendsData.sentRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No sent requests.</p>
              </div>
            ) : (
              <div style={styles.requestsGrid}>
                {friendsData.sentRequests.map((request) => (
                  <div key={request.id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <div 
                        style={styles.clickableSection}
                        onClick={() => handleViewProfile(request)}
                      >
                        <div style={styles.requestAvatar}>
                          {request.avatar_url ? (
                            <img src={request.avatar_url} alt={request.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                          ) : (
                            (request.full_name || request.username || 'S').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div style={styles.requestInfo}>
                          <h3 style={styles.requestName}>{request.full_name || request.username}</h3>
                          <div style={styles.requestMeta}>
                            <div>GitHub: {request.github_username || 'Not provided'}</div>
                            <div>Experience: {request.years_experience ? `${request.years_experience} years` : 'Not specified'}</div>
                            <div style={styles.requestDate}>
                              Sent: {new Date(request.requestSent).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={styles.requestActions}>
                        <span style={styles.pendingLabel}>Pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedFriend && (
        <div style={styles.modalOverlay} onClick={closeProfileModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>User Profile</h2>
              <button style={styles.closeButton} onClick={closeProfileModal}>
                ×
              </button>
            </div>
            
            <div style={styles.profileContent}>
              {/* Profile Header */}
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

              {/* Profile Details */}
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

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0'
  },
  loadingMessage: {
    padding: '40px',
    textAlign: 'center',
    color: '#666'
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #e9ecef',
    marginBottom: '30px'
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '16px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    color: '#007bff',
    borderBottomColor: '#007bff'
  },
  content: {
    minHeight: '400px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
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
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease'
  },
  requestCard: {
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease'
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
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  requestAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0
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
    color: '#333',
    margin: '0 0 8px 0'
  },
  requestName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 8px 0'
  },
  friendMeta: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4'
  },
  requestMeta: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4'
  },
  friendsSince: {
    color: '#28a745',
    fontWeight: '500',
    marginTop: '4px'
  },
  requestDate: {
    color: '#ffc107',
    fontWeight: '500',
    marginTop: '4px'
  },
  removeButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  requestActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  acceptButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  pendingLabel: {
    backgroundColor: '#ffc107',
    color: '#856404',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  clickableSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 0.8
    }
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 0 20px',
    borderBottom: '1px solid #e9ecef'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  },
  profileContent: {
    padding: '20px'
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
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 5px 0'
  },
  profileUsername: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  detailSection: {
    borderBottom: '1px solid #f1f3f4',
    paddingBottom: '15px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 10px 0'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    minWidth: '120px'
  },
  detailValue: {
    fontSize: '14px',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    wordBreak: 'break-word'
  },
  profileLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500'
  }
};

export default Friends;