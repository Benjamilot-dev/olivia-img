import React from 'react';
import UserAvatar from './UserAvatar';
import { Home, Search, PlusCircle, FolderHeart, User, LogIn, Shield } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  onGoHome,
  onFocusSearch,
  onOpenUpload,
  onOpenFolders,
  onOpenAuth,
  onOpenSettings,
  user,
  isAdmin,
  onLogout
}) {
  return (
    <nav className="mobile-bottom-nav">
      {/* Home */}
      <button
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={onGoHome}
        title="Inicio"
      >
        <Home size={20} />
        <span>Inicio</span>
      </button>

      {/* Search */}
      <button
        className="bottom-nav-item"
        onClick={onFocusSearch}
        title="Buscar"
      >
        <Search size={20} />
        <span>Buscar</span>
      </button>

      {/* Create Pin (Highlighted Center Button) */}
      <button
        className="bottom-nav-create-btn"
        onClick={onOpenUpload}
        title="Publicar Nueva Foto"
      >
        <PlusCircle size={26} strokeWidth={2.2} />
      </button>

      {/* Folders */}
      <button
        className="bottom-nav-item"
        onClick={onOpenFolders}
        title="Álbumes y Categorías"
      >
        <FolderHeart size={20} />
        <span>Álbumes</span>
      </button>

      {/* Profile / Admin / Auth */}
      {user ? (
        isAdmin ? (
          <button
            className="bottom-nav-item"
            onClick={onOpenSettings}
            title="Panel de Administrador"
            style={{ color: '#f59e0b' }}
          >
            <Shield size={20} />
            <span>Admin</span>
          </button>
        ) : (
          <button
            className="bottom-nav-item"
            onClick={onLogout}
            title={`Conectado como ${user.displayName || user.email}. Toca para salir.`}
          >
            <UserAvatar user={user} size={22} className="bottom-nav-avatar" />
            <span>Salir</span>
          </button>
        )
      ) : (
        <button
          className="bottom-nav-item"
          onClick={onOpenAuth}
          title="Iniciar Sesión"
        >
          <LogIn size={20} />
          <span>Ingresar</span>
        </button>
      )}
    </nav>
  );
}
