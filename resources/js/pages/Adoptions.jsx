import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CityInput from '../components/CityInput';
import PhotoUpload from '../components/PhotoUpload';
import { useNotification } from '../context/NotificationContext';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Adoptions({ 
    
    pendingBooking, clearPendingBooking }) {
    const { user } = useAuth();
    const { notify, confirmAction } = useNotification();
    const [annonces, setAnnonces] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedAnnonce, setSelectedAnnonce] = useState(null);
    const [filter, setFilter] = useState('Tous');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        animal_id: '', description: '', ville: '', statut: 'active', photos: []
    });

    useEffect(() => {
        fetchAnnonces();
        fetchAnimals();
    }, []);

    // Reprise après connexion : ouvre directement l'annonce que le visiteur voulait voir
    useEffect(() => {
        if (pendingBooking?.type === 'adoption' && pendingBooking.annonceId && annonces.length > 0) {
            const annonce = annonces.find(a => a.id === pendingBooking.annonceId);
            if (annonce) setSelectedAnnonce(annonce);
            if (clearPendingBooking) clearPendingBooking();
        }
    }, [annonces]);

    const fetchAnnonces = async () => {
        try {
            const res = await api.get('/annonces');
            setAnnonces(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAnimals = async () => {
        try {
            const res = await api.get('/animals');
            setAnimals(res.data);
        } catch (err) { console.error(err); }
    };

const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!form.animal_id) {
            notify.error('Veuillez choisir un animal');
            return;
        }
        if (!form.description || form.description.trim().length < 10) {
            notify.error('La description est obligatoire (au moins 10 caractères)');
            return;
        }
        if (!form.ville || form.ville.trim().length < 3) {
            notify.error('Veuillez indiquer une ville valide');
            return;
        }
        if (!form.photos || form.photos.length === 0) {
            notify.error('Veuillez ajouter au moins une photo de l\'animal');
            return;
        }

        setLoading(true);
        try {
            await api.post('/annonces', form);
            notify.success('Annonce publiée avec succès !');
            setShowForm(false);
            setForm({ animal_id: '', description: '', ville: '', statut: 'active', photos: [] });
            fetchAnnonces();
        } catch (err) {
            console.error(err);
            notify.error('Erreur lors de la publication de l\'annonce');
        }
        setLoading(false);
    };

   const handleContacter = async (annonce) => {
        const proprio = annonce.proprietaire || annonce.user;
        if (!proprio?.id) {
            alert('Impossible de contacter le propriétaire');
            return;
        }

        // Confirmation avant d'envoyer le message
                const confirmer = await confirmAction(
            `Envoyer un message au propriétaire de ${annonce.animal?.nom || 'cet animal'} pour manifester votre intérêt ?`,
            { title: '❤️ Adoption', confirmLabel: 'Envoyer', cancelLabel: 'Annuler' }
        );
        if (!confirmer) return;
              try {
            await api.post('/messages', {
                destinataire_id: proprio.id,
                contenu: `Bonjour ! Je suis intéressé(e) par l'adoption de ${annonce.animal?.nom}. Pouvez-vous me donner plus d'informations ? 🐾`
            });
            window.location.href = '/messages';
        } catch (err) {
            alert('❌ Erreur lors de l\'envoi du message');
        }
    };
    const filters = ['Tous', 'Chats', 'Chiens', 'Autres'];
           const filteredAnnonces = annonces.filter(a => {
        if (a.statut !== 'active') return false;
        if (filter === 'Tous') return true;
        if (filter === 'Chats') return a.animal?.espece === 'chat';
        if (filter === 'Chiens') return a.animal?.espece === 'chien';
        return a.animal?.espece !== 'chat' && a.animal?.espece !== 'chien';
    });

    // Tri : les annonces de la ville de l'utilisateur d'abord, puis les autres
    const villeUser = (user?.ville || '').toLowerCase().trim();
    filteredAnnonces.sort((a, b) => {
        const aProche = (a.ville || '').toLowerCase().trim() === villeUser ? 0 : 1;
        const bProche = (b.ville || '').toLowerCase().trim() === villeUser ? 0 : 1;
        return aProche - bProche;
    });
    const getIcon = (espece) => {
        if (espece === 'chat') return '🐱';
        if (espece === 'chien') return '🐶';
        if (espece === 'oiseau') return '🐦';
        if (espece === 'lapin') return '🐰';
        return '🐾';
    };

    const getColor = (espece) => {
        if (espece === 'chat') return '#FFF0EE';
        if (espece === 'chien') return '#E8F5E9';
        if (espece === 'oiseau') return '#E3F2FD';
        return '#FDF5F0';
    };

    // Vue détaillée
    if (selectedAnnonce) {
        const animal = selectedAnnonce.animal;
        const proprio = selectedAnnonce.proprietaire || selectedAnnonce.user;
        const photos = selectedAnnonce.photos || [];

        return (
            <div style={{padding: '24px'}}>
                <button onClick={() => setSelectedAnnonce(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: C.brown, fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'}}>
                    ← Retour
                </button>
                <div style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}>
                    <div style={{height: '280px', background: getColor(animal?.espece), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
                        {animal?.photo ? (
                            <img src={animal.photo} alt={animal?.nom} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                        ) : (
                            <div style={{fontSize: '120px'}}>{getIcon(animal?.espece)}</div>
                        )}
                        <div style={{position: 'absolute', top: '16px', right: '16px'}}>
                            <span style={{background: '#E8F5E9', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                ✅ {selectedAnnonce.statut}
                            </span>
                        </div>
                    </div>

                    {photos.length > 0 && (
                        <div style={{display: 'flex', gap: '8px', padding: '12px 24px', overflowX: 'auto'}}>
                            {photos.map((photo, i) => (
                                <img key={i} src={photo} alt="" style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: `2px solid ${C.primary}`, flexShrink: 0}}/>
                            ))}
                        </div>
                    )}

                    <div style={{padding: '24px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                            <div>
                                <h2 style={{fontSize: '28px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>{animal?.nom}</h2>
                                <p style={{color: '#888', fontSize: '15px', margin: 0}}>{animal?.espece} • {animal?.race}</p>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px'}}>
                            {animal?.sexe && (
                                <span style={{background: '#FFF0EE', color: C.primary, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600'}}>
                                    {animal.sexe === 'male' ? '♂️ Mâle' : '♀️ Femelle'}
                                </span>
                            )}
                            {animal?.caractere && (
                                <span style={{background: '#E3F2FD', color: '#1565c0', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600'}}>
                                    😊 {animal.caractere}
                                </span>
                            )}
                            {animal?.date_naissance && (
                                <span style={{background: '#E8F5E9', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600'}}>
                                    🎂 {new Date().getFullYear() - new Date(animal.date_naissance).getFullYear()} ans
                                </span>
                            )}
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}>
                            {[
                                {icon: '🐾', label: 'Espèce', value: animal?.espece || 'N/A'},
                                {icon: '🧬', label: 'Race', value: animal?.race || 'Non renseignée'},
                                {icon: '⚥', label: 'Sexe', value: animal?.sexe || 'N/A'},
                                {icon: '📍', label: 'Ville', value: selectedAnnonce.ville || 'N/A'},
                            ].map((item, i) => (
                                <div key={i} style={{background: C.beige, borderRadius: '12px', padding: '12px 16px'}}>
                                    <p style={{color: '#aaa', fontSize: '12px', margin: '0 0 4px'}}>{item.icon} {item.label}</p>
                                    <p style={{color: C.brown, fontWeight: '600', fontSize: '14px', margin: 0, textTransform: 'capitalize'}}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {selectedAnnonce.description && (
                            <div style={{marginBottom: '20px'}}>
                                <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>📝 Description</h3>
                                <p style={{color: '#666', lineHeight: '1.7', fontSize: '14px', background: C.beige, padding: '16px', borderRadius: '12px'}}>
                                    {selectedAnnonce.description}
                                </p>
                            </div>
                        )}

                        <div style={{background: C.beige, borderRadius: '16px', padding: '16px', marginBottom: '20px'}}>
                            <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '12px', fontSize: '15px'}}>👤 Propriétaire</h3>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={{width: '50px', height: '50px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0}}>
                                    {proprio?.prenom?.[0] || '?'}
                                </div>
                                <div>
                                    <p style={{fontWeight: '700', color: C.brown, margin: '0 0 4px'}}>{proprio?.prenom} {proprio?.nom}</p>
                                    <p style={{color: '#888', fontSize: '13px', margin: '0 0 2px'}}>📧 {proprio?.email}</p>
                                    {proprio?.telephone && <p style={{color: '#888', fontSize: '13px', margin: 0}}>📱 {proprio.telephone}</p>}
                                    {proprio?.ville && <p style={{color: '#888', fontSize: '13px', margin: 0}}>📍 {proprio.ville}</p>}
                                </div>
                            </div>
                        </div>

                        <button onClick={() => handleContacter(selectedAnnonce)}
                            style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer'}}>
                            ❤️ Je suis intéressé — Contacter le propriétaire
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{padding: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <div>
                    <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>Adoption</h2>
                    <p style={{color: '#888', fontSize: '14px', margin: 0}}>À la recherche d'un compagnon pour la vie ? 🐾</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{background: C.primary, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'}}>
                    + Publier une annonce
                </button>
            </div>

            <div style={{background: 'white', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px'}}>
                <span>🔍</span>
                <input placeholder="Rechercher un animal..." style={{border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#888', background: 'transparent'}}/>
            </div>

            <div style={{display: 'flex', gap: '10px', marginBottom: '24px'}}>
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        background: filter === f ? C.primary : 'white',
                        color: filter === f ? 'white' : C.brown,
                        fontWeight: '600', fontSize: '13px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        {f === 'Tous' ? '🐾' : f === 'Chats' ? '🐱' : f === 'Chiens' ? '🐶' : '🦜'} {f}
                    </button>
                ))}
            </div>

            {showForm && (
                <div style={{background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '24px'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '700', color: C.brown, marginBottom: '20px'}}>Nouvelle annonce d'adoption</h3>
                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Animal *</label>
                            <select value={form.animal_id} onChange={e => setForm({...form, animal_id: e.target.value})}
                                style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}} required>
                                <option value="">Choisir un animal</option>
                                {animals.map(a => (
                                    <option key={a.id} value={a.id}>{a.nom} — {a.espece}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Description *</label>
                            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box'}}
                                rows={4} placeholder="Décrivez votre animal et les conditions d'adoption..." required/>
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Ville *</label>
                            <CityInput value={form.ville} onChange={val => setForm({...form, ville: val})} placeholder="Ex: Fès, Maroc" required/>
                        </div>
                        <div>
                            <PhotoUpload
                                label="Photos de l'animal *"
                                multiple={true}
                                maxPhotos={6}
                                onUpload={(urls) => setForm({...form, photos: urls})}
                            />
                        </div>
                        <div style={{display: 'flex', gap: '12px'}}>
                            <button type="submit" disabled={loading} style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1}}>
                                {loading ? 'Publication...' : 'Publier'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'}}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {filteredAnnonces.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>🐾</div>
                    <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Aucune annonce pour le moment</p>
                    <p style={{fontSize: '14px'}}>Publiez une annonce pour faire adopter votre animal</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px'}}>
                    {filteredAnnonces.map(annonce => (
                        <div key={annonce.id} onClick={() => setSelectedAnnonce(annonce)}
                            style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s'}}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{height: '180px', background: getColor(annonce.animal?.espece), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
                                {annonce.animal?.photo ? (
                                    <img src={annonce.animal.photo} alt={annonce.animal?.nom} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                ) : (
                                    <div style={{fontSize: '80px'}}>{getIcon(annonce.animal?.espece)}</div>
                                )}
                                <button onClick={(e) => e.stopPropagation()} style={{position: 'absolute', top: '12px', right: '12px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '18px'}}>
                                    🤍
                                </button>
                            </div>

                            <div style={{padding: '16px'}}>
                                                              <h3 style={{fontWeight: '700', fontSize: '18px', color: C.brown, margin: '0 0 4px'}}>{annonce.animal?.nom || 'Animal'}</h3>
                                {annonce.ville && (annonce.ville || '').toLowerCase().trim() === villeUser && (
                                    <span style={{display: 'inline-block', background: '#E8F5E9', color: '#2e7d32', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginBottom: '6px'}}>📍 Près de chez vous</span>
                                )}
                                <p style={{color: '#888', fontSize: '13px', margin: '0 0 8px', textTransform: 'capitalize'}}>{annonce.animal?.espece} • {annonce.animal?.race}</p>

                                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px'}}>
                                    {annonce.animal?.sexe && (
                                        <span style={{background: '#FFF0EE', color: C.primary, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'}}>
                                            {annonce.animal.sexe === 'male' ? '♂️ Mâle' : '♀️ Femelle'}
                                        </span>
                                    )}
                                    {annonce.animal?.caractere && (
                                        <span style={{background: '#E3F2FD', color: '#1565c0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'}}>
                                            {annonce.animal.caractere}
                                        </span>
                                    )}
                                </div>

                                <p style={{color: '#666', fontSize: '13px', lineHeight: '1.5', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                    {annonce.description}
                                </p>

                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px', background: C.beige, borderRadius: '10px'}}>
                                    <div style={{width: '28px', height: '28px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', flexShrink: 0}}>
                                        {(annonce.proprietaire?.prenom || annonce.user?.prenom)?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p style={{fontWeight: '600', color: C.brown, fontSize: '12px', margin: 0}}>
                                            {annonce.proprietaire?.prenom || annonce.user?.prenom} {annonce.proprietaire?.nom || annonce.user?.nom}
                                        </p>
                                        <p style={{color: '#aaa', fontSize: '11px', margin: 0}}>📍 {annonce.ville}</p>
                                    </div>
                                </div>

                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{background: '#E8F5E9', color: '#2e7d32', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600'}}>
                                        ✅ {annonce.statut}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); handleContacter(annonce); }}
                                        style={{background: C.primary, color: 'white', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                        Je suis intéressé ❤️
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