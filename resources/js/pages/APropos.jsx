import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    introText, servicesList, raisonsList,
    prestataireSection, opportunitesSection, footerInfo
} from '../data/aboutContent';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
    rose: '#FFF0EE',
};

export default function APropos({ onNavigate, user, onRechercherService, onProposerServices })  {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/about/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const statCards = [
        { icon: '🐾', value: stats ? `${stats.prestataires_verifies}+` : '...', label: 'Prestataires vérifiés' },
        { icon: '❤️', value: stats ? `${stats.animaux_adoptes}+` : '...', label: 'Animaux adoptés' },
        { icon: '📍', value: stats ? `${stats.villes}+` : '...', label: 'Villes au Maroc' },
        { icon: '👥', value: stats ? `${stats.utilisateurs}+` : '...', label: 'Utilisateurs heureux' },
    ];

   const handleProposerServices = () => {
        if (onProposerServices) { onProposerServices(); return; }
        if (user?.role === 'prestataire') {
            onNavigate && onNavigate('mes-services');
        } else {
            alert('🔧 Pour proposer vos services, créez un compte prestataire depuis la page d\'accueil !');
        }
    };

    const handleRechercherService = () => {
        if (onRechercherService) { onRechercherService(); return; }
        onNavigate && onNavigate('booking');
    };

    return (
        <div style={{padding: '24px', maxWidth: '900px', margin: '0 auto'}}>
            <style>{`
                .apropos-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .apropos-grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .apropos-bottom-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                @media (min-width: 768px) {
                    .apropos-grid-2 { grid-template-columns: repeat(4, 1fr); }
                    .apropos-grid-4 { grid-template-columns: repeat(4, 1fr); }
                    .apropos-bottom-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>

            <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, marginBottom: '24px'}}>
                ℹ️ À propos de PawNella
            </h2>

            {/* Intro */}
            <div style={{background: C.rose, borderRadius: '20px', padding: '24px', marginBottom: '28px'}}>
                <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '60px', marginBottom: '12px'}}/>
                <p style={{color: C.primary, fontWeight: '700', fontSize: '14px', marginBottom: '12px'}}>Care • Connect • Adopt</p>
                <p style={{color: C.brown, fontSize: '14px', lineHeight: '1.7', margin: 0}}>{introText}</p>
            </div>

            {/* Nos services */}
            <div style={{marginBottom: '28px'}}>
                <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '16px'}}>🐾 Nos services</h3>
                <div className="apropos-grid-4">
                    {servicesList.map((s, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '18px 12px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize: '28px', marginBottom: '8px'}}>{s.icon}</div>
                            <p style={{color: C.brown, fontWeight: '600', fontSize: '13px', margin: 0}}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chiffres */}
            <div style={{marginBottom: '28px'}}>
                <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '16px'}}>📊 PawNella en chiffres</h3>
                <div className="apropos-grid-2">
                    {statCards.map((s, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize: '24px', marginBottom: '6px'}}>{s.icon}</div>
                            <div style={{fontSize: '22px', fontWeight: '800', color: C.primary, marginBottom: '2px'}}>{s.value}</div>
                            <div style={{color: '#888', fontSize: '12px'}}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pourquoi choisir */}
            <div style={{marginBottom: '28px'}}>
                <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '16px'}}>🛡️ Pourquoi choisir PawNella ?</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {raisonsList.map((r, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <span style={{fontSize: '22px'}}>{r.icon}</span>
                            <div>
                                <p style={{color: C.brown, fontWeight: '700', fontSize: '14px', margin: '0 0 2px'}}>{r.title}</p>
                                <p style={{color: '#888', fontSize: '13px', margin: 0, lineHeight: '1.5'}}>{r.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bouton principal */}
           <button onClick={handleRechercherService}
                style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '28px'}}>
                🔍 Rechercher un service
            </button>

            {/* Prestataire + Opportunités */}
            <div className="apropos-bottom-grid" style={{marginBottom: '28px'}}>
                <div style={{background: C.rose, borderRadius: '18px', padding: '20px'}}>
                    <p style={{color: C.brown, fontWeight: '700', fontSize: '15px', marginBottom: '8px'}}>{prestataireSection.title}</p>
                    <p style={{color: '#888', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px'}}>{prestataireSection.text}</p>
                    <button onClick={handleProposerServices}
                        style={{background: C.primary, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'}}>
                        {prestataireSection.cta}
                    </button>
                </div>
                <div style={{background: '#E3F2FD', borderRadius: '18px', padding: '20px'}}>
                    <p style={{color: C.brown, fontWeight: '700', fontSize: '15px', marginBottom: '8px'}}>{opportunitesSection.title}</p>
                    <p style={{color: '#888', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px'}}>{opportunitesSection.text}</p>
                    <button onClick={() => alert('🚀 Bientôt disponible !')}
                        style={{background: '#2196f3', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'}}>
                        {opportunitesSection.cta}
                    </button>
                </div>
            </div>

            {/* Footer infos */}
            <div className="apropos-grid-4" style={{paddingTop: '16px', borderTop: '1px solid #f0f0f0'}}>
                {footerInfo.map((f, i) => (
                    <div key={i} style={{textAlign: 'center'}}>
                        <div style={{fontSize: '18px', marginBottom: '4px'}}>{f.icon}</div>
                        <p style={{color: '#aaa', fontSize: '11px', margin: 0}}>{f.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}