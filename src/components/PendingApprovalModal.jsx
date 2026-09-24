import React from 'react';
import { X, Clock, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function PendingApprovalModal({
  isOpen,
  onClose,
  user,
  status = 'pending'
}) {
  if (!isOpen) return null;

  const isRejected = status === 'rejected';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={20} />
      </button>

      <div
        className="upload-modal-card"
        style={{ maxWidth: '460px', textAlign: 'center', padding: '36px 24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status Icon */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: isRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isRejected ? '#ef4444' : '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: isRejected ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 20px rgba(245, 158, 11, 0.3)'
        }}>
          {isRejected ? <ShieldAlert size={34} /> : <Clock size={34} />}
        </div>

        {/* User Card */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <UserAvatar user={user} size={24} />
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>
            {user?.displayName || user?.email}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>
          {isRejected ? 'Acceso No Autorizado' : 'Solicitud Pendiente de Aprobación'}
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '22px' }}>
          {isRejected
            ? 'El Administrador ha restringido el acceso de esta cuenta para subir fotos o crear carpetas.'
            : 'Tu cuenta ha sido registrada en el sistema. Para garantizar la seguridad de la galería, el Administrador debe aceptar tu solicitud antes de que puedas subir fotos a Cloudinary o crear nuevas carpetas.'}
        </p>

        {/* Status Badge */}
        <div style={{
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ color: 'var(--text-dim)' }}>Estado de tu cuenta:</span>
          <span style={{
            fontWeight: 700,
            color: isRejected ? '#ef4444' : '#fbbf24',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isRejected ? '🚫 Acceso Denegado' : '⏳ En Espera del Administrador'}
          </span>
        </div>

        <button
          className="btn-primary-pinterest"
          onClick={onClose}
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
