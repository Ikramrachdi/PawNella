import React, { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
    rose: '#FFF0EE',
};

export default function APropos({ onNavigate, user, onRechercherService, onProposerServices }) {
    const [stats, setStats] = useState(null);
    const [faqOuverte, setFaqOuverte] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/about/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const statCards = [
        { icon: '👥', value: stats ? stats.utilisateurs : '...', label: 'Utilisateurs' },
        { icon: '🐾', value: stats ? stats.prestataires_verifies : '...', label: 'Prestataires vérifiés' },
        { icon: '🐶', value: stats ? stats.animaux : '...', label: 'Animaux inscrits' },
        { icon: '🛠️', value: stats ? stats.services : '...', label: 'Services proposés' },
        { icon: '📅', value: stats ? stats.reservations : '...', label: 'Réservations' },
        { icon: '❤️', value: stats ? stats.animaux_adoptes : '...', label: 'Animaux adoptés' },
        { icon: '📍', value: stats ? stats.villes : '...', label: 'Villes couvertes' },
    ];

    const services = [
        { icon: '🚶', nom: 'Promenade', desc: 'Des balades quotidiennes pour dépenser votre compagnon.' },
        { icon: '🏠', nom: 'Garde à domicile', desc: 'Votre animal gardé dans un environnement familier.' },
        { icon: '🏨', nom: 'Pension', desc: 'Un hébergement confortable pendant vos absences.' },
        { icon: '💉', nom: 'Visite à domicile', desc: 'Un professionnel se déplace jusque chez vous.' },
        { icon: '✂️', nom: 'Toilettage', desc: 'Soins du pelage et hygiène pour un animal rayonnant.' },
        { icon: '🚕', nom: 'Taxi animalier', desc: 'Transport sécurisé vers le vétérinaire ou ailleurs.' },
        { icon: '💊', nom: 'Soins', desc: 'Administration de traitements et suivi de santé.' },
        { icon: '🎓', nom: 'Dressage', desc: 'Éducation et correction du comportement.' },
    ];

    const etapes = [
        { num: '1', icon: '🔍', titre: 'Recherchez', desc: 'Trouvez un prestataire vérifié près de chez vous, filtré par service et par ville.' },
        { num: '2', icon: '📅', titre: 'Réservez', desc: 'Choisissez la date, précisez votre animal et envoyez votre demande en quelques clics.' },
        { num: '3', icon: '💬', titre: 'Échangez', desc: 'Discutez directement avec le prestataire via la messagerie intégrée.' },
        { num: '4', icon: '⭐', titre: 'Évaluez', desc: 'Après la prestation, laissez un avis pour aider toute la communauté.' },
    ];

    const valeurs = [
        { icon: '🛡️', titre: 'Confiance', desc: 'Chaque prestataire est validé par notre équipe avant de proposer ses services.' },
        { icon: '📍', titre: 'Proximité', desc: 'Nous privilégions les mises en relation locales, au plus près de chez vous.' },
        { icon: '🐾', titre: 'Bien-être animal', desc: 'Le confort et la sécurité de votre compagnon sont notre priorité absolue.' },
        { icon: '🤝', titre: 'Transparence', desc: 'Avis vérifiés dans les deux sens, tarifs clairs, aucune mauvaise surprise.' },
    ];

    const securite = [
        { icon: '✅', titre: 'Prestataires validés', desc: 'Aucun prestataire ne peut publier de service sans avoir été vérifié et approuvé par un administrateur.' },
        { icon: '📄', titre: 'Justificatif de propriété', desc: 'Chaque animal inscrit doit être accompagné d\'un carnet de vaccination ou certificat vétérinaire.' },
        { icon: '⭐', titre: 'Avis bidirectionnels', desc: 'Clients et prestataires s\'évaluent mutuellement, pour une communauté de confiance.' },
        { icon: '🔒', titre: 'Données protégées', desc: 'Vos informations personnelles sont sécurisées et ne sont jamais partagées sans votre accord.' },
    ];

    const faq = [
        { q: 'Comment réserver un service ?', r: 'Recherchez un prestataire dans votre ville, choisissez le service souhaité, indiquez votre animal et la date, puis envoyez votre demande. Le prestataire l\'accepte ou la refuse, et vous êtes notifié.' },
        { q: 'Les prestataires sont-ils vérifiés ?', r: 'Oui. Chaque prestataire est examiné et validé manuellement par notre équipe avant de pouvoir proposer ses services sur la plateforme.' },
        { q: 'PawNella réalise-t-elle les services ?', r: 'Non. PawNella est une plateforme de mise en relation : nous connectons les propriétaires et les prestataires et facilitons la communication entre eux. Les services sont fournis directement par les prestataires indépendants.' },
        { q: 'Comment se passe le paiement ?', r: 'Le paiement s\'effectue directement entre vous et le prestataire, selon les modalités convenues ensemble. La plateforme affiche un tarif indicatif pour chaque service.' },
        { q: 'Puis-je adopter un animal ?', r: 'Oui. La section Adoption présente les animaux à adopter près de chez vous. Manifestez votre intérêt et entrez en contact avec la personne qui propose l\'animal.' },
        { q: 'Que faire en cas de problème ?', r: 'Vous pouvez contacter le prestataire via la messagerie, laisser un avis, ou signaler un contenu. Notre équipe reste attentive au bon fonctionnement de la communauté.' },
    ];

    const handleProposerServices = () => {
        if (onProposerServices) { onProposerServices(); return; }
        if (user?.role === 'prestataire') {
            onNavigate && onNavigate('mes-services');
        } else {
            alert('🔧 Pour proposer vos services, créez un compte prestataire depuis la page d\'accueil !');
        }
    };

    const handleRechercherService = () => {
        if (onRechercherService) { onRechercherService(); return; }
        onNavigate && onNavigate('services');
    };

    return (
        <div style={{padding: '24px', maxWidth: '980px', margin: '0 auto'}}>
            <style>{`
                .ap-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .ap-services { display: grid; grid-template-columns: 1fr; gap: 12px; }
                .ap-etapes { display: grid; grid-template-columns: 1fr; gap: 16px; }
                .ap-valeurs { display: grid; grid-template-columns: 1fr; gap: 12px; }
                .ap-secu { display: grid; grid-template-columns: 1fr; gap: 12px; }
                @media (min-width: 640px) {
                    .ap-stats { grid-template-columns: repeat(4, 1fr); }
                    .ap-services { grid-template-columns: repeat(2, 1fr); }
                    .ap-etapes { grid-template-columns: repeat(4, 1fr); }
                    .ap-valeurs { grid-template-columns: repeat(2, 1fr); }
                    .ap-secu { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>

            {/* HERO */}
            <div style={{background: `linear-gradient(135deg, ${C.primary} 0%, #d95f54 100%)`, borderRadius: '24px', padding: '40px 28px', marginBottom: '32px', textAlign: 'center', color: 'white'}}>
                <div style={{fontSize: '48px', marginBottom: '12px'}}>🐾</div>
                <h1 style={{fontSize: '30px', fontWeight: '800', margin: '0 0 10px'}}>PawNella</h1>
                <p style={{fontSize: '15px', fontWeight: '600', opacity: 0.95, margin: '0 0 6px', letterSpacing: '1px'}}>CARE • CONNECT • ADOPT</p>
                <p style={{fontSize: '15px', lineHeight: '1.7', maxWidth: '620px', margin: '16px auto 0', opacity: 0.95}}>
                    La première plateforme marocaine qui connecte les propriétaires d'animaux avec des prestataires de confiance, et facilite l'adoption responsable.
                </p>
            </div>

            {/* MISSION */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '12px'}}>🎯 Notre mission</h2>
                <div style={{background: C.rose, borderRadius: '18px', padding: '24px'}}>
                    <p style={{color: C.brown, fontSize: '15px', lineHeight: '1.8', margin: 0}}>
                        Prendre soin d'un animal ne devrait jamais être une source de stress. Au Maroc, trouver une garde fiable, un toiletteur de confiance ou un transport pour son compagnon relève souvent du parcours du combattant. <strong>PawNella</strong> est née de ce constat : offrir un espace unique, simple et sécurisé où chaque propriétaire trouve le bon prestataire, et où chaque animal en quête de foyer a une chance d'être adopté.
                    </p>
                </div>
            </section>

            {/* NOTRE ENGAGEMENT (mise en relation, pas prestataire) */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '12px'}}>🤝 Notre engagement</h2>
                <div style={{background: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${C.primary}`}}>
                    <p style={{color: C.brown, fontSize: '15px', lineHeight: '1.8', margin: '0 0 14px'}}>
                        <strong>PawNella est une plateforme de mise en relation.</strong> Nous ne réalisons pas les services nous-mêmes : notre rôle est de <strong>connecter</strong> les propriétaires d'animaux avec des prestataires indépendants, et de <strong>faciliter la communication</strong> entre eux en toute confiance.
                    </p>
                    <p style={{color: '#666', fontSize: '14px', lineHeight: '1.7', margin: 0}}>
                        Les prestations (garde, toilettage, transport, etc.) sont assurées directement par les prestataires, qui restent responsables de la qualité de leur travail. PawNella met à disposition les outils — recherche, réservation, messagerie, avis — pour que cette relation se déroule dans les meilleures conditions.
                    </p>
                </div>
            </section>

            {/* STATISTIQUES RÉELLES */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>📊 PawNella en chiffres</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Des données réelles, mises à jour en direct</p>
                <div className="ap-stats">
                    {statCards.map((s, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '20px 12px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize: '30px', marginBottom: '6px'}}>{s.icon}</div>
                            <div style={{fontSize: '26px', fontWeight: '800', color: C.primary, lineHeight: 1}}>{s.value}</div>
                            <div style={{fontSize: '12px', color: '#888', marginTop: '6px', fontWeight: '600'}}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* NOS SERVICES */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>🛠️ Nos services</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Tout ce dont votre animal a besoin, au même endroit</p>
                <div className="ap-services">
                    {services.map((s, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize: '28px', flexShrink: 0}}>{s.icon}</div>
                            <div>
                                <h3 style={{fontSize: '15px', fontWeight: '700', color: C.brown, margin: '0 0 4px'}}>{s.nom}</h3>
                                <p style={{fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.5'}}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* COMMENT ÇA MARCHE */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>⚙️ Comment ça marche ?</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Réserver un service en 4 étapes simples</p>
                <div className="ap-etapes">
                    {etapes.map((e, i) => (
                        <div key={i} style={{background: C.beige, borderRadius: '16px', padding: '20px 16px', textAlign: 'center'}}>
                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: C.primary, color: 'white', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'}}>{e.num}</div>
                            <div style={{fontSize: '28px', marginBottom: '8px'}}>{e.icon}</div>
                            <h3 style={{fontSize: '15px', fontWeight: '700', color: C.brown, margin: '0 0 6px'}}>{e.titre}</h3>
                            <p style={{fontSize: '12px', color: '#888', margin: 0, lineHeight: '1.5'}}>{e.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SÉCURITÉ & CONFIANCE */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>🔒 Sécurité & confiance</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Une plateforme pensée pour vous rassurer</p>
                <div className="ap-secu">
                    {securite.map((s, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: '14px', alignItems: 'flex-start'}}>
                            <div style={{fontSize: '26px', flexShrink: 0}}>{s.icon}</div>
                            <div>
                                <h3 style={{fontSize: '15px', fontWeight: '700', color: C.brown, margin: '0 0 5px'}}>{s.titre}</h3>
                                <p style={{fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.6'}}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* NOS VALEURS */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>💛 Nos valeurs</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Ce qui nous guide chaque jour</p>
                <div className="ap-valeurs">
                    {valeurs.map((v, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize: '30px', marginBottom: '8px'}}>{v.icon}</div>
                            <h3 style={{fontSize: '16px', fontWeight: '700', color: C.brown, margin: '0 0 6px'}}>{v.titre}</h3>
                            <p style={{fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.6'}}>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section style={{marginBottom: '36px'}}>
                <h2 style={{fontSize: '22px', fontWeight: '800', color: C.brown, marginBottom: '4px'}}>❓ Questions fréquentes</h2>
                <p style={{color: '#888', fontSize: '14px', marginBottom: '18px'}}>Tout ce que vous devez savoir</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {faq.map((item, i) => (
                        <div key={i} style={{background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                            <button onClick={() => setFaqOuverte(faqOuverte === i ? null : i)}
                                style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
                                <span style={{fontSize: '15px', fontWeight: '700', color: C.brown}}>{item.q}</span>
                                <span style={{fontSize: '18px', color: C.primary, flexShrink: 0, transform: faqOuverte === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s'}}>+</span>
                            </button>
                            {faqOuverte === i && (
                                <div style={{padding: '0 20px 18px'}}>
                                    <p style={{fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.7'}}>{item.r}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* APPEL À L'ACTION */}
            <section style={{background: C.brown, borderRadius: '24px', padding: '36px 28px', textAlign: 'center', color: 'white'}}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🐾</div>
                <h2 style={{fontSize: '24px', fontWeight: '800', margin: '0 0 8px'}}>Rejoignez la communauté PawNella</h2>
                <p style={{fontSize: '14px', opacity: 0.9, margin: '0 0 24px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6'}}>
                    Que vous cherchiez un service pour votre compagnon ou que vous souhaitiez proposer vos talents, votre place est ici.
                </p>
                <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <button onClick={handleRechercherService}
                        style={{background: C.primary, color: 'white', border: 'none', padding: '14px 28px', borderRadius: '30px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                        🔍 Trouver un service
                    </button>
                    <button onClick={handleProposerServices}
                        style={{background: 'white', color: C.brown, border: 'none', padding: '14px 28px', borderRadius: '30px', fontWeight: '700', fontSize: '15px', cursor: 'pointer'}}>
                        🛠️ Proposer mes services
                    </button>
                </div>
            </section>

            {/* PIED */}
            <p style={{textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '32px'}}>
                PawNella — Pour leur bonheur, pour notre amour. 🐾
            </p>
        </div>
    );
}