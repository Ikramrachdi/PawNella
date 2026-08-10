import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PhotoUpload from '../components/PhotoUpload';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';
import { verifierPhotoAnimal } from '../utils/animalPhotoCheck';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

// Numéro marocain : 10 chiffres commençant par 0, ou +212 suivi de 9 chiffres
function validateTelMaroc(tel) {
    if (!tel) return true; // champ optionnel
    const clean = tel.replace(/\s/g, '');
    return /^0[5-7][0-9]{8}$/.test(clean) || /^\+212[5-7][0-9]{8}$/.test(clean);
}

// Nom/race valide : min 2 caractères, contient une voyelle, que des lettres/espaces/tirets
function validateNomAnimal(txt) {
    if (!txt) return false;
    const clean = txt.trim();
    if (clean.length < 2) return false;
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(clean)) return false;
    if (!/[aeiouyàâäéèêëîïôöûü]/i.test(clean)) return false;
    return true;
}

// Durée de vie maximale par espèce (en années)
const DUREE_VIE_MAX = {
    chien: 20,
    chat: 25,
    oiseau: 80,
    lapin: 12,
    hamster: 4,
    cochon_dinde: 8,
    tortue: 150,
    poisson: 30,
    reptile: 40,
    autre: 50,
};

const ESPECES = [
    { value: 'chien', label: '🐶 Chien' },
    { value: 'chat', label: '🐱 Chat' },
    { value: 'oiseau', label: '🐦 Oiseau' },
    { value: 'lapin', label: '🐰 Lapin' },
    { value: 'hamster', label: '🐹 Hamster' },
    { value: 'cochon_dinde', label: '🐾 Cochon d\'Inde' },
    { value: 'tortue', label: '🐢 Tortue' },
    { value: 'poisson', label: '🐠 Poisson' },
    { value: 'reptile', label: '🦎 Reptile' },
    { value: 'cheval', label: '🐴 Cheval' },
    { value: 'autre', label: '🐾 Autre' },
];

// Races courantes par espèce
const RACES_PAR_ESPECE = {
    chien: ['Berger Allemand', 'Labrador', 'Golden Retriever', 'Bouledogue Français', 'Chihuahua', 'Rottweiler', 'Husky Sibérien', 'Beagle', 'Caniche', 'Berger Belge', 'Border Collie', 'Boxer', 'Dobermann', 'Épagneul', 'Jack Russell', 'Pitbull', 'Setter', 'Teckel', 'Yorkshire', 'Croisé / Bâtard'],
    chat: ['Persan', 'Siamois', 'Maine Coon', 'British Shorthair', 'Bengal', 'Sphynx', 'Ragdoll', 'Chartreux', 'Abyssin', 'Européen', 'Angora', 'Croisé / Européen'],
    oiseau: ['Perroquet', 'Perruche', 'Canari', 'Cacatoès', 'Inséparable', 'Calopsitte', 'Mandarin', 'Pinson'],
    lapin: ['Nain', 'Bélier', 'Angora', 'Rex', 'Géant des Flandres', 'Tête de Lion', 'Hollandais'],
    hamster: ['Doré / Syrien', 'Russe', 'Roborovski', 'Chinois', 'Campbell'],
    cochon_dinde: ['Américain', 'Abyssin', 'Péruvien', 'Rex', 'Sheltie'],
    tortue: ['Hermann', 'Grecque', 'De Floride', 'Léopard', 'Sillonnée'],
    poisson: ['Poisson rouge', 'Betta', 'Guppy', 'Molly', 'Néon', 'Scalaire', 'Koï'],
    reptile: ['Gecko', 'Iguane', 'Pogona', 'Serpent des blés', 'Caméléon', 'Python royal'],
    autre: [],
};

// Types de justificatifs acceptés
const TYPES_PREUVE = [
    { value: 'carnet_vaccination', label: '💉 Carnet de vaccination' },
    { value: 'certificat_veterinaire', label: '🏥 Certificat vétérinaire' },
    { value: 'passeport_animal', label: '📘 Passeport animalier' },
    { value: 'certificat_naissance', label: '📜 Certificat de naissance / pedigree' },
    { value: 'facture_adoption', label: '🧾 Facture / contrat d\'adoption' },
    { value: 'puce_identification', label: '🔖 Attestation de puce électronique' },
];

