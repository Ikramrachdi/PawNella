import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProfilPrestataire from './ProfilPrestataire';
import { SERVICE_TYPES, getUnite, getLabel } from '../constants/services';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

// Extrait un nom de ville propre depuis la réponse Nominatim
function extraireVille(item) {
    const a = item.address || {};
    return a.city || a.town || a.village || a.municipality || a.county || '';
}

// services_offerts peut être un tableau, une chaîne JSON, ou une simple chaîne
function premierService(p) {
    let v = p?.services_offerts;
    if (!v) return '';
    if (typeof v === 'string') {
        try { v = JSON.parse(v); } catch (e) { return v; }
    }
    if (Array.isArray(v)) return v[0] || '';
    return String(v);
}

export default function Services({ userLocation, onLocationChange }) {
    const villeInitiale = userLocation || '';

    const [ville, setVille] = useState(villeInitiale);
    const [showVilleModal, setShowVilleModal] = useState(!villeInitiale);

    const [prestataires, setPrestataires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null); // stocke la KEY (minuscule)
    const [showProfil, setShowProfil] = useState(false);
    const [selectedPrestId, setSelectedPrestId] = useState(null);
    const [search, setSearch] = useState('');

    const [saisieVille, setSaisieVille] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [rechercheEnCours, setRechercheEnCours] = useState(false);
    const [erreurVille, setErreurVille] = useState('');

    useEffect(() => {
        if (userLocation && userLocation !== ville) {
            setVille(userLocation);
            setShowVilleModal(false);
        }
    }, [userLocation]);

    useEffect(() => {
        if (!ville) {
            setPrestataires([]);
            return;
        }
        fetchPrestataires();
    }, [selectedService, ville]);

    const fetchPrestataires = async () => {
        setLoading(true);
        try {
            const params = { ville };
            if (selectedService) params.service = selectedService;
            const res = await api.get('/prestataires', { params });
            setPrestataires(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const rechercherVille = async (texte) => {
        setSaisieVille(texte);
        setErreurVille('');
        if (texte.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        setRechercheEnCours(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ma&limit=5&q=${encodeURIComponent(texte)}`;
            const res = await fetch(url);
            const data = await res.json();
            const villes = [];
            data.forEach(item => {
                const v = extraireVille(item);
                if (v && !villes.includes(v)) villes.push(v);
            });
            setSuggestions(villes);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        }
        setRechercheEnCours(false);
    };

    const confirmerVille = (v) => {
        if (!v) {
            setErreurVille('Veuillez sélectionner une ville dans la liste.');
            return;
        }
        setVille(v);
        if (onLocationChange) onLocationChange(v);
        setShowVilleModal(false);
        setSuggestions([]);
        setSaisieVille('');
    };

    const ouvrirModal = () => {
        setSaisieVille('');
        setSuggestions([]);
        setErreurVille('');
        setShowVilleModal(true);
    };

    const filtered = prestataires.filter(p =>
        !search ||
        p.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        p.nom?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (showProfil && selectedPrestId) {
        return (
            <ProfilPrestataire
                prestataireId={selectedPrestId}
                onBack={() => { setShowProfil(false); setSelectedPrestId(null); }}
                onReserver={() => { setShowProfil(false); }}
            />
        );
    }

    const modalVille = (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(74,44,36,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'}}>
            <div style={{background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{fontSize: '44px', marginBottom: '10px'}}>📍</div>
                    <h3 style={{color: C.brown, fontWeight: '800', fontSize: '20px', margin: '0 0 6px'}}>Où cherchez-vous ?</h3>
                    <p style={{color: '#888', fontSize: '14px', margin: 0}}>
                        Indiquez votre ville pour voir les prestataires disponibles près de chez vous.
                    </p>
                </div>

                <input
                    autoFocus
                    value={saisieVille}
                    onChange={e => rechercherVille(e.target.value)}
                    placeholder="Ex : Rabat, Salé, Casablanca..."
                    style={{width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '12px', border: `2px solid ${erreurVille ? '#e53935' : '#eee'}`, fontSize: '15px', outline: 'none', color: '#333'}}
                />

                {rechercheEnCours && <p style={{color: '#aaa', fontSize: '13px', margin: '10px 0 0'}}>⏳ Recherche...</p>}
                {erreurVille && <p style={{color: '#e53935', fontSize: '13px', margin: '8px 0 0'}}>{erreurVille}</p>}

                {suggestions.length > 0 && (
                    <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto'}}>
                        {suggestions.map((v, i) => (
                            <button key={i} onClick={() => confirmerVille(v)}
                                style={{background: C.beige, border: 'none', borderRadius: '12px', padding: '13px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '15px', color: C.brown, fontWeight: '600'}}
                                onMouseEnter={e => e.currentTarget.style.background = '#FFF0EE'}
                                onMouseLeave={e => e.currentTarget.style.background = C.beige}
                            >
                                📍 {v}
                            </button>
                        ))}
                    </div>
                )}

                {saisieVille.length >= 3 && !rechercheEnCours && suggestions.length === 0 && (
                    <p style={{color: '#888', fontSize: '13px', margin: '10px 0 0'}}>Aucune ville trouvée. Vérifiez l'orthographe.</p>
                )}

                {ville && (
                    <button onClick={() => setShowVilleModal(false)}
                        style={{width: '100%', marginTop: '18px', background: 'transparent', border: 'none', color: '#aaa', fontSize: '14px', cursor: 'pointer', padding: '8px'}}>
                        Annuler
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{padding: '24px'}}>
            {showVilleModal && modalVille}

            <div style={{marginBottom: '24px'}}>
                <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>Nos services</h2>
                <p style={{color: '#888', fontSize: '14px', margin: 0}}>Des professionnels vérifiés près de chez vous</p>
            </div>

            {ville && (
                <div style={{background: C.beige, borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
                    <span style={{color: C.brown, fontSize: '14px', fontWeight: '600'}}>📍 {ville}</span>
                    <button onClick={ouvrirModal}
                        style={{background: 'white', border: `1px solid ${C.primary}`, color: C.primary, borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}>
                        Changer
                    </button>
                </div>
            )}

            <div style={{background: 'white', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px'}}>
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un prestataire..."
                    style={{border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#333', background: 'transparent'}}/>
            </div>

            {/* Categories — source unique : constants/services.js */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '28px'}}>
                {SERVICE_TYPES.map(s => (
                    <button key={s.key} onClick={() => setSelectedService(selectedService === s.key ? null : s.key)}
                        style={{background: selectedService === s.key ? C.primary : s.color, border: 'none', borderRadius: '14px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'}}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{fontSize: '28px'}}>{s.icon}</span>
                        <span style={{fontSize: '12px', color: selectedService === s.key ? 'white' : C.brown, fontWeight: '600'}}>{s.label}</span>
                    </button>
                ))}
            </div>

            {!ville ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>📍</div>
                    <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Choisissez votre ville</p>
                    <p style={{fontSize: '14px', marginBottom: '20px'}}>Nous avons besoin de votre localisation pour afficher les prestataires.</p>
                    <button onClick={ouvrirModal}
                        style={{background: C.primary, color: 'white', border: 'none', borderRadius: '24px', padding: '12px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'}}>
                        Indiquer ma ville
                    </button>
                </div>
            ) : (
                <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', fontSize: '16px', margin: 0}}>
                            {selectedService ? getLabel(selectedService) : 'Tous les prestataires'} — {filtered.length} résultat(s)
                        </h3>
                    </div>

                    {loading ? (
                        <div style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>
                            <p>⏳ Chargement des prestataires...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                            <div style={{fontSize: '64px', marginBottom: '16px'}}>🔍</div>
                            <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Aucun prestataire trouvé</p>
                            <p style={{fontSize: '14px'}}>Essayez de changer votre localisation ou service</p>
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            {filtered.map(p => (
                                <div key={p.id}
                                    onClick={() => { setSelectedPrestId(p.id); setShowProfil(true); }}
                                    style={{background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s'}}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    {p.photo ? (
                                        <img src={p.photo} alt="" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.primary}`}}/>
                                    ) : (
                                        <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#FFF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, fontWeight: '700', color: C.primary}}>
                                            {p.prenom?.[0]}
                                        </div>
                                    )}
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                            <div>
                                                <h3 style={{fontWeight: '700', color: C.brown, fontSize: '15px', margin: '0 0 2px'}}>
                                                    {p.prenom} {p.nom}
                                                    {p.est_verifie && <span style={{color: '#4caf50', fontSize: '12px', marginLeft: '6px'}}>✅</span>}
                                                </h3>
                                                <p style={{color: '#888', fontSize: '13px', margin: '0 0 6px'}}>{p.description || 'Prestataire professionnel'}</p>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                    <span style={{color: '#FFB800', fontSize: '13px'}}>★</span>
                                                    <span style={{fontWeight: '600', fontSize: '13px', color: C.brown}}>{p.note_moyenne || '—'}</span>
                                                    <span style={{color: '#aaa', fontSize: '12px'}}>• 📍 {p.ville}</span>
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <p style={{fontWeight: '800', color: C.primary, fontSize: '16px', margin: '0 0 2px'}}>{p.tarif || '—'} DH</p>
                                                <p style={{color: '#aaa', fontSize: '12px', margin: '0 0 6px'}}>
                                                    {getUnite(selectedService || premierService(p))}
                                                </p>
                                                <span style={{background: C.beige, color: C.brown, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'}}>
                                                    Voir profil →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}