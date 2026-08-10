import React, { useEffect } from 'react';

const STYLES = {
    success: { bg: '#E8F5E9', color: '#2e7d32', icon: '✅' },
    error: { bg: '#fce4d6', color: '#E8756A', icon: '❌' },
    info: { bg: '#E3F2FD', color: '#1565c0', icon: 'ℹ️' },
};

export default function Toast({ toasts, removeToast }) {
    return (
        <div style={{position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px'}}>
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }) {
    const style = STYLES[toast.type] || STYLES.info;

    useEffect(() => {
        const timer = setTimeout(onClose, toast.duration || 3500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            background: style.bg, color: style.color, padding: '14px 16px', borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'flex-start', gap: '10px',
            fontSize: '14px', fontWeight: '600', animation: 'toast-in 0.25s ease',
        }}>
            <style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
            <span style={{fontSize: '18px', flexShrink: 0}}>{style.icon}</span>
            <span style={{flex: 1, lineHeight: '1.4'}}>{toast.message}</span>
            <button onClick={onClose} style={{background: 'none', border: 'none', color: style.color, cursor: 'pointer', fontSize: '16px', flexShrink: 0, opacity: 0.6}}>×</button>
        </div>
    );
}