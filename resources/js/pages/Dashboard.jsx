import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Animals from './Animals';
import Feed from './Feed';
import Adoptions from './Adoptions';
import Messages from './Messages';
import Evenements from './Evenements';
import Reservations from './Reservations';
import Services from './Services';
import Profil from './Profil';
import Booking from './Booking';
import LocationPopup from '../components/LocationPopup';
import Notifications from '../components/Notifications';
import MesServices from './MesServices';
import AdminDashboard from './AdminDashboard';
import APropos from './APropos';
import { SERVICE_TYPES } from '../constants/services';
import { useNotification } from '../context/NotificationContext';
const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
    white: '#FFFFFF',
};

function MesServicesPrestataire({ userId, onNavigate }) {
    const [services, setServices] = React.useState([]);

    React.useEffect(() => {
        api.get('/mes-services')
            .then(res => setServices(res.data))
            .catch(err => console.error(err));
    }, []);

    if (services.length === 0) {
        return (
            <div style={{background: 'white', borderRadius: '14px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                <p style={{color: '#aaa', fontSize: '14px', margin: '0 0 12px'}}>Vous n'avez pas encore de service publié</p>
                <button onClick={() => onNavigate('mes-services')}
                    style={{background: '#E8756A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'}}>
                    + Ajouter un service
                </button>
            </div>
        );
    }

    return (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px'}}>
            {services.slice(0, 4).map(s => (
                <div key={s.id} onClick={() => onNavigate('mes-services')}
                    style={{background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', opacity: s.actif ? 1 : 0.6}}>
                    {s.photo_principale && (
                        <img src={s.photo_principale} alt={s.titre}
                            style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}}/>
                    )}
                    <p style={{fontWeight: '700', color: '#4A2C24', fontSize: '14px', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{s.titre}</p>
                    <p style={{color: '#E8756A', fontWeight: '800', fontSize: '16px', margin: '0 0 4px'}}>{s.tarif} DH</p>
                    <span style={{background: s.actif ? '#E8F5E9' : '#f5f5f5', color: s.actif ? '#2e7d32' : '#999', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600'}}>
                        {s.actif ? '✅ Actif' : '⏸️ Désactivé'}
                    </span>
                </div>
            ))}
        </div>
    );
}

function AvisRecus() {
    const [data, setData] = useState({ avis: [], moyenne: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/mes-avis')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                ⏳ Chargement des avis...
            </div>
        );
    }

    if (data.total === 0) {
        return (
            <div style={{background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize: '40px', marginBottom: '8px'}}>⭐</div>
                <p style={{color: C.brown, fontWeight: '600', fontSize: '15px', margin: '0 0 4px'}}>Aucun avis pour le moment</p>
                <p style={{color: '#aaa', fontSize: '13px', margin: 0}}>Vos clients pourront vous noter après une prestation.</p>
            </div>
        );
    }

    const etoiles = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <div style={{background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <span style={{fontSize: '28px', fontWeight: '800', color: C.brown}}>{data.moyenne}</span>
                <div>
                    <div style={{color: '#FFB800', fontSize: '18px'}}>{etoiles(Math.round(data.moyenne))}</div>
                    <div style={{color: '#aaa', fontSize: '12px'}}>
                        {data.total} avis reçu{data.total > 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {data.avis.slice(0, 3).map((a, i, arr) => (
                <div key={a.id} style={{display: 'flex', gap: '12px', marginBottom: i < arr.length - 1 ? '12px' : 0, paddingBottom: i < arr.length - 1 ? '12px' : 0, borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none'}}>
                    {a.client?.photo ? (
                        <img src={a.client.photo} alt="" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0}}/>
                    ) : (
                        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0}}>
                            {a.client?.prenom?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div style={{flex: 1}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <p style={{fontWeight: '700', color: C.brown, fontSize: '14px', margin: '0 0 4px'}}>
                                {a.client?.prenom} {a.client?.nom}
                            </p>
                            <span style={{color: '#FFB800', fontSize: '13px'}}>{etoiles(a.note)}</span>
                        </div>
                        <p style={{color: '#888', fontSize: '13px', margin: 0, lineHeight: '1.5'}}>
                            {a.commentaire || <em style={{color: '#ccc'}}>Pas de commentaire</em>}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HomePage({ user, setPage, userLocation }) {
  const [stats, setStats] = useState({ animals: null, reservations: null, messages: null, annonces: null });
    const [annonces, setAnnonces] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        fetchStats();
        fetchAnnonces();
    }, [user?.id]);

    const fetchStats = async () => {
        try {
            const [animals, reservations, messages, annonces] = await Promise.all([
                api.get('/animals'),
                api.get('/reservations'),
                api.get('/messages'),
                api.get('/annonces'),
            ]);
            const mesAnnonces = annonces.data.filter(a => a.user_id === user?.id);
            setStats({
                animals: animals.data.length,
                reservations: reservations.data.length,
                messages: messages.data.length,
                annonces: mesAnnonces.length,
            });
        } catch (err) { console.error(err); }
    };

     const fetchAnnonces = async () => {
        try {
            const res = await api.get('/annonces');
            // Annonces des AUTRES, disponibles à l'adoption (pas les miennes)
            const aAdopter = res.data.filter(a => a.user_id !== user?.id && a.statut === 'active');
            setAnnonces(aAdopter.slice(0, 4));
        } catch (err) { console.error(err); }
    };
    const getIcon = (espece) => {
        if (espece === 'chien') return '🐶';
        if (espece === 'chat') return '🐱';
        if (espece === 'oiseau') return '🐦';
        if (espece === 'lapin') return '🐰';
        return '🐾';
    };

    const getColor = (espece) => {
        if (espece === 'chien') return '#E8F5E9';
        if (espece === 'chat') return '#FFF0EE';
        if (espece === 'oiseau') return '#E3F2FD';
        return '#FDF5F0';
    };
       const contacterProprio = async (annonce, e) => {
        if (e) e.stopPropagation();
        const proprio = annonce.proprietaire || annonce.user;
        if (!proprio?.id) { setPage('adoption'); return; }
        try {
            await api.post('/messages', {
                destinataire_id: proprio.id,
                contenu: `Bonjour ! Je suis intéressé(e) par l'adoption de ${annonce.animal?.nom || 'cet animal'}. Pouvez-vous me donner plus d'informations ? 🐾`
            });
            setPage('messages');
        } catch (err) {
            console.error(err);
            setPage('adoption');
        }
    };
    return (
        <div className="page-pad">
            <div style={{marginBottom: '24px'}}>
                <p style={{color: '#aaa', fontSize: '13px', margin: 0}}>
                    📍 {userLocation || 'Localisation non définie'}
                </p>
                <h2 style={{color: C.brown, fontSize: '22px', fontWeight: '800', margin: '4px 0'}}>
                    Bonjour {user?.prenom} ! 👋
                </h2>
                <p style={{color: '#888', fontSize: '14px', margin: 0}}>
                    Comment puis-je prendre soin de votre compagnon ?
                </p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px'}}>
                {[
                    {icon: '🐾', label: 'Mes animaux', value: stats.animals, color: C.primary, page: 'animals'},
                    {icon: '📅', label: 'Réservations', value: stats.reservations, color: '#4caf50', page: 'reservations'},
                    {icon: '💬', label: 'Messages', value: stats.messages, color: '#2196f3', page: 'messages'},
                    {icon: '📢', label: 'Annonces', value: stats.annonces, color: '#ff9800', page: 'adoption'},
                ].map((stat, i) => (
                    <div key={i} onClick={() => setPage(stat.page)}
                        style={{background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'center'}}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>{stat.icon}</div>
<div style={{fontSize: '28px', fontWeight: '800', color: stat.color, marginBottom: '4px'}}>{stat.value === null ? '…' : stat.value}</div>                        <div style={{color: '#888', fontSize: '13px'}}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{background: 'white', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '28px'}}>
                <span>🔍</span>
                <input placeholder="Rechercher un service..." 
                    onKeyDown={(e) => { if (e.key === 'Enter') setPage('services'); }}
                    onClick={() => setPage('services')}
                    readOnly
                    style={{border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#888', background: 'transparent', width: '100%', cursor: 'pointer'}}/>            </div>

            <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', margin: 0}}>Nos services</h3>
                    <button onClick={() => setPage('services')} style={{color: C.primary, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Voir tout</button>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px'}}>
                    {SERVICE_TYPES.map(s => (
                        <button key={s.key} onClick={() => setPage('services')}
                            style={{background: s.color, border: 'none', borderRadius: '14px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'}}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{fontSize: '28px'}}>{s.icon}</span>
                            <span style={{fontSize: '12px', color: C.brown, fontWeight: '600'}}>{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', margin: 0}}>Adoption</h3>
                    <button onClick={() => setPage('adoption')} style={{color: C.primary, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Voir plus</button>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '16px'}}>
                                                      {annonces.length > 0 ? annonces.map((a, i) => (
                        <button key={i} onClick={(e) => contacterProprio(a, e)}
                            style={{background: getColor(a.animal?.espece), border: 'none', borderRadius: '14px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', overflow: 'hidden'}}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {a.animal?.photo ? (
                                <img src={a.animal.photo} alt={a.animal?.nom} style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.primary}`}}/>
                            ) : (
                                <span style={{fontSize: '36px'}}>{getIcon(a.animal?.espece)}</span>
                            )}
                            <span style={{fontSize: '13px', fontWeight: '700', color: C.brown}}>{a.animal?.nom}</span>
                            <span style={{fontSize: '11px', color: '#888'}}>{a.animal?.espece} • {a.ville}</span>
                        </button>
                    )) : (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '14px'}}>
                            Aucune annonce pour le moment
                        </div>
                    )}
                </div>
                <button onClick={() => setPage('adoption')} style={{width: '100%', background: C.primary, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                    + Publier une annonce d'adoption
                </button>
            </div>

            {/* Services du prestataire */}
            {user?.role === 'prestataire' && (
                <div style={{marginBottom: '28px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                        <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', margin: 0}}>🔧 Mes services</h3>
                        <button onClick={() => setPage('mes-services')} style={{color: C.primary, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Gérer</button>
                    </div>
                    <MesServicesPrestataire userId={user?.id} onNavigate={setPage}/>
                </div>
            )}

            {/* Avis réels reçus par le prestataire */}
            {user?.role === 'prestataire' && (
                <div style={{marginBottom: '28px'}}>
                    <h3 style={{color: C.brown, fontWeight: '700', fontSize: '18px', marginBottom: '16px'}}>Avis reçus</h3>
                    <AvisRecus/>
                </div>
            )}

            <div onClick={() => setPage('apropos')} style={{background: 'white', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', marginBottom: '28px'}}>
                <span style={{fontSize: '24px'}}>ℹ️</span>
                <div style={{flex: 1}}>
                    <p style={{fontWeight: '700', color: C.brown, fontSize: '14px', margin: 0}}>À propos de PawNella</p>
                    <p style={{color: '#888', fontSize: '12px', margin: 0}}>Découvrez notre mission et nos services</p>
                </div>
                <span style={{color: '#aaa', fontSize: '18px'}}>›</span>
            </div>
        </div>
    );
}

export default function Dashboard({ pendingBooking, clearPendingBooking }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { confirmAction } = useNotification();
    const location = useLocation();
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [userLocation, setUserLocation] = useState('');
    const [pendingPage, setPendingPage] = useState('');

    // Ville liée au compte connecté (défaut = ville du profil)
    useEffect(() => {
        if (!user?.id) return;
        const saved = localStorage.getItem(`pawnella_ville_${user.id}`);
        setUserLocation(saved || user.ville || '');
    }, [user?.id]);

    const changerVille = (v) => {
        setUserLocation(v);
        if (user?.id) localStorage.setItem(`pawnella_ville_${user.id}`, v);
    };

    // Détermine la page active à partir de l'URL (ex: /services -> 'services')
    const page = location.pathname === '/' ? 'home' : location.pathname.slice(1);

   // Redirige vers la réservation/adoption en attente dès qu'elle est disponible
  useEffect(() => {
          if (pendingBooking) {
            const type = pendingBooking.type;

                     if (type === 'adoption') {
                if (clearPendingBooking) clearPendingBooking();
                if (pendingBooking.annonceId) {
                    // Envoyer directement le message au propriétaire, puis aller à la messagerie
                    api.get(`/annonces/${pendingBooking.annonceId}`)
                        .then(res => {
                            const annonce = res.data;
                            const proprio = annonce.proprietaire || annonce.user;
                            if (proprio?.id) {
                                return api.post('/messages', {
                                    destinataire_id: proprio.id,
                                    contenu: `Bonjour ! Je suis intéressé(e) par l'adoption de ${annonce.animal?.nom || 'cet animal'}. Pouvez-vous me donner plus d'informations ? 🐾`
                                });
                            }
                        })
                        .then(() => navigate('/messages'))
                        .catch(err => { console.error(err); navigate('/adoption'); });
                } else {
                    navigate('/adoption');
                }
            }
            else if (type === 'service') {
                if (clearPendingBooking) clearPendingBooking();
                if (user?.role === 'prestataire') {
                    navigate('/mes-services?nouveau=1');
                } else {
                    navigate('/');
                    confirmAction(
                        'Pour proposer un service, vous devez avoir un compte prestataire. Voulez-vous créer un compte prestataire ?',
                        { title: '🔧 Compte prestataire requis', confirmLabel: 'Créer un compte prestataire', cancelLabel: 'Plus tard' }
                    ).then(ok => { if (ok) navigate('/register-prestataire'); });
                }
            }
                          else {
                if (clearPendingBooking) clearPendingBooking();
                navigate('/booking');
            }
        }
    }, [pendingBooking]);
    const setPage = (id) => {
        navigate(id === 'home' ? '/' : `/${id}`);
    };

    const menuItems = [
        {id: 'home', icon: '🏠', label: 'Accueil'},
        ...(user?.role === 'prestataire' ? [{id: 'mes-services', icon: '🔧', label: 'Mes services'}] : []),
        {id: 'services', icon: '🔧', label: 'Services'},
        {id: 'adoption', icon: '❤️', label: 'Adoption'},
        {id: 'messages', icon: '💬', label: 'Messages'},
        {id: 'animals', icon: '🐾', label: 'Mes animaux'},
        {id: 'feed', icon: '📝', label: 'Feed'},
        {id: 'evenements', icon: '🎉', label: 'Événements'},
        {id: 'booking', icon: '📅', label: 'Réserver un service'},
        ...(user?.role === 'admin' ? [{id: 'admin', icon: '👑', label: 'Administration'}] : []),
        {id: 'profile', icon: '👤', label: 'Profil'},
    ];

    const handleNav = (id) => {
        if ((id === 'services' || id === 'adoption') && !userLocation) {
            setPendingPage(id);
            setShowLocationPopup(true);
        } else {
            setPage(id);
        }
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #FDF5F0; }
                .dashboard-layout { display: flex; min-height: 100vh; }
                .sidebar { width: 240px; background: white; box-shadow: 2px 0 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; }
                .main-content { margin-left: 240px; flex: 1; min-height: 100vh; background: #FDF5F0; overflow-y: auto; }
                .top-header { background: white; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 50; gap: 12px; }
                .page-pad { padding: 24px; }
                .header-greeting { font-size: 14px; color: #4A2C24; }
                .header-logout { background: #E8756A; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; }
                .bottom-nav { display: none; }

                @media (max-width: 768px) {
                    .sidebar { display: none; }
                    .main-content { margin-left: 0; padding-bottom: 74px; }
                    .top-header { padding: 10px 14px; }
                    .page-pad { padding: 16px; }
                    /* Sur mobile : on masque le "Bonjour, X" et le bouton du header (déconnexion via la bottom-nav) */
                    .header-greeting { display: none; }
                    .header-logout { display: none; }
                    .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #f0f0f0; justify-content: space-around; padding: 6px 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); z-index: 100; }
                }
            `}</style>

            <div className="dashboard-layout">
                <aside className="sidebar">
                    <div style={{padding: '20px', borderBottom: '1px solid #f5f5f5'}}>
                        <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '45px'}}/>
                    </div>
                    <div style={{padding: '12px', flex: 1, overflowY: 'auto'}}>
                        {menuItems.map(item => (
                            <button key={item.id} onClick={() => handleNav(item.id)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: page === item.id ? '#FFF0EE' : 'transparent',
                                color: page === item.id ? C.primary : C.brown,
                                fontWeight: page === item.id ? '700' : '500',
                                fontSize: '14px', marginBottom: '4px', textAlign: 'left', transition: 'all 0.2s'
                            }}>
                                <span style={{fontSize: '20px'}}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div style={{padding: '16px', borderTop: '1px solid #f5f5f5'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                            <div style={{width: '36px', height: '36px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px'}}>
                                {user?.prenom?.[0]}
                            </div>
                            <div>
                                <p style={{fontWeight: '700', fontSize: '13px', color: C.brown, margin: 0}}>{user?.prenom} {user?.nom}</p>
                                <p style={{fontSize: '11px', color: '#aaa', margin: 0}}>{user?.role}</p>
                            </div>
                        </div>
                        <button onClick={logout} style={{width: '100%', background: '#FFF0EE', color: C.primary, border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>
                            Déconnexion
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="top-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0}}>
                            {page !== 'home' && (
                                <button onClick={() => setPage('home')} style={{background: '#FFF0EE', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: C.primary, fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap'}}>
                                    ←
                                </button>
                            )}
                            {userLocation && <span style={{fontSize: '13px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>📍 {userLocation}</span>}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0}}>
                            <Notifications userId={user?.id}/>
                            <span className="header-greeting">Bonjour, <strong>{user?.prenom}</strong></span>
                            <button onClick={logout} className="header-logout">
                                Déconnexion
                            </button>
                        </div>
                    </div>
                    <div>
                        <Routes>
                            <Route path="/" element={<HomePage user={user} setPage={setPage} userLocation={userLocation}/>}/>
                            <Route path="/services" element={<Services userLocation={userLocation} onLocationChange={changerVille}/>}/>
                            <Route path="/adoption" element={<Adoptions pendingBooking={pendingBooking} clearPendingBooking={clearPendingBooking}/>}/>
                            <Route path="/messages" element={<Messages/>}/>
                            <Route path="/animals" element={<Animals/>}/>
                            <Route path="/feed" element={<Feed/>}/>
                            <Route path="/evenements" element={<Evenements/>}/>
                            <Route path="/reservations" element={<Reservations/>}/>
                            <Route path="/profile" element={<Profil onNavigate={setPage}/>}/>
                            <Route path="/booking" element={<Booking pendingBooking={pendingBooking} clearPendingBooking={clearPendingBooking}/>}/>
                            <Route path="/mes-services" element={<MesServices/>}/>
                            <Route path="/admin" element={<AdminDashboard/>}/>
                            <Route path="/apropos" element={<APropos onNavigate={setPage} user={user}/>}/>
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </div>
                </main>

                <nav className="bottom-nav">
                    {[
                        {id: 'home', icon: '🏠', label: 'Accueil'},
                        {id: 'services', icon: '🔧', label: 'Services'},
                        {id: 'adoption', icon: '❤️', label: 'Adoption'},
                        {id: 'messages', icon: '💬', label: 'Messages'},
                        {id: 'profile', icon: '👤', label: 'Profil'},
                    ].map(item => (
                        <button key={item.id} onClick={() => handleNav(item.id)} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer',
                            color: page === item.id ? C.primary : '#aaa',
                            fontSize: '10px', fontWeight: page === item.id ? '700' : '400'
                        }}>
                            <span style={{fontSize: '22px'}}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {showLocationPopup && (
                <LocationPopup
                    title={pendingPage === 'services' ? "Où cherchez-vous un service ?" : "Où cherchez-vous un animal ?"}
                    onConfirm={(loc) => { changerVille(loc); setShowLocationPopup(false); setPage(pendingPage); }}
                    onClose={() => { setShowLocationPopup(false); setPage(pendingPage); }}
                />
            )}
        </>
    );
}