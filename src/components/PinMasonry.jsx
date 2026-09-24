import React from 'react';
import PinCard from './PinCard';
import { SearchX, Sparkles } from 'lucide-react';

export default function PinMasonry({
  pins,
  onSelectPin,
  onLikePin,
  onSavePin,
  likedPinIds,
  savedPinIds,
  onSharePin,
  onResetFilters
}) {
  if (pins.length === 0) {
    return (
      <div className="masonry-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          maxWidth: '440px',
          margin: '0 auto',
          background: 'var(--bg-card)',
          padding: '40px 30px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <SearchX size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No encontramos pines aquí</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Prueba buscando con otra palabra o selecciona otra carpeta de Cloudinary.
          </p>
          <button className="btn-primary-pinterest" onClick={onResetFilters} style={{ margin: '0 auto' }}>
            <Sparkles size={16} />
            <span>Ver todos los Pines</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="masonry-wrapper" id="masonry-grid">
      <div className="masonry-grid">
        {pins.map((pin) => (
          <PinCard
            key={pin.id}
            pin={pin}
            onClick={onSelectPin}
            onLike={onLikePin}
            onSave={onSavePin}
            isLiked={likedPinIds.includes(pin.id)}
            isSaved={savedPinIds.includes(pin.id)}
            onShare={onSharePin}
          />
        ))}
      </div>
    </main>
  );
}
