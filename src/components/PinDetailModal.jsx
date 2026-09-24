import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  onToggleVisibility
}) {
  const [newComment, setNewComment] = useState('');

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

    const commentObj = {
      id: 'c_' + Date.now(),
      author: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Invitado Michi'),
      avatar: user?.photoURL || '/olivia-logo.png',
      text: newComment.trim(),
      date: 'Ahora'
    };

    onAddComment(pin.id, commentObj);
    setNewComment('');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pin.imageUrl;
    link.target = '_blank';
    link.download = `${pin.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const folderName = pin.cloudinaryFolder || 'olivia-cat/portraits';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Floating Close Button */}
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={20} />
      </button>

      <div className="pin-detail-card" onClick={(e) => e.stopPropagation()}>
        {/* Left Side: Image Display */}
        <div className="pin-detail-media">
          <img
            src={pin.imageUrl}
            alt={pin.title}
            className="pin-detail-img"
          />
        </div>

        {/* Right Side: Details & Interaction */}
        <div className="pin-detail-info">
          {/* Top Actions Bar (Desktop & Tablet) */}
          <div className="pin-detail-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <a
                href={pin.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-icon"
                title="Abrir imagen original"
              >
                <ExternalLink size={16} />
              </a>
              {canManage && (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => onToggleVisibility && onToggleVisibility(pin)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      color: pin.visibility === 'members' ? '#c4b5fd' : '#34d399',
                      border: pin.visibility === 'members' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                      background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title={pin.visibility === 'members' ? "Clic para hacerla pública" : "Clic para hacerla privada"}
                  >
                    {pin.visibility === 'members' ? <Globe size={13} /> : <Lock size={13} />}
                    <span>{pin.visibility === 'members' ? 'Hacer Pública' : 'Hacer Privada'}</span>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className={`btn-icon ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                title="Dar Ronroneo / Me Gusta"
                style={{
                  background: isLiked ? 'var(--accent-rose)' : 'var(--bg-card-hover)',
                  color: isLiked ? '#fff' : 'inherit'
                }}
              >
                <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
              </button>

              <button
                className={`btn-primary-pinterest ${isSaved ? 'saved' : ''}`}
                onClick={() => onSave(pin)}
                style={{
                  background: isSaved ? '#10b981' : 'var(--accent-pinterest)',
                  padding: '8px 16px',
                  fontSize: '0.85rem'
                }}
              >
                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>
            </div>
          </div>

          {/* Badges Row */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="cloudinary-badge" title="Álbum">
              <Cloud size={12} />
              <span>Álbum: {folderName.split('/').pop()}</span>
            </span>

            {/* Visibility Badge */}
            <span style={{
              background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: pin.visibility === 'members' ? '#c4b5fd' : '#34d399',
              border: pin.visibility === 'members' ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
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
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.86rem', padding: '8px 14px' }}
              />
              <button
                type="submit"
                className="btn-primary-pinterest"
                style={{ padding: '0 14px', borderRadius: 'var(--radius-full)' }}
                title="Publicar"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="pin-detail-mobile-actions">
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-icon" onClick={() => onShare(pin)} title="Compartir">
              <Share2 size={16} />
            </button>
            <button className="btn-icon" onClick={handleDownload} title="Descargar">
              <Download size={16} />
            </button>
            {isAdmin && (
              <button
                className="btn-icon"
                onClick={() => onDeletePin && onDeletePin(pin)}
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.1)' }}
                title="Eliminar Pin (Solo Admin)"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn-icon ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              style={{
                background: isLiked ? 'var(--accent-rose)' : 'var(--bg-card-hover)',
                color: isLiked ? '#fff' : 'inherit'
              }}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              className={`btn-primary-pinterest ${isSaved ? 'saved' : ''}`}
              onClick={() => onSave(pin)}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? "Guardado" : "Guardar"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
