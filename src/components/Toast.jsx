import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" onClick={() => onDismiss(toast.id)}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="#ef4444" />
          ) : toast.type === 'info' ? (
            <Info size={18} color="#60a5fa" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
