import React, { useState } from 'react';
import api from '../services/api';

const C = { primary: '#E8756A', brown: '#4A2C24', beige: '#FDF5F0' };

const TYPES = ['Réclamation', 'Assistance', 'Question', 'Autre'];

export default function Contact({ user }) {
    const [form, setForm] = useState({
        nom: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '',
        email: user?.email || '',
        telephone: '',
        type: '',
        objet: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [envoye, setEnvoye] = useState(false);
    const [erreur, setErreur] = useState('');

    const maj = (champ, valeur) => setForm({ ...form, [champ]: valeur });

    const envoyer = async () => {
        setErreur('');
        if (!form.nom || !form.email || !form.type || !form.objet || !form.message) {
            setErreur('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/contact', form);
            setEnvoye(true);
        } catch (err) {
            setErreur('Une erreur est survenue. Réessayez.');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px',
        padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        marginBottom: '16px', fontFamily: 'inherit',
    };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px' };

    if (envoye) {
        return (
            <div style={{ padding: '60px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ color: C.brown, fontWeight: '800', fontSize: '26px', marginBottom: '12px' }}>Demande envoyée !</h2>
                <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6' }}>
                    Merci {form.nom.split(' ')[0]}, votre demande a bien été reçue.<br />
                    L'équipe PawNella vous répondra dans les meilleurs délais.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* EN-TÊTE avec image */}
            <div style={{ position: 'relative', background: `linear-gradient(135deg, ${C.beige}, #fce4d6)`, padding: '48px 40px', overflow: 'hidden' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                        <h1 style={{ fontSize: '40px', fontWeight: '800', color: C.brown, margin: '0 0 12px' }}>Contactez-nous 🐾</h1>
                        <p style={{ color: '#7a6a63', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                            Une question, une réclamation ou un besoin d'aide ?<br />
                            Notre équipe est là pour vous écouter et vous répondre dans les meilleurs délais.
                        </p>
                    </div>
                    <img src="/images/photoacceuil.jpeg" alt="Animaux PawNella"
                        style={{ width: '320px', height: '200px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 12px 30px rgba(232,117,106,0.2)' }} />
                </div>
            </div>

            {/* FORMULAIRE */}
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ color: C.brown, fontWeight: '800', fontSize: '20px', margin: '0 0 20px', borderBottom: `3px solid ${C.primary}`, paddingBottom: '8px', display: 'inline-block' }}>
                        Envoyez-nous votre demande
                    </h2>

                    {erreur && (
                        <div style={{ background: '#fce4d6', color: C.primary, padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>{erreur}</div>
                    )}

                    <label style={labelStyle}>Nom complet *</label>
                    <input style={inputStyle} value={form.nom} onChange={e => maj('nom', e.target.value)} placeholder="Votre nom" />

                    <label style={labelStyle}>Adresse email *</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => maj('email', e.target.value)} placeholder="votre@email.com" />

                    <label style={labelStyle}>Numéro de téléphone (optionnel)</label>
                    <input style={inputStyle} value={form.telephone} onChange={e => maj('telephone', e.target.value)} placeholder="Votre numéro" />

                    <label style={labelStyle}>Type de demande *</label>
                    <select style={inputStyle} value={form.type} onChange={e => maj('type', e.target.value)}>
                        <option value="">Sélectionnez le type de demande</option>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <label style={labelStyle}>Objet de votre demande *</label>
                    <input style={inputStyle} value={form.objet} onChange={e => maj('objet', e.target.value)} placeholder="Ex : Réclamation concernant une réservation" />

                    <label style={labelStyle}>Votre message *</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} value={form.message} onChange={e => maj('message', e.target.value)} placeholder="Décrivez votre demande en détail..." rows={5} />

                    <button onClick={envoyer} disabled={loading}
                        style={{ width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Envoi...' : '📨 Envoyer ma demande'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '12px' }}>🔒 Vos informations sont sécurisées et confidentielles.</p>
                </div>
            </div>
        </div>
    );
}