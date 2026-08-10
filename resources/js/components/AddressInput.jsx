import React, { useState, useEffect, useRef } from 'react';
import { validateAdresse } from '../utils/validation';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function AddressInput({ value, onChange, placeholder, error }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const timeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchAddress = async (searchQuery) => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ma&limit=5&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Erreur recherche adresse:', error);
            setSuggestions([]);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        setGeoError('');
        onChange(newValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            searchAddress(newValue);
        }, 500);
    };

    const handleSelectSuggestion = (suggestion) => {
        const address = suggestion.display_name;
        setQuery(address);
        onChange(address);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Construit une adresse lisible depuis la réponse Nominatim
    const formatAddress = (address) => {
        if (!address) return '';
        const parts = [
            address.house_number,
            address.road,
            address.neighbourhood || address.suburb,
            address.city || address.town || address.village || address.municipality,
        ].filter(Boolean);
        return parts.join(', ');
    };

    // Géolocalisation au clic sur le repère
    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setGeoError('Géolocalisation non supportée par votre navigateur');
            return;
        }
        setGeoLoading(true);
        setGeoError('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=fr`
                    );
                    const data = await res.json();
                    const address = formatAddress(data.address) ||
                        data.display_name?.split(',').slice(0, 3).join(',').trim() || '';
                    setQuery(address);
                    onChange(address);
                    setShowSuggestions(false);
                    setSuggestions([]);
                } catch (err) {
                    console.error(err);
                    setGeoError('Impossible de déterminer votre adresse');
                }
                setGeoLoading(false);
            },
            (err) => {
                console.error(err);
                setGeoLoading(false);
                if (err.code === 1) setGeoError('Accès à la position refusé');
                else setGeoError('Position indisponible');
            }
        );
    };

    const isValid = query && validateAdresse(query);

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder || 'Ex: 15 Rue Mohammed V, Rabat'}
                    style={{
                        width: '100%',
                        border: error ? '1.5px solid #f44336' : (isValid ? '1.5px solid #4caf50' : '1.5px solid #e0d5d0'),
                        borderRadius: '10px',
                        padding: '10px 44px 10px 16px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border 0.2s'
                    }}
                />
                {/* Repère cliquable : géolocalisation */}
                <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    title="Utiliser ma position actuelle"
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: geoLoading ? 'wait' : 'pointer',
                        fontSize: '20px',
                        padding: '4px',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {geoLoading ? '⏳' : (loading ? '🔍' : '📍')}
                </button>
            </div>

            {geoError && (
                <p style={{ color: '#f44336', fontSize: '12px', margin: '6px 0 0' }}>⚠️ {geoError}</p>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    marginTop: '4px',
                    zIndex: 1000,
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: index < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',
                                fontSize: '13px',
                                color: C.brown,
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.beige}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            📍 {suggestion.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}