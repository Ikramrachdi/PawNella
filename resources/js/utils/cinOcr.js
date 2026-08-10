import { createWorker } from 'tesseract.js';

// Normalise un texte pour la comparaison :
// majuscules, sans accents, sans ponctuation, espaces simples
function normaliser(txt) {
    return String(txt || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // enlève les accents
        .replace(/[^A-Z\s]/g, ' ')          // garde uniquement les lettres
        .replace(/\s+/g, ' ')
        .trim();
}

// Distance de Levenshtein (tolère les fautes de lecture de l'OCR)
function distance(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) {
            const cout = a[i - 1] === b[j - 1] ? 0 : 1;
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cout);
        }
        prev = cur;
    }
    return prev[n];
}

// Un mot est "trouvé" si un mot du texte OCR lui ressemble suffisamment
function motTrouve(mot, motsTexte) {
    if (mot.length < 3) return true; // trop court pour être fiable, on ignore

    // Tolérance : 1 faute pour 4 caractères, minimum 1
    const tolerance = Math.max(1, Math.floor(mot.length / 4));

    return motsTexte.some(m => {
        if (m === mot) return true;
        if (Math.abs(m.length - mot.length) > tolerance) return false;
        return distance(m, mot) <= tolerance;
    });
}

/**
 * Lit le texte d'une image de CIN et vérifie que le nom saisi y figure.
 *
 * @param {string} imageUrl  URL ou base64 de l'image du CIN recto
 * @param {string} nom       Nom saisi par l'utilisateur
 * @param {string} prenom    Prénom saisi par l'utilisateur
 * @returns {Promise<{statut:'valide'|'incoherent'|'illisible', message:string, texteLu:string}>}
 */
export async function verifierNomSurCin(imageUrl, nom, prenom) {
    let worker;
    try {
        worker = await createWorker('fra');
        const { data } = await worker.recognize(imageUrl);
        await worker.terminate();
        worker = null;

        const texteLu = data?.text || '';
        console.log('=== OCR CIN texte lu ===\n', texteLu);
        const texteNorm = normaliser(texteLu);

        // Trop peu de texte exploitable : image floue, sombre, ou mal cadrée
        if (texteNorm.replace(/\s/g, '').length < 15) {
            return {
                statut: 'illisible',
                message: "Le texte de la carte n'a pas pu être lu automatiquement. Votre dossier sera vérifié manuellement par notre équipe.",
                texteLu,
            };
        }

        const motsTexte = texteNorm.split(' ').filter(m => m.length >= 3);

        const motsNom = normaliser(nom).split(' ').filter(m => m.length >= 3);
        const motsPrenom = normaliser(prenom).split(' ').filter(m => m.length >= 3);

        const nomOk = motsNom.length === 0 || motsNom.every(m => motTrouve(m, motsTexte));
        const prenomOk = motsPrenom.length === 0 || motsPrenom.every(m => motTrouve(m, motsTexte));

        if (nomOk && prenomOk) {
            return {
                statut: 'valide',
                message: 'Nom et prénom confirmés sur la carte d\'identité.',
                texteLu,
            };
        }

        // Un des deux manque : on précise lequel
        let quoi;
        if (!nomOk && !prenomOk) quoi = 'Le nom et le prénom saisis ne correspondent pas';
        else if (!nomOk) quoi = 'Le nom saisi ne correspond pas';
        else quoi = 'Le prénom saisi ne correspond pas';

        return {
            statut: 'incoherent',
            message: `${quoi} à ceux lus sur la carte d'identité. Vérifiez votre saisie ou reprenez la photo. Si l'information est correcte, votre dossier sera vérifié manuellement.`,
            texteLu,
        };

    } catch (err) {
        console.error('Erreur OCR CIN :', err);
        if (worker) { try { await worker.terminate(); } catch (e) {} }
        return {
            statut: 'illisible',
            message: "La vérification automatique n'a pas pu aboutir. Votre dossier sera vérifié manuellement par notre équipe.",
            texteLu: '',
        };
    }
}