import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CityInput from '../components/CityInput';
import AddressInput from '../components/AddressInput';
import countries from '../data/countries';
import { validatePhone, validateEmail, validatePassword, passwordHint, validateVille, validateNom } from '../utils/validation';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Register({ onSwitch, onHome, onPrestataire }) {
    const { register } = useAuth();
    const [form, setForm] = useState({
        nom: '', prenom: '', email: '',
        password: '', password_confirmation: '',
        pays: 'MA', telephone: '', ville: '', adresse: '', role: 'client'
    });
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const selectedCountry = countries.find(c => c.code === form.pays) || countries[0];
    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));

    const refs = {
        nom: useRef(null),
        prenom: useRef(null),
        email: useRef(null),
        ville: useRef(null),
        telephone: useRef(null),
        password: useRef(null),
        password_confirmation: useRef(null),
    };

    const scrollToFirstError = (errors) => {
        for (const field of Object.keys(refs)) {
            if (errors[field] && refs[field].current) {
                refs[field].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                refs[field].current.focus();
                break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setTouched({ nom: true, prenom: true, email: true, password: true, password_confirmation: true, pays: true, ville: true, telephone: true });

        const errors = {};
       if (!form.nom) errors.nom = 'Nom obligatoire';
        else if (!validateNom(form.nom)) errors.nom = 'Le nom ne doit contenir que des lettres';
        if (!form.prenom) errors.prenom = 'Prénom obligatoire';
        else if (!validateNom(form.prenom)) errors.prenom = 'Le prénom ne doit contenir que des lettres';
        if (!form.email || !validateEmail(form.email)) errors.email = 'Email invalide (ex: nom@gmail.com)';
        if (!form.password || !validatePassword(form.password)) errors.password = passwordHint;
        if (form.password !== form.password_confirmation) errors.password_confirmation = 'Les mots de passe ne correspondent pas';
if (!form.ville) errors.ville = 'Ville obligatoire';
        else if (!validateVille(form.ville)) errors.ville = 'Veuillez saisir une ville valide';        if (!form.telephone || !validatePhone(form.telephone, form.pays)) errors.telephone = 'Numéro de téléphone invalide';

       if (Object.keys(errors).length > 0) {
            const premierMessage = Object.values(errors)[0];
            setError('❌ ' + premierMessage);
            scrollToFirstError(errors);
            return;
        }
        setLoading(true);
        try {
            await register(form);
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de l\'inscription. Vérifiez vos données.';
            setError('❌ ' + msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setLoading(false);
    };

    return (
        <div style={{minHeight: '100vh', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
            <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(232,117,106,0.15)', padding: '40px', width: '100%', maxWidth: '500px'}}>

                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '80px', marginBottom: '8px'}}/>
                    <p style={{color: '#888'}}>Créez votre compte</p>
                </div>

                {/* Choix type de compte */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px'}}>
                    <div onClick={() => setForm({...form, role: 'client'})}
                        style={{border: `2px solid ${form.role === 'client' ? C.primary : '#e0d5d0'}`, borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: form.role === 'client' ? '#FFF0EE' : 'white'}}>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>🐾</div>
                        <p style={{color: C.brown, fontWeight: '700', fontSize: '14px', margin: '0 0 4px'}}>Client</p>
                        <p style={{color: '#888', fontSize: '12px', margin: 0}}>Propriétaire ou adoptant</p>
                    </div>
                    <div onClick={() => onPrestataire && onPrestataire()}
                        style={{border: '2px solid #e0d5d0', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'white'}}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e0d5d0'}>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>🔧</div>
                        <p style={{color: C.brown, fontWeight: '700', fontSize: '14px', margin: '0 0 4px'}}>Prestataire</p>
                        <p style={{color: '#888', fontSize: '12px', margin: 0}}>Proposer un service</p>
                    </div>
                </div>

                <ErrorBanner message={error} />

                <form onSubmit={handleSubmit}>
                    {/* Nom & Prénom */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Nom *</label>
                            <input ref={refs.nom} type="text" value={form.nom}
                               onChange={e => setForm({...form, nom: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')})}
                                onBlur={() => touch('nom')}
                                style={{width: '100%', border: fieldBorder(touched.nom && !form.nom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder="Votre nom"/>
                            {touched.nom && !form.nom && <FieldError message="Nom obligatoire"/>}
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Prénom *</label>
                            <input ref={refs.prenom} type="text" value={form.prenom}
onChange={e => setForm({...form, prenom: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')})}                                onBlur={() => touch('prenom')}
                                style={{width: '100%', border: fieldBorder(touched.prenom && !form.prenom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder="Votre prénom"/>
                            {touched.prenom && !form.prenom && <FieldError message="Prénom obligatoire"/>}
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{marginBottom: '12px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Email *</label>
                        <input ref={refs.email} type="email" value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            onBlur={() => touch('email')}
                            style={{width: '100%', border: fieldBorder(touched.email && (!form.email || !validateEmail(form.email))), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder="votre@email.com"/>
                        {touched.email && !form.email && <FieldError message="Email obligatoire"/>}
                        {touched.email && form.email && !validateEmail(form.email) && <FieldError message="Format d'email invalide (ex: nom@gmail.com)"/>}
                        {form.email && validateEmail(form.email) && <FieldSuccess message="Email valide"/>}
                    </div>

                    {/* Pays */}
                    <div style={{marginBottom: '12px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>🌍 Pays *</label>
                        <select value={form.pays} onChange={e => setForm({...form, pays: e.target.value, telephone: ''})}
                            style={{width: '100%', border: fieldBorder(false), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white'}}>
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
                            ))}
                        </select>
                    </div>

                    {/* Ville */}
                    <div style={{marginBottom: '12px'}} ref={refs.ville}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Ville *</label>
                        <CityInput
                            value={form.ville}
                            onChange={val => { setForm({...form, ville: val}); touch('ville'); }}
                            placeholder="Votre ville"/>
                        {touched.ville && !form.ville && <FieldError message="Ville obligatoire"/>}
                    </div>

                    {/* Adresse */}
                    <div style={{marginBottom: '12px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>📍 Adresse</label>
                        <AddressInput
                            value={form.adresse}
                            onChange={val => setForm({...form, adresse: val})}
                            placeholder="Ex: 15 Rue Mohammed V, Casablanca"/>
                    </div>

                    {/* Téléphone */}
                    <div style={{marginBottom: '12px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                            Téléphone * <span style={{color: '#aaa', fontWeight: '400'}}>({selectedCountry.dial})</span>
                        </label>
                        <input ref={refs.telephone} type="tel" value={form.telephone}
                            onChange={e => setForm({...form, telephone: e.target.value})}
                            onBlur={() => touch('telephone')}
                            style={{width: '100%', border: fieldBorder(touched.telephone && (!form.telephone || !validatePhone(form.telephone, form.pays))), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder={form.pays === 'MA' ? 'Ex: 0612345678' : `Ex: ${selectedCountry.dial} ...`}/>
                        {touched.telephone && !form.telephone && <FieldError message="Téléphone obligatoire"/>}
                        {touched.telephone && form.telephone && !validatePhone(form.telephone, form.pays) && (
                            <FieldError message={form.pays === 'MA' ? 'Numéro marocain invalide (10 chiffres, ex: 0612345678)' : 'Numéro invalide'}/>
                        )}
                        {form.telephone && validatePhone(form.telephone, form.pays) && <FieldSuccess message="Numéro valide"/>}
                    </div>

                    {/* Mot de passe */}
                    <div style={{marginBottom: '12px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Mot de passe *</label>
                        <input ref={refs.password} type="password" value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            onBlur={() => touch('password')}
                            style={{width: '100%', border: fieldBorder(touched.password && (!form.password || !validatePassword(form.password))), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder="Mot de passe fort"/>
                        {touched.password && !form.password && <FieldError message="Mot de passe obligatoire"/>}
                        {touched.password && form.password && !validatePassword(form.password) && <FieldError message={passwordHint}/>}
                        {form.password && validatePassword(form.password) && <FieldSuccess message="Mot de passe fort"/>}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Confirmer le mot de passe *</label>
                        <input ref={refs.password_confirmation} type="password" value={form.password_confirmation}
                            onChange={e => setForm({...form, password_confirmation: e.target.value})}
                            onBlur={() => touch('password_confirmation')}
                            style={{width: '100%', border: fieldBorder(touched.password_confirmation && form.password !== form.password_confirmation), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                            placeholder="Répétez votre mot de passe"/>
                        {touched.password_confirmation && !form.password_confirmation && <FieldError message="Confirmation obligatoire"/>}
                        {touched.password_confirmation && form.password_confirmation && form.password !== form.password_confirmation && <FieldError message="Les mots de passe ne correspondent pas"/>}
                        {form.password_confirmation && form.password === form.password_confirmation && <FieldSuccess message="Les mots de passe correspondent"/>}
                    </div>

                    <button type="submit" disabled={loading}
                        style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Inscription...' : '🐾 Créer mon compte'}
                    </button>
                </form>

                <p style={{textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '20px'}}>
                    Déjà un compte ?{' '}
                    <button onClick={onSwitch} style={{color: C.primary, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer'}}>
                        Se connecter
                    </button>
                </p>

                {onHome && (
                    <p style={{textAlign: 'center', marginTop: '8px'}}>
                        <button onClick={onHome} style={{color: '#aaa', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer'}}>
                            ← Retour à l'accueil
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}