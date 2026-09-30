import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pencil, 
  Folder, 
  Check, 
  Tag, 
  Globe, 
  Lock, 
  Trash2, 
  Sparkles, 
  FolderPlus, 
  Info, 
  Calendar 
} from 'lucide-react';
import { sanitizeText, sanitizeTags } from '../utils/security';

export default function EditPinModal({
  isOpen,
  onClose,
  pin,
  folders = [],
  onSave,
  onDelete,
  isAdmin = false
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever pin changes
  useEffect(() => {
    if (pin) {
      setTitle(pin.title || '');
      setDescription(pin.description || '');
      setSelectedFolder(pin.cloudinaryFolder || '');
      setVisibility(pin.visibility || 'public');
      setTags(Array.isArray(pin.tags) ? pin.tags.join(', ') : '');
    }
  }, [pin]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pin) return null;

  // Filter out the 'all' folder so it is not an assignment target
  const assignableFolders = folders.filter((f) => f.slug && f.id !== 'all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const processedTags = tags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    if (!processedTags.includes('olivia')) {
      processedTags.unshift('olivia');
    }

    const updatedData = {
      title: sanitizeText(title.trim(), 120),
      description: sanitizeText(description.trim(), 1000),
      cloudinaryFolder: sanitizeText(selectedFolder.trim(), 80), // '' means without album / General gallery
      visibility: visibility === 'members' ? 'members' : 'public',
      tags: sanitizeTags(processedTags),
      updatedAt: new Date().toISOString()
    };

    onSave(pin.id, updatedData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="edit-pin-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card, #1c212a)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <Pencil size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                Editar Pin
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                Cambia el álbum asignado o los detalles de la foto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {/* Photo Summary Preview Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#0a0d12',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <img
                src={pin.imageUrl}
                alt={pin.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pin.title || 'Foto de Olivia'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Autor: {pin.author?.name || 'Olivia Oficial'} • Álbum actual: <strong style={{ color: '#fcd34d' }}>{pin.cloudinaryFolder ? pin.cloudinaryFolder.split('/').pop() : 'Sin Álbum (General)'}</strong>
              </div>
            </div>
          </div>

          {/* 1. SELECTOR DE ÁLBUM / CARPETA (Core feature) */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '8px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={16} color="#f59e0b" />
                <span>Asignar a Álbum / Categoría</span>
              </span>
              <span style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 500 }}>
                {selectedFolder ? `Carpeta: ${selectedFolder.split('/').pop()}` : 'Sin Álbum (Galería General)'}
              </span>
            </label>

            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {/* Opción 1: Dejar Sin Álbum (Galería General) */}
              <button
                type="button"
                onClick={() => setSelectedFolder('')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: selectedFolder === '' 
                    ? '2px solid #f59e0b' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedFolder === '' 
                    ? 'rgba(245, 158, 11, 0.18)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  color: selectedFolder === '' ? '#fbbf24' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
              >
                <Sparkles size={16} color={selectedFolder === '' ? '#fbbf24' : '#94a3b8'} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: selectedFolder === '' ? 700 : 500 }}>
                    Sin Álbum
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    Galería general
                  </div>
                </div>
                {selectedFolder === '' && <Check size={14} color="#fbbf24" />}
              </button>

              {/* Opciones de Carpetas Existentes */}
              {assignableFolders.map((f) => {
                const isSelected = selectedFolder === f.slug;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFolder(f.slug)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: isSelected 
                        ? `2px solid ${f.color || '#3b82f6'}` 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected 
                        ? `${f.color || '#3b82f6'}22` 
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fff' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <Folder size={16} color={f.color || '#3b82f6'} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.slug.split('/').pop()}
                      </div>
                    </div>
                    {isSelected && <Check size={14} color={f.color || '#3b82f6'} />}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} />
              <span>Puedes mover esta foto a cualquiera de tus álbumes existentes o dejarla en "Sin Álbum".</span>
            </div>
          </div>

          {/* 2. Título */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              Título de la foto *
            </label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ojos celestes como zafiros..."
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* 3. Descripción */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
              Descripción / Historia
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos el momento o anécdota de esta foto..."
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.88rem',
                resize: 'vertical',
                lineHeight: 1.45
              }}
            />
          </div>

          {/* 4. Etiquetas (Tags) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#f8fafc',
              marginBottom: '6px'
            }}>
              <Tag size={15} color="#06b6d4" />
              <span>Etiquetas (separadas por coma)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="olivia, siesta, traviesa, ojos-azules"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* 5. Visibilidad (Pública / Privada) */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
              Privacidad y Acceso
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {/* Pública */}
              <button
                type="button"
                onClick={() => setVisibility('public')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: visibility === 'public' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: visibility === 'public' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: visibility === 'public' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: visibility === 'public' ? '#34d399' : '#94a3b8',
                  flexShrink: 0
                }}>
                  <Globe size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: visibility === 'public' ? '#34d399' : '#f8fafc' }}>
                    Pública para Todos
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                    Visible para cualquier visitante de la galería.
                  </div>
                </div>
              </button>

              {/* Privada */}
              <button
                type="button"
                onClick={() => setVisibility('members')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: visibility === 'members' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: visibility === 'members' ? 'rgba(139, 92, 246, 0.14)' : 'rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: visibility === 'members' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: visibility === 'members' ? '#c4b5fd' : '#94a3b8',
                  flexShrink: 0
                }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: visibility === 'members' ? '#c4b5fd' : '#f8fafc' }}>
                    Privada (Solo tú y Admin)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                    Oculta para visitantes y otros usuarios comunes.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '28px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap'
          }}>
            {/* Delete button shortcut */}
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(pin);
                }}
                className="btn-secondary"
                style={{
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  padding: '8px 14px',
                  fontSize: '0.84rem'
                }}
                title="Eliminar este Pin definitivamente"
              >
                <Trash2 size={15} />
                <span>Eliminar Pin</span>
              </button>
            ) : <div />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary-pinterest"
                style={{
                  padding: '9px 22px',
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                disabled={isSubmitting || !title.trim()}
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
