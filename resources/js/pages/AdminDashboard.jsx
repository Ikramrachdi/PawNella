import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function AdminDashboard() {
    const { notify, confirmAction } = useNotification();
    const [prestataires, setPrestataires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('en_attente');
        const [vue, setVue] = useState('prestataires'); // 'prestataires' ou 'contact'
    const [demandes, setDemandes] = useState([]);

    // Prestataire dont on inspecte les documents
    const [selected, setSelected] = useState(null);
    // Image affichée en plein écran
    const [zoomImg, setZoomImg] = useState(null);

    useEffect(() => { fetchPrestataires(); fetchDemandes(); }, []);

    const fetchDemandes = async () => {
        try {
            const res = await api.get('/contact');
            setDemandes(res.data);
        } catch (err) { console.error(err); }
    };

    const marquerTraitee = async (id) => {
        try {
            await api.put(`/contact/${id}`, { statut: 'traitee' });
            fetchDemandes();
            notify.success('Demande marquée comme traitée');
        } catch (err) { notify.error('Erreur'); }
    };

    const nouvellesDemandes = demandes.filter(d => d.statut === 'nouvelle').length;
    const fetchPrestataires = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/prestataires');
            setPrestataires(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleValidate = async (id) => {
        const confirmed = await confirmAction('Valider ce prestataire ? Son compte deviendra actif.', {
            title: 'Validation',
            confirmLabel: 'Valider',
            cancelLabel: 'Annuler',
        });
        if (!confirmed) return;
        try {
          await api.post(`/admin/prestataires/${id}/valider`);
            notify.success('Prestataire validé');
            setSelected(null);
            fetchPrestataires();
        } catch (err) {
            notify.error('Erreur lors de la validation');
        }
    };

    const handleReject = async (id) => {
        const confirmed = await confirmAction('Refuser ce prestataire ?', {
            title: 'Refus',
            confirmLabel: 'Refuser',
            cancelLabel: 'Annuler',
            danger: true,
        });
        if (!confirmed) return;
        try {
         await api.post(`/admin/prestataires/${id}/rejeter`);
            notify.success('Prestataire refusé');
            setSelected(null);
            fetchPrestataires();
        } catch (err) {
            notify.error('Erreur lors du refus');
        }
    };

    const filtered = prestataires.filter(p => {
        if (filter === 'tous') return true;
        return p.statut_validation === filter;
    });

    const counts = {
        en_attente: prestataires.filter(p => p.statut_validation === 'en_attente').length,
        valide: prestataires.filter(p => p.statut_validation === 'valide').length,
        rejete: prestataires.filter(p => p.statut_validation === 'rejete').length,
    };

    const STATUTS = {
        en_attente: { label: '⏳ En attente', bg: '#FFF8E1', color: '#f57f17' },
        valide: { label: '✅ Validé', bg: '#E8F5E9', color: '#2e7d32' },
        rejete: { label: '❌ Refusé', bg: '#FFF0EE', color: '#E8756A' },
    };

    // ---------- VUE DÉTAIL D'UN PRESTATAIRE ----------
    if (selected) {
        const p = selected;
        const nomComplet = `${p.prenom || ''} ${p.nom || ''}`.trim();
        const docs = [
            { url: p.cin_recto, label: '🪪 CIN — Recto' },
            { url: p.cin_verso, label: '🪪 CIN — Verso' },
            { url: p.selfie, label: '🤳 Selfie' },
        ];

        return (
            <div style={{ padding: '24px' }}>
                <button onClick={() => setSelected(null)}
                    style={{ background: '#FFF0EE', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', color: C.primary, fontWeight: '600', fontSize: '14px', marginBottom: '20px' }}>
                    ← Retour à la liste
                </button>

                <h2 style={{ fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px' }}>
                    Vérification du prestataire
                </h2>
                <p style={{ color: '#888', fontSize: '14px', margin: '0 0 20px' }}>
                    Comparez le nom déclaré avec les documents d'identité avant de valider.
                </p>

                {/* Bandeau d'alerte si revue demandée */}
                {p.needs_review && p.review_reason && (
                    <div style={{ background: '#FFF8E1', border: '1.5px solid #f57f17', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
                        <p style={{ color: '#f57f17', fontWeight: '700', fontSize: '14px', margin: '0 0 4px' }}>⚠️ Vérification manuelle demandée</p>
                        <p style={{ color: '#8a6d1a', fontSize: '13px', margin: 0 }}>{p.review_reason}</p>
                    </div>
                )}

                {/* Infos déclarées */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
                    <h3 style={{ color: C.brown, fontWeight: '700', fontSize: '16px', margin: '0 0 14px' }}>Informations déclarées</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {[
                            { label: '👤 Nom complet', value: nomComplet || '—', highlight: true },
                            { label: '📧 Email', value: p.email || '—' },
                            { label: '📱 Téléphone', value: p.telephone || '—' },
                            { label: '📍 Ville', value: p.ville || '—' },
                            { label: '🔧 Service', value: Array.isArray(p.services_offerts) ? p.services_offerts.join(', ') : (p.services_offerts || '—') },
                            { label: '💰 Tarif', value: p.tarif ? `${p.tarif} DH` : '—' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: item.highlight ? '#FFF0EE' : C.beige, borderRadius: '10px', padding: '10px 14px' }}>
                                <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 2px' }}>{item.label}</p>
                                <p style={{ color: item.highlight ? C.primary : C.brown, fontWeight: item.highlight ? '800' : '600', fontSize: '14px', margin: 0 }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
                    <h3 style={{ color: C.brown, fontWeight: '700', fontSize: '16px', margin: '0 0 14px' }}>Documents d'identité</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {docs.map((doc, i) => (
                            <div key={i}>
                                <p style={{ color: C.brown, fontWeight: '600', fontSize: '13px', margin: '0 0 8px' }}>{doc.label}</p>
                                {doc.url ? (
                                    <img src={doc.url} alt={doc.label}
                                        onClick={() => setZoomImg(doc.url)}
                                        onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
                                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #eee', cursor: 'zoom-in' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '160px', borderRadius: '10px', background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '13px' }}>
                                        Document manquant
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p style={{ color: '#aaa', fontSize: '12px', margin: '12px 0 0' }}>
                        💡 Cliquez sur une image pour l'agrandir et vérifier que le nom imprimé correspond au nom déclaré.
                    </p>
                </div>

                {/* Actions */}
                {p.statut_validation === 'en_attente' ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleValidate(p.id)}
                            style={{ flex: 1, background: '#E8F5E9', color: '#2e7d32', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                            ✅ Valider ce prestataire
                        </button>
                        <button onClick={() => handleReject(p.id)}
                            style={{ flex: 1, background: '#FFF0EE', color: C.primary, border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                            ❌ Refuser
                        </button>
                    </div>
                ) : (
                    <div style={{ background: STATUTS[p.statut_validation]?.bg, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                        <p style={{ color: STATUTS[p.statut_validation]?.color, fontWeight: '700', margin: 0 }}>
                            {STATUTS[p.statut_validation]?.label}
                        </p>
                    </div>
                )}

                {/* Zoom plein écran */}
                {zoomImg && (
                    <div onClick={() => setZoomImg(null)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '30px', cursor: 'zoom-out' }}>
                        <img src={zoomImg} alt="" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} />
                        <button onClick={() => setZoomImg(null)}
                            style={{ position: 'absolute', top: '20px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '22px', cursor: 'pointer', fontWeight: '700', color: C.brown }}>
                            ×
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ---------- VUE LISTE ----------
    return (
        <div style={{ padding: '24px' }}>
                       <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: C.brown, margin: '0 0 4px' }}>👑 Administration</h2>
                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Gestion de la plateforme</p>
            </div>

            {/* ONGLETS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f0e5e0' }}>
                <button onClick={() => setVue('prestataires')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', fontSize: '15px', fontWeight: vue === 'prestataires' ? '800' : '500', color: vue === 'prestataires' ? C.primary : '#888', borderBottom: vue === 'prestataires' ? `3px solid ${C.primary}` : '3px solid transparent', marginBottom: '-2px' }}>
                    🔧 Prestataires
                </button>
                <button onClick={() => setVue('contact')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', fontSize: '15px', fontWeight: vue === 'contact' ? '800' : '500', color: vue === 'contact' ? C.primary : '#888', borderBottom: vue === 'contact' ? `3px solid ${C.primary}` : '3px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✉️ Demandes de contact
                    {nouvellesDemandes > 0 && (
                        <span style={{ background: C.primary, color: 'white', borderRadius: '50%', minWidth: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', padding: '0 5px' }}>
                            {nouvellesDemandes}
                        </span>
                    )}
                </button>
            </div>

                     {vue === 'prestataires' && <>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { id: 'en_attente', label: `⏳ En attente (${counts.en_attente})` },
                    { id: 'valide', label: `✅ Validés (${counts.valide})` },
                    { id: 'rejete', label: `❌ Refusés (${counts.rejete})` },
                    { id: 'tous', label: 'Tous' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setFilter(tab.id)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: filter === tab.id ? C.primary : 'white',
                            color: filter === tab.id ? 'white' : '#888',
                            fontWeight: filter === tab.id ? '700' : '500',
                            fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>⏳ Chargement...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                    <p style={{ fontSize: '16px', color: C.brown, fontWeight: '600' }}>Aucun prestataire dans cette catégorie</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(p => {
                        const statut = STATUTS[p.statut_validation] || STATUTS.en_attente;
                        return (
                            <div key={p.id}
                                onClick={() => setSelected(p)}
                                style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: p.needs_review ? '1.5px solid #f57f17' : 'none' }}>
                                {p.photo ? (
                                    <img src={p.photo} alt="" style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                                        {p.prenom?.[0]}
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '700', color: C.brown, fontSize: '15px', margin: '0 0 2px' }}>
                                        {p.prenom} {p.nom}
                                        {p.needs_review && <span style={{ color: '#f57f17', fontSize: '12px', marginLeft: '8px' }}>⚠️ à vérifier</span>}
                                    </p>
                                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                                        {p.email} • {p.ville} • {Array.isArray(p.services_offerts) ? p.services_offerts.join(', ') : p.services_offerts}
                                    </p>
                                </div>
                                <span style={{ background: statut.bg, color: statut.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                    {statut.label}
                                </span>
                                <span style={{ color: '#ccc', fontSize: '18px', flexShrink: 0 }}>›</span>
                            </div>
                        );
                                })}
                </div>
            )}
            </>}

            {vue === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {demandes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✉️</div>
                            <p style={{ fontSize: '16px', color: C.brown, fontWeight: '600' }}>Aucune demande de contact</p>
                        </div>
                    ) : demandes.map(d => (
                        <div key={d.id} style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: d.statut === 'nouvelle' ? `1.5px solid ${C.primary}` : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                                <div>
                                    <p style={{ fontWeight: '700', color: C.brown, fontSize: '15px', margin: '0 0 2px' }}>
                                        {d.objet}
                                        <span style={{ background: '#FFF0EE', color: C.primary, padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', marginLeft: '10px' }}>{d.type}</span>
                                    </p>
                                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{d.nom} • {d.email}</p>
                                </div>
                                {d.statut === 'nouvelle' ? (
                                    <span style={{ background: C.primary, color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>Nouvelle</span>
                                ) : (
                                    <span style={{ background: '#E8F5E9', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>✅ Traitée</span>
                                )}
                            </div>
                            <p style={{ color: '#555', fontSize: '14px', margin: '0 0 12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{d.message}</p>
                            {d.statut === 'nouvelle' && (
                                <button onClick={() => marquerTraitee(d.id)}
                                    style={{ background: '#E8F5E9', color: '#2e7d32', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                    ✓ Marquer comme traitée
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}