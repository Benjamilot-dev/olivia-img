import React, { useState } from 'react';
import UserAvatar from './UserAvatar';
import { Heart, Bookmark, Share2, Download, Cloud } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PinCard({
  pin,
  onClick,
  onLike,
  onSave,
  isLiked,
  isSaved,
  onShare
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
          <div className="pin-mobile-badge-top">
            <span className="pin-folder-badge-mini" title={`Cloudinary: ${pin.cloudinaryFolder}`}>
              <Cloud size={10} color="#60a5fa" />
              <span>{folderName}</span>
            </span>
          </div>

          {/* Desktop Hover Overlay */}
          <div className="pin-overlay">
            <div className="pin-overlay-top">
              <span className="pin-folder-badge" title={`Guardado en Cloudinary: ${pin.cloudinaryFolder}`}>
                <Cloud size={11} color="#60a5fa" />
                <span>{folderName}</span>
              </span>

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
