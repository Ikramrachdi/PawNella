import React, { useState } from 'react';
import CityInput from './CityInput';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function LocationPopup({ onConfirm, onClose, title = "Où êtes-vous ?" }) {
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const useMyLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || '';
                    setLocation(city);
                } catch (err) {
                    console.error(err);
                }
                setLoading(false);
            }, () => {
                alert('Impossible d\'accéder à votre position');
                setLoading(false);
            });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '32px',
                maxWidth: '420px', width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <div style={{fontSize: '48px', marginBottom: '12px'}}>📍</div>
                    <h3 style={{fontSize: '20px', fontWeight: '800', color: C.brown, marginBottom: '8px'}}>{title}</h3>
                    <p style={{color: '#888', fontSize: '14px', lineHeight: '1.6'}}>
                        Indiquez votre localisation pour afficher les résultats près de chez vous.
                    </p>
                </div>

                <div style={{marginBottom: '16px'}}>
                    <CityInput
                        value={location}
                        onChange={setLocation}
                        placeholder="Ex: Fès, Maroc"
                    />
                </div>

                <button onClick={useMyLocation} disabled={loading}
                    style={{width: '100%', background: C.beige, color: C.brown, border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px', fontSize: '14px'}}>
                    {loading ? '⏳ Localisation...' : '📍 Utiliser ma position actuelle'}
                </button>

                <button
                    onClick={() => { if (location.length >= 3) onConfirm(location); else alert('Veuillez entrer une ville valide'); }}
                    style={{width: '100%', background: C.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginBottom: '12px'}}>
                    Confirmer
                </button>

                <button onClick={onClose}
                    style={{width: '100%', background: 'transparent', color: '#aaa', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px'}}>
                    Continuer sans localisation
                </button>
            </div>
        </div>
    );
}