import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';


export default function Login({ onSwitch, onHome }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(form.email, form.password);
        } catch (err) {
            setError('Email ou mot de passe incorrect');
        }
        setLoading(false);
    };

        return (
        <div style={{minHeight: '100vh', background: '#fdf5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
            <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(232,117,106,0.15)', padding: '40px', width: '100%', maxWidth: '420px'}}>
                <div style={{textAlign: 'center', marginBottom: '32px'}}>
                    <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '80px', marginBottom: '8px'}}/>
                    <p style={{color: '#888'}}>Connectez-vous à votre compte</p>
                </div>

                {error && (
                    <div style={{background: '#fce4d6', color: '#e8756a', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px'}}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '16px'}}>
                        <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#3d2314', marginBottom: '6px'}}>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div style={{marginBottom: '24px'}}>
                        <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#3d2314', marginBottom: '6px'}}>Mot de passe</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{width: '100%', background: '#e8756a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p style={{textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '24px'}}>
                    Pas encore de compte ?{' '}
                    <button onClick={onSwitch} style={{color: '#e8756a', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer'}}>
                        S'inscrire
                    </button>
                </p>

                {onHome && (
                    <p style={{textAlign: 'center', marginTop: '8px'}}>
                        <button onClick={onHome} style={{color: '#3d2314', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer'}}>
                            ← Retour à l'accueil
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}