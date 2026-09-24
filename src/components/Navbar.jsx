import React from 'react';
import UserAvatar from './UserAvatar';
import { Search, X, Plus, User, LogIn, LogOut, Cloud, Sparkles, Shield, Crown } from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenUpload,
  onOpenAuth,
  onOpenSettings,
  user,
  isAdmin,
  onLogout,
  onResetFilter,
  searchInputRef
}) {
  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={onResetFilter} title="Ir al inicio - Olivia the Cat! IMG">
        <div className="nav-logo-wrap">
          <img src="/olivia-logo.png" alt="Olivia the Cat" className="nav-logo-img" />
        </div>
        <div className="nav-brand-text">
          <span className="nav-brand-title">Olivia the Cat!</span>
          <span className="nav-brand-badge">
            <Sparkles size={10} /> Cloudinary & Firebase
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="nav-search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Buscar pines, poses, siestas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Borrar búsqueda"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Actions */}
      <div className="nav-actions">
        {/* Upload Pin Button */}
        <button
          className="btn-primary-pinterest nav-upload-desktop"
          onClick={onOpenUpload}
          title="Subir foto a Cloudinary"
          id="btn-upload-pin"
        >
          <Plus size={17} strokeWidth={2.5} />
          <span className="nav-upload-text">Crear Pin</span>
        </button>

        {/* Cloudinary & Firebase Settings - ADMIN ONLY */}
        {isAdmin && (
          <button
            className="btn-icon"
            onClick={onOpenSettings}
            title="Ajustes de Administrador (Cloudinary & Firebase)"
            id="btn-settings"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.45)',
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.08)'
            }}
          >
            <Shield size={17} />
          </button>
        )}

        {/* User Auth */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="user-avatar-btn" title={user.displayName || user.email || 'Usuario'}>
              <UserAvatar user={user} size={30} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span className="user-avatar-name">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'Gatito')}
                </span>
                {isAdmin && (
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#fbbf24',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '2px'
                  }}>
                    <Crown size={10} /> Admin
                  </span>
                )}
              </div>
            </div>
            <button
              className="btn-icon nav-logout-btn"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary nav-login-btn"
            onClick={onOpenAuth}
            id="btn-login"
          >
            <LogIn size={15} />
            <span className="nav-login-text">Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
}
