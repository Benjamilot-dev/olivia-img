import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';
        const isWarning = toast.type === 'warning';
        
        let accentColor = '#10b981'; // emerald
        let iconBg = 'rgba(16, 185, 129, 0.12)';
        let IconComponent = CheckCircle2;

        if (isError) {
          accentColor = '#ef4444';
          iconBg = 'rgba(239, 68, 68, 0.15)';
          IconComponent = AlertCircle;
        } else if (isWarning) {
          accentColor = '#f59e0b';
          iconBg = 'rgba(245, 158, 11, 0.15)';
          IconComponent = AlertTriangle;
        } else if (isInfo) {
          accentColor = '#38bdf8';
          iconBg = 'rgba(56, 189, 248, 0.15)';
          IconComponent = Info;
        }

        return (
          <div
            key={toast.id}
            className="toast-luxury"
            onClick={() => onDismiss(toast.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              minWidth: '280px',
              maxWidth: '420px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderLeft: `4px solid ${accentColor}`,
              borderRadius: '14px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              color: '#f8fafc',
              fontSize: '0.88rem',
              fontWeight: 500,
              lineHeight: 1.4,
              animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'transform 0.18s ease, opacity 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
                flexShrink: 0
              }}>
                <IconComponent size={18} />
              </div>
              <span style={{ color: '#f1f5f9' }}>{toast.message}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              aria-label="Cerrar notificación"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
