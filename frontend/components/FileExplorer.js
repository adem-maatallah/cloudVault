'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function FileExplorer({ userId, initialView = 'files' }) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderData, setFolderData] = useState(null);
  const [items, setItems] = useState({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Files' }]);

  useEffect(() => {
    fetchContent();
  }, [currentFolderId, initialView]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (initialView === 'favorites') {
        const response = await api.getFiles(userId, null, true);
        setItems({ folders: [], files: response.data });
        setBreadcrumbs([{ id: 'favorites', name: 'Favorites' }]);
      } else if (initialView === 'shared') {
        const response = await api.getSharedWithMe(userId);
        setItems({ folders: [], files: response.data });
        setBreadcrumbs([{ id: 'shared', name: 'Shared with Me' }]);
      } else {
        // Normal file/folder navigation
        if (currentFolderId) {
          const response = await api.getFolderById(currentFolderId);
          setFolderData(response.data.folder);
          setItems({
            folders: response.data.subfolders,
            files: response.data.files
          });
          // Update breadcrumbs would go here in a real app with parent tracking
        } else {
          const [foldersRes, filesRes] = await Promise.all([
            api.getFolders(userId),
            api.getFiles(userId, null)
          ]);
          setItems({
            folders: foldersRes.data,
            files: filesRes.data
          });
          setBreadcrumbs([{ id: null, name: 'My Files' }]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId, folderName) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (id, index) => {
    if (id === 'favorites' || id === 'shared') return;
    setCurrentFolderId(id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleDeleteFile = async (id) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await api.deleteFile(id);
        fetchContent();
      } catch (err) {
        alert('Failed to delete file');
      }
    }
  };

  const handleToggleFavorite = async (file) => {
    try {
      await api.toggleFavorite(file.id, !file.is_favorite);
      fetchContent();
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '--';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="explorer">
      <div className="explorer-header">
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id || 'root'} className="breadcrumb-item">
              <button onClick={() => handleBreadcrumbClick(crumb.id, index)}>
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && <span className="separator">/</span>}
            </span>
          ))}
        </div>
        
        <div className="explorer-actions">
          <button className="btn-primary" onClick={() => fetchContent()}>Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="explorer-loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="item-grid">
          {/* Folders */}
          {items.folders.map(folder => (
            <div key={`folder-${folder.id}`} className="item-card folder-item" onDoubleClick={() => handleFolderClick(folder.id, folder.name)}>
              <div className="item-icon">📁</div>
              <div className="item-info">
                <div className="item-name">{folder.name}</div>
                <div className="item-meta">Folder</div>
              </div>
            </div>
          ))}

          {/* Files */}
          {items.files.map(file => (
            <div key={`file-${file.id}`} className="item-card file-item">
              <div className="item-icon">
                {file.file_type?.includes('image') ? '🖼️' : 
                 file.file_type?.includes('pdf') ? '📄' : 
                 file.file_type?.includes('video') ? '🎥' : '📎'}
              </div>
              <div className="item-info">
                <div className="item-name">{file.filename}</div>
                <div className="item-meta">{formatSize(file.file_size)} • {new Date(file.upload_date).toLocaleDateString()}</div>
              </div>
              <div className="item-actions">
                <button 
                  className={`action-btn ${file.is_favorite ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(file)}
                  title="Favorite"
                >
                  ⭐
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteFile(file.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {items.folders.length === 0 && items.files.length === 0 && (
            <div className="empty-state">This folder is empty</div>
          )}
        </div>
      )}
    </div>
  );
}
