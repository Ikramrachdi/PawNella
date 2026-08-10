import React, { useState } from 'react';
import api from '../services/api';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function PhotoUpload({ onUpload, multiple = false, label = "Photo", maxPhotos = 6, validateFile = null, validatingLabel = "Vérification..." }) {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (multiple && files.length + photos.length > maxPhotos) {
            setError(`❌ Maximum ${maxPhotos} photos !`);
            return;
        }

        setError('');

        if (validateFile) {
            setValidating(true);
            try {
                for (const file of files) {
                    const result = await validateFile(file);
                    if (!result.valid) {
                        setError(result.message || '❌ Fichier invalide');
                        setValidating(false);
                        return;
                    }
                }
            } catch (err) {
                console.error(err);
                setError('❌ Erreur lors de la vérification du fichier');
                setValidating(false);
                return;
            }
            setValidating(false);
        }

        setLoading(true);

        try {
            if (multiple) {
                const formData = new FormData();
                files.forEach(file => formData.append('photos[]', file));

                const res = await api.post('/upload-multiple', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newPhotos = [...photos, ...res.data.urls];
                setPhotos(newPhotos);
                onUpload(newPhotos);
            } else {
                const formData = new FormData();
                formData.append('photo', files[0]);

                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setPhotos([res.data.url]);
                onUpload(res.data.url);
            }
        } catch (err) {
            setError('❌ Erreur lors de l\'upload. Réessayez.');
            console.error(err);
        }
        setLoading(false);
    };

    const removePhoto = (index) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        onUpload(multiple ? newPhotos : '');
    };

    const isBusy = loading || validating;

    return (
        <div>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>
                📸 {label}
            </label>

            {error && (
                <p style={{color: C.primary, fontSize: '13px', marginBottom: '8px'}}>{error}</p>
            )}

            <div style={{border: '2px dashed #e0d5d0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: isBusy ? '#f5f5f5' : C.beige, transition: 'all 0.2s'}}
                onClick={() => !isBusy && document.getElementById(`upload-${label}`).click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e0d5d0'}
            >
                {isBusy ? (
                    <div>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>⏳</div>
                        <p style={{color: '#888', fontSize: '14px', margin: 0}}>{validating ? validatingLabel : 'Upload en cours...'}</p>
                    </div>
                ) : (
                    <div>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>📷</div>
                        <p style={{color: '#888', fontSize: '14px', margin: '0 0 4px'}}>
                            {multiple ? `Ajouter des photos (max ${maxPhotos})` : 'Ajouter une photo'}
                        </p>
                        <p style={{color: '#aaa', fontSize: '12px', margin: 0}}>JPG, PNG — max 5MB</p>
                    </div>
                )}
                <input
                    id={`upload-${label}`}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    style={{display: 'none'}}
                    onChange={handleUpload}
                />
            </div>

            {photos.length > 0 && (
                <div style={{display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap'}}>
                    {photos.map((url, i) => (
                        <div key={i} style={{position: 'relative'}}>
                            <img
                                src={url}
                                alt=""
                                style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: `2px solid ${C.primary}`}}
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                style={{position: 'absolute', top: '-8px', right: '-8px', background: C.primary, color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'}}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {multiple && photos.length < maxPhotos && (
                        <div
                            onClick={() => document.getElementById(`upload-${label}`).click()}
                            style={{width: '80px', height: '80px', border: '2px dashed #e0d5d0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '24px', color: '#aaa'}}
                        >
                            +
                        </div>
                    )}
                </div>
            )}

            {photos.length > 0 && (
                <p style={{color: '#4caf50', fontSize: '13px', marginTop: '8px', fontWeight: '600'}}>
                    ✅ {photos.length} photo(s) uploadée(s) avec succès
                </p>
            )}
        </div>
    );
}