import React from 'react';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Oui', cancelLabel = 'Non', danger = false, onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
            <div style={{background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'}}>
                <div style={{fontSize: '48px', marginBottom: '12px'}}>{danger ? '⚠️' : '❓'}</div>
                {title && <h3 style={{color: C.brown, fontWeight: '800', fontSize: '18px', marginBottom: '8px'}}>{title}</h3>}
                <p style={{color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6'}}>{message}</p>
                <div style={{display: 'flex', gap: '12px'}}>
                    <button onClick={onCancel}
                        style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'}}>
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm}
                        style={{flex: 1, background: danger ? '#f44336' : C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'}}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}