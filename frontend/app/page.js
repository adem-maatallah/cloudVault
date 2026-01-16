'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import FileExplorer from '../components/FileExplorer';
import ProfileModal from '../components/ProfileModal';
import CreateUserModal from '../components/CreateUserModal';
import CreateFolderModal from '../components/CreateFolderModal';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  
  // Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // Use the actual logged-in user ID
  const userId = user?.id;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!stats) setLoading(true);
      setError(null);

      const [statsResponse, activityResponse] = await Promise.all([
        api.getStats(userId),
        api.getActivity(userId, 10)
      ]);

      setStats(statsResponse.data);
      setActivity(activityResponse.data);
      setRecentFiles(statsResponse.data.recentFiles || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const checkApiHealth = async () => {
    try {
      await api.healthCheck();
      setApiStatus('connected');
    } catch (err) {
      setApiStatus('disconnected');
    }
  };

  const handleToggleFavorite = async (file) => {
    try {
      await api.toggleFavorite(file.id, !file.is_favorite);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update favorite status');
    }
  };

  useEffect(() => {
    if (userId) {
      checkApiHealth();
      fetchDashboardData();
    }
  }, [fetchDashboardData, userId]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderDashboardView = () => (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card storage-card">
          <div className="stat-header">
            <h3>💾 Storage</h3>
          </div>
          <div className="storage-info">
            <div className="storage-bar">
              <div 
                className="storage-fill" 
                style={{ width: `${stats?.storage?.percentage || 0}%` }}
              ></div>
            </div>
            <div className="storage-text">
              <span className="storage-used">{formatFileSize(stats?.storage?.used || 0)}</span>
              <span className="storage-total">of {formatFileSize(stats?.storage?.limit || 0)}</span>
            </div>
            <div className="storage-percent">{stats?.storage?.percentage || 0}% used</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveView('files')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats?.counts?.folders || 0}</div>
          <div className="stat-label">Folders</div>
        </div>

        <div className="stat-card" onClick={() => setActiveView('files')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">📄</div>
          <div className="stat-value">{stats?.counts?.files || 0}</div>
          <div className="stat-label">Files</div>
        </div>

        <div className="stat-card" onClick={() => setActiveView('shared')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">🔗</div>
          <div className="stat-value">{stats?.counts?.shared || 0}</div>
          <div className="stat-label">Shared</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <h2>📂 Recent Files</h2>
          {recentFiles.length === 0 ? (
            <div className="empty-state">No files yet</div>
          ) : (
            <div className="file-list">
              {recentFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-icon">
                    {file.file_type?.includes('image') ? '🖼️' : '📄'}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{file.filename}</div>
                    <div className="file-meta">
                      {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                    </div>
                  </div>
                  <button 
                    className={`action-btn ${file.is_favorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(file);
                    }}
                    title={file.is_favorite ? "Unfavorite" : "Favorite"}
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>📊 Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="empty-state">No activity yet</div>
          ) : (
            <div className="activity-list">
              {activity.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-details">
                    <div className="activity-text">
                      <strong>{item.action}</strong> {item.resource_name}
                    </div>
                    <div className="activity-time">{formatDate(item.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        stats={stats}
      />

      <main className="main-content">
        <header className="dash-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
                <p>Welcome back, user!</p>
              </div>
              <div className="header-actions">
                <button className="btn-outline" onClick={() => setIsCreateFolderOpen(true)}>
                  + New Folder
                </button>
                <button className="btn-primary" onClick={() => setIsCreateUserOpen(true)}>
                  + Add User
                </button>
                <div className="user-menu" onClick={() => setIsProfileOpen(true)}>
                  <div className="avatar">SJ</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
          {error && <div className="error">{error}</div>}
          
          {(loading || authLoading) ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : !user ? (
            <div className="loading">Redirecting to login...</div>
          ) : (
            activeView === 'dashboard' 
              ? renderDashboardView() 
              : <FileExplorer userId={userId} initialView={activeView} />
          )
          }
        </div>
      </main>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        userId={userId}
        onUserUpdated={fetchDashboardData}
      />
      <CreateUserModal 
        isOpen={isCreateUserOpen} 
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={fetchDashboardData}
      />
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        userId={userId}
        onFolderCreated={fetchDashboardData}
      />
    </div>
  );
}
