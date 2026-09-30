import React, { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import { 
  X, 
  Heart, 
  Bookmark, 
  Share2, 
  Download, 
  Cloud, 
  Send, 
  MessageCircle, 
  Calendar, 
  ExternalLink, 
  Sparkles,
  Trash2,
  Globe,
  Lock,
  Pencil,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Link2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isSafeUrl, sanitizeText, sanitizeComment, safeOpenUrl } from '../utils/security';

export default function PinDetailModal({
  pin,
  onClose,
  onLike,
  onSave,
  isLiked,
  isSaved,
  onShare,
  onSelectTag,
  onAddComment,
  user,
  isAdmin = false,
  onDeletePin,
  onToggleVisibility,
  onEditPin
}) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyImageLink = async () => {
    try {
      await navigator.clipboard.writeText(pin.imageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      const input = document.createElement('input');
      input.value = pin.imageUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Reset zoom whenever expanded state changes or pin changes
  useEffect(() => {
    setIsZoomed(false);
  }, [isExpanded, pin?.id]);

  // Handle ESC key to exit expanded mode or close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, onClose]);

  // Check if current user is the author or admin
  const isAuthor = Boolean(
    user && (
      (pin.authorUid && pin.authorUid === user.uid) ||
      (pin.author?.uid && pin.author.uid === user.uid) ||
      (pin.authorEmail && pin.authorEmail === user.email)
    )
  );
  const canManage = isAdmin || isAuthor;

  if (!pin) return null;

  const handleLike = (e) => {
    onLike(pin.id);
    if (!isLiked) {
      confetti({
        particleCount: 30,
        spread: 55,
        colors: ['#f43f5e', '#f59e0b', '#ec4899', '#ffffff']
      });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = sanitizeComment({
      id: 'c_' + Date.now(),
      author: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Invitado Michi'),
      avatar: user?.photoURL || '/olivia-logo.png',
      text: newComment.trim(),
      date: 'Ahora'
    });

    onAddComment(pin.id, commentObj);
    setNewComment('');
  };

  const handleDownload = async () => {
    if (!isSafeUrl(pin.imageUrl, true)) return;
    const safeFilename = `${(sanitizeText(pin.title) || 'olivia_pin').replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_')}.jpg`;
    try {
      if (pin.imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = pin.imageUrl;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const response = await fetch(pin.imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      safeOpenUrl(pin.imageUrl);
    }
  };

  const albumLabel = pin.cloudinaryFolder ? pin.cloudinaryFolder.split('/').pop() : 'Sin Álbum';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Floating Close Button */}
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={20} />
      </button>

      <div className="pin-detail-card" onClick={(e) => e.stopPropagation()}>
        {/* Left Side: Image Display (Click to expand fitted to screen) */}
        <div
          className="pin-detail-media"
          onClick={() => setIsExpanded(true)}
          title="Haz clic para ver más grande ajustado a la pantalla ⛶"
        >
          <img
            src={pin.imageUrl}
            alt={pin.title}
            className="pin-detail-img"
          />

          <div className="pin-media-expand-badge">
            <Maximize2 size={13} />
            <span>Ver más grande</span>
          </div>
        </div>

        {/* Right Side: Details & Interaction */}
        <div className="pin-detail-info">
          {/* Top Actions Bar (Desktop & Tablet) */}
          <div className="pin-detail-header-actions">
            <div className="pin-detail-header-left">
              <button
                className="btn-icon"
                onClick={() => setIsExpanded(true)}
                title="Ver foto más grande ajustada a la pantalla ⛶"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <Maximize2 size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={() => onShare(pin)}
                title="Compartir Pin"
              >
                <Share2 size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={handleDownload}
                title="Descargar Foto"
              >
                <Download size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={handleCopyImageLink}
                style={{
                  color: copiedLink ? '#10b981' : undefined,
                  borderColor: copiedLink ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  background: copiedLink ? 'rgba(16, 185, 129, 0.15)' : undefined
                }}
                title={copiedLink ? "¡Dirección copiada!" : "Copiar dirección de la imagen 🔗"}
              >
                {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
              </button>
              <a
                href={isSafeUrl(pin.imageUrl) ? pin.imageUrl : '#'}
                onClick={(e) => {
                  if (!isSafeUrl(pin.imageUrl)) e.preventDefault();
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon"
                title="Abrir imagen original"
              >
                <ExternalLink size={16} />
              </a>
              {canManage && (
                <>
                  <button
                    className="btn-icon"
                    onClick={() => onEditPin && onEditPin(pin)}
                    style={{
                      color: '#f59e0b',
                      borderColor: 'rgba(245, 158, 11, 0.35)',
                      background: 'rgba(245, 158, 11, 0.12)'
                    }}
                    title="Editar Pin y cambiar Álbum ✏️"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onToggleVisibility && onToggleVisibility(pin)}
                    style={{
                      color: pin.visibility === 'members' ? '#c4b5fd' : '#34d399',
                      borderColor: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                      background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.14)' : 'rgba(16, 185, 129, 0.14)'
                    }}
                    title={pin.visibility === 'members' ? "Foto Privada (Solo tú y Admin). Clic para hacerla Pública 🌍" : "Foto Pública. Clic para hacerla Privada (Solo tú y Admin) 🔒"}
                  >
                    {pin.visibility === 'members' ? <Lock size={16} /> : <Globe size={16} />}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onDeletePin && onDeletePin(pin)}
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.1)' }}
                    title={isAuthor && !isAdmin ? "Eliminar mi Pin" : "Eliminar este Pin (Admin)"}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="pin-detail-header-right">
              <button
                className={`btn-icon ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                title="Dar Ronroneo / Me Gusta"
                style={{
                  background: isLiked ? 'var(--accent-rose)' : 'var(--bg-card-hover)',
                  color: isLiked ? '#fff' : 'inherit'
                }}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              </button>

              <button
                className={`pin-detail-save-btn ${isSaved ? 'saved' : ''}`}
                onClick={() => onSave(pin)}
                title={isSaved ? "Pin guardado" : "Guardar este Pin"}
              >
                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>
            </div>
          </div>

          {/* Badges Row */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="cloudinary-badge"
              onClick={() => canManage && onEditPin && onEditPin(pin)}
              style={{
                cursor: canManage ? 'pointer' : 'default',
                background: pin.cloudinaryFolder ? 'rgba(56, 189, 248, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                borderColor: pin.cloudinaryFolder ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.25)',
                color: pin.cloudinaryFolder ? '#38bdf8' : '#94a3b8'
              }}
              title={canManage ? "Clic para mover de Álbum o dejar Sin Álbum 📁✏️" : "Álbum"}
            >
              <Cloud size={12} />
              <span>Álbum: {albumLabel}</span>
              {canManage && <Pencil size={11} style={{ opacity: 0.8, marginLeft: 2 }} />}
            </span>

            {/* Visibility Badge (Interactive for author/admin) */}
            <span
              onClick={() => canManage && onToggleVisibility && onToggleVisibility(pin)}
              style={{
                cursor: canManage ? 'pointer' : 'default',
                background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: pin.visibility === 'members' ? '#c4b5fd' : '#34d399',
                border: pin.visibility === 'members' ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)'
              }}
              title={canManage ? "Clic para cambiar estado de visibilidad" : ""}
            >
              {pin.visibility === 'members' ? <Lock size={12} /> : <Globe size={12} />}
              <span>
                {pin.visibility === 'members'
                  ? isAuthor && !isAdmin
                    ? 'Foto Privada (Solo tú y Admin)'
                    : isAdmin
                    ? `Foto Privada de ${pin.author?.name || 'Usuario'} (Vista Admin)`
                    : 'Foto Privada'
                  : 'Pública para Todos'}
              </span>
              {canManage && <span style={{ opacity: 0.7, fontSize: '0.68rem', marginLeft: '2px' }}>(Cambiar)</span>}
            </span>

            {pin.isOfficial && (
              <span style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={10} /> Ilustración Oficial
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h2 className="pin-detail-title">{pin.title}</h2>
          <p className="pin-detail-desc">{pin.description || 'Sin descripción adicional para este pin.'}</p>

          {/* Tags */}
          {pin.tags && pin.tags.length > 0 && (
            <div className="pin-tags-list">
              {pin.tags.map((tag, idx) => (
                <button
                  key={idx}
                  className="pin-tag-chip"
                  onClick={() => {
                    onSelectTag(tag);
                    onClose();
                  }}
                  title={`Filtrar por #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="pin-detail-author-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserAvatar author={pin.author} size={38} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{pin.author?.name || 'Olivia Oficial'}</h4>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>{pin.author?.badge || 'Creador Felino'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Heart size={11} color="#f43f5e" fill="#f43f5e" />
                <span>{(pin.likesCount || 0) + (isLiked ? 1 : 0)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                <Calendar size={10} />
                <span>{pin.createdAt ? new Date(pin.createdAt).toLocaleDateString() : 'Hoy'}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}>
              <MessageCircle size={15} color="#f59e0b" />
              <span>Comentarios ({pin.comments?.length || 0})</span>
            </h3>

            {/* Comments list */}
            <div className="pin-detail-comments-list">
              {pin.comments && pin.comments.length > 0 ? (
                pin.comments.map((comm) => (
                  <div key={comm.id} style={{ display: 'flex', gap: '8px', fontSize: '0.84rem' }}>
                    <UserAvatar src={comm.avatar} name={comm.author} size={26} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.82rem' }}>{comm.author}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{comm.date}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.35 }}>{comm.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Aún no hay comentarios. ¡Sé el primero en escribir uno!
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
              <input
                type="text"
                className="form-input"
                placeholder={user ? "Escribe un comentario..." : "Escribe como invitado..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.86rem', padding: '8px 14px', flex: 1, minWidth: 0 }}
              />
              <button
                type="submit"
                className="btn-primary-pinterest"
                style={{ padding: '0 14px', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
                title="Publicar"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="pin-detail-mobile-actions">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button className="btn-icon" onClick={() => setIsExpanded(true)} title="Ver más grande ajustado a la pantalla">
              <Maximize2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={handleCopyImageLink}
              style={{
                color: copiedLink ? '#10b981' : undefined,
                borderColor: copiedLink ? 'rgba(16, 185, 129, 0.4)' : undefined,
                background: copiedLink ? 'rgba(16, 185, 129, 0.15)' : undefined
              }}
              title={copiedLink ? "¡Dirección copiada!" : "Copiar dirección de la imagen"}
            >
              {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
            </button>
            <button className="btn-icon" onClick={() => onShare(pin)} title="Compartir">
              <Share2 size={16} />
            </button>
            <button className="btn-icon" onClick={handleDownload} title="Descargar">
              <Download size={16} />
            </button>
            <a
              href={isSafeUrl(pin.imageUrl) ? pin.imageUrl : '#'}
              onClick={(e) => {
                if (!isSafeUrl(pin.imageUrl)) e.preventDefault();
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="Abrir original"
            >
              <ExternalLink size={16} />
            </a>
            {canManage && (
              <>
                <button
                  className="btn-icon"
                  onClick={() => onEditPin && onEditPin(pin)}
                  style={{
                    color: '#f59e0b',
                    borderColor: 'rgba(245, 158, 11, 0.35)',
                    background: 'rgba(245, 158, 11, 0.12)'
                  }}
                  title="Editar y cambiar Álbum"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => onToggleVisibility && onToggleVisibility(pin)}
                  style={{
                    color: pin.visibility === 'members' ? '#c4b5fd' : '#34d399',
                    borderColor: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                    background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.14)' : 'rgba(16, 185, 129, 0.14)'
                  }}
                  title={pin.visibility === 'members' ? "Hacer pública" : "Hacer privada"}
                >
                  {pin.visibility === 'members' ? <Lock size={15} /> : <Globe size={15} />}
                </button>
                <button
                  className="btn-icon"
                  onClick={() => onDeletePin && onDeletePin(pin)}
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.1)' }}
                  title="Eliminar Pin"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button
              className={`btn-icon ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              style={{
                background: isLiked ? 'var(--accent-rose)' : 'var(--bg-card-hover)',
                color: isLiked ? '#fff' : 'inherit'
              }}
              title="Me gusta"
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              className={`pin-detail-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => onSave(pin)}
              title={isSaved ? "Guardado" : "Guardar"}
            >
              <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? "Guardado" : "Guardar"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Theater Lightbox: Foto más grande pero ajustada a la pantalla */}
      {isExpanded && (
        <div
          className="pin-theater-overlay"
          onClick={() => setIsExpanded(false)}
        >
          {/* Top Bar with Title and Actions */}
          <div className="pin-theater-top-bar" onClick={(e) => e.stopPropagation()}>
            <div className="pin-theater-info">
              <h3 className="pin-theater-title">{pin.title || 'Foto de Olivia'}</h3>
              <span className="pin-theater-badge">
                {albumLabel ? `Álbum: ${albumLabel}` : 'Galería general'}
              </span>
            </div>

            <div className="pin-theater-actions">
              <button
                className="btn-icon pin-theater-btn"
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? "Ajustar foto a la pantalla" : "Ver tamaño 100% original"}
              >
                {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
              </button>
              <button
                className="btn-icon pin-theater-btn"
                onClick={handleCopyImageLink}
                style={{
                  color: copiedLink ? '#10b981' : undefined,
                  borderColor: copiedLink ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  background: copiedLink ? 'rgba(16, 185, 129, 0.22)' : undefined
                }}
                title={copiedLink ? "¡Dirección copiada al portapapeles!" : "Copiar dirección de la imagen 🔗"}
              >
                {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
              </button>
              <button
                className="btn-icon pin-theater-btn"
                onClick={() => onShare(pin)}
                title="Compartir foto"
              >
                <Share2 size={16} />
              </button>
              <button
                className="btn-icon pin-theater-btn"
                onClick={handleDownload}
                title="Descargar foto"
              >
                <Download size={16} />
              </button>
              <button
                className={`btn-icon pin-theater-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                style={{
                  background: isLiked ? 'var(--accent-rose)' : undefined,
                  color: isLiked ? '#fff' : undefined
                }}
                title="Me gusta"
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                className="btn-icon pin-theater-btn pin-theater-close"
                onClick={() => setIsExpanded(false)}
                title="Volver a la ventana normal (Esc)"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Center Image Container fitted to screen */}
          <div
            className={`pin-theater-image-wrapper ${isZoomed ? 'zoomed' : ''}`}
            onClick={() => setIsExpanded(false)}
          >
            {copiedLink && (
              <div className="pin-theater-copied-badge" onClick={(e) => e.stopPropagation()}>
                <Check size={14} />
                <span>¡Dirección de la imagen copiada al portapapeles! 📋</span>
              </div>
            )}
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className={`pin-theater-img ${isZoomed ? 'zoomed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              title={isZoomed ? "Clic para ajustar a la pantalla" : "Clic para ver tamaño 100% original"}
            />
          </div>

          {/* Bottom hint bar */}
          <div className="pin-theater-bottom-hint" onClick={(e) => e.stopPropagation()}>
            <span>
              {isZoomed 
                ? '🔍 Tamaño original • Haz clic en la foto para ajustar a la pantalla' 
                : '✨ Ajustado a la pantalla • Haz clic en la foto para zoom 100% • Esc para volver'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
