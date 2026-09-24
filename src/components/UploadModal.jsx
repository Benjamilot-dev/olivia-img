import React, { useState, useRef } from 'react';
import UserAvatar from './UserAvatar';
import { X, UploadCloud, Image as ImageIcon, Folder, Tag, AlertCircle, CheckCircle2, Loader2, Sparkles, Cloud, Globe, Lock } from 'lucide-react';
import { uploadToCloudinary, getCloudinaryConfig } from '../services/cloudinary';

export default function UploadModal({
  isOpen,
  onClose,
  onPinCreated,
  folders,
  user
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('olivia-cat/portraits');
  const [customFolder, setCustomFolder] = useState('');
  const [isCustomFolder, setIsCustomFolder] = useState(false);
  const [visibility, setVisibility] = useState('public'); // 'public' | 'members'
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.)');
      return;
    }
    setFile(selectedFile);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      if (!title) {
        // Use clean filename as initial title
        const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !previewUrl) {
      setErrorMessage('Debes seleccionar o arrastrar una imagen primero.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para el pin de Olivia.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage('');

    const targetFolder = isCustomFolder && customFolder.trim()
      ? `olivia-cat/${customFolder.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : folder;

    try {
      let finalImageUrl = previewUrl;
      let finalFolder = targetFolder;

      // Try uploading to Cloudinary
      if (file) {
        try {
          const result = await uploadToCloudinary(file, targetFolder, (percent) => {
            setUploadProgress(percent);
          });
          finalImageUrl = result.url;
          finalFolder = result.folder || targetFolder;
        } catch (cloudErr) {
          console.warn("Cloudinary upload notice:", cloudErr);
          // If preset not yet created by user, fallback gracefully to data URL so pin is created
          setErrorMessage(`Aviso Cloudinary: ${cloudErr.message}. Se usará la imagen local para este Pin.`);
          finalImageUrl = previewUrl;
        }
      }

      // Process tags
      const tagList = tags
        .split(',')
        .map(t => t.trim().toLowerCase().replace(/^#/, ''))
        .filter(t => t.length > 0);
      if (!tagList.includes('olivia')) tagList.unshift('olivia');

      const newPin = {
        id: 'pin_' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
        cloudinaryFolder: finalFolder,
        visibility: visibility, // 'public' | 'members'
        likesCount: 1,
        savesCount: 0,
        author: {
          name: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Olivia Fan'),
          avatar: user?.photoURL || '/olivia-logo.png',
          badge: 'Creador'
        },
        authorUid: user?.uid || null,
        tags: tagList,
        comments: [],
        createdAt: new Date().toISOString()
      };

      onPinCreated(newPin);
      setIsUploading(false);
      onClose();
      // Reset form
      setFile(null);
      setPreviewUrl('');
      setTitle('');
      setDescription('');
      setVisibility('public');
      setTags('');
    } catch (err) {
      setErrorMessage(err.message || 'Error al procesar el pin');
      setIsUploading(false);
    }
  };

  const cloudinaryConfig = getCloudinaryConfig();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={22} />
      </button>

      <div className="upload-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800 }}>
              Crear Nuevo Pin Felino
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Almacenamiento en Cloudinary con organización en carpetas
            </p>
          </div>
          <div className="cloudinary-badge">
            <Cloud size={13} />
            <span>Cloud: {cloudinaryConfig.cloudName || 'Configurable'}</span>
          </div>
        </div>

        {user && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <UserAvatar user={user} size={22} />
            <span>Publicando como: <strong style={{ color: '#fff' }}>{user.displayName || user.email}</strong> (Google)</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#f87171'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dropzone */}
          {!previewUrl ? (
            <div
              className={`upload-dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={44} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
                Arrastra una foto aquí o haz clic para buscar
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Formatos recomendados: JPG, PNG, WEBP de alta calidad
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div className="upload-preview-wrap">
                <img src={previewUrl} alt="Vista previa" className="upload-preview-img" />
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setPreviewUrl(''); }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Cambiar imagen"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Título del Pin *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Olivia durmiendo al sol"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Folder selection */}
            <div className="form-group">
              <label className="form-label">Carpeta Cloudinary</label>
              {!isCustomFolder ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    value={folder}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomFolder(true);
                      } else {
                        setFolder(e.target.value);
                      }
                    }}
                  >
                    {folders.filter(f => f.slug).map(f => (
                      <option key={f.id} value={f.slug}>
                        📁 {f.name} ({f.slug})
                      </option>
                    ))}
                    <option value="__custom__">➕ + Nueva carpeta personalizada...</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre de la carpeta (ej: travesuras-nuevas)"
                    value={customFolder}
                    onChange={(e) => setCustomFolder(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsCustomFolder(false)}
                    style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                  >
                    Volver a lista
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Descripción o historia felina</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Cuéntanos qué hacía Olivia en esta foto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Etiquetas (separadas por comas)</label>
            <input
              type="text"
              className="form-input"
              placeholder="olivia, siesta, gata, ojos-azules, cute"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Visibility Selector */}
          <div className="form-group">
            <label className="form-label">Privacidad / Visibilidad</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setVisibility('public')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: visibility === 'public' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  background: visibility === 'public' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: visibility === 'public' ? '#34d399' : '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Globe size={16} />
                  <span>Pública (Visible para todos)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  Cualquier persona puede ver esta foto, incluso sin iniciar sesión ni estar registrado.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('members')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: visibility === 'members' ? '2px solid #8b5cf6' : '1px solid var(--border-subtle)',
                  background: visibility === 'members' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: visibility === 'members' ? '#c4b5fd' : '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Lock size={16} />
                  <span>Solo Registrados (Privada)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  Solo los usuarios que hayan iniciado sesión con su cuenta pueden ver esta foto.
                </span>
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Subiendo a Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #e60023)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary-pinterest"
              disabled={isUploading}
              style={{ padding: '10px 24px' }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publicar en Olivia the Cat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
