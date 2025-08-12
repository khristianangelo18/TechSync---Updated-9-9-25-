// frontend/src/pages/project/ProjectFiles.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { githubService } from '../../services/githubService';

function ProjectFiles() {
  const { projectId } = useParams();
  
  // State management
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUser, setGitHubUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [projectRepository, setProjectRepository] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState([]);
  const [fileContents, setFileContents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRepositorySelector, setShowRepositorySelector] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);

  // Check GitHub connection status
  const checkGitHubConnection = useCallback(async () => {
    try {
      setLoading(true);
      const userResponse = await githubService.getGitHubUser();
      if (userResponse.success) {
        setIsGitHubConnected(true);
        setGitHubUser(userResponse.data);
      }
    } catch (error) {
      setIsGitHubConnected(false);
      setGitHubUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkProjectRepository = useCallback(async () => {
    try {
      const response = await githubService.getProjectRepository(projectId);
      if (response.success) {
        setProjectRepository(response.data);
        try {
          await loadRepositoryContents(response.data.repository_full_name, response.data.branch || 'main');
          setCurrentBranch(response.data.branch || 'main');
        } catch (contentError) {
          // Repository exists but user doesn't have access
          console.log('Repository access error:', contentError);
          setError('access_denied');
        }
      }
    } catch (error) {
      // No repository connected to project yet
      setProjectRepository(null);
    }
  }, [projectId]);

  useEffect(() => {
    checkGitHubConnection();
    checkProjectRepository();
  }, [checkGitHubConnection, checkProjectRepository]);

  const handleGitHubConnect = async () => {
    try {
      const response = await githubService.getOAuthURL();
      if (response.success) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      setError('Failed to initiate GitHub connection');
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await githubService.disconnectGitHub();
      setIsGitHubConnected(false);
      setGitHubUser(null);
      setRepositories([]);
      setProjectRepository(null);
      setFileContents([]);
      setSelectedFile(null);
      setFileContent('');
    } catch (error) {
      setError('Failed to disconnect GitHub account');
    }
  };

  const loadUserRepositories = async () => {
    try {
      setLoadingRepositories(true);
      const response = await githubService.getUserRepositories({ per_page: 50, sort: 'updated' });
      if (response.success) {
        setRepositories(response.data);
        setShowRepositorySelector(true);
      }
    } catch (error) {
      setError('Failed to load repositories');
    } finally {
      setLoadingRepositories(false);
    }
  };

  const connectRepositoryToProject = async (repository) => {
    try {
      const response = await githubService.connectRepositoryToProject(
        projectId, 
        repository.full_name,
        repository.default_branch || 'main'
      );
      if (response.success) {
        setProjectRepository(response.data);
        setShowRepositorySelector(false);
        await loadRepositoryContents(repository.full_name, repository.default_branch || 'main');
        setCurrentBranch(repository.default_branch || 'main');
        await loadBranches(repository.full_name);
      }
    } catch (error) {
      setError('Failed to connect repository to project');
    }
  };

  const disconnectRepositoryFromProject = async () => {
    try {
      await githubService.disconnectRepositoryFromProject(projectId);
      setProjectRepository(null);
      setFileContents([]);
      setSelectedFile(null);
      setFileContent('');
      setBranches([]);
    } catch (error) {
      setError('Failed to disconnect repository from project');
    }
  };

  const loadRepositoryContents = async (repositoryFullName, branch = 'main', path = '') => {
    try {
      setLoadingContents(true);
      const [owner, repo] = repositoryFullName.split('/');
      const response = await githubService.getRepositoryContents(owner, repo, path, branch);
      if (response.success) {
        const contents = Array.isArray(response.data) ? response.data : [response.data];
        setFileContents(contents);
        setCurrentPath(path);
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Repository access error:', error);
      if (error.response?.status === 404) {
        setError('access_denied');
      } else {
        setError('Failed to load repository contents');
      }
      setFileContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  const loadBranches = async (repositoryFullName) => {
    try {
      const [owner, repo] = repositoryFullName.split('/');
      const response = await githubService.getRepositoryBranches(owner, repo);
      if (response.success) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'dir') {
      await loadRepositoryContents(projectRepository.repository_full_name, currentBranch, file.path);
    } else if (file.type === 'file') {
      await loadFileContent(file);
    }
  };

  const loadFileContent = async (file) => {
    try {
      if (githubService.isBinaryFile(file.name)) {
        setSelectedFile(file);
        setFileContent('This is a binary file and cannot be displayed as text.');
        return;
      }

      const [owner, repo] = projectRepository.repository_full_name.split('/');
      const response = await githubService.getFileContent(owner, repo, file.path, currentBranch);
      if (response.success) {
        setSelectedFile(file);
        setFileContent(response.data.content);
      }
    } catch (error) {
      setError('Failed to load file content');
    }
  };

  const handleBranchChange = async (branch) => {
    setCurrentBranch(branch);
    await loadRepositoryContents(projectRepository.repository_full_name, branch, currentPath);
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split('/').filter(part => part);
    pathParts.pop();
    const parentPath = pathParts.join('/');
    loadRepositoryContents(projectRepository.repository_full_name, currentBranch, parentPath);
  };

  const breadcrumbParts = currentPath ? currentPath.split('/').filter(part => part) : [];

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      fontSize: '28px',
      margin: '0 0 10px 0'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    connectSection: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '30px'
    },
    connectButton: {
      backgroundColor: '#24292e',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '20px'
    },
    connectedInfo: {
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%'
    },
    repositorySection: {
      marginBottom: '30px'
    },
    repositoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    repositoryInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    branchSelector: {
      padding: '6px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px'
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#666'
    },
    breadcrumbLink: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    fileList: {
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 15px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    fileIcon: {
      marginRight: '10px',
      fontSize: '16px'
    },
    fileName: {
      flex: 1,
      fontSize: '14px'
    },
    fileSize: {
      fontSize: '12px',
      color: '#666'
    },
    fileViewer: {
      marginTop: '30px'
    },
    fileViewerHeader: {
      backgroundColor: '#f8f9fa',
      padding: '10px 15px',
      borderBottom: '1px solid #dee2e6',
      fontSize: '14px',
      fontWeight: '500'
    },
    fileViewerContent: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      fontSize: '14px',
      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
      lineHeight: '1.5',
      maxHeight: '600px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    repositorySelector: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px'
    },
    repositoryItem: {
      padding: '15px',
      border: '1px solid #eee',
      borderRadius: '6px',
      marginBottom: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    repositoryName: {
      fontWeight: '500',
      marginBottom: '5px'
    },
    repositoryDescription: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px'
    },
    repositoryMeta: {
      fontSize: '12px',
      color: '#888',
      display: 'flex',
      gap: '15px'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px',
      color: '#666'
    },
    errorState: {
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      color: '#721c24',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    accessDeniedSection: {
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    accessDeniedTitle: {
      color: '#856404',
      fontSize: '20px',
      marginBottom: '15px',
      fontWeight: '600'
    },
    accessDeniedText: {
      color: '#856404',
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    accessDeniedSteps: {
      textAlign: 'left',
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#fcf8e3',
      padding: '20px',
      borderRadius: '6px',
      border: '1px solid #faebcc'
    },
    stepsList: {
      margin: '10px 0',
      paddingLeft: '20px'
    },
    stepItem: {
      marginBottom: '8px',
      color: '#856404'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <h2>Loading GitHub integration...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Files</h1>
        <p style={styles.subtitle}>Project files and GitHub repository integration</p>
      </div>

      {error && error !== 'access_denied' && (
        <div style={styles.errorState}>
          {error}
        </div>
      )}

      {error === 'access_denied' && projectRepository && (
        <div style={styles.accessDeniedSection}>
          <h3 style={styles.accessDeniedTitle}>🔒 Repository Access Required</h3>
          <p style={styles.accessDeniedText}>
            A repository is connected to this project, but you don't have access to view its contents.
          </p>
          <div style={styles.accessDeniedSteps}>
            <strong>To gain access:</strong>
            <ol style={styles.stepsList}>
              <li style={styles.stepItem}>
                Contact the project owner or repository owner
              </li>
              <li style={styles.stepItem}>
                Ask them to add you as a collaborator to the repository: 
                <br />
                <strong>{projectRepository.repository_full_name}</strong>
              </li>
              <li style={styles.stepItem}>
                Once added, refresh this page to view the files
              </li>
            </ol>
          </div>
          <p style={styles.accessDeniedText}>
            <small>
              💡 Repository collaborators can be managed in GitHub under Settings → Manage access
            </small>
          </p>
        </div>
      )}

      {!isGitHubConnected ? (
        <div style={styles.connectSection}>
          <h2>Connect Your GitHub Account</h2>
          <p>Connect your GitHub account to browse and manage repository files directly in your project workspace.</p>
          <button style={styles.connectButton} onClick={handleGitHubConnect}>
            <span>📚</span>
            Connect GitHub
          </button>
        </div>
      ) : (
        <>
          <div style={styles.connectedInfo}>
            <div style={styles.userInfo}>
              <img 
                src={githubUser?.github_avatar_url} 
                alt={githubUser?.github_name} 
                style={styles.avatar}
              />
              <div>
                <strong>{githubUser?.github_name || githubUser?.github_username}</strong>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  @{githubUser?.github_username}
                </div>
              </div>
            </div>
            <button style={styles.dangerButton} onClick={handleDisconnectGitHub}>
              Disconnect
            </button>
          </div>

          {!projectRepository ? (
            <div style={styles.repositorySection}>
              <h3>Connect Repository to Project</h3>
              <p>Select a repository to connect to this project for file management.</p>
              
              {!showRepositorySelector ? (
                <button 
                  style={styles.button} 
                  onClick={loadUserRepositories}
                  disabled={loadingRepositories}
                >
                  {loadingRepositories ? 'Loading...' : 'Select Repository'}
                </button>
              ) : (
                <div style={styles.repositorySelector}>
                  <h4>Your Repositories</h4>
                  {repositories.map(repo => (
                    <div 
                      key={repo.id} 
                      style={styles.repositoryItem}
                      onClick={() => connectRepositoryToProject(repo)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={styles.repositoryName}>{repo.full_name}</div>
                      {repo.description && (
                        <div style={styles.repositoryDescription}>{repo.description}</div>
                      )}
                      <div style={styles.repositoryMeta}>
                        {repo.language && <span>📝 {repo.language}</span>}
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                        <span>{repo.private ? '🔒 Private' : '🌍 Public'}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    style={styles.button} 
                    onClick={() => setShowRepositorySelector(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.repositorySection}>
              <div style={styles.repositoryHeader}>
                <div style={styles.repositoryInfo}>
                  <strong>📚 {projectRepository.repository_full_name}</strong>
                  {branches.length > 0 && error !== 'access_denied' && (
                    <select 
                      style={styles.branchSelector}
                      value={currentBranch}
                      onChange={(e) => handleBranchChange(e.target.value)}
                    >
                      {branches.map(branch => (
                        <option key={branch.name} value={branch.name}>
                          🌿 {branch.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button 
                  style={styles.dangerButton} 
                  onClick={disconnectRepositoryFromProject}
                >
                  Disconnect Repository
                </button>
              </div>

              {error !== 'access_denied' && (
                <>
                  {currentPath && (
                    <div style={styles.breadcrumb}>
                      <span 
                        style={styles.breadcrumbLink}
                        onClick={() => loadRepositoryContents(projectRepository.repository_full_name, currentBranch, '')}
                      >
                        {projectRepository.repository_full_name.split('/')[1]}
                      </span>
                      {breadcrumbParts.map((part, index) => (
                        <React.Fragment key={index}>
                          <span> / </span>
                          <span 
                            style={styles.breadcrumbLink}
                            onClick={() => {
                              const path = breadcrumbParts.slice(0, index + 1).join('/');
                              loadRepositoryContents(projectRepository.repository_full_name, currentBranch, path);
                            }}
                          >
                            {part}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {loadingContents ? (
                    <div style={styles.loadingState}>Loading files...</div>
                  ) : (
                    <div style={styles.fileList}>
                      {currentPath && (
                        <div 
                          style={{...styles.fileItem, backgroundColor: '#f8f9fa'}}
                          onClick={navigateToParent}
                        >
                          <span style={styles.fileIcon}>📁</span>
                          <span style={styles.fileName}>..</span>
                        </div>
                      )}
                      
                      {fileContents.map((file, index) => (
                        <div 
                          key={index}
                          style={styles.fileItem}
                          onClick={() => handleFileClick(file)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <span style={styles.fileIcon}>
                            {file.type === 'dir' ? '📁' : '📄'}
                          </span>
                          <span style={styles.fileName}>{file.name}</span>
                          {file.size && (
                            <span style={styles.fileSize}>
                              {githubService.formatFileSize(file.size)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFile && (
                    <div style={styles.fileViewer}>
                      <div style={styles.fileViewerHeader}>
                        📄 {selectedFile.name} ({githubService.formatFileSize(selectedFile.size)})
                      </div>
                      <div style={styles.fileViewerContent}>
                        {fileContent}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectFiles;