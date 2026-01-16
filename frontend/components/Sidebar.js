'use client';

import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeView, onViewChange, stats }) {
  const { user, logout } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'files', label: 'My Files', icon: '📂' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'shared', label: 'Shared', icon: '🔗' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">☁️</span>
        <span className="brand-name">CloudVault</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        <button className="nav-item logout-btn" onClick={logout} style={{marginTop: 'auto', color: 'var(--danger-color)'}}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="storage-mini">
          <div className="storage-mini-header">
            <span>Storage</span>
            <span>{stats?.storage?.percentage || 0}%</span>
          </div>
          <div className="storage-mini-bar">
            <div 
              className="storage-mini-fill" 
              style={{ width: `${stats?.storage?.percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
