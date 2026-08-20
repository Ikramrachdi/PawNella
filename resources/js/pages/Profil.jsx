import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { validatePhone, validateEmail } from '../utils/validation';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';


const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Profil({ onNavigate }) {
    const { user, logout, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLangue, setShowLangue] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [form, setForm] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        ville: user?.ville || '',
        biographie: user?.biographie || '',
    });
    const [success, setSuccess] = useState('');
    const [avisRecus, setAvisRecus] = useState({ avis: [], moyenne: 0, total: 0 });

    useEffect(() => {
        if (user?.role === 'prestataire') {
            api.get('/mes-avis')
                .then(res => setAvisRecus(res.data))
                .catch(err => console.error(err));
        }
    }, [user?.id]);

    const etoiles = (note) => '★'.repeat(note) + '☆'.repeat(5 - note);

    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ nom: true, prenom: true, email: true, telephone: true });

        if (!form.nom || !form.prenom) {
            setError('❌ Nom et prénom obligatoires');
            return;
        }
        if (!form.email || !validateEmail(form.email)) {
            setError('❌ Adresse email invalide');
            return;
        }
        if (form.telephone && !validatePhone(form.telephone, user?.pays || 'MA')) {
            setError('❌ Numéro de téléphone invalide');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.put('/me', form);
            updateUser(res.data);
            setSuccess('Profil mis à jour avec succès !');
            setEditing(false);
            setTouched({});
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors)[0][0]
                : err.response?.data?.message || 'Erreur lors de la mise à jour';
            setError('❌ ' + msg);
        }
        setLoading(false);
    };

    const menuItems = [
        { icon: '🐾', label: 'Mes animaux', desc: 'Gérer mes animaux', action: () => onNavigate && onNavigate('animals') },
        { icon: '📅', label: 'Mes réservations', desc: 'Voir mes réservations', action: () => onNavigate && onNavigate('reservations') },
        { icon: '💰', label: 'Mes paiements', desc: 'Historique des paiements', action: () => alert('💰 Fonctionnalité paiement bientôt disponible !') },
        { icon: '📢', label: 'Mes annonces', desc: 'Annonces d\'adoption', action: () => onNavigate && onNavigate('adoption') },
        { icon: '🔔', label: 'Notifications', desc: 'Gérer les notifications', action: () => alert('🔔 Activez les notifications dans votre navigateur !') },
        { icon: '🌍', label: 'Langue', desc: 'Français', action: () => setShowLangue(true) },
        { icon: '❓', label: 'Aide & Support', desc: 'Centre d\'aide', action: () => alert('❓ Pour toute aide, contactez support@pawnella.ma') },
        { icon: 'ℹ️', label: 'À propos de PawNella', desc: 'Notre mission et nos services', action: () => onNavigate && onNavigate('apropos') },
    ];

    return (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, marginBottom: '24px'}}>Mon profil</h2>

            {success && (
                <div style={{background: '#E8F5E9', color: '#2e7d32', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    ✅ {success}
                </div>
            )}

            {/* Popup Langue */}
            {showLangue && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '360px', width: '100%', margin: '20px'}}>
                        <h3 style={{color: C.brown, fontWeight: '800', marginBottom: '20px'}}>🌍 Choisir la langue</h3>
                        {['🇫🇷 Français', '🇬🇧 English', '🇸🇦 العربية'].map((lang, i) => (
                            <div key={i} onClick={() => { alert(`Langue ${lang} sélectionnée`); setShowLangue(false); }}
                                style={{padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px', background: i === 0 ? '#FFF0EE' : C.beige, border: i === 0 ? `2px solid ${C.primary}` : '2px solid transparent', color: C.brown, fontWeight: i === 0 ? '700' : '500', fontSize: '15px'}}>
                                {lang} {i === 0 && '✓'}
                            </div>
                        ))}
                        <button onClick={() => setShowLangue(false)} style={{width: '100%', background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', marginTop: '8px'}}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Photo & infos */}
            <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
                    <div style={{position: 'relative'}}>
                        <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #E8756A, #4A2C24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '28px'}}>
                            {user?.prenom?.[0]}{user?.nom?.[0]}
                        </div>
                        <button style={{position: 'absolute', bottom: 0, right: 0, background: C.primary, border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', color: 'white', fontSize: '12px'}}>
                            ✏️
                        </button>
                    </div>
                    <div>
                        <h3 style={{fontSize: '20px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>{user?.prenom} {user?.nom}</h3>
                        <p style={{color: '#888', fontSize: '14px', margin: '0 0 8px'}}>Membre depuis 2026</p>
                        <span style={{background: '#FFF0EE', color: C.primary, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                            {user?.role}
                        </span>
                    </div>
                    <button onClick={() => { setEditing(!editing); setError(''); setTouched({}); }}
                        style={{marginLeft: 'auto', background: C.beige, border: 'none', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', color: C.brown, fontWeight: '600', fontSize: '13px'}}>
                        ✏️ Modifier
                    </button>
                </div>

                {editing && <ErrorBanner message={error} />}

                {editing ? (
                    <form onSubmit={handleSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Nom *</label>
                            <input type="text" value={form.nom}
                                onChange={e => setForm({...form, nom: e.target.value})}
                                onBlur={() => touch('nom')}
                                style={{width: '100%', border: fieldBorder(touched.nom && !form.nom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                            {touched.nom && !form.nom && <FieldError message="Nom obligatoire"/>}
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Prénom *</label>
                            <input type="text" value={form.prenom}
                                onChange={e => setForm({...form, prenom: e.target.value})}
                                onBlur={() => touch('prenom')}
                                style={{width: '100%', border: fieldBorder(touched.prenom && !form.prenom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                            {touched.prenom && !form.prenom && <FieldError message="Prénom obligatoire"/>}
                        </div>
                        <div style={{gridColumn: 'span 2'}}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Email *</label>
                            <input type="email" value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                onBlur={() => touch('email')}
                                style={{width: '100%', border: fieldBorder(touched.email && (!form.email || !validateEmail(form.email))), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                            {touched.email && !form.email && <FieldError message="Email obligatoire"/>}
                            {touched.email && form.email && !validateEmail(form.email) && <FieldError message="Format d'email invalide"/>}
                            {form.email && validateEmail(form.email) && <FieldSuccess message="Email valide"/>}
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Ville</label>
                            <input type="text" value={form.ville}
                                onChange={e => setForm({...form, ville: e.target.value})}
                                style={{width: '100%', border: fieldBorder(false), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Téléphone</label>
                            <input type="tel" value={form.telephone}
                                onChange={e => setForm({...form, telephone: e.target.value})}
                                onBlur={() => touch('telephone')}
                                style={{width: '100%', border: fieldBorder(touched.telephone && form.telephone && !validatePhone(form.telephone, user?.pays || 'MA')), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                            {touched.telephone && form.telephone && !validatePhone(form.telephone, user?.pays || 'MA') && (
                                <FieldError message="Numéro de téléphone invalide"/>
                            )}
                            {form.telephone && validatePhone(form.telephone, user?.pays || 'MA') && <FieldSuccess message="Numéro valide"/>}
                        </div>
                        <div style={{gridColumn: 'span 2'}}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Biographie</label>
                            <textarea value={form.biographie} onChange={e => setForm({...form, biographie: e.target.value})}
                                style={{width: '100%', border: fieldBorder(false), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box'}}
                                rows={3} placeholder="Parlez-nous de vous..."/>
                        </div>
                        <div style={{gridColumn: 'span 2', display: 'flex', gap: '12px'}}>
                            <button type="submit" disabled={loading} style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                            <button type="button" onClick={() => { setEditing(false); setError(''); setTouched({}); }}
                                style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'}}>
                                Annuler
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                        {[
                            { icon: '📧', label: 'Email', value: user?.email },
                            { icon: '📱', label: 'Téléphone', value: user?.telephone || 'Non renseigné' },
                            { icon: '📍', label: 'Ville', value: user?.ville || 'Non renseignée' },
                            { icon: '👤', label: 'Rôle', value: user?.role },
                        ].map((item, i) => (
                            <div key={i} style={{background: C.beige, borderRadius: '12px', padding: '12px 16px'}}>
                                <p style={{color: '#aaa', fontSize: '12px', margin: '0 0 4px'}}>{item.icon} {item.label}</p>
                                <p style={{color: C.brown, fontWeight: '600', fontSize: '14px', margin: 0}}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Mes avis reçus (prestataire uniquement) */}
            {user?.role === 'prestataire' && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
                        <h3 style={{fontSize: '18px', fontWeight: '800', color: C.brown, margin: 0}}>⭐ Mes avis reçus</h3>
                        {avisRecus.total > 0 && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{color: '#FFB800', fontWeight: '800', fontSize: '18px'}}>{avisRecus.moyenne}</span>
                                <span style={{color: '#FFB800', fontSize: '16px'}}>{etoiles(Math.round(avisRecus.moyenne))}</span>
                                <span style={{color: '#aaa', fontSize: '13px'}}>({avisRecus.total} avis)</span>
                            </div>
                        )}
                    </div>

                    {avisRecus.total === 0 ? (
                        <div style={{textAlign: 'center', padding: '24px', color: '#aaa'}}>
                            <div style={{fontSize: '40px', marginBottom: '8px'}}>⭐</div>
                            <p style={{fontSize: '14px', margin: 0}}>Vous n'avez pas encore reçu d'avis</p>
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            {avisRecus.avis.map(a => (
                                <div key={a.id} style={{padding: '14px 16px', background: C.beige, borderRadius: '12px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                                        <div style={{width: '36px', height: '36px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0}}>
                                            {a.client?.prenom?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{flex: 1}}>
                                            <p style={{fontWeight: '700', color: C.brown, margin: 0, fontSize: '14px'}}>
                                                {a.client?.prenom} {a.client?.nom?.[0] ? a.client.nom[0].toUpperCase() + '.' : ''}
                                            </p>
                                            <span style={{color: '#FFB800', fontSize: '13px'}}>{etoiles(a.note)}</span>
                                        </div>
                                    </div>
                                    {a.commentaire && (
                                        <p style={{color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.5'}}>{a.commentaire}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Menu options */}
            <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px'}}>
                {menuItems.map((item, i) => (
                    <div key={i}
                        onClick={() => item.action && item.action()}
                        style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: i < menuItems.length - 1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer', transition: 'background 0.2s'}}
                        onMouseEnter={e => e.currentTarget.style.background = C.beige}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                        <span style={{fontSize: '22px'}}>{item.icon}</span>
                        <div style={{flex: 1}}>
                            <p style={{fontWeight: '600', color: C.brown, fontSize: '14px', margin: 0}}>{item.label}</p>
                            <p style={{color: '#aaa', fontSize: '12px', margin: 0}}>{item.desc}</p>
                        </div>
                        <span style={{color: '#aaa', fontSize: '18px'}}>›</span>
                    </div>
                ))}
            </div>

            <button onClick={logout} style={{width: '100%', background: '#FFF0EE', color: C.primary, border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                🚪 Déconnexion
            </button>
        </div>
    );
}