import React, { useState } from 'react';
import UserAvatar from './UserAvatar';
import { Heart, Bookmark, Share2, Download, Cloud, Trash2, Globe, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PinCard({
  pin,
  onClick,
  onLike,
  onSave,
  isLiked,
  isSaved,
  onShare,
  isAdmin = false,
  onDeletePin,
  onToggleVisibility
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(pin.id);
    if (!isLiked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 22,
        spread: 40,
        origin: { x, y },
        colors: ['#f43f5e', '#f59e0b', '#ec4899', '#ffffff']
      });
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(pin);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare(pin);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = pin.imageUrl;
    link.target = '_blank';
    link.download = `${pin.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeletePin) {
      onDeletePin(pin);
    }
  };

  const folderName = pin.cloudinaryFolder ? pin.cloudinaryFolder.split('/').pop() : 'general';

  return (
    <div className="pin-card-wrapper">
      <div className="pin-card" onClick={() => onClick(pin)}>
        {/* Image Box */}
        <div className="pin-image-box" style={{ minHeight: imgLoaded ? 'auto' : '180px' }}>
          <img
            src={pin.imageUrl}
            alt={pin.title}
            className="pin-img"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0.4, transition: 'opacity 0.3s ease' }}
          />

          {/* Mobile Top Folder Tag (visible on mobile where hover doesn't exist) */}
          <div className="pin-mobile-badge-top" style={{ display: 'flex', gap: '4px' }}>
            <span className="pin-folder-badge-mini" title={`Cloudinary: ${pin.cloudinaryFolder}`}>
              <Cloud size={10} color="#60a5fa" />
              <span>{folderName}</span>
            </span>
            {pin.visibility === 'members' && (
              <span style={{
                background: 'rgba(139, 92, 246, 0.85)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.66rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }} title="Solo para miembros registrados">
                <Lock size={9} />
              </span>
            )}
          </div>

          {/* Desktop Hover Overlay */}
          <div className="pin-overlay">
            <div className="pin-overlay-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pin-folder-badge" title={`Guardado en Cloudinary: ${pin.cloudinaryFolder}`}>
                  <Cloud size={11} color="#60a5fa" />
                  <span>{folderName}</span>
                </span>
                {pin.visibility === 'members' && (
                  <span style={{
                    background: 'rgba(139, 92, 246, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }} title="Foto visible solo para miembros registrados">
                    <Lock size={10} />
                    <span>Solo Registrados</span>
                  </span>
                )}
              </div>

              <button
                className={`pin-save-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
                title={isSaved ? "Guardado en tus Pines" : "Guardar este Pin"}
              >
                <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>
            </div>

            <div className="pin-overlay-bottom">
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="pin-action-btn-circle"
                  onClick={handleShare}
                  title="Compartir enlace"
                >
                  <Share2 size={15} />
                </button>
                <button
                  className="pin-action-btn-circle"
                  onClick={handleDownload}
                  title="Descargar imagen"
                >
                  <Download size={15} />
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="pin-action-btn-circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleVisibility) onToggleVisibility(pin);
                      }}
                      style={{
                        background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.95)' : 'rgba(16, 185, 129, 0.95)',
                        color: '#fff'
                      }}
                      title={pin.visibility === 'members' ? "Foto PRIVADA. Clic para hacerla Pública 🌍" : "Foto PÚBLICA. Clic para hacerla Solo para Registrados 🔒"}
                    >
                      {pin.visibility === 'members' ? <Lock size={14} /> : <Globe size={14} />}
                    </button>
                    <button
                      className="pin-action-btn-circle"
                      onClick={handleDelete}
                      style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff' }}
                      title="Eliminar este Pin (Solo Admin)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

              <button
                className={`pin-action-btn-circle ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                title={isLiked ? "Ya no me gusta" : "Me gusta / Ronroneo"}
              >
                <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* Info & Mobile Actions */}
        <div className="pin-info">
          <h3 className="pin-card-title">{pin.title}</h3>

          <div className="pin-card-meta">
            <div className="pin-author-wrap">
              <UserAvatar author={pin.author} size={20} className="pin-author-mini-avatar" />
              <span className="pin-author-name">{pin.author?.name || 'Olivia'}</span>
            </div>

            <div className="pin-card-actions-row">
              {isAdmin && (
                <>
                  <button
                    className="pin-quick-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleVisibility) onToggleVisibility(pin);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: pin.visibility === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: pin.visibility === 'members' ? '#a78bfa' : '#34d399',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title={pin.visibility === 'members' ? "Hacer Pública" : "Hacer Solo Miembros"}
                  >
                    {pin.visibility === 'members' ? <Lock size={11} /> : <Globe size={11} />}
                  </button>
                  <button
                    className="pin-quick-action-btn"
                    onClick={handleDelete}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Eliminar Pin (Admin)"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}

              {/* Quick Mobile Save Button */}
              <button
                className={`pin-quick-save-btn ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
                title="Guardar"
              >
                <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
              </button>

              {/* Quick Mobile Like Button */}
              <button
                className={`pin-quick-like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                title="Me gusta"
              >
                <Heart size={13} color="#f43f5e" fill={isLiked ? "#f43f5e" : "none"} />
                <span>{(pin.likesCount || 0) + (isLiked ? 1 : 0)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
