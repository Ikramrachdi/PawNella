import React from 'react';

const C = { primary: '#E8756A' };

// Banner d'erreur général en haut du formulaire
export function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div style={{
            background: '#fce4d6', color: C.primary, padding: '14px 16px',
            borderRadius: '12px', marginBottom: '20px', fontSize: '14px',
            fontWeight: '600', border: `1.5px solid ${C.primary}`,
            display: 'flex', alignItems: 'flex-start', gap: '10px'
        }}>
            <span style={{fontSize: '20px', flexShrink: 0}}>⚠️</span>
            <span>{message}</span>
        </div>
    );
}

// Message d'erreur sous un champ
export function FieldError({ message }) {
    if (!message) return null;
    return (
        <p style={{color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>❌</span> {message}
        </p>
    );
}

// Message de succès sous un champ
export function FieldSuccess({ message }) {
    if (!message) return null;
    return (
        <p style={{color: '#4caf50', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>✅</span> {message}
        </p>
    );
}

// Style de bordure selon l'état du champ
export function fieldBorder(hasError) {
    return `1.5px solid ${hasError ? '#f44336' : '#e0d5d0'}`;
}
