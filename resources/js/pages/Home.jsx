import React, { useState, useEffect } from 'react';
import api from '../services/api';
import APropos from './APropos';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

const SERVICES = [
    { icon: '🚶', title: 'Promenade', type: 'promenade', desc: 'Sortez votre animal en toute sécurité avec un promeneur professionnel disponible près de chez vous.' },
    { icon: '🏠', title: 'Garde à domicile', type: 'garde', desc: 'Votre animal reste dans un environnement familier et chaleureux chez un pet sitter de confiance.' },
    { icon: '🏨', title: 'Pension', type: 'pension', desc: 'Un hébergement confortable et sécurisé pour votre compagnon pendant vos absences.' },
    { icon: '🏥', title: 'Visite à domicile', type: 'visite', desc: 'Un professionnel se déplace chez vous pour nourrir, jouer et prendre soin de votre animal.' },
    { icon: '✂️', title: 'Soins & Toilettage', type: 'toilettage', desc: 'Bain, coupe, brossage... votre animal repart propre, beau et heureux !' },
    { icon: '🚗', title: 'Taxi animalier', type: 'taxi', desc: 'Transport sécurisé et adapté pour vos animaux vers le vétérinaire ou ailleurs.' },
];

const ANIMAUX_FICTIFS = [];

export default function Home({ onLogin, onRegister, startPendingBooking }) {
    const [annonces, setAnnonces] = useState([]);
    const [activeTab, setActiveTab] = useState('accueil');
    
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    useEffect(() => { fetchAnnonces(); }, []);

    const fetchAnnonces = async () => {
        try {
            const res = await api.get('/annonces');
            setAnnonces(res.data);
        } catch (err) { console.error(err); }
    };

    const getIcon = (espece) => {
        if (espece === 'chat') return '🐱';
        if (espece === 'chien') return '🐶';
        if (espece === 'oiseau') return '🐦';
        return '🐾';
    };

    const handleReserver = (service = null) => {
        if (startPendingBooking) {
            startPendingBooking({
                type: 'service',
                serviceType: service?.type || null,
                titre: service?.title || null,
            });
        }
        setShowAuthPopup(true);
    };

    const handleAdopter = (annonceId = null) => {
        if (startPendingBooking) {
            startPendingBooking({
                type: 'adoption',
                annonceId: annonceId,
            });
        }
        setShowAuthPopup(true);
    };

    return (
        <div style={{fontFamily: 'sans-serif', background: C.beige, minHeight: '100vh'}}>

            <style>{`
                @media (max-width: 640px) {
                    .landing-nav { padding: 10px 16px !important; }
                    .landing-nav-links { display: none !important; }
                    .landing-auth-btn { padding: 7px 13px !important; font-size: 12px !important; }
                    .landing-logo { height: 38px !important; }

                    .landing-hero { flex-direction: column !important; padding: 28px 18px !important; }
                    .landing-hero-text { padding-right: 0 !important; text-align: center; }
                    .landing-hero-title { font-size: 34px !important; }
                    .landing-hero-actions { justify-content: center !important; flex-wrap: wrap; }
                    .landing-hero-img-wrap { width: 100% !important; height: 260px !important; margin-top: 24px; }

                    .landing-section { padding: 36px 18px !important; }
                    .landing-section-title { font-size: 26px !important; }

                    .landing-footer-row { flex-direction: column !important; text-align: center; gap: 20px !important; }
                    .landing-footer-links { justify-content: center; flex-wrap: wrap; }
                }
            `}</style>

            {/* POPUP AUTH */}
            {showAuthPopup && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                    <div style={{background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'}}>
                        <div style={{fontSize: '60px', marginBottom: '16px'}}>🐾</div>
                        <h3 style={{color: C.brown, fontWeight: '800', fontSize: '22px', marginBottom: '8px'}}>Accès requis</h3>
                        <p style={{color: '#888', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6'}}>
                            Pour réserver un service ou adopter un animal, vous devez être connecté. Ne vous inquiétez pas, on reprendra exactement où vous en étiez !
                        </p>
                        <button onClick={() => { setShowAuthPopup(false); onLogin(); }}
                            style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '12px'}}>
                            🔑 Se connecter
                        </button>
                        <button onClick={() => { setShowAuthPopup(false); onRegister(); }}
                            style={{width: '100%', background: 'white', color: C.primary, border: `2px solid ${C.primary}`, padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '12px'}}>
                            ✨ Créer un compte
                        </button>
                        <button onClick={() => setShowAuthPopup(false)}
                            style={{background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '14px'}}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="landing-nav" style={{background: 'white', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100}}>
                <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" className="landing-logo" style={{height: '50px'}}/>
                <div className="landing-nav-links" style={{display: 'flex', gap: '32px'}}>
                    {[
                        {id: 'accueil', label: 'Accueil'},
                        {id: 'services', label: 'Services'},
                        {id: 'adoption', label: 'Adoption'},
                        {id: 'apropos', label: 'À propos'},
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{color: activeTab === item.id ? C.primary : C.brown, fontWeight: activeTab === item.id ? '700' : '500', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === item.id ? `2px solid ${C.primary}` : 'none', paddingBottom: '4px'}}>
                            {item.label}
                        </button>
                    ))}
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                    <button onClick={onLogin} className="landing-auth-btn" style={{background: 'transparent', border: `1.5px solid ${C.primary}`, color: C.primary, padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'}}>
                        Connexion
                    </button>
                    <button onClick={onRegister} className="landing-auth-btn" style={{background: C.primary, border: 'none', color: 'white', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'}}>
                        S'inscrire
                    </button>
                </div>
            </nav>

            {/* ACCUEIL */}
            {activeTab === 'accueil' && (
                <>
                    <section className="landing-hero" style={{padding: '60px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto'}}>
                        <div className="landing-hero-text" style={{flex: 1, paddingRight: '40px'}}>
                            <div style={{background: C.primary, color: 'white', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', marginBottom: '16px', fontWeight: '600'}}>
                                🐾 Care • Connect • Adopt
                            </div>
                            <h1 className="landing-hero-title" style={{fontSize: '48px', fontWeight: '800', color: C.brown, lineHeight: '1.2', marginBottom: '20px'}}>
                                Le meilleur pour<br/>vos animaux,<br/>
                                <span style={{color: C.primary}}>en un seul endroit</span> ❤️
                            </h1>
                            <p style={{color: '#888', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px', maxWidth: '480px'}}>
                                Trouvez des services de confiance, adoptez un compagnon et rejoignez une communauté qui aime les animaux.
                            </p>
                            <div className="landing-hero-actions" style={{display: 'flex', gap: '16px'}}>
                                <button onClick={() => setActiveTab('services')} style={{background: C.primary, color: 'white', border: 'none', padding: '14px 28px', borderRadius: '30px', cursor: 'pointer', fontWeight: '700', fontSize: '15px'}}>
                                    🐾 Découvrir les services
                                </button>
                                <button onClick={() => setActiveTab('adoption')} style={{background: 'white', color: C.primary, border: `2px solid ${C.primary}`, padding: '14px 28px', borderRadius: '30px', cursor: 'pointer', fontWeight: '700', fontSize: '15px'}}>
                                    ❤️ Adopter un animal
                                </button>
                            </div>
                        </div>
                        <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
                            <div className="landing-hero-img-wrap" style={{width: '420px', height: '380px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(232,117,106,0.2)'}}>
                                <img src="/images/photoacceuil.jpeg" alt="PawNella animaux" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                            </div>
                        </div>
                    </section>

                    <section className="landing-section" style={{background: 'white', padding: '60px 40px'}}>
                        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                            <h2 className="landing-section-title" style={{textAlign: 'center', fontSize: '32px', fontWeight: '800', color: C.brown, marginBottom: '8px'}}>🔍 Trouvez le service idéal</h2>
                            <p style={{textAlign: 'center', color: '#888', marginBottom: '40px'}}>Des professionnels vérifiés près de chez vous</p>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
                                {SERVICES.map((s, i) => (
                                    <div key={i} onClick={() => setActiveTab('services')}
                                        style={{background: C.beige, borderRadius: '20px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s'}}
                                        onMouseEnter={e => e.currentTarget.style.border = `2px solid ${C.primary}`}
                                        onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}
                                    >
                                        <div style={{fontSize: '40px', marginBottom: '12px'}}>{s.icon}</div>
                                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px', fontSize: '15px'}}>{s.title}</h3>
                                        <p style={{color: '#888', fontSize: '13px'}}>{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="landing-section" style={{padding: '60px 40px'}}>
                        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
                                <div>
                                    <h2 className="landing-section-title" style={{fontSize: '32px', fontWeight: '800', color: C.brown, marginBottom: '8px'}}>🐾 Animaux à adopter</h2>
                                    <p style={{color: '#888'}}>Donnez leur une seconde chance</p>
                                </div>
                                <button onClick={() => setActiveTab('adoption')} style={{background: C.primary, color: 'white', border: 'none', padding: '10px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600'}}>
                                    Voir tous →
                                </button>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px'}}>
                                {(annonces.length > 0 ? annonces.slice(0, 4) : ANIMAUX_FICTIFS).map((a, i) => {
                                    const nom = a.animal?.nom || a.nom;
                                    const type = a.animal ? `${a.animal.espece} • ${a.animal.race}` : a.type;
                                    const photo = a.animal?.photo || a.photo;
                                    const icon = a.animal ? getIcon(a.animal.espece) : (a.icon || '🐾');
                                    const ville = a.ville;
                                    return (
                                        <div key={i} style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s'}}
                                            onClick={() => handleAdopter(a.id)}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <div style={{height: '180px', background: '#FFF0EE', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                {photo ? (
                                                    <img src={photo} alt={nom} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                                ) : (
                                                    <span style={{fontSize: '80px'}}>{icon}</span>
                                                )}
                                            </div>
                                            <div style={{padding: '16px'}}>
                                                <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '4px'}}>{nom}</h3>
                                                <p style={{color: '#888', fontSize: '13px', marginBottom: '8px'}}>{type}</p>
                                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                    <span style={{color: '#aaa', fontSize: '12px'}}>📍 {ville}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleAdopter(a.id); }} style={{background: C.primary, color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                                        Adopter ❤️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="landing-section" style={{background: C.brown, padding: '60px 40px'}}>
                        <div style={{maxWidth: '1200px', margin: '0 auto', textAlign: 'center'}}>
                            <h2 className="landing-section-title" style={{fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '8px'}}>Pourquoi choisir PawNella ?</h2>
                            <p style={{color: '#f5c5b5', marginBottom: '40px'}}>Tout ce dont votre animal a besoin</p>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px'}}>
                                {[
                                    {icon: '✅', title: 'Prestataires vérifiés', desc: 'Tous nos prestataires sont vérifiés et notés'},
                                    {icon: '⭐', title: 'Avis de confiance', desc: 'Des milliers d\'avis authentiques'},
                                    {icon: '💬', title: 'Support 7j/7', desc: 'Une équipe disponible pour vous aider'},
                                    {icon: '❤️', title: 'Amour garanti', desc: 'Votre animal est entre de bonnes mains'},
                                ].map((item, i) => (
                                    <div key={i} style={{background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px 20px', textAlign: 'center'}}>
                                        <div style={{fontSize: '40px', marginBottom: '12px'}}>{item.icon}</div>
                                        <h3 style={{color: 'white', fontWeight: '700', marginBottom: '8px'}}>{item.title}</h3>
                                        <p style={{color: '#f5c5b5', fontSize: '13px'}}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="landing-section" style={{background: '#fce4d6', padding: '60px 40px', textAlign: 'center'}}>
                        <div style={{maxWidth: '600px', margin: '0 auto'}}>
                            <div style={{fontSize: '60px', marginBottom: '16px'}}>🐾</div>
                            <h2 className="landing-section-title" style={{fontSize: '36px', fontWeight: '800', color: C.brown, marginBottom: '16px'}}>
                                Prêt à offrir le meilleur à votre compagnon ?
                            </h2>
                            <p style={{color: '#888', marginBottom: '32px', fontSize: '16px'}}>
                                Rejoignez des milliers de propriétaires qui font confiance à PawNella
                            </p>
                            <button onClick={onRegister} style={{background: C.primary, color: 'white', border: 'none', padding: '16px 40px', borderRadius: '30px', cursor: 'pointer', fontWeight: '700', fontSize: '16px'}}>
                                🐾 Commencer maintenant
                            </button>
                        </div>
                    </section>
                </>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
                <section className="landing-section" style={{padding: '60px 40px', maxWidth: '1200px', margin: '0 auto'}}>
                    <h2 className="landing-section-title" style={{fontSize: '32px', fontWeight: '800', color: C.brown, marginBottom: '8px'}}>Nos Services</h2>
                    <p style={{color: '#888', marginBottom: '40px'}}>Des professionnels vérifiés près de chez vous</p>
                   <button onClick={() => {
        if (startPendingBooking) startPendingBooking({ type: 'service' });
        setShowAuthPopup(true);
    }}
    style={{background: C.primary, color: 'white', border: 'none', padding: '14px 28px', borderRadius: '28px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '24px'}}>
    🔧 Proposer un service
</button>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                        {SERVICES.map((s, i) => (
                            <div key={i} style={{background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', gap: '16px', alignItems: 'flex-start'}}>
                                <div style={{fontSize: '40px', flexShrink: 0}}>{s.icon}</div>
                                <div style={{flex: 1}}>
                                    <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '8px'}}>{s.title}</h3>
                                    <p style={{color: '#888', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6'}}>{s.desc}</p>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span style={{color: '#aaa', fontSize: '12px', fontStyle: 'italic'}}>💰 Prix selon prestataire</span>
                                        <button onClick={() => handleReserver(s)} style={{background: C.primary, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>
                                            Réserver
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ADOPTION TAB */}
            {activeTab === 'adoption' && (
                <section className="landing-section" style={{padding: '60px 40px', maxWidth: '1200px', margin: '0 auto'}}>
                    <h2 className="landing-section-title" style={{fontSize: '32px', fontWeight: '800', color: C.brown, marginBottom: '8px'}}>🐾 Animaux à adopter</h2>
                         <p style={{color: '#888', marginBottom: '40px'}}>Trouvez votre compagnon idéal</p>
                    {annonces.filter(a => a.statut === 'active').length === 0 && (
                        <div style={{textAlign: 'center', padding: '48px 0', color: '#aaa'}}>
                            <div style={{fontSize: '56px', marginBottom: '12px'}}>🐾</div>
                            <p style={{fontSize: '15px', color: C.brown, fontWeight: '600'}}>Aucun animal à adopter pour le moment</p>
                            <p style={{fontSize: '13px'}}>Revenez bientôt !</p>
                        </div>
                    )}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px'}}>
                        {annonces.filter(a => a.statut === 'active').map((a, i) => {                            const nom = a.animal?.nom || a.nom;
                            const type = a.animal ? `${a.animal.espece} • ${a.animal.race}` : a.type;
                            const photo = a.animal?.photo || a.photo;
                            const icon = a.animal ? getIcon(a.animal.espece) : (a.icon || '🐾');
                            const ville = a.ville;
                            const desc = a.description || a.desc;
                            return (
                                <div key={i} style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s'}}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{height: '180px', background: '#FFF0EE', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        {photo ? (
                                            <img src={photo} alt={nom} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                        ) : (
                                            <span style={{fontSize: '80px'}}>{icon}</span>
                                        )}
                                    </div>
                                    <div style={{padding: '16px'}}>
                                        <h3 style={{color: C.brown, fontWeight: '700', marginBottom: '4px'}}>{nom}</h3>
                                        <p style={{color: '#888', fontSize: '13px', marginBottom: '8px'}}>{type}</p>
                                        {desc && <p style={{color: '#888', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{desc}</p>}
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <span style={{color: '#aaa', fontSize: '12px'}}>📍 {ville}</span>
                                            <button onClick={() => handleAdopter(a.id)} style={{background: C.primary, color: 'white', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'}}>
                                                Je suis intéressé ❤️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* À PROPOS TAB */}
            {activeTab === 'apropos' && (
                <APropos
                    onRechercherService={() => setActiveTab('services')}
                    onProposerServices={() => onRegister()}
                />
            )}

            {/* FOOTER */}
            <footer style={{background: C.brown, padding: '40px', color: 'white'}}>
                <div className="landing-footer-row" style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
                    <div>
                        <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '40px', marginBottom: '8px'}}/>
                        <p style={{color: '#f5c5b5', fontSize: '13px'}}>Pour leur bonheur, pour notre amour.</p>
                    </div>
                    <div className="landing-footer-links" style={{display: 'flex', gap: '32px'}}>
                        {['Services', 'Adoption', 'À propos', 'Contact'].map(item => (
                            <button key={item} style={{color: '#f5c5b5', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer'}}>{item}</button>
                        ))}
                    </div>
                    <p style={{color: '#f5c5b5', fontSize: '13px'}}>© 2026 PawNella. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}