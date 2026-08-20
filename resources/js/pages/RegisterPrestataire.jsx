import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CityInput from '../components/CityInput';
import AddressInput from '../components/AddressInput';
import PhotoUpload from '../components/PhotoUpload';
import countries from '../data/countries';
import { validatePhone, validateEmail, validatePassword, passwordHint, validateTarif, PRIX_MIN_PAR_TYPE } from '../utils/validation';
import { validateSelfie, validateCinRecto, validateCinVerso, validatePhotoLogement } from '../utils/faceDetection';
import { verifierNomSurCin } from '../utils/cinOcr';
import { ErrorBanner, FieldError, FieldSuccess, fieldBorder } from '../components/FormError';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function RegisterPrestataire({ onSwitch, onHome }) {
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState({});

    // Résultat de la lecture automatique du nom sur la CIN
    const [ocrCin, setOcrCin] = useState(null);      // { statut, message }
    const [ocrEnCours, setOcrEnCours] = useState(false);

    const [form, setForm] = useState({
        nom: '', prenom: '', email: '', password: '', password_confirmation: '',
        pays: 'MA', telephone: '', adresse: '', ville: '',
        description: '', tarif: '', type_service: '',
        cin_recto: '', cin_verso: '', selfie: '', photos_logement: [],
        role: 'prestataire'
    });

    const selectedCountry = countries.find(c => c.code === form.pays) || countries[0];
    const nomValide = (v) => /^[A-Za-zÀ-ÿ\s'-]+$/.test((v || '').trim());
    const touch = (field) => setTouched(prev => ({...prev, [field]: true}));
    const touchAll = (fields) => setTouched(prev => ({...prev, ...fields.reduce((acc, f) => ({...acc, [f]: true}), {})}));

    const refs = {
        nom: useRef(null),
        prenom: useRef(null),
        email: useRef(null),
        password: useRef(null),
        password_confirmation: useRef(null),
        adresse: useRef(null),
        ville: useRef(null),
        telephone: useRef(null),
        type_service: useRef(null),
        description: useRef(null),
        tarif: useRef(null),
        cin_recto: useRef(null),
        cin_verso: useRef(null),
        selfie: useRef(null),
    };

    const scrollToFirstError = (errors) => {
        for (const field of Object.keys(refs)) {
            if (errors[field] && refs[field].current) {
                refs[field].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (refs[field].current.focus) refs[field].current.focus();
                break;
            }
        }
    };

    // Lance la lecture du nom sur la CIN recto
    const lancerVerificationNom = async (url) => {
        setOcrEnCours(true);
        setOcrCin(null);
        const res = await verifierNomSurCin(url, form.nom, form.prenom);
        setOcrCin(res);
        setOcrEnCours(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const champsOK = form.nom && form.prenom && form.email && form.telephone &&
                form.ville && form.description && form.tarif &&
                form.cin_recto && form.cin_verso && form.selfie;

            // Motifs de revue manuelle
            const motifs = [];
            if (!champsOK) motifs.push('Champs obligatoires manquants');
            if (ocrCin?.statut === 'incoherent') {
                motifs.push('Le nom saisi ne correspond pas au nom lu sur la CIN');
            }
            if (ocrCin?.statut === 'illisible' || !ocrCin) {
                motifs.push('Nom sur la CIN non lisible automatiquement — à vérifier visuellement');
            }

            const besoinRevue = motifs.length > 0;

            const dataToSend = {
                ...form,
                statut_validation: besoinRevue ? 'en_attente' : 'valide',
                needs_review: besoinRevue,
                review_reason: besoinRevue ? motifs.join(' • ') : null,
            };

            await register(dataToSend);
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors de l\'inscription. Vérifiez vos données.';
            setError('❌ ' + msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setLoading(false);
    };

    if (success) {
        const enRevue = ocrCin?.statut !== 'valide';

        return (
            <div style={{minHeight: '100vh', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(232,117,106,0.15)', padding: '40px', width: '100%', maxWidth: '520px', textAlign: 'center'}}>
                    <div style={{fontSize: '80px', marginBottom: '16px'}}>🎉</div>
                    <h2 style={{color: C.brown, fontWeight: '800', fontSize: '24px', marginBottom: '12px'}}>Compte créé avec succès !</h2>
                    <p style={{color: '#888', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px'}}>
                        {enRevue
                            ? "Votre compte prestataire a été créé. Vos documents seront vérifiés manuellement par notre équipe sous 24h."
                            : "Votre identité a été confirmée automatiquement. Votre compte est actif."}
                    </p>
                    <div style={{background: C.beige, borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left'}}>
                        {[
                            {icon: '👤', label: 'Nom', value: `${form.prenom} ${form.nom}`},
                            {icon: '🔧', label: 'Service', value: form.type_service},
                            {icon: '🌍', label: 'Pays', value: selectedCountry.name},
                            {icon: '📍', label: 'Ville', value: form.ville},
                            {icon: '📱', label: 'Téléphone', value: form.telephone},
                            {icon: '💰', label: 'Tarif', value: `${form.tarif} DH`},
                        ].map((item, i) => (
                            <div key={i} style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', marginBottom: '8px', borderBottom: i < 5 ? '1px solid #f0f0f0' : 'none'}}>
                                <span style={{color: '#888', fontSize: '13px'}}>{item.icon} {item.label}</span>
                                <span style={{color: C.brown, fontWeight: '600', fontSize: '13px'}}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={onHome} style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                        🏠 Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{minHeight: '100vh', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
            <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(232,117,106,0.15)', padding: '40px', width: '100%', maxWidth: '520px'}}>

                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '70px', marginBottom: '8px'}}/>
                    <h2 style={{color: C.brown, fontWeight: '800', fontSize: '18px', margin: '0 0 4px'}}>Proposer un service</h2>
                    <p style={{color: '#888', fontSize: '13px', margin: 0}}>Rejoignez notre communauté de prestataires</p>
                </div>

                {/* Progress */}
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '32px'}}>
                    {[{num:1,label:'Connexion'},{num:2,label:'Informations'},{num:3,label:'Service'},{num:4,label:'Vérification'},{num:5,label:'Publication'}].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                                <div style={{width: '28px', height: '28px', borderRadius: '50%', background: step >= s.num ? C.primary : '#e0e0e0', color: step >= s.num ? 'white' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px'}}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span style={{fontSize: '10px', color: step >= s.num ? C.primary : '#aaa', whiteSpace: 'nowrap'}}>{s.label}</span>
                            </div>
                            {i < 4 && <div style={{flex: 1, height: '2px', background: step > s.num ? C.primary : '#e0e0e0', marginBottom: '16px'}}/>}
                        </React.Fragment>
                    ))}
                </div>

                <ErrorBanner message={error} />

                {/* STEP 1 — Connexion */}
                {step === 1 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>1. Créez votre compte</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                            <div>
                                <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Nom *</label>
                                <input ref={refs.nom} type="text" value={form.nom}
                                    onChange={e => setForm({...form, nom: e.target.value})}
                                    onBlur={() => touch('nom')}
                                    style={{width: '100%', border: fieldBorder(touched.nom && !form.nom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                    placeholder="Votre nom"/>
{touched.nom && !form.nom && <FieldError message="Nom obligatoire"/>}
                                {touched.nom && form.nom && !nomValide(form.nom) && <FieldError message="Le nom ne doit pas contenir de chiffres"/>}                            </div>
                            <div>
                                <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Prénom *</label>
                                <input ref={refs.prenom} type="text" value={form.prenom}
                                    onChange={e => setForm({...form, prenom: e.target.value})}
                                    onBlur={() => touch('prenom')}
                                    style={{width: '100%', border: fieldBorder(touched.prenom && !form.prenom), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                    placeholder="Votre prénom"/>
{touched.prenom && !form.prenom && <FieldError message="Prénom obligatoire"/>}
                                {touched.prenom && form.prenom && !nomValide(form.prenom) && <FieldError message="Le prénom ne doit pas contenir de chiffres"/>}                            </div>
                        </div>

                        <div style={{background: C.beige, borderRadius: '10px', padding: '10px 14px'}}>
                            <p style={{color: '#888', fontSize: '12px', margin: 0, lineHeight: '1.5'}}>
                                ℹ️ Saisissez votre nom et prénom <strong>exactement comme sur votre carte d'identité</strong>.
                                Ils seront comparés automatiquement avec votre CIN à l'étape 4.
                            </p>
                        </div>

                        <div>
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

                        <div>
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

                        <div>
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

                        <button onClick={() => {
                            touchAll(['nom', 'prenom', 'email', 'password', 'password_confirmation']);
                           const errors = {};
                            if (!form.nom || !nomValide(form.nom)) errors.nom = true;
                            if (!form.prenom || !nomValide(form.prenom)) errors.prenom = true;
                            if (!form.email || !validateEmail(form.email)) errors.email = true;
                            if (!form.password || !validatePassword(form.password)) errors.password = true;
                            if (form.password !== form.password_confirmation) errors.password_confirmation = true;
                            if (Object.keys(errors).length > 0) {
                                setError('Veuillez corriger les erreurs ci-dessous');
                                scrollToFirstError(errors);
                                return;
                            }
                            setError(''); setStep(2);
                        }} style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                            Suivant →
                        </button>
                        {onHome && (
                            <button onClick={onHome} style={{width: '100%', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px'}}>
                                ← Retour à l'accueil
                            </button>
                        )}
                    </div>
                )}

                {/* STEP 2 — Informations */}
                {step === 2 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>2. Vos informations</h3>

                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>🌍 Pays *</label>
                            <select value={form.pays} onChange={e => setForm({...form, pays: e.target.value, telephone: ''})}
                                style={{width: '100%', border: fieldBorder(false), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white'}}>
                                {countries.map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
                                ))}
                            </select>
                        </div>

                        <div ref={refs.adresse}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>📍 Adresse *</label>
                            <AddressInput value={form.adresse} onChange={val => { setForm({...form, adresse: val}); touch('adresse'); }} placeholder="Ex: 15 Rue de la Paix, Fès"/>
                            {touched.adresse && !form.adresse && <FieldError message="Adresse obligatoire"/>}
                            {form.adresse && <FieldSuccess message="Adresse sélectionnée"/>}
                        </div>

                        <div ref={refs.ville}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>🗺️ Ville *</label>
                            <CityInput value={form.ville} onChange={val => { setForm({...form, ville: val}); touch('ville'); }} placeholder="Ex: Fès, Maroc"/>
                            {touched.ville && !form.ville && <FieldError message="Ville obligatoire"/>}
                            {form.ville && <FieldSuccess message={`Ville : ${form.ville}`}/>}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                📱 Téléphone * <span style={{color: '#aaa', fontWeight: '400'}}>({selectedCountry.dial})</span>
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

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => setStep(1)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                            <button onClick={() => {
                                touchAll(['adresse', 'ville', 'telephone']);
                                const errors = {};
                                if (!form.adresse) errors.adresse = true;
                                if (!form.ville) errors.ville = true;
                                if (!form.telephone || !validatePhone(form.telephone, form.pays)) errors.telephone = true;
                                if (Object.keys(errors).length > 0) {
                                    setError('Veuillez corriger les erreurs ci-dessous');
                                    scrollToFirstError(errors);
                                    return;
                                }
                                setError(''); setStep(3);
                            }} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3 — Service */}
                {step === 3 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>3. Votre service</h3>

                        <div ref={refs.type_service}>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Type de service *</label>
                            <select value={form.type_service} onChange={e => setForm({...form, type_service: e.target.value, tarif: ''})}
                                style={{width: '100%', border: fieldBorder(touched.type_service && !form.type_service), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}>
                                <option value="">Choisir un service</option>
                                <option value="promenade">🚶 Promenade</option>
                                <option value="garde">🏠 Garde à domicile</option>
                                <option value="pension">🏨 Pension</option>
                                <option value="visite">🏥 Visite à domicile</option>
                                <option value="toilettage">✂️ Soins & Toilettage</option>
                                <option value="taxi">🚗 Taxi animalier</option>
                                <option value="soins">💊 Soins</option>
                                <option value="dressage">📋 Dressage</option>
                            </select>
                            {touched.type_service && !form.type_service && <FieldError message="Type de service obligatoire"/>}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Description *</label>
                            <textarea ref={refs.description} value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                onBlur={() => touch('description')}
                                style={{width: '100%', border: fieldBorder(touched.description && !form.description), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box'}}
                                rows={4} placeholder="Décrivez votre service et votre expérience..."/>
                            {touched.description && !form.description && <FieldError message="Description obligatoire"/>}
                        </div>

                        <div>
                            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>Prix (DH) *</label>
                            <input ref={refs.tarif} type="number" value={form.tarif}
                                onChange={e => setForm({...form, tarif: e.target.value})}
                                onBlur={() => touch('tarif')}
                                style={{width: '100%', border: fieldBorder(touched.tarif && !validateTarif(form.tarif, form.type_service).valid), borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
                                placeholder={form.type_service ? `Min: ${PRIX_MIN_PAR_TYPE[form.type_service]?.min || 1} DH` : 'Ex: 50'}
                                min={PRIX_MIN_PAR_TYPE[form.type_service]?.min || 1}/>
                            {touched.tarif && !validateTarif(form.tarif, form.type_service).valid && (
                                <FieldError message={validateTarif(form.tarif, form.type_service).message}/>
                            )}
                            {form.type_service && PRIX_MIN_PAR_TYPE[form.type_service] && (
                                <p style={{color: '#aaa', fontSize: '11px', marginTop: '4px'}}>💡 Prix minimum : {PRIX_MIN_PAR_TYPE[form.type_service].label}</p>
                            )}
                            {form.tarif && validateTarif(form.tarif, form.type_service).valid && <FieldSuccess message="Prix valide"/>}
                        </div>

                        {(form.type_service === 'pension' || form.type_service === 'garde') && (
                            <div>
                                <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: C.brown, marginBottom: '6px'}}>
                                    🏠 Photos du logement *
                                </label>
                                <div style={{border: `2px dashed ${touched.photos_logement && form.photos_logement.length === 0 ? '#f44336' : '#e0d5d0'}`, borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: C.beige}}
                                    onClick={() => document.getElementById('logement-input').click()}>
                                    <div style={{fontSize: '32px', marginBottom: '6px'}}>🏠</div>
                                    <p style={{color: '#888', fontSize: '13px', margin: 0}}>Ajouter des photos de votre espace (chambre, salon, jardin...)</p>
                                    <input id="logement-input" type="file" multiple accept="image/*" style={{display: 'none'}}
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            const validFiles = [];
                                            const errors = [];

                                            for (const file of files) {
                                                const result = await validatePhotoLogement(file);
                                                if (result.valid) {
                                                    validFiles.push(file);
                                                } else {
                                                    errors.push(result.message);
                                                }
                                            }

                                            if (errors.length > 0) {
                                                setError(errors[0]);
                                                return;
                                            }

                                            setForm({...form, photos_logement: validFiles});
                                            touch('photos_logement');
                                        }}/>
                                </div>
                                {touched.photos_logement && form.photos_logement.length === 0 && <FieldError message="Au moins une photo du logement est obligatoire"/>}
                                {form.photos_logement.length > 0 && <FieldSuccess message={`${form.photos_logement.length} photo(s) de logement validée(s)`}/>}
                            </div>
                        )}

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => setStep(2)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                            <button onClick={() => {
                                touchAll(['type_service', 'description', 'tarif', 'photos_logement']);
                                const errors = {};
                                if (!form.type_service) errors.type_service = true;
                                if (!form.description) errors.description = true;
                                if (!validateTarif(form.tarif, form.type_service).valid) errors.tarif = true;
                                if ((form.type_service === 'pension' || form.type_service === 'garde') && form.photos_logement.length === 0) errors.photos_logement = true;
                                if (Object.keys(errors).length > 0) {
                                    setError('Veuillez corriger les erreurs ci-dessous');
                                    scrollToFirstError(errors);
                                    return;
                                }
                                setError(''); setStep(4);
                            }} style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4 — Vérification */}
                {step === 4 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '4px'}}>4. Vérification d'identité</h3>
                        <p style={{color: '#888', fontSize: '13px', margin: 0}}>Pour garantir la confiance et la sécurité.</p>
                        <div style={{background: C.beige, borderRadius: '12px', padding: '12px 16px'}}>
                            <p style={{color: '#888', fontSize: '12px', margin: 0}}>🔒 Vos informations sont sécurisées.</p>
                        </div>

                        <div ref={refs.cin_recto}>
                            <PhotoUpload
                                label="🪪 CIN — Recto *"
                                validateFile={validateCinRecto}
                                validatingLabel="Vérification en cours..."
                                onUpload={(url) => {
                                    setForm({...form, cin_recto: url});
                                    touch('cin_recto');
                                    lancerVerificationNom(url);
                                }}/>
                            {touched.cin_recto && !form.cin_recto && <FieldError message="CIN Recto obligatoire"/>}
                            {form.cin_recto && !ocrEnCours && !ocrCin && <FieldSuccess message="CIN Recto vérifié"/>}

                            {/* Résultat de la lecture du nom */}
                            {ocrEnCours && (
                                <div style={{background: '#E3F2FD', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#1565c0', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                        🔍 Lecture du nom sur la carte en cours... (quelques secondes)
                                    </p>
                                </div>
                            )}

                            {!ocrEnCours && ocrCin?.statut === 'valide' && (
                                <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#2e7d32', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                        ✅ {ocrCin.message}
                                    </p>
                                </div>
                            )}

                            {!ocrEnCours && ocrCin?.statut === 'incoherent' && (
                                <div style={{background: '#FFF0EE', border: '1.5px solid #E8756A', borderRadius: '10px', padding: '12px 14px', marginTop: '8px'}}>
                                    <p style={{color: C.primary, fontSize: '13px', margin: '0 0 8px', fontWeight: '700'}}>
                                        ⚠️ {ocrCin.message}
                                    </p>
                                    <p style={{color: '#888', fontSize: '12px', margin: '0 0 8px'}}>
                                        Nom saisi : <strong>{form.prenom} {form.nom}</strong>
                                    </p>
                                    <button type="button" onClick={() => setStep(1)}
                                        style={{background: 'white', border: `1px solid ${C.primary}`, color: C.primary, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}>
                                        ← Corriger mon nom
                                    </button>
                                </div>
                            )}

                            {!ocrEnCours && ocrCin?.statut === 'illisible' && (
                                <div style={{background: '#FFF8E1', borderRadius: '10px', padding: '10px 14px', marginTop: '8px'}}>
                                    <p style={{color: '#f57f17', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                        ⏳ {ocrCin.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div ref={refs.cin_verso}>
                            <PhotoUpload
                                label="🪪 CIN — Verso *"
                                validateFile={validateCinVerso}
                                validatingLabel="Vérification en cours..."
                                onUpload={(url) => { setForm({...form, cin_verso: url}); touch('cin_verso'); }}/>
                            {touched.cin_verso && !form.cin_verso && <FieldError message="CIN Verso obligatoire"/>}
                            {form.cin_verso && <FieldSuccess message="CIN Verso uploadé"/>}
                        </div>

                        <div ref={refs.selfie}>
                            <PhotoUpload
                                label="🤳 Selfie *"
                                validateFile={validateSelfie}
                                validatingLabel="Vérification en cours..."
                                onUpload={(url) => { setForm({...form, selfie: url}); touch('selfie'); }}/>
                            {touched.selfie && !form.selfie && <FieldError message="Selfie obligatoire"/>}
                            {form.selfie && <FieldSuccess message="Selfie validé"/>}
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => setStep(3)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>← Retour</button>
                            <button onClick={() => {
                                touchAll(['cin_recto', 'cin_verso', 'selfie']);
                                const errors = {};
                                if (!form.cin_recto) errors.cin_recto = true;
                                if (!form.cin_verso) errors.cin_verso = true;
                                if (!form.selfie) errors.selfie = true;
                                if (Object.keys(errors).length > 0) {
                                    setError('Veuillez télécharger tous les documents requis');
                                    scrollToFirstError(errors);
                                    return;
                                }
                                if (ocrEnCours) {
                                    setError('Veuillez patienter, la lecture de votre carte est en cours');
                                    return;
                                }
                                setError(''); setStep(5);
                            }} disabled={ocrEnCours}
                                style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: ocrEnCours ? 'wait' : 'pointer', opacity: ocrEnCours ? 0.6 : 1}}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5 — Publication */}
                {step === 5 && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div style={{textAlign: 'center', marginBottom: '8px'}}>
                            <div style={{fontSize: '60px', marginBottom: '12px'}}>🎉</div>
                            <h3 style={{color: C.brown, fontWeight: '800', fontSize: '20px', marginBottom: '8px'}}>Votre service est prêt !</h3>
                            <p style={{color: '#888', fontSize: '14px', lineHeight: '1.6'}}>Vérifiez vos informations avant de publier.</p>
                        </div>

                        {/* Rappel du résultat de la vérification d'identité */}
                        {ocrCin?.statut === 'valide' ? (
                            <div style={{background: '#E8F5E9', borderRadius: '12px', padding: '12px 16px'}}>
                                <p style={{color: '#2e7d32', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                    ✅ Identité confirmée — votre compte sera actif immédiatement.
                                </p>
                            </div>
                        ) : (
                            <div style={{background: '#FFF8E1', borderRadius: '12px', padding: '12px 16px'}}>
                                <p style={{color: '#f57f17', fontSize: '13px', margin: 0, fontWeight: '600'}}>
                                    ⏳ Vos documents seront vérifiés manuellement par notre équipe sous 24h.
                                </p>
                            </div>
                        )}

                        <div style={{background: C.beige, borderRadius: '14px', padding: '16px'}}>
                            {[
                                {icon: '👤', label: 'Nom', value: `${form.prenom} ${form.nom}`},
                                {icon: '🔧', label: 'Service', value: form.type_service},
                                {icon: '🌍', label: 'Pays', value: selectedCountry.name},
                                {icon: '📍', label: 'Ville', value: form.ville},
                                {icon: '📱', label: 'Téléphone', value: form.telephone},
                                {icon: '💰', label: 'Tarif', value: `${form.tarif} DH`},
                            ].map((item, i) => (
                                <div key={i} style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', marginBottom: '8px', borderBottom: i < 5 ? '1px solid #f0f0f0' : 'none'}}>
                                    <span style={{color: '#888', fontSize: '13px'}}>{item.icon} {item.label}</span>
                                    <span style={{color: C.brown, fontWeight: '600', fontSize: '13px'}}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {['Annonces vérifiées et sécurisées', 'Communauté bienveillante', 'Visibilité locale', 'Support dédié 7j/7'].map((item, i) => (
                                <div key={i} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <span style={{color: '#4caf50', fontSize: '16px'}}>✅</span>
                                    <span style={{color: '#666', fontSize: '13px'}}>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => setStep(4)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>
                                ← Retour
                            </button>
                            <button onClick={handleSubmit} disabled={loading}
                                style={{flex: 2, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                                {loading ? '⏳ Création...' : '🚀 Publier mon service'}
                            </button>
                        </div>
                    </div>
                )}

                <p style={{textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px'}}>
                    Vous êtes un client ?{' '}
                    <button onClick={onSwitch} style={{color: C.primary, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer'}}>
                        Créer un compte client
                    </button>
                </p>
            </div>
        </div>
    );
}