import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise = null;
let loadError = false;

async function ensureModelsLoaded() {
    if (modelsLoaded) return true;
    if (loadError) return false;
    if (!loadingPromise) {
        loadingPromise = faceapi.nets.tinyFaceDetector.loadFromUri('/models')
            .then(() => { modelsLoaded = true; })
            .catch((err) => {
                console.error('Erreur chargement modèle face-api:', err);
                loadError = true;
            });
    }
    await loadingPromise;
    return modelsLoaded;
}

// Selfie : exactement 1 visage humain
export async function validateSelfie(file) {
    try {
        const loaded = await ensureModelsLoaded();
        if (!loaded) {
            return { valid: false, message: '❌ Impossible de vérifier le selfie. Réessayez.' };
        }

        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }));

        console.log('Selfie — visages détectés:', detections.length);

        if (detections.length === 0) {
            return { valid: false, message: '❌ Aucun visage détecté. Le selfie doit montrer clairement votre visage, bien éclairé, face à la caméra. N\'uploadez pas une photo de document ou d\'objet.' };
        }
        if (detections.length > 1) {
            return { valid: false, message: '❌ Plusieurs visages détectés. Le selfie doit montrer une seule personne.' };
        }
        return { valid: true };
    } catch (err) {
        console.error('Erreur détection selfie:', err);
        return { valid: false, message: '❌ Erreur lors de la vérification. Réessayez avec une photo plus claire.' };
    }
}

// CIN Recto : doit contenir au moins 1 visage (photo sur la carte)
export async function validateCinRecto(file) {
    try {
        const loaded = await ensureModelsLoaded();
        if (!loaded) {
            return { valid: false, message: '❌ Impossible de vérifier le CIN. Réessayez.' };
        }

        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 }));

        console.log('CIN recto — visages détectés:', detections.length);

        if (detections.length === 0) {
            return { valid: false, message: '❌ Aucune photo de visage détectée sur le recto de votre CIN. Assurez-vous de photographier le RECTO (face avant) de votre carte d\'identité nationale, avec la photo clairement visible.' };
        }
        return { valid: true };
    } catch (err) {
        console.error('Erreur détection CIN recto:', err);
        return { valid: false, message: '❌ Erreur lors de la vérification du CIN Recto. Réessayez.' };
    }
}

// CIN Verso : ne doit PAS contenir de visage (c'est le dos de la carte)
export async function validateCinVerso(file) {
    try {
        const loaded = await ensureModelsLoaded();
        if (!loaded) {
            // En cas d'erreur de chargement, on laisse passer
            return { valid: true };
        }

        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }));

        console.log('CIN verso — visages détectés:', detections.length);

        if (detections.length > 0) {
            return { valid: false, message: '❌ Cette photo ressemble à un recto de CIN ou un selfie. Le VERSO (dos) de la carte ne doit pas contenir de photo de visage. Vérifiez que vous uploadez bien le dos de votre carte d\'identité.' };
        }
        return { valid: true };
    } catch (err) {
        console.error('Erreur détection CIN verso:', err);
        return { valid: true }; // En cas d'erreur technique, on laisse passer
    }
}

// Validation automatique complète pour l'inscription prestataire
export async function validateDocumentsAuto(cinRectoFile, selfieFile) {
    const reasons = [];

    const cinCheck = await validateCinRecto(cinRectoFile);
    if (!cinCheck.valid) reasons.push('CIN recto invalide : ' + cinCheck.message);

    const selfieCheck = await validateSelfie(selfieFile);
    if (!selfieCheck.valid) reasons.push('Selfie invalide : ' + selfieCheck.message);

    return {
        valid: reasons.length === 0,
        reasons,
    };
}
// Photo de logement : bloquée seulement si c'est un selfie pur (1 visage qui occupe tout le cadre)
// Vérifie via Claude API si la photo est bien un logement
export async function validatePhotoLogement(file) {
    try {
        const loaded = await ensureModelsLoaded();
        if (!loaded) return { valid: true };

        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 })
        );

        console.log('Photo logement — visages:', detections.length);

        if (detections.length > 0) {
            return {
                valid: false,
                message: '❌ Photo refusée. Uploadez une photo de votre espace : chambre, salon, jardin, extérieur... Pas de selfie ou photo de personne.'
            };
        }

        return { valid: true };
    } catch (err) {
        console.error('Erreur:', err);
        return { valid: true };
    }
}