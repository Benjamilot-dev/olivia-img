import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  RotateCcw, 
  Info, 
  X, 
  Folder, 
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'info' | 'reset'
  itemPreview = null, // { image, title, subtitle, badge, icon }
  options = null, // Array of custom buttons: [{ label, variant, onClick, icon }]
  onConfirm
}) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Icon and accent configuration based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 size={24} />,
          iconBg: 'rgba(239, 68, 68, 0.15)',
          iconColor: '#ef4444',
          iconBorder: 'rgba(239, 68, 68, 0.3)',
          glow: 'rgba(239, 68, 68, 0.25)',
          confirmBtnBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          confirmBtnHover: '#b91c1c'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#f59e0b',
          iconBorder: 'rgba(245, 158, 11, 0.3)',
          glow: 'rgba(245, 158, 11, 0.25)',
          confirmBtnBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          confirmBtnHover: '#b45309'
        };
      case 'reset':
        return {
          icon: <RotateCcw size={24} />,
          iconBg: 'rgba(168, 85, 247, 0.15)',
          iconColor: '#c084fc',
          iconBorder: 'rgba(168, 85, 247, 0.3)',
          glow: 'rgba(168, 85, 247, 0.25)',
          confirmBtnBg: 'linear-gradient(135deg, #a855f7, #9333ea)',
          confirmBtnHover: '#7e22ce'
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} />,
          iconBg: 'rgba(59, 130, 246, 0.15)',
          iconColor: '#60a5fa',
          iconBorder: 'rgba(59, 130, 246, 0.3)',
          glow: 'rgba(59, 130, 246, 0.25)',
          confirmBtnBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          confirmBtnHover: '#1d4ed8'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div 
      className="confirm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        className="confirm-modal-card"
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px ${vStyles.glow}`,
          position: 'relative',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glow at the top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${vStyles.iconColor}, transparent)`
        }} />

        {/* Close button */}
        <button 
          onClick={onClose}
          aria-label="Cerrar ventana"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <X size={16} />
        </button>

        {/* Header with glowing icon badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: vStyles.iconBg,
            border: `1px solid ${vStyles.iconBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: vStyles.iconColor,
            flexShrink: 0,
            boxShadow: `0 8px 16px -4px ${vStyles.glow}`
          }}>
            {vStyles.icon}
          </div>
          <div style={{ paddingRight: '1.5rem' }}>
            <h3 style={{
              margin: '0 0 0.35rem 0',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#f8fafc',
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}>
              {title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#94a3b8',
              lineHeight: 1.5
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* Optional Item Preview Card */}
        {itemPreview && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            {itemPreview.image ? (
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                flexShrink: 0,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <img 
                  src={itemPreview.image} 
                  alt={itemPreview.title || 'Foto'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : itemPreview.icon === 'folder' ? (
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                flexShrink: 0
              }}>
                <Folder size={22} />
              </div>
            ) : null}

            <div style={{ flex: 1, minWidth: 0 }}>
              {itemPreview.title && (
                <div style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#f1f5f9',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {itemPreview.title}
                </div>
              )}
              {itemPreview.subtitle && (
                <div style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {itemPreview.subtitle}
                </div>
              )}
            </div>

            {itemPreview.badge && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontWeight: 500,
                flexShrink: 0
              }}>
                {itemPreview.badge}
              </span>
            )}
          </div>
        )}

        {/* Buttons / Actions */}
        {options && options.length > 0 ? (
          /* Custom options list (e.g. for folders with multiple choices) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  opt.onClick();
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: opt.variant === 'danger' 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : opt.variant === 'primary'
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  background: opt.variant === 'danger'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : opt.variant === 'primary'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'rgba(255, 255, 255, 0.07)',
                  color: '#ffffff',
                  boxShadow: opt.variant === 'danger' 
                    ? '0 4px 14px rgba(239, 68, 68, 0.3)' 
                    : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginTop: '0.2rem'
              }}
            >
              {cancelText}
            </button>
          </div>
        ) : (
          /* Standard 2-button layout: Cancel & Confirm */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#cbd5e1',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#ffffff',
                background: vStyles.confirmBtnBg,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${vStyles.glow}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${vStyles.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 15px ${vStyles.glow}`;
              }}
            >
              {vStyles.icon && React.cloneElement(vStyles.icon, { size: 16 })}
              <span>{confirmText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
