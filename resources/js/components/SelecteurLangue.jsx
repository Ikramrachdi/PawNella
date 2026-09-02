import React, { useState } from 'react';

const C = { primary: '#E8756A', brown: '#4A2C24', beige: '#FDF5F0' };

const LANGUES = [
    { code: 'fr', label: 'Français', drapeau: '🇫🇷' },
    { code: 'ar', label: 'العربية', drapeau: '🇲🇦' },
    { code: 'en', label: 'English', drapeau: '🇬🇧' },
];

export default function SelecteurLangue() {
    const [ouvert, setOuvert] = useState(false);
    const [langue, setLangue] = useState(LANGUES[0]);

    return (
        <div style={{position: 'relative'}}>
            <button
                onClick={() => setOuvert(!ouvert)}
                title="Changer la langue"
                style={{display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, border: 'none', borderRadius: '25px', padding: '8px 14px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '14px'}}
            >
                <span style={{fontSize: '16px'}}>🌐</span>
                <span>{langue.code.toUpperCase()}</span>
            </button>

            {ouvert && (
                <div style={{position: 'absolute', top: '46px', right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: '150px', zIndex: 200}}>
                    {LANGUES.map(l => (
                        <button key={l.code} onClick={() => { setLangue(l); setOuvert(false); }}
                            style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: langue.code === l.code ? C.beige : 'white', cursor: 'pointer', fontSize: '14px', color: C.brown, textAlign: 'left'}}
                            onMouseEnter={e => e.currentTarget.style.background = C.beige}
                            onMouseLeave={e => e.currentTarget.style.background = langue.code === l.code ? C.beige : 'white'}>
                            <span style={{fontSize: '18px'}}>{l.drapeau}</span>
                            <span>{l.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}