const STATUTS_PREUVE = {
    en_attente: { label: '⏳ En cours de vérification', bg: '#FFF8E1', color: '#f57f17' },
    valide: { label: '✅ Propriété vérifiée', bg: '#E8F5E9', color: '#2e7d32' },
    refuse: { label: '❌ Document refusé', bg: '#FFF0EE', color: '#E8756A' },
};

function dateLocale(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatAge(dateStr) {
    if (!dateStr) return '';
    const naissance = new Date(dateStr);
    const now = new Date();
    if (isNaN(naissance.getTime()) || naissance > now) return '';

    let mois = (now.getFullYear() - naissance.getFullYear()) * 12 + (now.getMonth() - naissance.getMonth());
    if (now.getDate() < naissance.getDate()) mois--;
    if (mois < 0) mois = 0;

    if (mois < 1) {
        const jours = Math.floor((now - naissance) / (1000 * 60 * 60 * 24));
        return jours <= 1 ? `${jours} jour` : `${jours} jours`;
    }
    if (mois < 12) return `${mois} mois`;

    const ans = Math.floor(mois / 12);
    const reste = mois % 12;
    const partAns = ans === 1 ? '1 an' : `${ans} ans`;
    return reste === 0 ? partAns : `${partAns} et ${reste} mois`;
}

function AnimalAvatar({ photo, icon, taille = 60 }) {
    const [erreur, setErreur] = useState(false);
    useEffect(() => { setErreur(false); }, [photo]);

    if (!photo || erreur) {
        return (
            <div style={{width: `${taille}px`, height: `${taille}px`, borderRadius: '50%', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${Math.round(taille * 0.47)}px`, flexShrink: 0}}>
                {icon}
            </div>
        );
    }

    return (
        <img src={photo} alt=""
            onError={() => setErreur(true)}
            style={{width: `${taille}px`, height: `${taille}px`, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.primary}`, flexShrink: 0}}/>
    );
}

function validateDateNaissance(date, espece) {
    if (!date) return { valid: false, message: 'Date de naissance obligatoire' };

    const naissance = new Date(date);
    const today = new Date();

    if (naissance > today) {
        return { valid: false, message: 'La date de naissance ne peut pas être dans le futur' };
    }

    const ageEnAnnees = (today - naissance) / (1000 * 60 * 60 * 24 * 365.25);
    const maxAge = DUREE_VIE_MAX[espece] || 50;

    if (ageEnAnnees > maxAge) {
        return { valid: false, message: `Un ${espece} ne peut pas vivre plus de ${maxAge} ans. Vérifiez la date de naissance.` };
    }
    if (ageEnAnnees < 0.1) {
        return { valid: false, message: 'L\'animal doit avoir au moins quelques semaines' };
    }
    return { valid: true };
}

export default function Animals() {
    const [animals, setAnimals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [photoUrl, setPhotoUrl] = useState('');
    const [preuveUrl, setPreuveUrl] = useState('');

    // Vérification de la photo par espèce
    const [photoCheck, setPhotoCheck] = useState(null);   // { statut, message }
    const [photoChecking, setPhotoChecking] = useState(false);

    const [form, setForm] = useState({
        nom: '', espece: 'chien', race: '', sexe: 'male', date_naissance: '', caractere: '',
        photo: '', preuve_propriete: '', type_preuve: '',
        a_probleme_sante: false, probleme_sante: '', traitement: '', consignes_sante: '',
        veterinaire: '', contact_urgence_sante: '', sante_certifiee: false,
    });

    useEffect(() => { fetchAnimals(); }, []);

    const fetchAnimals = async () => {
        try {
            const res = await api.get('/animals');
            setAnimals(res.data);
        } catch (err) { console.error(err); }
    };

    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));

    const resetForm = () => {
        setForm({
            nom: '', espece: 'chien', race: '', sexe: 'male', date_naissance: '', caractere: '', photo: '',
            preuve_propriete: '', type_preuve: '',
            a_probleme_sante: false, probleme_sante: '', traitement: '', consignes_sante: '',
            veterinaire: '', contact_urgence_sante: '', sante_certifiee: false,
        });
        setPhotoUrl('');
        setPreuveUrl('');
        setPhotoCheck(null);
        setPhotoChecking(false);
        setEditingId(null);
        setShowForm(false);
        setError('');
        setTouched({});
    };

    // Analyse la photo uploadée par rapport à l'espèce choisie
    const lancerVerifPhoto = async (url, espece) => {
        setPhotoChecking(true);
        setPhotoCheck(null);
        const res = await verifierPhotoAnimal(url, espece);
        setPhotoCheck(res);
        setPhotoChecking(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ nom: true, race: true, espece: true, sexe: true, date_naissance: true, type_preuve: true, probleme_sante: true, sante_certifiee: true, contact_urgence_sante: true });

        const errors = {};
        if (!validateNomAnimal(form.nom)) errors.nom = true;
        if (form.race.trim() && !validateNomAnimal(form.race)) errors.race = true;
        if (!form.espece) errors.espece = true;
        if (!form.sexe) errors.sexe = true;

        const dateCheck = validateDateNaissance(form.date_naissance, form.espece);
        if (!dateCheck.valid) errors.date_naissance = true;

       if (!preuveUrl) errors.preuve = true;
        else if (!form.type_preuve) errors.type_preuve = true;

        // Photo refusée si l'analyse a détecté une incohérence
        if (photoUrl && photoCheck?.statut === 'incoherent') errors.photo = true;

        if (form.a_probleme_sante) {
            if (!form.probleme_sante.trim()) errors.probleme_sante = true;
            if (!form.sante_certifiee) errors.sante_certifiee = true;
            if (form.contact_urgence_sante && !validateTelMaroc(form.contact_urgence_sante)) errors.contact_urgence_sante = true;
        }

        if (Object.keys(errors).length > 0) {
            if (errors.photo) {
                setError('❌ ' + (photoCheck?.message || 'La photo ne correspond pas à l\'espèce choisie'));
            } else if (errors.nom) {
                setError('❌ Nom invalide : au moins 2 lettres, sans chiffres ni caractères aléatoires');
            } else if (errors.race) {
                setError('❌ Race invalide : utilisez de vraies lettres (ex: Berger Allemand)');
            } else if (errors.date_naissance) {
                setError('❌ ' + (dateCheck?.message || 'La date de naissance est invalide'));
            } else if (errors.preuve) {
                setError('❌ Le justificatif de propriété (carnet de vaccination) est obligatoire');
            } else if (errors.type_preuve) {
                setError('❌ Veuillez indiquer de quel type de document il s\'agit');
            } else if (errors.probleme_sante) {
                setError('❌ Veuillez décrire le problème de santé de l\'animal');
            } else if (errors.contact_urgence_sante) {
                setError('❌ Le numéro de contact d\'urgence est invalide (10 chiffres)');
            } else if (errors.sante_certifiee) {
                setError('❌ Vous devez certifier l\'exactitude des informations de santé');
            } else {
                setError('❌ Veuillez corriger les erreurs ci-dessous');
            }
            return;
        }

        if (photoChecking) {
            setError('⏳ Analyse de la photo en cours, veuillez patienter');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const dataToSend = {
                nom: form.nom,
                espece: form.espece,
                race: form.race.trim(),
                sexe: form.sexe,
                date_naissance: form.date_naissance,
                caractere: form.caractere,
                photo: photoUrl || form.photo,
                preuve_propriete: preuveUrl || form.preuve_propriete,
                type_preuve: form.type_preuve,
                a_probleme_sante: form.a_probleme_sante,
                probleme_sante: form.a_probleme_sante ? form.probleme_sante : null,
                traitement: form.a_probleme_sante ? form.traitement : null,
                consignes_sante: form.a_probleme_sante ? form.consignes_sante : null,
                veterinaire: form.a_probleme_sante ? form.veterinaire : null,
                contact_urgence_sante: form.a_probleme_sante ? form.contact_urgence_sante : null,
                sante_certifiee_le: (form.a_probleme_sante && form.sante_certifiee) ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
            };

            if (editingId) {
                await api.put(`/animals/${editingId}`, dataToSend);
            } else {
                await api.post('/animals', dataToSend);
            }
            resetForm();
            fetchAnimals();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
            setError('❌ ' + msg);
        }
        setLoading(false);
    };

    const handleEdit = (animal) => {
        setForm({
            nom: animal.nom || '',
            espece: animal.espece || 'chien',
            race: animal.race || '',
            sexe: animal.sexe || 'male',
            date_naissance: animal.date_naissance ? String(animal.date_naissance).slice(0, 10) : '',
            caractere: animal.caractere || '',
            photo: animal.photo || '',
            preuve_propriete: animal.preuve_propriete || '',
            type_preuve: animal.type_preuve || '',
            a_probleme_sante: !!animal.a_probleme_sante,
            probleme_sante: animal.probleme_sante || '',
            traitement: animal.traitement || '',
            consignes_sante: animal.consignes_sante || '',
            veterinaire: animal.veterinaire || '',
            contact_urgence_sante: animal.contact_urgence_sante || '',
            sante_certifiee: !!animal.sante_certifiee_le,
        });
        setPhotoUrl(animal.photo || '');
        setPreuveUrl(animal.preuve_propriete || '');
        // Photo déjà validée à la création : on ne rebloque pas à l'édition
        setPhotoCheck(animal.photo ? { statut: 'valide', message: 'Photo existante' } : null);
        setEditingId(animal.id);
        setShowForm(true);
        setError('');
        setTouched({});
        window.scrollTo(0, 0);
    };

    const handleDelete = async (animal) => {
        if (window.confirm(`Supprimer ${animal.nom} ?`)) {
            try {
                await api.delete(`/animals/${animal.id}`);
                fetchAnimals();
            } catch (err) { console.error(err); }
        }
    };

    const getIcon = (espece) => {
        const found = ESPECES.find(e => e.value === espece);
        return found ? found.label.split(' ')[0] : '🐾';
    };

    const labelPreuve = (val) => TYPES_PREUVE.find(t => t.value === val)?.label || val;

    const dateCheck = form.date_naissance ? validateDateNaissance(form.date_naissance, form.espece) : null;
    const today = dateLocale(new Date());
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - (DUREE_VIE_MAX[form.espece] || 50));
    const minDateStr = dateLocale(minDate);

    const inputStyle = (err) => ({ width: '100%', border: fieldBorder(err), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' });

    // Enregistrement bloqué tant que la photo est en cours d'analyse ou incohérente
    const photoBloque = photoChecking || (photoUrl && photoCheck?.statut === 'incoherent');

    return (
        <div style={{padding: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <div>
                    <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>🐾 Mes animaux</h2>
                    <p style={{color: '#888', fontSize: '14px', margin: 0}}>Gérez vos compagnons</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    style={{background: C.primary, color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px'}}>
                    + Ajouter un animal
                </button>
            </div>

            {showForm && (
                <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '24px'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '700', color: C.brown, marginBottom: '20px'}}>
                        {editingId ? '✏️ Modifier l\'animal' : '+ Nouvel animal'}
                    </h3>

                    <ErrorBanner message={error} />

                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

                        {/* Espèce — placée avant la photo car nécessaire pour l'analyse */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Espèce *</label>
                            <select value={form.espece}
                                onChange={e => {
                                    const nouvelleEspece = e.target.value;
                                    setForm({...form, espece: nouvelleEspece, date_naissance: '', race: ''});
                                    // Re-analyser la photo si elle est déjà présente
                                    if (photoUrl) lancerVerifPhoto(photoUrl, nouvelleEspece);
                                }}
                                style={{...inputStyle(false), background: 'white'}}>
                                {ESPECES.map(e => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Photo */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>
                                📸 Photo de l'animal
                            </label>
                            {photoUrl && (
                                <div style={{marginBottom: '12px', position: 'relative', display: 'inline-block'}}>
                                    <img src={photoUrl} alt="Animal"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: `3px solid ${photoCheck?.statut === 'incoherent' ? '#f44336' : C.primary}`}}/>
                                    <button type="button" onClick={() => { setPhotoUrl(''); setForm({...form, photo: ''}); setPhotoCheck(null); }}
                                        style={{position: 'absolute', top: '-6px', right: '-6px', background: C.primary, color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'}}>
                                        ×
                                    </button>
                                </div>
                            )}
                            {!photoUrl && (
                                <PhotoUpload
                                    label="Photo"
                                    multiple={false}
                                    onUpload={(url) => {
                                        setPhotoUrl(url);
                                        setForm(prev => ({...prev, photo: url}));
                                        lancerVerifPhoto(url, form.espece);
                                    }}
                                />
                            )}

                            {/* Résultat de l'analyse photo */}
                            {photoChecking && (
                                <div style={{background: '#E3F2FD', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#1565c0', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                        🔍 Analyse de la photo en cours... (quelques secondes)
                                    </p>
                                </div>
                            )}
                            {!photoChecking && photoUrl && photoCheck?.statut === 'valide' && (
                                <FieldSuccess message={photoCheck.message}/>
                            )}
                            {!photoChecking && photoUrl && photoCheck?.statut === 'incertain' && (
                                <div style={{background: '#FFF8E1', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#f57f17', fontSize: '13px', margin: 0, fontWeight: '600'}}>⚠️ {photoCheck.message}</p>
                                </div>
                            )}
                            {!photoChecking && photoUrl && photoCheck?.statut === 'incoherent' && (
                                <div style={{background: '#FFF0EE', border: '1.5px solid #f44336', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#d32f2f', fontSize: '13px', margin: 0, fontWeight: '700'}}>❌ {photoCheck.message}</p>
                                </div>
                            )}
                        </div>

                      {/* Justificatif de propriété — OBLIGATOIRE */}
                        <div style={{background: C.beige, borderRadius: '14px', padding: '16px', border: touched.preuve && !preuveUrl ? '1.5px solid #f44336' : 'none'}}>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '700', color: C.brown, marginBottom: '4px'}}>
                                📄 Justificatif de propriété <span style={{color: '#E8756A', fontWeight: '600'}}>*</span>
                            </label>
                            <p style={{color: '#888', fontSize: '12px', margin: '0 0 12px', lineHeight: '1.5'}}>
                                Carnet de vaccination, certificat vétérinaire… Ce document est <strong>obligatoire</strong>
                                pour garantir la sécurité et rassurer les prestataires.
                            </p>

                            {preuveUrl && (
                                <div style={{marginBottom: '12px', position: 'relative', display: 'inline-block'}}>
                                    <img src={preuveUrl} alt="Justificatif"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        style={{width: '140px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: `2px solid ${C.primary}`}}/>
                                    <button type="button" onClick={() => { setPreuveUrl(''); setForm({...form, preuve_propriete: '', type_preuve: ''}); }}
                                        style={{position: 'absolute', top: '-6px', right: '-6px', background: C.primary, color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'}}>
                                        ×
                                    </button>
                                </div>
                            )}
                            {!preuveUrl && (
                                <PhotoUpload
                                    label="Justificatif"
                                    multiple={false}
                                    onUpload={(url) => {
                                        setPreuveUrl(url);
                                        setForm(prev => ({...prev, preuve_propriete: url}));
                                        touch('preuve');
                                    }}
                                />
                            )}
                            {touched.preuve && !preuveUrl && <FieldError message="Le justificatif de propriété est obligatoire"/>}

                            {preuveUrl && (
                                <div style={{marginTop: '12px'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                        Type de document *
                                    </label>
                                    <select value={form.type_preuve}
                                        onChange={e => { setForm({...form, type_preuve: e.target.value}); touch('type_preuve'); }}
                                        style={{...inputStyle(touched.type_preuve && !form.type_preuve), background: 'white'}}>
                                        <option value="">— Choisir —</option>
                                        {TYPES_PREUVE.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    {touched.type_preuve && !form.type_preuve && <FieldError message="Précisez le type de document"/>}
                                    {form.type_preuve && <FieldSuccess message="Document prêt à être envoyé pour vérification"/>}
                                </div>
                            )}
                        </div>

                        {/* Nom */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Nom *</label>
                            <input type="text" value={form.nom}
                                onChange={e => setForm({...form, nom: e.target.value})}
                                onBlur={() => touch('nom')}
                                style={inputStyle(touched.nom && !validateNomAnimal(form.nom))}
                                placeholder="Ex: Rex, Luna..."/>
                            {touched.nom && !validateNomAnimal(form.nom) && <FieldError message="Au moins 2 lettres, sans chiffres ni caractères aléatoires"/>}
                        </div>

                        {/* Race */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Race</label>
                            {(() => {
                                const racesDispo = RACES_PAR_ESPECE[form.espece] || [];
                                const estAutre = form.race && !racesDispo.includes(form.race);
                                return (
                                    <>
                                        <select
                                            value={estAutre ? '__autre__' : form.race}
                                            onChange={e => {
                                                if (e.target.value === '__autre__') {
                                                    setForm({...form, race: ' '});
                                                } else {
                                                    setForm({...form, race: e.target.value});
                                                }
                                            }}
                                            style={{...inputStyle(false), background: 'white', marginBottom: estAutre ? '8px' : 0}}>
                                            <option value="">— Non précisée —</option>
                                            {racesDispo.map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                            <option value="__autre__">✏️ Autre (préciser)</option>
                                        </select>
                                        {estAutre && (
                                            <>
                                                <input type="text" value={form.race.trim()}
                                                    onChange={e => setForm({...form, race: e.target.value})}
                                                    onBlur={() => touch('race')}
                                                    style={inputStyle(touched.race && form.race.trim() && !validateNomAnimal(form.race))}
                                                    placeholder="Précisez la race"/>
                                                {touched.race && form.race.trim() && !validateNomAnimal(form.race) && (
                                                    <FieldError message="Race invalide : utilisez de vraies lettres"/>
                                                )}
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Sexe */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Sexe *</label>
                            <div style={{display: 'flex', gap: '12px'}}>
                                {[{value: 'male', label: '♂️ Mâle'}, {value: 'femelle', label: '♀️ Femelle'}].map(s => (
                                    <button key={s.value} type="button"
                                        onClick={() => setForm({...form, sexe: s.value})}
                                        style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: form.sexe === s.value ? C.primary : C.beige, color: form.sexe === s.value ? 'white' : C.brown, fontWeight: '600', fontSize: '14px'}}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date de naissance */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>
                                Date de naissance *
                                <span style={{color: '#aaa', fontWeight: '400', fontSize: '12px', marginLeft: '8px'}}>
                                    (max {DUREE_VIE_MAX[form.espece]} ans pour un {form.espece})
                                </span>
                            </label>
                            <input type="date" value={form.date_naissance}
                                onChange={e => { setForm({...form, date_naissance: e.target.value}); touch('date_naissance'); }}
                                max={today}
                                min={minDateStr}
                                style={inputStyle(touched.date_naissance && dateCheck && !dateCheck.valid)}/>
                            {touched.date_naissance && dateCheck && !dateCheck.valid && (
                                <FieldError message={dateCheck.message}/>
                            )}
                            {form.date_naissance && dateCheck?.valid && (
                                <FieldSuccess message={`Âge valide : ${formatAge(form.date_naissance)}`}/>
                            )}
                        </div>

                        {/* Caractère */}
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Caractère</label>
                            <textarea value={form.caractere}
                                onChange={e => setForm({...form, caractere: e.target.value})}
                                style={{...inputStyle(false), border: '1.5px solid #e0d5d0', resize: 'none'}}
                                rows={3} placeholder="Ex: Joueur, affectueux, calme..."/>
                        </div>

                        {/* ÉTAT DE SANTÉ */}
                        <div style={{background: '#FFF8F5', border: '1.5px solid #f0d5cd', borderRadius: '14px', padding: '16px'}}>
                            <label style={{display: 'block', fontSize: '15px', fontWeight: '700', color: C.brown, marginBottom: '6px'}}>
                                🏥 État de santé
                            </label>
                            <p style={{color: '#888', fontSize: '12px', margin: '0 0 12px', lineHeight: '1.5'}}>
                                Cet animal est-il malade, blessé, allergique ou présente-t-il un problème de santé&nbsp;?
                                Ces informations seront transmises au prestataire avant chaque garde.
                            </p>

                            <div style={{display: 'flex', gap: '12px', marginBottom: form.a_probleme_sante ? '16px' : 0}}>
                                <button type="button"
                                    onClick={() => setForm({...form, a_probleme_sante: false, sante_certifiee: false})}
                                    style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: !form.a_probleme_sante ? C.primary : 'white', color: !form.a_probleme_sante ? 'white' : C.brown, fontWeight: '600', fontSize: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'}}>
                                    ✅ Non, en bonne santé
                                </button>
                                <button type="button"
                                    onClick={() => setForm({...form, a_probleme_sante: true})}
                                    style={{flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: form.a_probleme_sante ? '#e67e22' : 'white', color: form.a_probleme_sante ? 'white' : C.brown, fontWeight: '600', fontSize: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'}}>
                                    ⚠️ Oui, problème de santé
                                </button>
                            </div>

                            {form.a_probleme_sante && (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                            Description du problème *
                                        </label>
                                        <textarea value={form.probleme_sante}
                                            onChange={e => setForm({...form, probleme_sante: e.target.value})}
                                            onBlur={() => touch('probleme_sante')}
                                            style={{...inputStyle(touched.probleme_sante && !form.probleme_sante.trim()), resize: 'none'}}
                                            rows={2} placeholder="Ex: Épilepsie, allergie au poulet, patte cassée en convalescence..."/>
                                        {touched.probleme_sante && !form.probleme_sante.trim() && <FieldError message="Description obligatoire"/>}
                                    </div>

                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                            Traitement / médicaments
                                        </label>
                                        <textarea value={form.traitement}
                                            onChange={e => setForm({...form, traitement: e.target.value})}
                                            style={{...inputStyle(false), resize: 'none'}}
                                            rows={2} placeholder="Ex: 1 comprimé matin et soir, insuline 2x/jour..."/>
                                    </div>

                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                            Consignes particulières
                                        </label>
                                        <textarea value={form.consignes_sante}
                                            onChange={e => setForm({...form, consignes_sante: e.target.value})}
                                            style={{...inputStyle(false), resize: 'none'}}
                                            rows={2} placeholder="Ex: Éviter les efforts, ne pas donner de sucreries..."/>
                                    </div>

                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                            🏥 Vétérinaire habituel
                                        </label>
                                        <input type="text" value={form.veterinaire}
                                            onChange={e => setForm({...form, veterinaire: e.target.value})}
                                            style={inputStyle(false)}
                                            placeholder="Ex: Dr. Alami, Clinique VetPlus, Rabat"/>
                                    </div>

                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                            📞 Contact d'urgence
                                        </label>
                                        <input type="tel" value={form.contact_urgence_sante}
                                            maxLength={10}
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                setForm({...form, contact_urgence_sante: val});
                                            }}
                                            onBlur={() => touch('contact_urgence_sante')}
                                            style={inputStyle(touched.contact_urgence_sante && !validateTelMaroc(form.contact_urgence_sante))}
                                            placeholder="Ex: 0612345678"/>
                                        {touched.contact_urgence_sante && form.contact_urgence_sante && !validateTelMaroc(form.contact_urgence_sante) && (
                                            <FieldError message="Numéro invalide (10 chiffres, ex: 0612345678)"/>
                                        )}
                                        {form.contact_urgence_sante && validateTelMaroc(form.contact_urgence_sante) && (
                                            <FieldSuccess message="Numéro valide"/>
                                        )}
                                    </div>

                                    <label style={{display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', background: 'white', borderRadius: '10px', padding: '12px', border: touched.sante_certifiee && !form.sante_certifiee ? '1.5px solid #f44336' : '1.5px solid #eee'}}>
                                        <input type="checkbox" checked={form.sante_certifiee}
                                            onChange={e => { setForm({...form, sante_certifiee: e.target.checked}); touch('sante_certifiee'); }}
                                            style={{marginTop: '3px', width: '18px', height: '18px', accentColor: C.primary, flexShrink: 0}}/>
                                        <span style={{fontSize: '13px', color: C.brown, lineHeight: '1.5'}}>
                                            Je certifie que ces informations de santé sont <strong>exactes et complètes</strong>.
                                            Je comprends que toute omission peut engager ma responsabilité en cas d'incident.
                                        </span>
                                    </label>
                                    {touched.sante_certifiee && !form.sante_certifiee && <FieldError message="Vous devez certifier l'exactitude des informations"/>}
                                </div>
                            )}
                        </div>

                        <div style={{display: 'flex', gap: '12px'}}>
                            <button type="submit" disabled={loading || photoBloque}
                                title={photoBloque ? 'Photo en cours d\'analyse ou non conforme' : ''}
                                style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: (loading || photoBloque) ? 'not-allowed' : 'pointer', opacity: (loading || photoBloque) ? 0.6 : 1}}>
                                {loading ? 'Enregistrement...' : photoChecking ? '🔍 Analyse photo...' : editingId ? '✏️ Modifier' : '✅ Ajouter l\'animal'}
                            </button>
                            <button type="button" onClick={resetForm}
                                style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'}}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {animals.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>🐾</div>
                    <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Vous n'avez pas encore d'animal</p>
                    <p style={{fontSize: '14px'}}>Ajoutez votre premier compagnon pour pouvoir réserver des services</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px'}}>
                    {animals.map(animal => {
                        const statut = STATUTS_PREUVE[animal.statut_preuve];

                        return (
                            <div key={animal.id} style={{background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px'}}>
                                    <AnimalAvatar photo={animal.photo} icon={getIcon(animal.espece)} taille={60}/>
                                    <div>
                                        <h3 style={{fontWeight: '700', color: C.brown, fontSize: '16px', margin: '0 0 2px'}}>{animal.nom}</h3>
                                        <p style={{color: '#888', fontSize: '13px', margin: 0, textTransform: 'capitalize'}}>
                                            {animal.espece} {animal.race ? `• ${animal.race}` : ''} • {animal.sexe}
                                        </p>
                                    </div>
                                </div>

                                {animal.date_naissance && (
                                    <p style={{color: '#888', fontSize: '13px', marginBottom: '8px'}}>
                                        🎂 Né(e) le {new Date(animal.date_naissance).toLocaleDateString('fr-FR')}
                                        {' '}({formatAge(animal.date_naissance)})
                                    </p>
                                )}

                                {animal.a_probleme_sante ? (
                                    <div style={{background: '#FFF3E0', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px'}}>
                                        <p style={{color: '#e67e22', fontSize: '12px', fontWeight: '700', margin: 0}}>
                                            ⚠️ Problème de santé déclaré
                                        </p>
                                        {animal.probleme_sante && (
                                            <p style={{color: '#a5652b', fontSize: '11px', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                {animal.probleme_sante}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px'}}>
                                        <p style={{color: '#2e7d32', fontSize: '12px', fontWeight: '700', margin: 0}}>
                                            ✅ En bonne santé
                                        </p>
                                    </div>
                                )}

                                {statut && (
                                    <div style={{background: statut.bg, borderRadius: '10px', padding: '8px 12px', marginBottom: '10px'}}>
                                        <p style={{color: statut.color, fontSize: '12px', fontWeight: '700', margin: 0}}>
                                            {statut.label}
                                        </p>
                                        {animal.type_preuve && (
                                            <p style={{color: statut.color, fontSize: '11px', margin: '2px 0 0', opacity: 0.85}}>
                                                {labelPreuve(animal.type_preuve)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {animal.caractere && (
                                    <p style={{color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '14px', background: C.beige, padding: '8px 12px', borderRadius: '8px'}}>
                                        💬 {animal.caractere}
                                    </p>
                                )}

                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button onClick={() => handleEdit(animal)}
                                        style={{flex: 1, background: C.beige, color: C.brown, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        ✏️ Modifier
                                    </button>
                                    <button onClick={() => handleDelete(animal)}
                                        style={{flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}