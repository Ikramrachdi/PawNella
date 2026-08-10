import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';
import { validateDateHeure, dateMinToday, heureMinPourDate } from '../utils/validation';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Evenements() {
    const { user } = useAuth();
    const { notify, confirmAction } = useNotification();
    const [evenements, setEvenements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        titre: '',
        description: '',
        date: '',
        heure: '',
        lieu: '',
        latitude: null,
        longitude: null,
        frais: '',
        gratuit: true,
        places_max: '',
    });

    const today = dateMinToday();

    // Heure minimale autorisée pour la date choisie
    const heureMin = heureMinPourDate(form.date);
    const dateHeureCheck = validateDateHeure(form.date, form.heure);

    useEffect(() => { fetchEvenements(); }, []);

    // Si la date change et rend l'heure invalide, on réinitialise l'heure
    useEffect(() => {
        if (form.date && form.heure && form.date === today && form.heure < heureMin) {
            setForm(prev => ({ ...prev, heure: '' }));
        }
    }, [form.date]);

    const fetchEvenements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/evenements');
            setEvenements(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));

    const resetForm = () => {
        setForm({ titre: '', description: '', date: '', heure: '', lieu: '', latitude: null, longitude: null, frais: '', gratuit: true, places_max: '' });
        setEditingId(null);
        setShowForm(false);
        setError('');
        setTouched({});
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            notify.error('Géolocalisation non supportée par votre navigateur');
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`);
                const data = await res.json();
                const lieu = data.display_name?.split(',').slice(0, 3).join(',').trim() || `${latitude}, ${longitude}`;
                setForm(prev => ({ ...prev, lieu, latitude, longitude }));
                notify.success('Position récupérée avec succès !');
            } catch (err) {
                setForm(prev => ({ ...prev, latitude, longitude, lieu: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            }
        }, () => {
            notify.error('Impossible de récupérer votre position');
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       setTouched({ titre: true, date: true, heure: true, lieu: true, description: true });

        const errors = {};
        if (!form.titre) errors.titre = true;
        if (!form.description || form.description.trim().length < 10) errors.description = true;
        if (!form.lieu) errors.lieu = true;
        if (!form.gratuit && (!form.frais || parseFloat(form.frais) <= 0)) errors.frais = true;

        // Règle générale : aucune date/heure passée
        const check = validateDateHeure(form.date, form.heure);
        if (!check.valid) errors.date = true;

        if (Object.keys(errors).length > 0) {
if (errors.description) setError('❌ La description est obligatoire (au moins 10 caractères)');
            else setError(check.valid ? '❌ Veuillez corriger les erreurs ci-dessous' : '❌ ' + check.message);            return;
        }

        setError('');
        setLoading(true);
        try {
            const data = {
                titre: form.titre,
                description: form.description,
                date: `${form.date} ${form.heure}:00`,
                lieu: form.lieu,
                latitude: form.latitude,
                longitude: form.longitude,
                frais: form.gratuit ? 0 : parseFloat(form.frais),
                places_max: form.places_max ? parseInt(form.places_max) : null,
            };

            if (editingId) {
                await api.put(`/evenements/${editingId}`, data);
                notify.success('Événement modifié avec succès !');
            } else {
                await api.post('/evenements', data);
                notify.success('Événement créé avec succès !');
            }
            resetForm();
            fetchEvenements();
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
            setError('❌ ' + msg);
        }
        setLoading(false);
    };

    const handleEdit = (ev) => {
        const d = new Date(ev.date);
        const pad = (n) => String(n).padStart(2, '0');
        const dateLocale = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const heureLocale = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setForm({
            titre: ev.titre || '',
            description: ev.description || '',
            date: dateLocale,
            heure: heureLocale,
            lieu: ev.lieu || '',
            latitude: ev.latitude ? parseFloat(ev.latitude) : null,
            longitude: ev.longitude ? parseFloat(ev.longitude) : null,
            frais: ev.frais > 0 ? ev.frais : '',
            gratuit: !ev.frais || ev.frais === 0,
            places_max: ev.places_max || '',
        });
        setEditingId(ev.id);
        setShowForm(true);
        setError('');
        setTouched({});
        window.scrollTo(0, 0);
    };

    const handleDelete = async (ev) => {
        const confirmed = await confirmAction(`Supprimer l'événement "${ev.titre}" ?`, {
            title: 'Suppression',
            confirmLabel: 'Supprimer',
            cancelLabel: 'Annuler',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await api.delete(`/evenements/${ev.id}`);
            notify.success('Événement supprimé');
            fetchEvenements();
        } catch (err) {
            notify.error('Erreur lors de la suppression');
        }
    };

    const handleParticiper = async (ev) => {
        // Sécurité : on ne participe pas à un événement déjà passé
        if (new Date(ev.date) < new Date()) {
            notify.error('Cet événement est déjà passé');
            return;
        }
        try {
            await api.post(`/evenements/${ev.id}/participer`);
            notify.success('Vous participez à cet événement !');
            await fetchEvenements();
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de la participation';
            notify.error(msg);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatHeure = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{padding: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <div>
                    <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>🎉 Événements</h2>
                    <p style={{color: '#888', fontSize: '14px', margin: 0}}>Découvrez et participez aux événements de la communauté</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    style={{background: C.primary, color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px'}}>
                    + Créer un événement
                </button>
            </div>

            {/* Formulaire */}
            {showForm && (
                <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '24px'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '700', color: C.brown, marginBottom: '20px'}}>
                        {editingId ? '✏️ Modifier l\'événement' : '+ Nouvel événement'}
                    </h3>

                    <ErrorBanner message={error} />

                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Titre *</label>
                            <input type="text" value={form.titre}
                                onChange={e => setForm({...form, titre: e.target.value})}
                                onBlur={() => touch('titre')}
                                style={{width: '100%', border: fieldBorder(touched.titre && !form.titre), borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder="Ex: Balade canine au parc"/>
                            {touched.titre && !form.titre && <FieldError message="Titre obligatoire"/>}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Description</label>
                            <textarea value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box'}}
                                rows={3} placeholder="Décrivez votre événement..."/>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Date *</label>
                                <input type="date" value={form.date} min={today}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val && val < today) {
                                            notify.error('La date ne peut pas être dans le passé !');
                                            return;
                                        }
                                        setForm({...form, date: val});
                                        touch('date');
                                    }}
                                    style={{width: '100%', border: fieldBorder(touched.date && !form.date), borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                                {touched.date && !form.date && <FieldError message="Date obligatoire"/>}
                            </div>
                            <div>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Heure *</label>
                                <input type="time" value={form.heure} min={form.date === today ? heureMin : undefined}
                                    disabled={!form.date}
                                    onChange={e => { setForm({...form, heure: e.target.value}); touch('heure'); }}
                                    onBlur={() => touch('heure')}
                                    style={{width: '100%', border: fieldBorder(touched.heure && !dateHeureCheck.valid), borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: form.date ? 'white' : '#f5f5f5'}}/>
                                {!form.date && <p style={{color: '#aaa', fontSize: '12px', margin: '6px 0 0'}}>Choisissez d'abord une date</p>}
                                {form.date && touched.heure && !dateHeureCheck.valid && <FieldError message={dateHeureCheck.message}/>}
                                {form.date && form.heure && dateHeureCheck.valid && <FieldSuccess message="Date et heure valides"/>}
                            </div>
                        </div>

                        {form.date === today && (
                            <p style={{color: '#aaa', fontSize: '12px', margin: '-8px 0 0'}}>
                                ⏰ Pour aujourd'hui, l'heure doit être postérieure à {heureMin}.
                            </p>
                        )}

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>📍 Lieu *</label>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <input type="text" value={form.lieu}
                                    onChange={e => setForm({...form, lieu: e.target.value})}
                                    onBlur={() => touch('lieu')}
                                    style={{flex: 1, border: fieldBorder(touched.lieu && !form.lieu), borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                    placeholder="Ex: Parc Hassan II, Rabat"/>
                                <button type="button" onClick={useMyLocation}
                                    style={{background: C.beige, color: C.brown, border: 'none', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap'}}>
                                    📍 Ma position
                                </button>
                            </div>
                            {touched.lieu && !form.lieu && <FieldError message="Lieu obligatoire"/>}
                            {form.latitude && form.longitude && (
                                <FieldSuccess message={`Position GPS enregistrée (${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)})`}/>
                            )}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>💰 Frais de participation</label>
                            <div style={{display: 'flex', gap: '12px', marginBottom: '10px'}}>
                                <button type="button" onClick={() => setForm({...form, gratuit: true, frais: ''})}
                                    style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: form.gratuit ? C.primary : C.beige, color: form.gratuit ? 'white' : C.brown, fontWeight: '600', fontSize: '14px'}}>
                                    🎁 Gratuit
                                </button>
                                <button type="button" onClick={() => setForm({...form, gratuit: false})}
                                    style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: !form.gratuit ? C.primary : C.beige, color: !form.gratuit ? 'white' : C.brown, fontWeight: '600', fontSize: '14px'}}>
                                    💳 Payant
                                </button>
                            </div>
                            {!form.gratuit && (
                                <div>
                                    <input type="number" value={form.frais}
                                        onChange={e => setForm({...form, frais: e.target.value})}
                                        onBlur={() => touch('frais')}
                                        style={{width: '100%', border: fieldBorder(touched.frais && (!form.frais || parseFloat(form.frais) <= 0)), borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                        placeholder="Montant en DH" min="1"/>
                                    {touched.frais && (!form.frais || parseFloat(form.frais) <= 0) && <FieldError message="Montant obligatoire et supérieur à 0"/>}
                                    {form.frais && parseFloat(form.frais) > 0 && <FieldSuccess message={`Frais : ${form.frais} DH`}/>}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>👥 Nombre de places maximum (optionnel)</label>
                            <input type="number" value={form.places_max}
                                onChange={e => setForm({...form, places_max: e.target.value})}
                                style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder="Ex: 20 (laisser vide si illimité)" min="1"/>
                        </div>

                        <div style={{display: 'flex', gap: '12px'}}>
                            <button type="submit" disabled={loading}
                                style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                                {loading ? 'Enregistrement...' : editingId ? '✏️ Modifier' : '✅ Créer l\'événement'}
                            </button>
                            <button type="button" onClick={resetForm}
                                style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'}}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des événements */}
            {loading && !showForm ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>⏳ Chargement...</div>
            ) : evenements.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>🎉</div>
                    <p style={{fontSize: '18px', color: C.brown, fontWeight: '600', marginBottom: '8px'}}>Aucun événement pour le moment</p>
                    <p style={{fontSize: '14px'}}>Soyez le premier à créer un événement !</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px'}}>
                    {evenements.map(ev => {
                        const isCreateur = ev.user_id === user?.id;
                        const isPasse = new Date(ev.date) < new Date();
                        const participants = Array.isArray(ev.participations) ? ev.participations.length : 0;
                        const complet = ev.places_max && participants >= ev.places_max;

                        return (
                            <div key={ev.id} style={{background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', opacity: isPasse ? 0.7 : 1}}>
                                <div style={{background: isPasse ? '#f5f5f5' : 'linear-gradient(135deg, #E8756A, #4A2C24)', padding: '20px', color: 'white'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <div>
                                            <h3 style={{fontWeight: '800', fontSize: '17px', margin: '0 0 6px', color: isPasse ? '#666' : 'white'}}>{ev.titre}</h3>
                                            <p style={{fontSize: '13px', margin: 0, opacity: 0.9, color: isPasse ? '#888' : 'white'}}>
                                                par {ev.user?.prenom} {ev.user?.nom}
                                            </p>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            {isPasse ? (
                                                <span style={{background: '#e0e0e0', color: '#666', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'}}>
                                                    Terminé
                                                </span>
                                            ) : ev.frais > 0 ? (
                                                <span style={{background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                                    💳 {ev.frais} DH
                                                </span>
                                            ) : (
                                                <span style={{background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                                    🎁 Gratuit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{padding: '16px'}}>
                                    {ev.description && (
                                        <p style={{color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                            {ev.description}
                                        </p>
                                    )}

                                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span style={{fontSize: '14px'}}>📅</span>
                                            <span style={{color: C.brown, fontSize: '13px', fontWeight: '600'}}>{formatDate(ev.date)}</span>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span style={{fontSize: '14px'}}>🕐</span>
                                            <span style={{color: '#888', fontSize: '13px'}}>{formatHeure(ev.date)}</span>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span style={{fontSize: '14px'}}>📍</span>
                                            <span style={{color: '#888', fontSize: '13px'}}>{ev.lieu}</span>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span style={{fontSize: '14px'}}>👥</span>
                                            <span style={{color: '#888', fontSize: '13px'}}>
                                                {participants} participant(s)
                                                {ev.places_max ? ` / ${ev.places_max} places` : ''}
                                                {complet && <span style={{color: C.primary, fontWeight: '700', marginLeft: '4px'}}>• Complet</span>}
                                            </span>
                                        </div>
                                        {ev.latitude && ev.longitude && (
                                            <a href={`https://www.google.com/maps?q=${ev.latitude},${ev.longitude}`} target="_blank" rel="noreferrer"
                                                style={{color: '#1565c0', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                🗺️ Voir sur Google Maps
                                            </a>
                                        )}
                                    </div>

                                    <div style={{display: 'flex', gap: '8px'}}>
                                        {!isPasse && !isCreateur && (
                                            <button onClick={async () => {
                                                const confirmed = await confirmAction(
                                                    `Confirmer votre participation à "${ev.titre}" ?${ev.frais > 0 ? ` (Frais : ${ev.frais} DH)` : ' (Gratuit)'}`,
                                                    {
                                                        title: 'Participation',
                                                        confirmLabel: 'Confirmer',
                                                        cancelLabel: 'Annuler',
                                                    }
                                                );
                                                if (confirmed) handleParticiper(ev);
                                            }}
                                                disabled={complet}
                                                style={{
                                                    flex: 1, background: complet ? '#f5f5f5' : C.primary,
                                                    color: complet ? '#aaa' : 'white', border: 'none',
                                                    padding: '10px', borderRadius: '10px', fontWeight: '700',
                                                    cursor: complet ? 'not-allowed' : 'pointer', fontSize: '13px'
                                                }}>
                                                {complet ? '🚫 Complet' : '🎉 Participer'}
                                            </button>
                                        )}
                                        {isCreateur && !isPasse && (
                                            <>
                                                <button onClick={() => handleEdit(ev)}
                                                    style={{flex: 1, background: C.beige, color: C.brown, border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '13px'}}>
                                                    ✏️ Modifier
                                                </button>
                                                <button onClick={() => handleDelete(ev)}
                                                    style={{flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '13px'}}>
                                                    🗑️ Supprimer
                                                </button>
                                            </>
                                        )}
                                        {isCreateur && isPasse && (
                                            <button onClick={() => handleDelete(ev)}
                                                style={{flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '13px'}}>
                                                🗑️ Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}