import React, { useState } from 'react';
import api from '../services/api';

const C = { primary: '#E8756A', brown: '#4A2C24', beige: '#FDF5F0' };

const TYPES = ['Réclamation', 'Assistance', 'Question', 'Autre'];

export default function Contact({ user }) {
    const [form, setForm] = useState({
        nom: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '',
        email: user?.email || '',
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
            setErreur('Veuillez remplir tous les champs.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/contact', form);
            setEnvoye(true);
        } catch (err) {
            setErreur("Une erreur est survenue. Réessayez.");
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px',
        padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        marginBottom: '16px', fontFamily: 'inherit',
    };
    const labelStyle = {
        display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '6px',
    };

    if (envoye) {
        return (
            <div style={{ padding: '60px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ color: C.brown, fontWeight: '800', fontSize: '26px', marginBottom: '12px' }}>
                    Demande envoyée !
                </h2>
                <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6' }}>
                    Merci {form.nom.split(' ')[0]}, votre demande a bien été reçue.<br />
                    L'équipe PawNella vous répondra dans les meilleurs délais.
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: C.brown, fontWeight: '800', fontSize: '30px', marginBottom: '8px' }}>
                    Contactez-nous 🐾
                </h2>
                <p style={{ color: '#888', fontSize: '15px' }}>
                    Une question, une réclamation ou un besoin d'aide ? Notre équipe est là pour vous.
                </p>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {erreur && (
                    <div style={{ background: '#fce4d6', color: C.primary, padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
                        {erreur}
                    </div>
                )}

                <label style={labelStyle}>Nom complet</label>
                <input style={inputStyle} value={form.nom} onChange={e => maj('nom', e.target.value)} placeholder="Votre nom" />

                <label style={labelStyle}>Adresse email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => maj('email', e.target.value)} placeholder="votre@email.com" />

                <label style={labelStyle}>Type de demande</label>
                <select style={inputStyle} value={form.type} onChange={e => maj('type', e.target.value)}>
                    <option value="">Sélectionnez le type de demande</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <label style={labelStyle}>Objet</label>
                <input style={inputStyle} value={form.objet} onChange={e => maj('objet', e.target.value)} placeholder="Ex : Réclamation concernant une réservation" />

                <label style={labelStyle}>Votre message</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} value={form.message} onChange={e => maj('message', e.target.value)} placeholder="Décrivez votre demande en détail..." rows={5} />

                <button onClick={envoyer} disabled={loading}
                    style={{ width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
                    {loading ? 'Envoi...' : '📨 Envoyer ma demande'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
                    🔒 Vos informations sont sécurisées et confidentielles.
                </p>
            </div>
        </div>
    );
}