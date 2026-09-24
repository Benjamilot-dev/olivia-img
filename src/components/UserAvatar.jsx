import React, { useState } from 'react';

export default function UserAvatar({
  user,
  author,
  src,
  name: directName,
  size = 30,
  className = 'user-avatar-img'
}) {
  const [hasError, setHasError] = useState(false);

  // Extract avatar URL and display name from any provided shape
  const photoUrl = src || user?.photoURL || author?.avatar;
  const name = directName || user?.displayName || user?.email || author?.name || 'Usuario';
  const initial = (name.trim().charAt(0) || 'O').toUpperCase();

  // If valid avatar URL and hasn't errored
  if (photoUrl && !hasError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={className}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0
        }}
      />
    );
  }

  // Fallback: Elegant styled avatar with user initial
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f59e0b 0%, #e60023 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${Math.max(10, Math.round(size * 0.44))}px`,
        flexShrink: 0,
        textTransform: 'uppercase',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      title={name}
    >
      {initial}
    </div>
  );
}
