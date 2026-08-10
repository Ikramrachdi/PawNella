import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUnite } from '../constants/services';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

const serviceIcons = {
    promenade: '🚶',
    garde: '🏠',
    pension: '🏨',
    visite: '🏥',
    toilettage: '✂️',
    taxi: '🚗',
    dressage: '📋',
    soins: '💊',
};

// Date lisible : "il y a 3 jours"
function dateRelative(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const jours = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    if (jours < 1) return "aujourd'hui";
    if (jours === 1) return 'hier';
    if (jours < 7) return `il y a ${jours} jours`;
    if (jours < 30) {
        const s = Math.floor(jours / 7);
        return s === 1 ? 'il y a 1 semaine' : `il y a ${s} semaines`;
    }
    const m = Math.floor(jours / 30);
    return m === 1 ? 'il y a 1 mois' : `il y a ${m} mois`;
}

export default function ProfilPrestataire({ prestataireId, onBack, onReserver }) {
    const [prestataire, setPrestataire] = useState(null);
    const [avisData, setAvisData] = useState({ avis: [], moyenne: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingAvis, setLoadingAvis] = useState(true);
    const [activeTab, setActiveTab] = useState('apropos');

    useEffect(() => {
        fetchPrestataire();
        fetchAvis();
    }, [prestataireId]);

    const fetchPrestataire = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/prestataires/${prestataireId}`);
            setPrestataire(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchAvis = async () => {
        setLoadingAvis(true);
        try {
            const res = await api.get(`/prestataires/${prestataireId}/avis`);
            setAvisData(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoadingAvis(false);
    };

    if (loading) {
        return (
            <div style={{padding: '24px', textAlign: 'center', color: '#aaa'}}>
                <p>⏳ Chargement...</p>
            </div>
        );
    }

    if (!prestataire) {
        return (
            <div style={{padding: '24px', textAlign: 'center', color: '#aaa'}}>
                <p>❌ Prestataire introuvable</p>
                <button onClick={onBack} style={{background: C.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginTop: '12px'}}>
                    ← Retour
                </button>
            </div>
        );
    }

    const services = Array.isArray(prestataire.services_offerts)
        ? prestataire.services_offerts
        : prestataire.services_offerts ? [prestataire.services_offerts] : [];

    const unite = getUnite(services[0]) || '';
    const etoiles = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <div style={{padding: '24px'}}>
            <button onClick={onBack} style={{background: 'none', border: 'none', cursor: 'pointer', color: C.brown, fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'}}>
                ← Retour
            </button>

            {/* Header profil */}
            <div style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px'}}>
                <div style={{background: 'linear-gradient(135deg, #fce4d6, #FFF0EE)', padding: '32px 24px', textAlign: 'center'}}>
                    {prestataire.photo ? (
                        <img src={prestataire.photo} alt={prestataire.prenom} style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${C.primary}`, marginBottom: '16px'}}/>
                    ) : (
                        <div style={{width: '100px', height: '100px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '36px', margin: '0 auto 16px'}}>
                            {prestataire.prenom?.[0]}
                        </div>
                    )}
                    <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px'}}>
                        {prestataire.prenom} {prestataire.nom}
                    </h2>
                    <p style={{color: '#888', fontSize: '14px', margin: '0 0 12px'}}>
                        {prestataire.description || 'Prestataire professionnel'}
                    </p>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap'}}>
                        {prestataire.est_verifie && (
                            <span style={{background: '#E8F5E9', color: '#2e7d32', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                ✅ Vérifié
                            </span>
                        )}
                        <span style={{background: '#FFF0EE', color: C.primary, padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                            📍 {prestataire.ville}
                        </span>
                        {prestataire.tarif && (
                            <span style={{background: '#E3F2FD', color: '#1565c0', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                💰 {prestataire.tarif} DH {unite}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats — toutes issues de la base */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #f5f5f5'}}>
                    {[
                        {label: 'Note', value: prestataire.total_avis > 0 ? prestataire.note_moyenne : '—', icon: '⭐'},
                        {label: 'Avis', value: prestataire.total_avis ?? 0, icon: '💬'},
                        {label: 'Réservations', value: prestataire.total_reservations ?? 0, icon: '📅'},
                    ].map((stat, i) => (
                        <div key={i} style={{padding: '16px', textAlign: 'center', borderRight: i < 2 ? '1px solid #f5f5f5' : 'none'}}>
                            <div style={{fontSize: '20px', marginBottom: '4px'}}>{stat.icon}</div>
                            <div style={{fontSize: '20px', fontWeight: '800', color: C.brown}}>{stat.value}</div>
                            <div style={{color: '#aaa', fontSize: '12px'}}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div style={{display: 'flex', gap: '8px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                {[
                    {id: 'apropos', label: 'À propos'},
                    {id: 'services', label: 'Services'},
                    {id: 'avis', label: `Avis${avisData.total ? ` (${avisData.total})` : ''}`},
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: activeTab === tab.id ? C.primary : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#888',
                        fontWeight: activeTab === tab.id ? '700' : '500',
                        fontSize: '14px', transition: 'all 0.2s'
                    }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab À propos */}
            {activeTab === 'apropos' && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '16px'}}>👤 Informations</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}>
                        {[
                            {icon: '📱', label: 'Téléphone', value: prestataire.telephone || 'N/A'},
                            {icon: '📍', label: 'Ville', value: prestataire.ville || 'N/A'},
                            {icon: '✅', label: 'Statut', value: prestataire.est_verifie ? 'Vérifié' : 'En attente'},
                            {icon: '💰', label: 'Tarif', value: prestataire.tarif ? `${prestataire.tarif} DH ${unite}` : 'N/A'},
                        ].map((item, i) => (
                            <div key={i} style={{background: C.beige, borderRadius: '12px', padding: '12px 16px'}}>
                                <p style={{color: '#aaa', fontSize: '12px', margin: '0 0 4px'}}>{item.icon} {item.label}</p>
                                <p style={{color: C.brown, fontWeight: '600', fontSize: '14px', margin: 0}}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    {prestataire.description && (
                        <div>
                            <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '12px'}}>📝 Description</h3>
                            <p style={{color: '#666', lineHeight: '1.7', fontSize: '14px', background: C.beige, padding: '16px', borderRadius: '12px'}}>
                                {prestataire.description}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab Services */}
            {activeTab === 'services' && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '16px'}}>🔧 Services proposés</h3>
                    {services.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            {services.map((service, i) => (
                                <div key={i} style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: C.beige, borderRadius: '14px'}}>
                                    <span style={{fontSize: '32px'}}>{serviceIcons[String(service).toLowerCase()] || '🐾'}</span>
                                    <div style={{flex: 1}}>
                                        <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px', textTransform: 'capitalize'}}>{service}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p style={{fontWeight: '800', color: C.primary, margin: '0 0 2px'}}>{prestataire.tarif || '—'} DH</p>
                                        <p style={{color: '#aaa', fontSize: '12px', margin: 0}}>{getUnite(service)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{color: '#aaa', textAlign: 'center', padding: '20px'}}>Aucun service renseigné</p>
                    )}
                </div>
            )}

            {/* Tab Avis — issus de la table avis */}
            {activeTab === 'avis' && (
                <div style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '16px'}}>⭐ Avis clients</h3>

                    {loadingAvis ? (
                        <p style={{color: '#aaa', textAlign: 'center', padding: '20px'}}>⏳ Chargement des avis...</p>
                    ) : avisData.total === 0 ? (
                        <div style={{textAlign: 'center', padding: '32px', color: '#aaa'}}>
                            <div style={{fontSize: '40px', marginBottom: '8px'}}>⭐</div>
                            <p style={{color: C.brown, fontWeight: '600', fontSize: '15px', margin: '0 0 4px'}}>Aucun avis pour le moment</p>
                            <p style={{fontSize: '13px', margin: 0}}>Ce prestataire n'a pas encore été noté.</p>
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            {avisData.avis.map(a => (
                                <div key={a.id} style={{padding: '16px', background: C.beige, borderRadius: '14px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
                                        {a.client?.photo ? (
                                            <img src={a.client.photo} alt="" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0}}/>
                                        ) : (
                                            <div style={{width: '40px', height: '40px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0}}>
                                                {a.client?.prenom?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{flex: 1}}>
                                            <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px', fontSize: '14px'}}>
                                                {a.client?.prenom} {a.client?.nom?.[0] ? a.client.nom[0].toUpperCase() + '.' : ''}
                                            </p>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                <span style={{color: '#FFB800', fontSize: '13px'}}>{etoiles(a.note)}</span>
                                                <span style={{color: '#aaa', fontSize: '12px'}}>{dateRelative(a.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {a.commentaire && (
                                        <p style={{color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.6'}}>{a.commentaire}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bouton Réserver */}
            <div style={{background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <div>
                        <p style={{color: C.brown, fontWeight: '700', fontSize: '16px', margin: '0 0 4px'}}>À partir de</p>
                        <p style={{fontSize: '28px', fontWeight: '800', color: C.primary, margin: 0}}>
                            {prestataire.tarif || '—'} DH<span style={{fontSize: '14px', color: '#aaa', fontWeight: '400'}}> {unite}</span>
                        </p>
                    </div>
                    <button onClick={() => onReserver && onReserver(prestataire)}
                        style={{background: C.primary, color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                        📅 Réserver
                    </button>
                </div>
            </div>
        </div>
    );
}