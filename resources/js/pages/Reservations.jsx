import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

const STATUT_COLORS = {
    en_attente: { bg: '#FFF8E1', color: '#f57f17', label: '⏳ En attente' },
    acceptee: { bg: '#E8F5E9', color: '#2e7d32', label: '✅ Acceptée' },
    refusee: { bg: '#FFF0EE', color: '#E8756A', label: '❌ Refusée' },
    annulee: { bg: '#f5f5f5', color: '#999', label: '🚫 Annulée' },
    terminee: { bg: '#E3F2FD', color: '#1565c0', label: '🏁 Terminée' },
};

export default function Reservations() {
    const { user } = useAuth();
    const { notify, confirmAction } = useNotification();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // Avis
    const [avisResa, setAvisResa] = useState(null);
    const [note, setNote] = useState(0);
    const [commentaire, setCommentaire] = useState('');
    const [envoiAvis, setEnvoiAvis] = useState(false);
    const [avisDeposes, setAvisDeposes] = useState([]);

    const isPrestataire = user?.role === 'prestataire';

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(() => fetchReservations(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchReservations = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get('/reservations');
            setReservations(res.data);
        } catch (err) {
            console.error(err);
        }
        if (!silent) setLoading(false);
    };

    const handleAccepter = async (id) => {
        const confirmed = await confirmAction('Accepter cette réservation ?', {
            title: 'Accepter',
            confirmLabel: 'Accepter',
            cancelLabel: 'Annuler',
        });
        if (!confirmed) return;
        try {
            await api.put(`/reservations/${id}`, { statut: 'acceptee' });
            notify.success('Réservation acceptée !');
            fetchReservations();
        } catch (err) {
            notify.error('Erreur lors de l\'acceptation');
        }
    };

    const handleStatutTrajet = async (id, statutTrajet, label) => {
        const confirmed = await confirmAction(`${label} ?`, {
            title: 'Suivi du trajet',
            confirmLabel: 'Confirmer',
            cancelLabel: 'Annuler',
        });
        if (!confirmed) return;
        try {
            await api.put(`/reservations/${id}`, { statut_trajet: statutTrajet });
            notify.success(`Trajet : ${label}`);
            fetchReservations();
        } catch (err) {
            console.error(err);
            notify.error('Erreur lors de la mise à jour du trajet');
        }
    };

    const handleRefuser = async (id) => {
        const confirmed = await confirmAction('Refuser cette réservation ?', {
            title: 'Refus',
            confirmLabel: 'Refuser',
            cancelLabel: 'Annuler',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await api.put(`/reservations/${id}`, { statut: 'refusee' });
            notify.success('Réservation refusée');
            fetchReservations();
        } catch (err) {
            notify.error('Erreur lors du refus');
        }
    };

    const handleAnnuler = async (id) => {
        const confirmed = await confirmAction('Annuler cette réservation ?', {
            title: 'Annulation',
            confirmLabel: 'Annuler la réservation',
            cancelLabel: 'Garder',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await api.put(`/reservations/${id}`, { statut: 'annulee' });
            notify.success('Réservation annulée');
            fetchReservations();
        } catch (err) {
            notify.error('Erreur lors de l\'annulation');
        }
    };

    // Prestataire : marquer la prestation comme terminée
    const handleTerminer = async (id) => {
        const confirmed = await confirmAction('Marquer cette prestation comme terminée ?', {
            title: 'Terminer',
            confirmLabel: 'Oui, terminée',
            cancelLabel: 'Annuler',
        });
        if (!confirmed) return;
        try {
            await api.put(`/reservations/${id}`, { statut: 'terminee' });
            notify.success('Prestation marquée comme terminée');
            fetchReservations();
        } catch (err) {
            notify.error('Erreur lors de la mise à jour');
        }
    };

    // Client : ouvrir le formulaire d'avis
    const ouvrirAvis = (r) => {
        setAvisResa(r);
        setNote(0);
        setCommentaire('');
    };

    const envoyerAvis = async () => {
        if (note < 1) {
            notify.error('Veuillez sélectionner une note (1 à 5 étoiles)');
            return;
        }
        setEnvoiAvis(true);
        try {
            await api.post('/avis', {
                prestataire_id: avisResa.prestataire_id,
                reservation_id: avisResa.id,
                note: note,
                commentaire: commentaire.trim() || null,
            });
            notify.success('Merci pour votre avis !');
            setAvisDeposes([...avisDeposes, avisResa.id]);
            setAvisResa(null);
        } catch (err) {
            const brut = err.response?.data?.message || '';
            if (err.response?.status === 409 || brut.includes('Duplicate') || brut.includes('unique')) {
                notify.error('Vous avez déjà laissé un avis pour cette réservation');
                setAvisDeposes([...avisDeposes, avisResa.id]);
                setAvisResa(null);
            } else {
                notify.error('Erreur lors de l\'envoi de l\'avis');
            }
        }
        setEnvoiAvis(false);
    };

    // Filtrage selon le rôle
    const mesReservations = isPrestataire
        ? reservations.filter(r => r.prestataire_id === user?.id)
        : reservations.filter(r => r.proprietaire_id === user?.id);

    const filtrees = activeTab === 'all'
        ? mesReservations
        : mesReservations.filter(r => r.statut === activeTab);

    const counts = {
        all: mesReservations.length,
        en_attente: mesReservations.filter(r => r.statut === 'en_attente').length,
        acceptee: mesReservations.filter(r => r.statut === 'acceptee').length,
        terminee: mesReservations.filter(r => r.statut === 'terminee').length,
        refusee: mesReservations.filter(r => r.statut === 'refusee').length,
    };

    if (loading) {
        return <div style={{padding: '24px', textAlign: 'center', color: '#aaa'}}>⏳ Chargement...</div>;
    }

    return (
        <div style={{padding: '24px'}}>
            <div style={{marginBottom: '24px'}}>
                <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>
                    {isPrestataire ? '📋 Demandes de réservation' : '📅 Mes réservations'}
                </h2>
                <p style={{color: '#888', fontSize: '14px', margin: 0}}>
                    {isPrestataire
                        ? 'Gérez les demandes de vos clients'
                        : 'Suivez l\'état de vos réservations'}
                </p>
            </div>

            {/* Tabs */}
            <div style={{display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'}}>
                {[
                    { id: 'all', label: `Toutes (${counts.all})` },
                    { id: 'en_attente', label: `⏳ En attente (${counts.en_attente})` },
                    { id: 'acceptee', label: `✅ Acceptées (${counts.acceptee})` },
                    { id: 'terminee', label: `🏁 Terminées (${counts.terminee})` },
                    { id: 'refusee', label: `❌ Refusées (${counts.refusee})` },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: activeTab === tab.id ? C.primary : 'white',
                            color: activeTab === tab.id ? 'white' : '#888',
                            fontWeight: activeTab === tab.id ? '700' : '500',
                            fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Alerte demandes en attente pour prestataire */}
            {isPrestataire && counts.en_attente > 0 && (
                <div style={{background: '#FFF8E1', border: '1.5px solid #f57f17', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '24px'}}>⏳</span>
                    <p style={{color: '#f57f17', fontWeight: '700', fontSize: '14px', margin: 0}}>
                        {counts.en_attente} demande(s) en attente de votre réponse
                    </p>
                </div>
            )}

            {filtrees.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>📅</div>
                    <p style={{fontSize: '16px', color: C.brown, fontWeight: '600', marginBottom: '8px'}}>
                        Aucune réservation
                    </p>
                    <p style={{fontSize: '14px'}}>
                        {isPrestataire
                            ? 'Vous n\'avez pas encore reçu de demandes'
                            : 'Vous n\'avez pas encore effectué de réservation'}
                    </p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {filtrees.map(r => {
                        const statut = STATUT_COLORS[r.statut] || STATUT_COLORS.en_attente;
                        const autrePersonne = isPrestataire ? r.proprietaire : r.prestataire;
                        const dejaNote = avisDeposes.includes(r.id);

                        return (
                            <div key={r.id} style={{background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px', border: r.statut === 'en_attente' && isPrestataire ? `2px solid #f57f17` : 'none'}}>

                                {/* Header */}
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                                        <div style={{width: '44px', height: '44px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>
                                            {autrePersonne?.prenom?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px', fontSize: '15px'}}>
                                                {isPrestataire ? 'Client : ' : 'Prestataire : '}
                                                {autrePersonne?.prenom} {autrePersonne?.nom}
                                            </p>
                                            <p style={{color: '#888', fontSize: '13px', margin: 0}}>
                                                {autrePersonne?.email} • {autrePersonne?.telephone}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{background: statut.bg, color: statut.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', flexShrink: 0}}>
                                        {statut.label}
                                    </span>
                                </div>

                                {/* Infos réservation */}
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px'}}>
                                    {[
                                        { icon: '🔧', label: 'Service', value: r.service?.titre || r.type_service },
                                        { icon: '📅', label: 'Date', value: r.date_debut ? new Date(r.date_debut).toLocaleDateString('fr-FR') : 'N/A' },
                                        { icon: '🕐', label: 'Heure', value: r.date_debut ? new Date(r.date_debut).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : 'N/A' },
                                        { icon: '📍', label: 'Ville', value: r.ville || 'N/A' },
                                        { icon: '💰', label: 'Montant', value: `${r.montant} DH` },
                                        ...(r.animal ? [{ icon: '🐾', label: 'Animal', value: `${r.animal.nom} (${r.animal.espece})` }] : []),
                                        ...(r.adresse_depart ? [{ icon: '🚗', label: 'Départ', value: r.adresse_depart }] : []),
                                        ...(r.adresse_arrivee ? [{ icon: '🏁', label: 'Arrivée', value: r.adresse_arrivee }] : []),
                                    ].map((item, i) => (
                                        <div key={i} style={{background: C.beige, borderRadius: '10px', padding: '10px 12px'}}>
                                            <p style={{color: '#aaa', fontSize: '11px', margin: '0 0 2px'}}>{item.icon} {item.label}</p>
                                            <p style={{color: C.brown, fontWeight: '600', fontSize: '13px', margin: 0}}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Coordonnées client */}
                                {isPrestataire && r.client_nom && (
                                    <div style={{background: '#F3E5F5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px'}}>
                                        <p style={{color: '#7b1fa2', fontSize: '12px', fontWeight: '700', margin: '0 0 4px'}}>👤 Coordonnées client</p>
                                        <p style={{color: '#555', fontSize: '13px', margin: 0}}>
                                            {r.client_prenom} {r.client_nom} • {r.client_telephone} • {r.client_adresse}
                                        </p>
                                    </div>
                                )}

                                {/* Notes */}
                                {r.notes && (
                                    <div style={{background: '#FFF8E1', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px'}}>
                                        <p style={{color: '#666', fontSize: '13px', margin: 0}}>📝 {r.notes}</p>
                                    </div>
                                )}

                                {/* Actions prestataire : accepter / refuser */}
                                {isPrestataire && r.statut === 'en_attente' && (
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button onClick={() => handleAccepter(r.id)}
                                            style={{flex: 1, background: '#E8F5E9', color: '#2e7d32', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px'}}>
                                            ✅ Accepter
                                        </button>
                                        <button onClick={() => handleRefuser(r.id)}
                                            style={{flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px'}}>
                                            ❌ Refuser
                                        </button>
                                    </div>
                                )}

                                {/* Action client : annuler */}
                                {!isPrestataire && r.statut === 'en_attente' && (
                                    <button onClick={() => handleAnnuler(r.id)}
                                        style={{width: '100%', background: '#f5f5f5', color: '#666', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px'}}>
                                        🚫 Annuler la réservation
                                    </button>
                                )}

                                {/* Statut accepté */}
                                {r.statut === 'acceptee' && (
                                    <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '10px 14px', textAlign: 'center'}}>
                                        <p style={{color: '#2e7d32', fontWeight: '700', fontSize: '13px', margin: 0}}>
                                            ✅ {isPrestataire ? 'Vous avez accepté cette réservation' : 'Votre réservation est confirmée !'}
                                        </p>
                                    </div>
                                )}

                                {/* Contacter (client) */}
                                {!isPrestataire && r.statut === 'acceptee' && (
                                    <button onClick={async () => {
                                        try {
                                            await api.post('/messages', {
                                                destinataire_id: r.prestataire_id,
                                                contenu: `Bonjour, je vous contacte au sujet de ma réservation pour ${r.type_service} le ${new Date(r.date_debut).toLocaleDateString('fr-FR')}.`
                                            });
                                            window.location.href = '/messages';
                                        } catch (err) { console.error(err); }
                                    }}
                                        style={{width: '100%', background: '#E3F2FD', color: '#1565c0', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                        💬 Contacter le prestataire
                                    </button>
                                )}

                                {/* Client : suivi du trajet taxi */}
                                {!isPrestataire && r.statut === 'acceptee' && r.type_service === 'taxi' && (
                                    <div style={{marginTop: '12px'}}>
                                        {(() => {
                                            const etapes = [
                                                { key: 'en_route', icon: '🚕', label: 'Chauffeur en route' },
                                                { key: 'arrive', icon: '📍', label: 'Arrivé au point de départ' },
                                                { key: 'termine', icon: '🏁', label: 'Trajet terminé' },
                                            ];
                                            const rang = { en_route: 1, arrive: 2, termine: 3 };
                                            const actuel = rang[r.statut_trajet] || 0;
                                            return (
                                                <div style={{background: C.beige, borderRadius: '12px', padding: '14px'}}>
                                                    <p style={{color: C.brown, fontWeight: '700', fontSize: '13px', margin: '0 0 10px'}}>🚕 Suivi du trajet</p>
                                                    {etapes.map((e, i) => {
                                                        const fait = actuel >= (i + 1);
                                                        return (
                                                            <div key={e.key} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: fait ? 1 : 0.4}}>
                                                                <span style={{fontSize: '18px'}}>{fait ? e.icon : '⏳'}</span>
                                                                <span style={{color: fait ? '#2e7d32' : '#999', fontWeight: fait ? '700' : '500', fontSize: '13px'}}>{e.label}</span>
                                                                {fait && <span style={{marginLeft: 'auto', color: '#2e7d32', fontSize: '14px'}}>✓</span>}
                                                            </div>
                                                        );
                                                    })}
                                                    {actuel === 0 && (
                                                        <p style={{color: '#999', fontSize: '12px', margin: '4px 0 0', fontStyle: 'italic'}}>En attente du démarrage par le chauffeur…</p>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {r.statut_trajet === 'termine' && (
                                            avisDeposes.includes(r.id) ? (
                                                <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', marginTop: '12px'}}>
                                                    <p style={{color: '#2e7d32', fontWeight: '700', fontSize: '13px', margin: 0}}>⭐ Merci, votre avis a été enregistré</p>
                                                </div>
                                            ) : (
                                                <button onClick={() => ouvrirAvis(r)}
                                                    style={{width: '100%', background: '#FFB800', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', marginTop: '12px'}}>
                                                    ✅ Confirmer & noter le chauffeur
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Actions prestataire quand accepté */}
                                {isPrestataire && r.statut === 'acceptee' && (
                                    <>
                                        <button onClick={async () => {
                                            try {
                                                await api.post('/messages', {
                                                    destinataire_id: r.proprietaire_id,
                                                    contenu: `Bonjour, j'ai accepté votre réservation pour ${r.type_service} le ${new Date(r.date_debut).toLocaleDateString('fr-FR')}. Comment puis-je vous aider ?`
                                                });
                                                window.location.href = '/messages';
                                            } catch (err) { console.error(err); }
                                        }}
                                            style={{width: '100%', background: '#E3F2FD', color: '#1565c0', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                            💬 Contacter le client
                                        </button>

                                        {r.type_service !== 'taxi' && (
                                            <button onClick={() => handleTerminer(r.id)}
                                                style={{width: '100%', background: '#E8756A', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                                🏁 Marquer comme terminée
                                            </button>
                                        )}

                                        {r.type_service === 'taxi' && (
                                            <>
                                                {(!r.statut_trajet || r.statut_trajet === 'en_attente') && (
                                                    <button onClick={() => handleStatutTrajet(r.id, 'en_route', 'Trajet démarré')}
                                                        style={{width: '100%', background: '#4A2C24', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                                        🚕 Démarrer le trajet
                                                    </button>
                                                )}
                                                {r.statut_trajet === 'en_route' && (
                                                    <button onClick={() => handleStatutTrajet(r.id, 'arrive', 'Arrivé à destination')}
                                                        style={{width: '100%', background: '#4A2C24', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                                        📍 Je suis arrivé
                                                    </button>
                                                )}
                                                {r.statut_trajet === 'arrive' && (
                                                    <button onClick={() => handleStatutTrajet(r.id, 'termine', 'Trajet terminé')}
                                                        style={{width: '100%', background: '#2e7d32', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>
                                                        🏁 Trajet terminé
                                                    </button>
                                                )}
                                                {r.statut_trajet === 'termine' && (
                                                    <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', marginTop: '8px'}}>
                                                        <p style={{color: '#2e7d32', fontWeight: '700', fontSize: '13px', margin: 0}}>✅ Trajet terminé</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Statut terminé */}
                                {r.statut === 'terminee' && (
                                    <div style={{background: '#E3F2FD', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', marginBottom: '8px'}}>
                                        <p style={{color: '#1565c0', fontWeight: '700', fontSize: '13px', margin: 0}}>
                                            🏁 Prestation terminée
                                        </p>
                                    </div>
                                )}

                                {/* Client : laisser un avis */}
                                {!isPrestataire && r.statut === 'terminee' && (
                                    dejaNote ? (
                                        <div style={{background: '#E8F5E9', borderRadius: '10px', padding: '10px 14px', textAlign: 'center'}}>
                                            <p style={{color: '#2e7d32', fontWeight: '700', fontSize: '13px', margin: 0}}>
                                                ⭐ Merci, votre avis a été enregistré
                                            </p>
                                        </div>
                                    ) : (
                                        <button onClick={() => ouvrirAvis(r)}
                                            style={{width: '100%', background: '#FFB800', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px'}}>
                                            ⭐ Laisser un avis
                                        </button>
                                    )
                                )}

                                {r.statut === 'refusee' && (
                                    <div style={{background: '#FFF0EE', borderRadius: '10px', padding: '10px 14px', textAlign: 'center'}}>
                                        <p style={{color: C.primary, fontWeight: '700', fontSize: '13px', margin: 0}}>
                                            ❌ {isPrestataire ? 'Vous avez refusé cette réservation' : 'Votre réservation a été refusée'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL AVIS */}
            {avisResa && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(74,44,36,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'}}>
                    <div style={{background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)'}}>
                        <h3 style={{color: C.brown, fontWeight: '800', fontSize: '20px', margin: '0 0 6px', textAlign: 'center'}}>
                            Votre avis
                        </h3>
                        <p style={{color: '#888', fontSize: '14px', margin: '0 0 20px', textAlign: 'center'}}>
                            {avisResa.prestataire?.prenom} {avisResa.prestataire?.nom} — {avisResa.type_service}
                        </p>

                        {/* Étoiles */}
                        <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px'}}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setNote(n)}
                                    style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '36px', lineHeight: 1, padding: 0, color: n <= note ? '#FFB800' : '#ddd'}}>
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={commentaire}
                            onChange={e => setCommentaire(e.target.value)}
                            placeholder="Votre commentaire (facultatif)"
                            rows={4}
                            maxLength={1000}
                            style={{width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '12px', border: '2px solid #eee', fontSize: '14px', outline: 'none', color: '#333', fontFamily: 'inherit', resize: 'vertical'}}
                        />

                        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                            <button onClick={() => setAvisResa(null)} disabled={envoiAvis}
                                style={{flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px'}}>
                                Annuler
                            </button>
                            <button onClick={envoyerAvis} disabled={envoiAvis}
                                style={{flex: 1, background: C.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: envoiAvis ? 'wait' : 'pointer', fontSize: '14px', opacity: envoiAvis ? 0.6 : 1}}>
                                {envoiAvis ? 'Envoi...' : 'Envoyer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
