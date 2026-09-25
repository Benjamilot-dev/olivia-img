import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Moon, 
  Compass, 
  Coffee, 
  Zap, 
  Smile, 
  FolderPlus,
  Folder,
  Lock,
  Trash2,
  Pencil,
  Heart,
  Camera,
  Star,
  Award,
  Flame,
  Sun
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Crown,
  Moon,
  Compass,
  Coffee,
  Zap,
  Smile,
  Folder,
  Heart,
  Camera,
  Star,
  Award,
  Flame,
  Sun
};

export default function FolderBar({
  folders,
  activeFolder,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  getPinsCountByFolder,
  user,
  isApproved = false,
  isAdmin = false,
  onRequireAuth,
  onRequireApproval,
  onDeleteFolder,
  onDeleteAllPinsInFolder
}) {
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleStartAddFolder = () => {
    if (!user) {
      onRequireAuth('folder');
      return;
    }
    if (!isApproved) {
      if (onRequireApproval) onRequireApproval();
      return;
    }
    setShowNewFolderInput(true);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth('folder');
      return;
    }
    if (!isApproved) {
      if (onRequireApproval) onRequireApproval();
      return;
    }
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  return (
    <div className="folder-bar-container">
      {folders.map((folder) => {
        const IconComponent = ICON_MAP[folder.icon] || Folder;
        const isActive = activeFolder === folder.slug || (folder.id === 'all' && activeFolder === '');
        const count = getPinsCountByFolder(folder.slug);

        return (
          <button
            key={folder.id}
            className={`folder-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectFolder(folder.slug)}
            title={`Álbum: ${folder.name}`}
          >
            <IconComponent size={15} color={isActive ? '#111' : (folder.color || 'var(--text-muted)')} />
            <span>{folder.name}</span>
            <span className="folder-pill-badge">{count}</span>

            {/* Admin Exclusive: Modify / Rename & Delete Folder */}
            {isAdmin && (
              <span
                className="folder-admin-actions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginLeft: '4px'
                }}
              >
                {/* Edit / Rename folder */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditFolder) onEditFolder(folder);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      if (onEditFolder) onEditFolder(folder);
                    }
                  }}
                  title={`Modificar nombre de carpeta "${folder.name}" (Admin)`}
                  className="folder-action-btn folder-action-edit"
                  style={{
                    padding: '2px 4px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#1d4ed8' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <Pencil size={11} />
                </span>

                {/* Delete folder (except 'all') */}
                {folder.id !== 'all' && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteFolder) onDeleteFolder(folder);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        if (onDeleteFolder) onDeleteFolder(folder);
                      }
                    }}
                    title={`Eliminar carpeta "${folder.name}" (Admin)`}
                    className="folder-action-btn folder-action-delete"
                    style={{
                      padding: '2px 4px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#ef4444' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={11} />
                  </span>
                )}
              </span>
            )}
          </button>
        );
      })}

      {/* Add New Folder */}
      {showNewFolderInput ? (
        <form onSubmit={handleCreateFolder} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            className="form-input"
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '160px', borderRadius: 'var(--radius-full)' }}
            placeholder="Ej: Cumpleaños"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary-pinterest"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            Crear
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            onClick={() => setShowNewFolderInput(false)}
          >
            ✕
          </button>
        </form>
      ) : (
        <button
          className="folder-add-btn"
          onClick={handleStartAddFolder}
          title={user ? "Crear nuevo álbum" : "Inicia sesión con Google para crear álbumes"}
        >
          {user ? <FolderPlus size={15} /> : <Lock size={13} />}
          <span>Nuevo Álbum</span>
        </button>
      )}

      {/* Admin Quick Batch Delete Action */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => onDeleteAllPinsInFolder && onDeleteAllPinsInFolder(activeFolder || null)}
          title={activeFolder ? "Eliminar todos los pines de esta carpeta" : "Eliminar todos los pines de la galería"}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Trash2 size={12} />
          <span>{activeFolder ? 'Vaciar carpeta' : 'Vaciar galería'}</span>
        </button>
      )}
    </div>
  );
}
