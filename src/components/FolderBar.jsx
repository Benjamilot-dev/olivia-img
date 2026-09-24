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
  Lock
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Crown,
  Moon,
  Compass,
  Coffee,
  Zap,
  Smile,
  Folder
};

export default function FolderBar({
  folders,
  activeFolder,
  onSelectFolder,
  onAddFolder,
  getPinsCountByFolder,
  user,
  isApproved = false,
  onRequireAuth,
  onRequireApproval
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
            title={`Carpeta Cloudinary: ${folder.slug || 'todas'}`}
          >
            <IconComponent size={15} color={isActive ? '#111' : (folder.color || 'var(--text-muted)')} />
            <span>{folder.name}</span>
            <span className="folder-pill-badge">{count}</span>
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
          title={user ? "Crear nueva carpeta en Cloudinary" : "Inicia sesión con Google para crear carpetas"}
        >
          {user ? <FolderPlus size={15} /> : <Lock size={13} />}
          <span>Nueva Carpeta</span>
        </button>
      )}
    </div>
  );
}
