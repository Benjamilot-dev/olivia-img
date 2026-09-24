import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Shield, CheckCircle, FolderPlus, UploadCloud, LogIn } from 'lucide-react';
import { loginWithGoogle } from '../firebase/config';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  actionReason = '' // 'upload' | 'folder' | ''
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.user) {
      onAuthSuccess(res.user, `¡Bienvenido(a), ${res.user.displayName || 'Gatito'}! Sesión iniciada con Google.`);
      onClose();
    } else {
      setError(res.error || 'No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={20} />
      </button>

      <div
        className="upload-modal-card"
        style={{ maxWidth: '440px', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Olivia Avatar with Glowing Ring */}
        <div style={{
          width: '74px',
          height: '74px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          overflow: 'hidden',
          padding: '3px',
          background: 'linear-gradient(135deg, #f59e0b, #e60023, #8b5cf6)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
            <img src="/olivia-logo.png" alt="Olivia the Cat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px' }}>
          {actionReason === 'upload'
            ? 'Inicia sesión para subir fotos'
            : actionReason === 'folder'
            ? 'Inicia sesión para crear carpetas'
            : 'Acceso con Google'}
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {actionReason === 'upload'
            ? 'Para almacenar tus fotos en Cloudinary y compartirlas en la galería de Olivia, autentícate con tu cuenta de Google.'
            : actionReason === 'folder'
            ? 'Para organizar y crear nuevas carpetas personalizadas en Cloudinary, accede con tu cuenta de Google.'
            : 'Solo los usuarios autenticados con Google pueden subir imágenes y crear carpetas personalizadas.'}
        </p>

        {/* Perks Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          textAlign: 'left',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={15} color="#f59e0b" />
            <span>Subir imágenes a <strong>Cloudinary</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={15} color="#8b5cf6" />
            <span>Crear y organizar <strong>carpetas felinas</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color="#10b981" />
            <span>Tu nombre y foto de Google en tus pines</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={15} color="#3b82f6" />
            <span>Acceso seguro con moderación y aprobación de cuenta</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#f87171',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#ffffff',
            color: '#111827',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.94rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="btn-google-auth"
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{isLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
        </button>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '16px' }}>
          Autenticación oficial y segura respaldada por <strong>Firebase Auth</strong>
        </p>
      </div>
    </div>
  );
}
