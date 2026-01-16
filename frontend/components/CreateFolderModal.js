'use client';

import { useState } from 'react';
import api from '../lib/api';

export default function CreateFolderModal({ isOpen, onClose, userId, parentId, onFolderCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    setError(null);

    try {
      await api.createFolder({
        name,
        userId,
        parentFolderId: parentId || null
      });
      setName('');
      if (onFolderCreated) onFolderCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Folder</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
