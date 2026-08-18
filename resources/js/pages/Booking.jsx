import React, { useState, useEffect, useRef } from 'react';
import CityInput from '../components/CityInput';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { validatePhone, validateDateHeure, dateMinToday, heureMinPourDate } from '../utils/validation';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';
import AddressInput from '../components/AddressInput';
import { calculerTrajetDepuisAdresses } from '../utils/taxiDistance';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

const TYPE_ICONS = {
    promenade: '🚶', garde: '🏠', pension: '🏨', visite: '🏥',
    toilettage: '✂️', taxi: '🚗', soins: '💊', dressage: '📋',
};

const CRENEAUX = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function Booking({ pendingBooking, clearPendingBooking }) {
    const { user } = useAuth();
    const { notify } = useNotification();

    const [step, setStep] = useState(1);
    const [location, setLocation] = useState('');
    const [services, setServices] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [selectedServiceType, setSelectedServiceType] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [selectedPrest, setSelectedPrest] = useState(null);
    const [date, setDate] = useState('');
    const [heure, setHeure] = useState('');
    const [duree, setDuree] = useState('30');
    const [notes, setNotes] = useState('');
    const [adresseDepart, setAdresseDepart] = useState('');
    const [adresseArrivee, setAdresseArrivee] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taxiInfo, setTaxiInfo] = useState(null);      // { distance, duree, prix }
    const [calculTaxi, setCalculTaxi] = useState(false);  // en cours de calcul
    const [coordonnees, setCoordonnees] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || '',
    });
    const [coordError, setCoordError] = useState('');
    const [coordTouched, setCoordTouched] = useState({});

    const coordRefs = {
        nom: useRef(null),
        prenom: useRef(null),
        telephone: useRef(null),
        adresse: useRef(null),
    };

    const scrollToFirstCoordError = (errors) => {
        for (const field of Object.keys(coordRefs)) {
            if (errors[field] && coordRefs[field].current) {
                coordRefs[field].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    };

    const today = dateMinToday();

    // Heure minimale autorisée pour la date choisie
    const heureMin = heureMinPourDate(date);
    const creneauPasse = (h) => date === today && h < heureMin;
    const tousCreneauxPasses = date === today && CRENEAUX.every(h => creneauPasse(h));

    useEffect(() => {
        fetchAnimals();
        if (pendingBooking?.type === 'service' && pendingBooking.serviceType) {
            setSelectedServiceType(pendingBooking.serviceType);
            setStep(1);
            if (clearPendingBooking) clearPendingBooking();
        }
    }, []);

    // Si l'heure choisie devient invalide après changement de date, on la réinitialise
    useEffect(() => {
        if (heure && creneauPasse(heure)) setHeure('');
    }, [date]);

    useEffect(() => {
        if (location) fetchServices();
    }, [location]);

    const fetchAnimals = async () => {
        try {
            const res = await api.get('/animals');
            setAnimals(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedServiceType) params.type = selectedServiceType;
            if (location) params.ville = location;
            const res = await api.get('/services', { params });
            setServices(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const TYPES = [
        { type: 'promenade', label: 'Promenade' },
        { type: 'garde', label: 'Garde' },
        { type: 'pension', label: 'Pension' },
        { type: 'visite', label: 'Visite' },
        { type: 'toilettage', label: 'Toilettage' },
        { type: 'taxi', label: 'Taxi' },
        { type: 'soins', label: 'Soins' },
        { type: 'dressage', label: 'Dressage' },
    ];

    const servicesFiltres = selectedServiceType
        ? services.filter(s => s.type === selectedServiceType)
        : services;
    const availableTypes = new Set(services.map(s => s.type));

    const steps = [
        { num: 1, label: 'Localisation' },
        { num: 2, label: 'Service' },
        { num: 3, label: 'Animal' },
        { num: 4, label: 'Prestataire' },
        { num: 5, label: 'Date' },
        { num: 6, label: 'Coordonnées' },
        { num: 7, label: 'Récap' },
    ];

    const validateCoordonnees = () => {
        const errors = {};
        if (!coordonnees.nom) errors.nom = true;
        if (!coordonnees.prenom) errors.prenom = true;
        if (!coordonnees.telephone || !validatePhone(coordonnees.telephone, user?.pays || 'MA')) errors.telephone = true;
        if (!coordonnees.adresse) errors.adresse = true;

        if (Object.keys(errors).length > 0) {
            if (errors.nom || errors.prenom) setCoordError('❌ Nom et prénom obligatoires');
            else if (errors.telephone) setCoordError('❌ Numéro de téléphone invalide');
            else if (errors.adresse) setCoordError('❌ Adresse obligatoire');
            scrollToFirstCoordError(errors);
            return false;
        }
        setCoordError('');
        return true;
    };

   const handleConfirm = async () => {
       
      // Taxi : le prix doit avoir été calculé (sinon montant faux)
        const estTaxi = String(selectedService?.type || '').toLowerCase().trim() === 'taxi'
            || String(selectedService?.nom || '').toLowerCase().includes('taxi');
        console.log('CONFIRM → estTaxi:', estTaxi, '| type:', selectedService?.type, '| taxiInfo:', taxiInfo);
        if (estTaxi && !taxiInfo) {
            notify.error('Veuillez calculer le prix du trajet avant de confirmer');
            setStep(5);
            return;
        }
        setLoading(true);
        try {
            const dateDebut = `${date} ${heure}:00`;
            const dateFinObj = new Date(`${date}T${heure}:00`);
            dateFinObj.setMinutes(dateFinObj.getMinutes() + parseInt(duree));
            const pad = (n) => String(n).padStart(2, '0');
            const dateFin = `${dateFinObj.getFullYear()}-${pad(dateFinObj.getMonth() + 1)}-${pad(dateFinObj.getDate())} ${pad(dateFinObj.getHours())}:${pad(dateFinObj.getMinutes())}:00`;

            await api.post('/reservations', {
                prestataire_id: selectedService.user_id,
                service_id: selectedService.id,
                animal_id: selectedAnimal?.id,
                type_service: selectedService.type,
                ville: location,
                date_debut: dateDebut,
                date_fin: dateFin,
montant: (selectedService.type === 'taxi' && taxiInfo) ? taxiInfo.prix : selectedService.tarif,                notes: notes,
                adresse_depart: adresseDepart || null,
                adresse_arrivee: adresseArrivee || null,
                client_nom: coordonnees.nom,
                client_prenom: coordonnees.prenom,
                client_telephone: coordonnees.telephone,
                client_adresse: coordonnees.adresse,
            });
            setConfirmed(true);
        } catch (err) {
            console.error(err);
            notify.error('Erreur lors de la réservation. Vérifiez vos informations.');
        }
        setLoading(false);
    };

   // Un service est-il compatible avec l'espèce de l'animal choisi ?
    const serviceAccepteAnimal = (service, animal) => {
        if (!animal) return true;
        const especes = service.especes_acceptees;
        if (!especes || especes.length === 0) return true;
        const espceAnimal = String(animal.espece || '').toLowerCase();
        if (especes.includes(espceAnimal)) return true;
        const principales = ['chien', 'chat', 'oiseau', 'reptile', 'rongeur'];
        if (especes.includes('autre') && !principales.includes(espceAnimal)) return true;
        return false;
    };

    const getAnimalIcon = (espece) => {
        const icons = { chien: '🐶', chat: '🐱', oiseau: '🐦', lapin: '🐰', hamster: '🐹', tortue: '🐢', poisson: '🐠', reptile: '🦎' };
        return icons[espece] || '🐾';
    };
    if (confirmed) {
        return (
            <div style={{padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh'}}>
                <div style={{background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '400px', width: '100%'}}>
                    <div style={{fontSize: '80px', marginBottom: '16px'}}>🎉</div>
                    <h2 style={{color: C.brown, fontSize: '24px', fontWeight: '800', marginBottom: '8px'}}>Réservation confirmée !</h2>
                    <p style={{color: '#888', marginBottom: '24px', lineHeight: '1.6'}}>
                        Votre réservation avec <strong>{selectedPrest?.prenom} {selectedPrest?.nom}</strong> pour <strong>{selectedAnimal?.nom}</strong> est confirmée.
                    </p>
                    <div style={{background: C.beige, borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left'}}>
                        {[
                            { label: 'Animal', value: `${selectedAnimal?.nom} (${selectedAnimal?.espece})` },
                            { label: 'Service', value: selectedService?.titre },
                            { label: 'Prestataire', value: `${selectedPrest?.prenom} ${selectedPrest?.nom}` },
                            { label: 'Date', value: `${date} à ${heure}` },
                            { label: 'Total', value: `${selectedService?.tarif} DH`, bold: true },
                        ].map((item, i) => (
                            <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: i < 4 ? '8px' : 0}}>
                                <span style={{color: '#888', fontSize: '14px'}}>{item.label}</span>
                                <span style={{color: item.bold ? C.primary : C.brown, fontWeight: item.bold ? '800' : '600', fontSize: item.bold ? '16px' : '14px'}}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={async () => {
                        try {
                            await api.post('/messages', {
                                destinataire_id: selectedService?.user_id,
                                contenu: `Bonjour, je viens de réserver votre service "${selectedService?.titre}" pour ${selectedAnimal?.nom}. Merci !`
                            });
                            window.location.href = '/messages';
                        } catch (err) { console.error(err); }
                    }}
                        style={{width: '100%', background: '#E3F2FD', color: '#1565c0', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '12px'}}>
                        💬 Contacter le prestataire
                    </button>
                    <button onClick={() => { setStep(1); setConfirmed(false); setSelectedServiceType(null); setSelectedService(null); setSelectedAnimal(null); setDate(''); setHeure(''); }}
                        style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                        Faire une nouvelle réservation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, marginBottom: '24px'}}>📅 Nouvelle réservation</h2>

            {/* Progress */}
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '32px', overflowX: 'auto'}}>
                {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '60px'}}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: step >= s.num ? C.primary : '#e0e0e0',
                                color: step >= s.num ? 'white' : '#aaa',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '700', fontSize: '13px'
                            }}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span style={{fontSize: '10px', color: step >= s.num ? C.primary : '#aaa', fontWeight: step === s.num ? '700' : '400', whiteSpace: 'nowrap'}}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{flex: 1, height: '2px', background: step > s.num ? C.primary : '#e0e0e0', marginBottom: '18px', minWidth: '16px'}}/>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* STEP 1 — Localisation */}
            {step === 1 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '8px'}}>📍 Où se trouve votre animal ?</h3>
                    <p style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>Indiquez votre ville pour trouver des prestataires près de chez vous.</p>
<CityInput value={location} onChange={setLocation} placeholder="Ex: Rabat, Maroc"/>
                                            <button onClick={async () => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                                const data = await res.json();
                                setLocation(data.address?.city || data.address?.town || '');
                            });
                        }
                    }} style={{width: '100%', background: C.beige, color: C.brown, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', marginTop: '12px', fontSize: '14px'}}>
                        📍 Utiliser ma position
                    </button>
                    <button onClick={() => { if (location.length >= 3) setStep(2); else notify.error('Veuillez entrer une ville valide'); }}
                        style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '12px'}}>
                        Continuer →
                    </button>
                </div>
            )}

            {/* STEP 2 — Service */}
            {step === 2 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '8px'}}>🔧 Quel service recherchez-vous ?</h3>
                    <p style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>Services disponibles près de <strong>{location}</strong></p>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px'}}>
                        {TYPES.map(t => {
                            const disponible = availableTypes.has(t.type);
                            return (
                                <button key={t.type}
                                    onClick={() => { if (disponible) setSelectedServiceType(t.type); }}
                                    disabled={!disponible}
                                    style={{
                                        padding: '14px 8px', borderRadius: '12px', border: 'none',
                                        cursor: disponible ? 'pointer' : 'not-allowed',
                                        background: selectedServiceType === t.type ? C.primary : (disponible ? C.beige : '#f0f0f0'),
                                        color: selectedServiceType === t.type ? 'white' : (disponible ? C.brown : '#bbb'),
                                        fontWeight: '600', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        opacity: disponible ? 1 : 0.6,
                                    }}>
                                    <span style={{fontSize: '22px'}}>{TYPE_ICONS[t.type]}</span>
                                    {t.label}
                                    {!disponible && <span style={{fontSize: '9px', color: '#bbb'}}>Indisponible</span>}
                                </button>
                            );
                        })}
                    </div>

                    {loading ? (
                        <p style={{textAlign: 'center', color: '#aaa', padding: '20px'}}>⏳ Chargement...</p>
                    ) : servicesFiltres.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#aaa', padding: '20px'}}>
                            {selectedServiceType ? 'Aucun service de ce type trouvé près de chez vous' : 'Choisissez un type de service ci-dessus'}
                        </p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            {servicesFiltres.map(s => (
                                <div key={s.id} onClick={() => setSelectedService(s)}
                                    style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '14px', cursor: 'pointer', border: `2px solid ${selectedService?.id === s.id ? C.primary : '#f0f0f0'}`, background: selectedService?.id === s.id ? '#FFF0EE' : 'white', transition: 'all 0.2s'}}>
                                    {s.photo_principale ? (
                                        <img src={s.photo_principale} alt={s.titre} style={{width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0}}/>
                                    ) : (
                                        <span style={{fontSize: '32px'}}>{TYPE_ICONS[s.type] || '🐾'}</span>
                                    )}
                                    <div style={{flex: 1}}>
                                        <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px'}}>{s.titre}</p>
                                        <p style={{color: '#888', fontSize: '13px', margin: 0}}>{s.prestataire?.prenom} {s.prestataire?.nom}</p>
                                    </div>
                                    <span style={{color: C.primary, fontWeight: '700'}}>{s.tarif} DH</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button onClick={() => setStep(1)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                        <button onClick={() => {
                            if (selectedService) { setSelectedPrest(selectedService.prestataire); setStep(3); }
                            else notify.error('Choisissez un service');
                        }} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                            Continuer →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3 — Animal */}
            {step === 3 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '8px'}}>🐾 Quel animal est concerné ?</h3>
                    <p style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>Sélectionnez l'animal pour lequel vous réservez ce service.</p>

                   {animals.length === 0 ? (
                        <>
                            {/* Message inline */}
                            <div style={{textAlign: 'center', padding: '32px', background: C.beige, borderRadius: '14px'}}>
                                <div style={{fontSize: '48px', marginBottom: '12px'}}>🐾</div>
                                <p style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>Aucun animal enregistré</p>
                                <p style={{color: '#888', fontSize: '14px', marginBottom: '16px'}}>Vous devez d'abord ajouter un animal pour pouvoir réserver.</p>
                            </div>

                                {/* Pop-up modal */}
                                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                                    <div style={{background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'}}>
                                        <div style={{fontSize: '60px', marginBottom: '16px'}}>🐾</div>
                                        <h3 style={{color: C.brown, fontWeight: '800', fontSize: '22px', marginBottom: '8px'}}>Ajoutez d'abord un animal</h3>
                                        <p style={{color: '#888', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6'}}>
                                            Pour réserver un service, vous devez avoir au moins un animal enregistré. Cela ne prend qu'une minute !
                                        </p>
                                        <button onClick={() => { window.location.href = '/animals'; }}
                                            style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '12px'}}>
                                            🐾 Ajouter un animal
                                        </button>
                                        <button onClick={() => setStep(2)}
                                            style={{width: '100%', background: 'white', color: '#888', border: '1.5px solid #e0d5d0', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'}}>
                                            ← Retour
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                       <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px'}}>
                            {animals.map(animal => {
                                const compatible = serviceAccepteAnimal(selectedService, animal);
                                return (
                                <div key={animal.id} onClick={() => { if (compatible) setSelectedAnimal(animal); }}
                                    style={{
                                        padding: '16px', borderRadius: '14px', cursor: compatible ? 'pointer' : 'not-allowed', textAlign: 'center',
                                        border: `2px solid ${selectedAnimal?.id === animal.id ? C.primary : '#f0f0f0'}`,
                                        background: selectedAnimal?.id === animal.id ? '#FFF0EE' : 'white',
                                        opacity: compatible ? 1 : 0.45,
                                        transition: 'all 0.2s'
                                    }}>
                                    {animal.photo ? (
                                        <img src={animal.photo} alt={animal.nom}
                                            style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.primary}`, marginBottom: '8px'}}/>
                                    ) : (
                                        <div style={{fontSize: '40px', marginBottom: '8px'}}>{getAnimalIcon(animal.espece)}</div>
                                    )}
                                    <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px', fontSize: '14px'}}>{animal.nom}</p>
                                    <p style={{color: '#888', fontSize: '12px', margin: 0, textTransform: 'capitalize'}}>{animal.espece}</p>
                                    {selectedAnimal?.id === animal.id && compatible && (
                                        <span style={{display: 'inline-block', marginTop: '6px', background: C.primary, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700'}}>
                                            ✓ Sélectionné
                                        </span>
                                    )}
                                    {!compatible && (
                                        <span style={{display: 'inline-block', marginTop: '6px', background: '#f5f5f5', color: '#999', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600'}}>
                                            Non accepté
                                        </span>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button onClick={() => setStep(2)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                      <button onClick={() => {
                            if (!selectedAnimal) { notify.error('Veuillez sélectionner un animal'); return; }
                            if (!serviceAccepteAnimal(selectedService, selectedAnimal)) {
                                notify.error(`Ce prestataire n'accepte pas les ${selectedAnimal.espece}. Choisissez un autre animal ou revenez au choix du service.`);
                                return;
                            }
                            setStep(4);
                        }} disabled={animals.length === 0}
                            style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: animals.length === 0 ? 0.5 : 1}}>
                            Continuer →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4 — Prestataire */}
            {step === 4 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '8px'}}>👤 Votre prestataire</h3>
                    <p style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>{selectedService?.titre} pour <strong>{selectedAnimal?.nom}</strong></p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '14px', border: `2px solid ${C.primary}`, background: '#FFF0EE'}}>
                        {selectedPrest?.photo ? (
                            <img src={selectedPrest.photo} alt="" style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0}}/>
                        ) : (
                            <div style={{width: '50px', height: '50px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: C.primary, flexShrink: 0}}>
                                {selectedPrest?.prenom?.[0]}
                            </div>
                        )}
                        <div style={{flex: 1}}>
                            <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px'}}>{selectedPrest?.prenom} {selectedPrest?.nom}</p>
                            <p style={{color: '#888', fontSize: '12px', margin: '0 0 4px'}}>{selectedPrest?.description || 'Prestataire professionnel'}</p>
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <span style={{color: '#FFB800'}}>★</span>
                                <span style={{fontWeight: '600', fontSize: '13px', color: C.brown}}>{selectedPrest?.note_moyenne || '—'}</span>
                                {selectedPrest?.est_verifie && <span style={{color: '#4caf50', fontSize: '12px'}}>✅ Vérifié</span>}
                            </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p style={{fontWeight: '800', color: C.primary, margin: '0 0 2px'}}>{selectedService?.tarif} DH</p>
                            <p style={{color: '#aaa', fontSize: '12px', margin: 0}}>/ {selectedService?.unite}</p>
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button onClick={() => setStep(3)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                        <button onClick={() => setStep(5)} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                            Continuer →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 5 — Date */}
            {step === 5 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '20px'}}>📅 Quand ?</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Date *</label>
                            <input type="date" value={date} min={today}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val && val < today) {
                                        notify.error('La date ne peut pas être dans le passé !');
                                        return;
                                    }
                                    setDate(val);
                                }}
                                style={{width: '100%', border: fieldBorder(!date), borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}/>
                            {!date && <FieldError message="Date obligatoire"/>}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Heure *</label>

                            {!date ? (
                                <p style={{color: '#aaa', fontSize: '13px', margin: 0}}>Choisissez d'abord une date.</p>
                            ) : tousCreneauxPasses ? (
                                <div style={{background: '#FFF0EE', borderRadius: '10px', padding: '12px 14px'}}>
                                    <p style={{color: C.primary, fontSize: '13px', fontWeight: '600', margin: 0}}>
                                        ⏰ Plus aucun créneau disponible aujourd'hui. Choisissez une date ultérieure.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                        {CRENEAUX.map(h => {
                                            const passe = creneauPasse(h);
                                            return (
                                                <button key={h} onClick={() => { if (!passe) setHeure(h); }} disabled={passe}
                                                    title={passe ? 'Créneau déjà passé' : ''}
                                                    style={{
                                                        padding: '8px 16px', borderRadius: '10px', border: 'none',
                                                        cursor: passe ? 'not-allowed' : 'pointer',
                                                        background: heure === h ? C.primary : (passe ? '#f0f0f0' : C.beige),
                                                        color: heure === h ? 'white' : (passe ? '#bbb' : C.brown),
                                                        fontWeight: '600', fontSize: '13px',
                                                        textDecoration: passe ? 'line-through' : 'none',
                                                        opacity: passe ? 0.6 : 1,
                                                    }}>
                                                    {h}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {!heure && <FieldError message="Veuillez choisir un créneau"/>}
                                    {date === today && (
                                        <p style={{color: '#aaa', fontSize: '12px', margin: '8px 0 0'}}>
                                            Les créneaux déjà passés sont désactivés (réservation min. 30 min à l'avance).
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                       {selectedService?.type !== 'taxi' && (
                            <div>
                                <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Durée</label>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    {['30', '45', '60'].map(d => (
                                        <button key={d} onClick={() => setDuree(d)}
                                            style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: duree === d ? C.primary : C.beige, color: duree === d ? 'white' : C.brown, fontWeight: '600', fontSize: '13px'}}>
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Taxi : adresses départ/arrivée */}
                        {selectedService?.type === 'taxi' && (
                            <>
                                <div>
                                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>🚗 Adresse de départ *</label>
                                    <AddressInput value={adresseDepart} onChange={val => setAdresseDepart(val)} placeholder="Ex: 15 Rue Mohammed V, Rabat"/>
                                    {!adresseDepart && <FieldError message="Adresse de départ obligatoire pour le taxi"/>}
                                </div>

                                <div>
                                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>🏁 Adresse d'arrivée *</label>
                                    <AddressInput value={adresseArrivee} onChange={val => setAdresseArrivee(val)} placeholder="Ex: Clinique vétérinaire, Hay Riad"/>
                                    {!adresseArrivee && <FieldError message="Adresse d'arrivée obligatoire pour le taxi"/>}
                                </div>
                                {/* Calcul automatique du prix */}
                                <div>
                                    <button type="button"
                                        disabled={!adresseDepart || !adresseArrivee || calculTaxi}
                                        onClick={async () => {
                                            setCalculTaxi(true);
                                            setTaxiInfo(null);
                                            const res = await calculerTrajetDepuisAdresses(adresseDepart, adresseArrivee, selectedAnimal?.espece || 'chien');
                                            if (res.ok) setTaxiInfo(res);
                                            else notify.error(res.message || 'Impossible de calculer le trajet');
                                            setCalculTaxi(false);
                                        }}
                                        style={{width: '100%', background: (!adresseDepart || !adresseArrivee) ? '#ccc' : C.brown, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: (!adresseDepart || !adresseArrivee) ? 'not-allowed' : 'pointer', fontSize: '14px'}}>
                                        {calculTaxi ? '⏳ Calcul en cours...' : '🧮 Calculer le prix du trajet'}
                                    </button>

                                    {taxiInfo && (
                                        <div style={{marginTop: '12px', background: '#E8F5E9', borderRadius: '12px', padding: '14px'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                                <span style={{color: '#555', fontSize: '13px'}}>📏 Distance</span>
                                                <span style={{color: C.brown, fontWeight: '700', fontSize: '13px'}}>{taxiInfo.distance} km</span>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                                <span style={{color: '#555', fontSize: '13px'}}>⏱️ Durée estimée</span>
                                                <span style={{color: C.brown, fontWeight: '700', fontSize: '13px'}}>{taxiInfo.duree} min</span>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #c8e6c9'}}>
                                                <span style={{color: '#2e7d32', fontSize: '15px', fontWeight: '700'}}>💰 Prix estimé</span>
                                                <span style={{color: '#2e7d32', fontWeight: '800', fontSize: '18px'}}>{taxiInfo.prix} DH</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Notes (optionnel)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box'}}
                                rows={3} placeholder="Informations importantes sur votre animal..."/>
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button onClick={() => setStep(4)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                       <button onClick={() => {
                            const check = validateDateHeure(date, heure);
                            if (!check.valid) { notify.error(check.message); return; }
                            if (selectedService?.type === 'taxi' && (!adresseDepart || !adresseArrivee)) {
                                notify.error('Les adresses de départ et d\'arrivée sont obligatoires pour le taxi');
                                return;
                            }
                            if (selectedService?.type === 'taxi' && !taxiInfo) {
                                notify.error('Veuillez calculer le prix du trajet avant de continuer');
                                return;
                            }
                            setStep(6);
                        }} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                            
                            
                            Continuer →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 6 — Coordonnées */}
            {step === 6 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '4px'}}>👤 Vos coordonnées</h3>
                    <p style={{color: '#888', fontSize: '13px', marginBottom: '20px'}}>Ces informations sont nécessaires pour confirmer votre réservation.</p>

                    <ErrorBanner message={coordError} />

                    <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                            <div ref={coordRefs.nom}>
                                <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Nom *</label>
                                <input type="text" value={coordonnees.nom}
                                    onChange={e => setCoordonnees({...coordonnees, nom: e.target.value})}
                                    onBlur={() => setCoordTouched(p => ({...p, nom: true}))}
                                    style={{width: '100%', border: fieldBorder(coordTouched.nom && !coordonnees.nom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                    placeholder="Votre nom"/>
                                {coordTouched.nom && !coordonnees.nom && <FieldError message="Nom obligatoire"/>}
                            </div>
                            <div ref={coordRefs.prenom}>
                                <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Prénom *</label>
                                <input type="text" value={coordonnees.prenom}
                                    onChange={e => setCoordonnees({...coordonnees, prenom: e.target.value})}
                                    onBlur={() => setCoordTouched(p => ({...p, prenom: true}))}
                                    style={{width: '100%', border: fieldBorder(coordTouched.prenom && !coordonnees.prenom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                    placeholder="Votre prénom"/>
                                {coordTouched.prenom && !coordonnees.prenom && <FieldError message="Prénom obligatoire"/>}
                            </div>
                        </div>

                        <div ref={coordRefs.telephone}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>📱 Téléphone *</label>
                            <input type="tel" value={coordonnees.telephone}
                                onChange={e => setCoordonnees({...coordonnees, telephone: e.target.value})}
                                onBlur={() => setCoordTouched(p => ({...p, telephone: true}))}
                                style={{width: '100%', border: fieldBorder(coordTouched.telephone && (!coordonnees.telephone || !validatePhone(coordonnees.telephone, user?.pays || 'MA'))), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder="Ex: 0612345678"/>
                            {coordTouched.telephone && !coordonnees.telephone && <FieldError message="Téléphone obligatoire"/>}
                            {coordTouched.telephone && coordonnees.telephone && !validatePhone(coordonnees.telephone, user?.pays || 'MA') && <FieldError message="Numéro invalide"/>}
                            {coordonnees.telephone && validatePhone(coordonnees.telephone, user?.pays || 'MA') && <FieldSuccess message="Numéro valide"/>}
                        </div>

                        <div ref={coordRefs.adresse}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>📍 Adresse *</label>
                            <AddressInput
                                value={coordonnees.adresse}
                                onChange={val => { setCoordonnees({...coordonnees, adresse: val}); setCoordTouched(p => ({...p, adresse: true})); }}
                                placeholder="Ex: 15 Rue Mohammed V, Rabat"
                            />
                            {coordTouched.adresse && !coordonnees.adresse && <FieldError message="Adresse obligatoire"/>}
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button onClick={() => { setStep(5); setCoordError(''); }}
                            style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>
                            ← Retour
                        </button>
                        <button onClick={() => {
                            setCoordTouched({ nom: true, prenom: true, telephone: true, adresse: true });
                            if (validateCoordonnees()) setStep(7);
                        }} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                            Continuer →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 7 — Récap */}
            {step === 7 && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '20px'}}>📋 Récapitulatif</h3>

                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: C.beige, borderRadius: '14px', marginBottom: '16px'}}>
                        {selectedAnimal?.photo ? (
                            <img src={selectedAnimal.photo} alt="" style={{width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover'}}/>
                        ) : (
                            <div style={{fontSize: '30px'}}>{getAnimalIcon(selectedAnimal?.espece)}</div>
                        )}
                        <div>
                           <div>
                            <p style={{fontWeight: '700', color: C.brown, margin: 0}}>{selectedAnimal?.nom}</p>
                            <p style={{color: '#888', fontSize: '12px', margin: 0, textTransform: 'capitalize'}}>{selectedAnimal?.espece} {selectedAnimal?.race ? `• ${selectedAnimal.race}` : ''}</p>
                            {(selectedAnimal?.taille || selectedAnimal?.poids) && (
                                <p style={{color: '#aaa', fontSize: '12px', margin: '2px 0 0'}}>
                                    {selectedAnimal?.taille ? `📏 ${selectedAnimal.taille}` : ''}{selectedAnimal?.taille && selectedAnimal?.poids ? ' • ' : ''}{selectedAnimal?.poids ? `⚖️ ${selectedAnimal.poids} kg` : ''}
                                </p>
                            )}
                        </div>
                        </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
                        {[
                            { label: 'Service', value: selectedService?.titre },
                            { label: 'Prestataire', value: `${selectedPrest?.prenom} ${selectedPrest?.nom}` },
                            { label: 'Date', value: date },
                            { label: 'Heure', value: heure },
                            { label: 'Durée', value: `${duree} minutes` },
                            { label: 'Localisation', value: location },
                            { label: 'Client', value: `${coordonnees.prenom} ${coordonnees.nom}` },
                            { label: 'Téléphone', value: coordonnees.telephone },
                            { label: 'Adresse', value: coordonnees.adresse },
                            ...(selectedService?.type === 'taxi' ? [
                                { label: '🚗 Départ', value: adresseDepart },
                                { label: '🏁 Arrivée', value: adresseArrivee },
                            ] : []),
                        ].map((item, i, arr) => (
                            <div key={i} style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none'}}>
                                <span style={{color: '#888', fontSize: '14px'}}>{item.label}</span>
                                <span style={{color: C.brown, fontWeight: '600', fontSize: '14px', maxWidth: '60%', textAlign: 'right'}}>{item.value}</span>
                            </div>
                        ))}
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px'}}>
                            <span style={{color: C.brown, fontWeight: '700', fontSize: '16px'}}>Total</span>
                            <span style={{color: C.primary, fontWeight: '800', fontSize: '20px'}}>{selectedService?.tarif} DH</span>
                        </div>
                    </div>

                    {notes && (
                        <div style={{background: '#FFF8E1', borderRadius: '10px', padding: '12px', marginBottom: '20px'}}>
                            <p style={{color: C.brown, fontSize: '13px', margin: 0}}>📝 {notes}</p>
                        </div>
                    )}

                    <div style={{display: 'flex', gap: '12px'}}>
                        <button onClick={() => setStep(6)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                        <button onClick={handleConfirm} disabled={loading}
                            style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', opacity: loading ? 0.7 : 1}}>
                            {loading ? '⏳ Envoi...' : '✅ Confirmer la réservation'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}