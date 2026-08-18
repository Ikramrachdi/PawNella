import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PhotoUpload from '../components/PhotoUpload';
import { validateTarif, PRIX_MIN_PAR_TYPE } from '../utils/validation';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';


const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

const TYPES = [
    { type: 'promenade', label: 'Promenade', icon: '🚶' },
    { type: 'garde', label: 'Garde à domicile', icon: '🏠' },
    { type: 'pension', label: 'Pension', icon: '🏨' },
    { type: 'visite', label: 'Visite à domicile', icon: '🏥' },
    { type: 'toilettage', label: 'Soins & Toilettage', icon: '✂️' },
    { type: 'taxi', label: 'Taxi animalier', icon: '🚗' },
    { type: 'soins', label: 'Soins', icon: '💊' },
    { type: 'dressage', label: 'Dressage', icon: '📋' },
];

const UNITES_PAR_TYPE = {
    promenade: [{ value: '30min', label: '/ 30min' }, { value: '1h', label: '/ 1h' }],
    garde: [{ value: 'jour', label: '/ jour' }, { value: 'nuit', label: '/ nuit' }],
    pension: [{ value: 'jour', label: '/ jour' }, { value: 'nuit', label: '/ nuit' }],
    visite: [{ value: 'visite', label: '/ visite' }],
    toilettage: [{ value: 'seance', label: '/ séance' }],
    taxi: [{ value: 'trajet', label: '/ trajet' }],
    soins: [{ value: 'seance', label: '/ séance' }],
    dressage: [{ value: 'seance', label: '/ séance' }, { value: '1h', label: '/ 1h' }],
};

const DEFAULT_UNITES = [{ value: '30min', label: '/ 30min' }, { value: '1h', label: '/ 1h' }];
const ESPECES = [
    { value: 'chien', label: 'Chien', icon: '🐕' },
    { value: 'chat', label: 'Chat', icon: '🐈' },
    { value: 'oiseau', label: 'Oiseau', icon: '🐦' },
    { value: 'reptile', label: 'Reptile', icon: '🦎' },
    { value: 'rongeur', label: 'Rongeur', icon: '🐹' },
    { value: 'autre', label: 'Autre', icon: '🐾' },
];

