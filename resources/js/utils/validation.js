export function validatePhone(phone, countryCode) {
    if (!phone) return false;
    const cleaned = phone.replace(/\s/g, '');

    if (countryCode === 'MA') {
        return /^(0[5-7][0-9]{8})$/.test(cleaned) || /^(\+212[5-7][0-9]{8})$/.test(cleaned);
    }

    const genericRegex = /^\+?[0-9]{6,15}$/;
    return genericRegex.test(cleaned);
}

export function validateEmail(email) {
    if (!email) return false;
    const trimmed = email.trim();

    // Syntaxe générale
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!emailRegex.test(trimmed)) return false;

    // Extraire la partie après @
    const atIndex = trimmed.lastIndexOf('@');
    const domainPart = trimmed.substring(atIndex + 1); // ex: gmail.com

    const dotIndex = domainPart.indexOf('.');
    if (dotIndex === -1) return false;

    // Partie entre @ et le premier point (ex: "gmail") doit avoir min 2 lettres
    const beforeDot = domainPart.substring(0, dotIndex);
    if (beforeDot.length < 2) return false;

    // Extension après le dernier point (ex: "com", "ma") : min 2 lettres
    const lastDotIndex = domainPart.lastIndexOf('.');
    const extension = domainPart.substring(lastDotIndex + 1);
    if (extension.length < 2) return false;

    return true;
}

export function validatePassword(password) {
    if (!password) return false;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
}

export const passwordHint = "8 caractères min., avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (ex: !@#$%).";

export const PRIX_MIN_PAR_TYPE = {
    promenade: { min: 30, label: '30 DH / 30min' },
    garde: { min: 80, label: '80 DH / jour' },
    pension: { min: 100, label: '100 DH / nuit' },
    visite: { min: 50, label: '50 DH / visite' },
    toilettage: { min: 60, label: '60 DH / séance' },
    taxi: { min: 40, label: '40 DH / trajet' },
    soins: { min: 50, label: '50 DH / séance' },
    dressage: { min: 80, label: '80 DH / séance' },
};

export function validateTarif(tarif, type) {
    const val = parseFloat(tarif);
    if (isNaN(val) || val <= 0) return { valid: false, message: 'Le prix doit être supérieur à 0' };
    const min = PRIX_MIN_PAR_TYPE[type]?.min;
    if (min && val < min) {
        return { valid: false, message: `Prix minimum pour ce service : ${PRIX_MIN_PAR_TYPE[type].label}` };
    }
    return { valid: true };
}

// Validation simple : min 3 lettres, pas de chiffres seuls, pas de caractères spéciaux
export function validateVille(ville) {
    if (!ville) return false;
    const trimmed = ville.trim();
    if (trimmed.length < 3) return false;
    // Doit contenir au moins 2 lettres
    const lettres = trimmed.match(/[a-zA-ZÀ-ÿ]/g);
    if (!lettres || lettres.length < 2) return false;
    // Pas que des chiffres
    if (/^\d+$/.test(trimmed)) return false;
    return true;
}

export function validateAdresse(adresse) {
    if (!adresse) return true; // adresse optionnelle
    const trimmed = adresse.trim();
    if (trimmed.length < 5) return false;
    const lettres = trimmed.match(/[a-zA-ZÀ-ÿ]/g);
    if (!lettres || lettres.length < 3) return false;
    return true;
}

// ---------- DATES & HEURES ----------
// Règle générale : aucune date/heure déjà passée n'est acceptée.

// Date du jour au format YYYY-MM-DD (pour l'attribut min des <input type="date">)
export function dateMinToday() {
    const d = new Date();
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const jour = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mois}-${jour}`;
}

// Heure minimale autorisée pour une date donnée.
// Si la date est aujourd'hui -> heure actuelle (+ marge). Sinon -> '00:00'
export function heureMinPourDate(dateStr, margeMinutes = 30) {
    if (dateStr !== dateMinToday()) return '00:00';
    const d = new Date(Date.now() + margeMinutes * 60000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

// Valide un couple date + heure.
// Retourne { valid: bool, message: string }
export function validateDateHeure(dateStr, heureStr, margeMinutes = 30) {
    if (!dateStr) return { valid: false, message: 'Veuillez choisir une date' };
    if (!heureStr) return { valid: false, message: 'Veuillez choisir une heure' };

    const choisi = new Date(`${dateStr}T${heureStr}`);
    if (isNaN(choisi.getTime())) {
        return { valid: false, message: 'Date ou heure invalide' };
    }

    const limite = new Date(Date.now() + margeMinutes * 60000);

    if (choisi < new Date()) {
        return { valid: false, message: 'Cette date/heure est déjà passée' };
    }
    if (choisi < limite) {
        return { valid: false, message: `Veuillez réserver au moins ${margeMinutes} minutes à l'avance` };
    }
    return { valid: true, message: '' };
}
// Nom / prénom : lettres uniquement (accents, espaces, tirets, apostrophes), pas de chiffres
export function validateNom(nom) {
    if (!nom) return false;
    const trimmed = nom.trim();
    if (trimmed.length < 2) return false;
    // Refuse tout ce qui contient un chiffre ou un caractère spécial
    return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed);
}