import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div style={s.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 6000);
    return () => clearTimeout(timer);
  }, []);

  const icons = { Fire: '🔥', Medical: '🚑', Accident: '🚗', Flood: '🌊', 'Power Cut': '⚡', Other: '🆘' };
  const sevColor = { critical: '#E24B4A', moderate: '#EF9F27', low: '#639922' };

  return (
    <div style={s.toast}>
      <div style={s.toastLeft}>
        <div style={{...s.sevBar, background: sevColor[toast.severity] || '#E24B4A'}}></div>
        <div style={s.toastIcon}>{icons[toast.type] || '🆘'}</div>
        <div style={s.toastBody}>
          <div style={s.toastTitle}>🚨 New Crisis Alert</div>
          <div style={s.toastType}>{toast.type} — {toast.severity}</div>
          {toast.location_name && <div style={s.toastLoc}>📍 {toast.location_name}</div>}
          {toast.description && <div style={s.toastDesc}>{toast.description.slice(0, 60)}{toast.description.length > 60 ? '...' : ''}</div>}
          <div style={s.toastName}>Reported by {toast.requester_name}</div>
        </div>
      </div>
      <button style={s.closeBtn} onClick={() => removeToast(toast.id)}>✕</button>
    </div>
  );
}

const s = {
  container: { position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px' },
  toast: { background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'slideIn 0.3s ease' },
  toastLeft: { display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 },
  sevBar: { width: '3px', borderRadius: '2px', alignSelf: 'stretch', flexShrink: 0, minHeight: '40px' },
  toastIcon: { fontSize: '22px', flexShrink: 0 },
  toastBody: { flex: 1 },
  toastTitle: { fontSize: '12px', fontWeight: '700', color: '#E24B4A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' },
  toastType: { fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  toastLoc: { fontSize: '12px', color: '#666', marginBottom: '2px' },
  toastDesc: { fontSize: '12px', color: '#555', marginBottom: '4px', lineHeight: '1.5' },
  toastName: { fontSize: '11px', color: '#444' },
  closeBtn: { background: 'none', border: 'none', color: '#444', fontSize: '14px', cursor: 'pointer', padding: '0', flexShrink: 0 }
};