export default function MesServices() {
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
   const [form, setForm] = useState({
        type: '', titre: '', description: '', tarif: '', unite: '30min',
        photos: [], photo_principale: '', especes_acceptees: []
    });


useEffect(() => {                                    // ← ICI, dedans
        const params = new URLSearchParams(window.location.search);
        if (params.get('nouveau') === '1') setShowForm(true);
    }, []);

    
    const refs = 
    {
        type: useRef(null),
        titre: useRef(null),
        tarif: useRef(null),
    };

    const scrollToFirstError = (errors) => {
        for (const field of Object.keys(refs)) {
            if (errors[field] && refs[field].current) {
                refs[field].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/mes-services');
            setServices(res.data);
        } catch (err) { console.error(err); }
    };

    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));
    const touchAll = (fields) => setTouched(prev => ({...prev, ...fields.reduce((acc, f) => ({...acc, [f]: true}), {})}));

    const resetForm = () => {
setForm({ type: '', titre: '', description: '', tarif: '', unite: '30min', photos: [], photo_principale: '', especes_acceptees: [] });        setEditingId(null);
        setShowForm(false);
        setError('');
        setTouched({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        touchAll(['type', 'titre', 'tarif']);

        const errors = {};
        if (!form.type) errors.type = true;
        if (!form.titre) errors.titre = true;
        const tarifCheck = validateTarif(form.tarif, form.type);
        if (!tarifCheck.valid) errors.tarif = true;

        if (Object.keys(errors).length > 0) {
            setError('❌ Veuillez corriger les erreurs ci-dessous');
            scrollToFirstError(errors);
            return;
        }

        setError('');
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/services/${editingId}`, form);
            } else {
                await api.post('/services', form);
            }
            resetForm();
            fetchServices();
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
            setError('❌ ' + msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setLoading(false);
    };

    const handleEdit = (service) => {
        setForm({
            type: service.type,
            titre: service.titre,
            description: service.description || '',
            tarif: service.tarif,
            unite: service.unite || '30min',
            photos: service.photos || [],
            photo_principale: service.photo_principale || '',
            especes_acceptees: service.especes_acceptees || [],
        });
        setEditingId(service.id);
        setShowForm(true);
        setError('');
        setTouched({});
        window.scrollTo(0, 0);
    };

    const handleDelete = async (service) => {
        if (window.confirm(`Supprimer le service "${service.titre}" ?`)) {
            try {
                await api.delete(`/services/${service.id}`);
                fetchServices();
            } catch (err) { console.error(err); }
        }
    };

    const toggleActif = async (service) => {
        try {
            await api.put(`/services/${service.id}`, { ...service, actif: !service.actif });
            fetchServices();
        } catch (err) { console.error(err); }
    };

    const inputStyle = {
        width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px',
        padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
    };

    const getIcon = (type) => TYPES.find(t => t.type === type)?.icon || '🐾';
    const unitesDisponibles = UNITES_PAR_TYPE[form.type] || DEFAULT_UNITES;

    const getUniteLabel = (type, unite) => {
        const liste = UNITES_PAR_TYPE[type] || DEFAULT_UNITES;
        return liste.find(u => u.value === unite)?.label.replace('/ ', '') || unite;
    };

    return (
        <div style={{padding: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <div>
                    <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>🔧 Mes services</h2>
                    <p style={{color: '#888', fontSize: '14px', margin: 0}}>Gérez les services que vous proposez aux clients</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    style={{background: C.primary, color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px'}}>
                    + Ajouter un service
                </button>
            </div>

            {showForm && (
                <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '24px'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '700', color: C.brown, marginBottom: '20px'}}>
                        {editingId ? '✏️ Modifier le service' : '+ Nouveau service'}
                    </h3>

                    <ErrorBanner message={error} />

                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        {/* Type */}
                        <div ref={refs.type}>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Type de service *</label>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px'}}>
                                {TYPES.map(t => (
                                    <button key={t.type} type="button"
                                        onClick={() => { setForm({...form, type: t.type, unite: (UNITES_PAR_TYPE[t.type] || DEFAULT_UNITES)[0].value, tarif: ''}); touch('type'); }}
                                        style={{
                                            padding: '14px 8px', borderRadius: '12px',
                                            border: touched.type && !form.type ? '2px solid #f44336' : 'none',
                                            cursor: 'pointer',
                                            background: form.type === t.type ? C.primary : C.beige,
                                            color: form.type === t.type ? 'white' : C.brown,
                                            fontWeight: '600', fontSize: '13px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                        }}>
                                        <span style={{fontSize: '22px'}}>{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            {touched.type && !form.type && <FieldError message="Veuillez choisir un type de service"/>}
                        </div>

                        {/* Titre */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Titre de l'annonce *</label>
                            <input ref={refs.titre} type="text" value={form.titre}
                                onChange={e => setForm({...form, titre: e.target.value})}
                                onBlur={() => touch('titre')}
                                style={{...inputStyle, border: fieldBorder(touched.titre && !form.titre)}}
                                placeholder="Ex: Promenade de chien en groupe ou solo"/>
                            {touched.titre && !form.titre && <FieldError message="Titre obligatoire"/>}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Description</label>
                            <textarea value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                style={{...inputStyle, resize: 'none'}} rows={4}
                                placeholder="Décrivez votre service, votre expérience, vos disponibilités..."/>
                        </div>
{/* Espèces acceptées */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>
                                🐾 Animaux acceptés <span style={{color: '#aaa', fontWeight: '400'}}>(cochez les espèces)</span>
                            </label>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px'}}>
                                {ESPECES.map(esp => {
                                    const coche = form.especes_acceptees.includes(esp.value);
                                    return (
                                        <button key={esp.value} type="button"
                                            onClick={() => {
                                                const liste = coche
                                                    ? form.especes_acceptees.filter(x => x !== esp.value)
                                                    : [...form.especes_acceptees, esp.value];
                                                setForm({...form, especes_acceptees: liste});
                                            }}
                                            style={{
                                                padding: '12px 8px', borderRadius: '12px',
                                                border: coche ? `2px solid ${C.primary}` : '2px solid #e0d5d0',
                                                cursor: 'pointer',
                                                background: coche ? C.primary : 'white',
                                                color: coche ? 'white' : C.brown,
                                                fontWeight: '600', fontSize: '13px',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                            }}>
                                            <span style={{fontSize: '20px'}}>{esp.icon}</span>
                                            {esp.label}
                                            {coche && <span style={{fontSize: '11px'}}>✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Tarif + Unité */}
                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
                            <div>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Tarif (DH) *</label>
                                <input ref={refs.tarif} type="number" value={form.tarif}
                                    onChange={e => setForm({...form, tarif: e.target.value})}
                                    onBlur={() => touch('tarif')}
                                    style={{...inputStyle, border: fieldBorder(touched.tarif && !validateTarif(form.tarif, form.type).valid)}}
                                    placeholder={form.type ? `Min: ${PRIX_MIN_PAR_TYPE[form.type]?.min || 1} DH` : 'Ex: 50'}
                                    min={PRIX_MIN_PAR_TYPE[form.type]?.min || 1}/>
                                {touched.tarif && !validateTarif(form.tarif, form.type).valid && (
                                    <FieldError message={validateTarif(form.tarif, form.type).message}/>
                                )}
                                {form.type && PRIX_MIN_PAR_TYPE[form.type] && (
                                    <p style={{color: '#aaa', fontSize: '11px', marginTop: '4px'}}>💡 Min : {PRIX_MIN_PAR_TYPE[form.type].label}</p>
                                )}
                                {form.tarif && validateTarif(form.tarif, form.type).valid && <FieldSuccess message="Prix valide"/>}
                            </div>
                            <div>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Unité</label>
                                <select value={form.unite} onChange={e => setForm({...form, unite: e.target.value})} style={inputStyle}>
                                    {unitesDisponibles.map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Photo principale */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>
                                🖼️ Photo principale <span style={{color: '#aaa', fontWeight: '400'}}>(recommandée)</span>
                            </label>
                            {form.photo_principale && (
                                <div style={{marginBottom: '12px', position: 'relative', display: 'inline-block'}}>
                                    <img src={form.photo_principale} alt="Photo principale"
                                        style={{width: '120px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: `2px solid ${C.primary}`}}/>
                                    <button type="button" onClick={() => setForm({...form, photo_principale: ''})}
                                        style={{position: 'absolute', top: '-8px', right: '-8px', background: C.primary, color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'}}>
                                        ×
                                    </button>
                                </div>
                            )}
                            {!form.photo_principale && (
                                <PhotoUpload
                                    label="Photo principale"
                                    multiple={false}
                                    onUpload={(url) => setForm({...form, photo_principale: url})}
                                />
                            )}
                            {form.photo_principale && <FieldSuccess message="Photo principale ajoutée"/>}
                        </div>

                        {/* Photos supplémentaires */}
                        <div>
                            <PhotoUpload
                                label="Photos supplémentaires (optionnel)"
                                multiple={true}
                                maxPhotos={4}
                                onUpload={(urls) => setForm({...form, photos: urls})}
                            />
                            {form.photos.length > 0 && (
                                <div style={{display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap'}}>
                                    {form.photos.map((p, i) => (
                                        <img key={i} src={p} alt="" style={{width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: `2px solid ${C.primary}`}}/>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Boutons */}
                        <div style={{display: 'flex', gap: '12px'}}>
                            <button type="submit" disabled={loading}
                                style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                                {loading ? 'Enregistrement...' : editingId ? '✏️ Modifier' : '✅ Publier le service'}
                            </button>
                            <button type="button" onClick={resetForm}
                                style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'}}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des services */}
            {services.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>🔧</div>
                    <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Vous n'avez pas encore de service</p>
                    <p style={{fontSize: '14px'}}>Ajoutez votre premier service pour que les clients puissent vous trouver et réserver</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px'}}>
                    {services.map(service => (
                        <div key={service.id} style={{background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', opacity: service.actif ? 1 : 0.6}}>
                            {service.photo_principale ? (
                                <img src={service.photo_principale} alt={service.titre}
                                    style={{width: '100%', height: '160px', objectFit: 'cover'}}/>
                            ) : (
                                <div style={{width: '100%', height: '100px', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px'}}>
                                    {getIcon(service.type)}
                                </div>
                            )}
                            <div style={{padding: '16px'}}>
                                <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px'}}>
                                    <span style={{fontSize: '24px'}}>{getIcon(service.type)}</span>
                                    <div style={{flex: 1}}>
                                        <h3 style={{fontWeight: '700', color: C.brown, fontSize: '15px', margin: '0 0 2px'}}>{service.titre}</h3>
                                        <p style={{color: '#888', fontSize: '12px', margin: 0, textTransform: 'capitalize'}}>{service.type}</p>
                                    </div>
                                    <span style={{background: service.actif ? '#E8F5E9' : '#f5f5f5', color: service.actif ? '#2e7d32' : '#999', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600'}}>
                                        {service.actif ? '✅ Actif' : '⏸️ Désactivé'}
                                    </span>
                                </div>
                                {service.description && (
                                    <p style={{color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                        {service.description}
                                    </p>
                                )}
                                <p style={{color: C.primary, fontWeight: '800', fontSize: '18px', marginBottom: '12px'}}>
                                    {service.tarif} DH <span style={{fontSize: '13px', color: '#aaa', fontWeight: '400'}}>/ {getUniteLabel(service.type, service.unite)}</span>
                                </p>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button onClick={() => handleEdit(service)}
                                        style={{flex: 1, background: C.beige, color: C.brown, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        ✏️ Modifier
                                    </button>
                                    <button onClick={() => toggleActif(service)}
                                        style={{flex: 1, background: '#FFF8E1', color: '#f57f17', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        {service.actif ? '⏸️ Désactiver' : '▶️ Activer'}
                                    </button>
                                    <button onClick={() => handleDelete(service)}
                                        style={{flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}