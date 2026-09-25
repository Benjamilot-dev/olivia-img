import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pencil, 
  Folder, 
  Sparkles, 
  Crown, 
  Moon, 
  Compass, 
  Coffee, 
  Zap, 
  Smile, 
  Heart, 
  Camera, 
  Star, 
  Award, 
  Flame, 
  Sun,
  Shield,
  Trash2,
  Check,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';

export const FOLDER_ICONS = [
  { name: 'Folder', icon: Folder, label: 'Carpeta' },
  { name: 'Sparkles', icon: Sparkles, label: 'Brillos' },
  { name: 'Crown', icon: Crown, label: 'Corona' },
  { name: 'Moon', icon: Moon, label: 'Siesta' },
  { name: 'Compass', icon: Compass, label: 'Aventura' },
  { name: 'Coffee', icon: Coffee, label: 'Café' },
  { name: 'Zap', icon: Zap, label: 'Energía' },
  { name: 'Smile', icon: Smile, label: 'Sonrisa' },
  { name: 'Heart', icon: Heart, label: 'Corazón' },
  { name: 'Camera', icon: Camera, label: 'Cámara' },
  { name: 'Star', icon: Star, label: 'Estrella' },
  { name: 'Award', icon: Award, label: 'Premio' },
  { name: 'Flame', icon: Flame, label: 'Fuego' },
  { name: 'Sun', icon: Sun, label: 'Sol' }
];

export const FOLDER_COLORS = [
  { hex: '#f59e0b', name: 'Ámbar Dorado' },
  { hex: '#8b5cf6', name: 'Púrpura Místico' },
  { hex: '#10b981', name: 'Esmeralda' },
  { hex: '#ff6b8b', name: 'Rosa Olivia' },
  { hex: '#3b82f6', name: 'Azul Eléctrico' },
  { hex: '#ec4899', name: 'Fucsia' },
  { hex: '#f97316', name: 'Naranja Vivo' },
  { hex: '#06b6d4', name: 'Cian Turquesa' },
  { hex: '#14b8a6', name: 'Teal Menta' },
  { hex: '#ef4444', name: 'Rojo Carmesí' }
];

export default function EditFolderModal({
  isOpen,
  folder,
  pinsCount = 0,
  onClose,
  onSave,
  onDelete,
  isAdmin = false
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('#f59e0b');
  const [syncSlug, setSyncSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
      setIcon(folder.icon || 'Folder');
      setColor(folder.color || '#f59e0b');
      setCustomSlug(folder.slug || '');
      setSyncSlug(false);
      setError('');
    }
  }, [folder, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !folder) return null;

  // Security guard
  if (!isAdmin) {
    return (
      <div 
        className="modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '24px' }}>
          <Shield size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#fff' }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Solo el Administrador de Olivia the Cat tiene permisos para modificar o actualizar el nombre de las carpetas.
          </p>
          <button type="button" className="btn-primary-pinterest" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const isAllFolder = folder.id === 'all';
  const IconSelectedComponent = FOLDER_ICONS.find(i => i.name === icon)?.icon || Folder;

  // Calculate projected slug if syncing
  const projectedSlug = isAllFolder 
    ? '' 
    : syncSlug 
      ? `olivia-cat/${name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}`
      : (customSlug || folder.slug);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la carpeta no puede estar vacío');
      return;
    }

    onSave({
      name: name.trim(),
      icon,
      color,
      slug: isAllFolder ? '' : projectedSlug
    });
  };

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0d1117',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Pencil size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Modificar Carpeta
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  Admin
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                Actualiza el nombre, icono y estilo del álbum
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="btn-icon"
            onClick={onClose}
            style={{ width: '34px', height: '34px', color: 'var(--text-muted)' }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Pill Preview */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Vista previa en la barra de álbumes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Dark State Preview */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                background: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#f8fafc'
              }}
            >
              <IconSelectedComponent size={15} color={color} />
              <span>{name || 'Nombre del Álbum'}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff'
              }}>
                {pinsCount}
              </span>
            </div>

            {/* Active White State Preview */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                background: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#111827',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}
            >
              <IconSelectedComponent size={15} color="#111827" />
              <span>{name || 'Nombre del Álbum'}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 0, 0, 0.12)',
                color: '#111827'
              }}>
                {pinsCount}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Input Name */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px', display: 'block' }}>
              Nombre de la Carpeta / Álbum *
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: Momentos Divertidos"
              style={{
                width: '100%',
                background: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.9rem',
                color: '#fff',
                outline: 'none'
              }}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={14} color="#a855f7" />
              <span>Color del Icono y Distintivo</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FOLDER_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: isSelected ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: isSelected ? `0 0 12px ${c.hex}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                    title={c.name}
                  >
                    {isSelected && <Check size={14} color="#fff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Icono Representativo</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
              gap: '8px',
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '8px',
              background: '#161b22',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {FOLDER_ICONS.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid transparent',
                      color: isSelected ? '#fbbf24' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={item.label}
                  >
                    <ItemIcon size={18} color={isSelected ? '#fbbf24' : color} />
                    <span style={{ fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '58px' }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slug & Pin Migration Notice (For non-root folders) */}
          {!isAllFolder && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.22)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#93c5fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#bfdbfe' }}>
                  Identificador de fotos (Slug):
                </span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.74rem' }}>
                  <input
                    type="checkbox"
                    checked={syncSlug}
                    onChange={(e) => setSyncSlug(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Actualizar también identificador</span>
                </label>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#60a5fa', wordBreak: 'break-all' }}>
                {folder.slug}
                {syncSlug && projectedSlug !== folder.slug && (
                  <>
                    {' '}<ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                    <span style={{ color: '#34d399', fontWeight: 700 }}>{projectedSlug}</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {syncSlug && projectedSlug !== folder.slug
                  ? `Se migrarán automáticamente las ${pinsCount} fotos vinculadas a este nuevo identificador.`
                  : `Las ${pinsCount} fotos vinculadas se mantendrán asignadas a este álbum.`}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '6px'
          }}>
            {/* Delete button (shortcut) */}
            {!isAllFolder && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(folder)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Eliminar esta carpeta definitivamente"
              >
                <Trash2 size={14} />
                <span>Eliminar Carpeta</span>
              </button>
            ) : <div />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  fontSize: '0.84rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-primary-pinterest"
                style={{
                  padding: '9px 20px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <Check size={16} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
