'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function ProfileModal({ isOpen, onClose, userId, onUserUpdated }) {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [isOpen, userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.getUserById(userId);
      setUserData({ name: response.data.name, email: response.data.email });
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateUser(userId, userData);
      setSuccess(true);
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              placeholder="Your email"
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">Profile updated successfully!</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
