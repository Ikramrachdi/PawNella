import api from './api';

// Demander la permission des notifications
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
};

// Envoyer une notification navigateur
export const sendBrowserNotif = (title, body, icon = '/images/logo_PAWNELLA.jpeg') => {
    if (Notification.permission === 'granted') {
        const notif = new Notification(title, { body, icon });
        notif.onclick = () => window.focus();
    }
};

// Créer une notification en base de données
export const createNotification = async (destinataire_id, type, message) => {
    try {
        await api.post('/notifications', { destinataire_id, type, message });
    } catch (err) {
        console.error(err);
    }
};

// Alertes spécifiques
export const alertes = {

    // Quand un adoptant soumet une candidature
    candidatureSoumise: async (proprietaireId, animalNom) => {
        await createNotification(
            proprietaireId,
            'adoption',
            `❤️ Nouvelle demande d'adoption pour ${animalNom} !`
        );
        sendBrowserNotif(
            'Nouvelle candidature !',
            `Quelqu'un est intéressé par ${animalNom}`
        );
    },

    // Quand une candidature est acceptée
    candidatureAcceptee: async (adoptantId, animalNom) => {
        await createNotification(
            adoptantId,
            'adoption',
            `🎉 Votre demande d'adoption pour ${animalNom} a été acceptée !`
        );
        sendBrowserNotif(
            'Adoption acceptée ! 🎉',
            `Votre demande pour ${animalNom} est acceptée`
        );
    },

    // Quand une candidature est refusée
    candidatureRefusee: async (adoptantId, animalNom) => {
        await createNotification(
            adoptantId,
            'adoption',
            `😔 Votre demande d'adoption pour ${animalNom} a été refusée.`
        );
    },

    // Quand une réservation est reçue (prestataire)
    reservationRecue: async (prestataireId, typeService) => {
        await createNotification(
            prestataireId,
            'reservation',
            `📅 Nouvelle réservation pour : ${typeService}`
        );
        sendBrowserNotif(
            'Nouvelle réservation !',
            `Vous avez une demande de ${typeService}`
        );
    },

    // Quand une réservation est confirmée (client)
    reservationConfirmee: async (clientId, typeService, prestataireNom) => {
        await createNotification(
            clientId,
            'reservation',
            `✅ Votre réservation "${typeService}" avec ${prestataireNom} est confirmée !`
        );
        sendBrowserNotif(
            'Réservation confirmée ! ✅',
            `${typeService} avec ${prestataireNom}`
        );
    },

    // Quand une réservation est refusée (client)
    reservationRefusee: async (clientId, typeService) => {
        await createNotification(
            clientId,
            'reservation',
            `❌ Votre réservation "${typeService}" a été refusée.`
        );
        sendBrowserNotif(
            'Réservation refusée',
            `Votre demande de ${typeService} n'a pas été acceptée`
        );
    },

    // Quand un nouveau message est reçu
    nouveauMessage: async (destinataireId, expediteurNom) => {
        await createNotification(
            destinataireId,
            'message',
            `💬 Nouveau message de ${expediteurNom}`
        );
        sendBrowserNotif(
            `Message de ${expediteurNom}`,
            'Vous avez un nouveau message'
        );
    },

    // Quand un animal est mis à jour
    animalMisAJour: async (userId, animalNom) => {
        await createNotification(
            userId,
            'animal',
            `🐾 Le profil de ${animalNom} a été mis à jour`
        );
    },

    // Quand un prestataire est validé par admin
    prestataireValide: async (prestataireId) => {
        await createNotification(
            prestataireId,
            'validation',
            `✅ Votre compte prestataire a été validé ! Vous êtes maintenant visible.`
        );
        sendBrowserNotif(
            'Compte validé ! 🎉',
            'Votre profil prestataire est maintenant en ligne'
        );
    },

    // Quand une nouvelle annonce est publiée (pour les adoptants)
    nouvelleAnnonce: async (adoptantId, animalNom, ville) => {
        await createNotification(
            adoptantId,
            'adoption',
            `🐾 Nouvel animal à adopter près de chez vous : ${animalNom} à ${ville}`
        );
        sendBrowserNotif(
            'Nouvel animal à adopter !',
            `${animalNom} cherche une famille à ${ville}`
        );
    },

    // Rappel événement
    rappelEvenement: async (userId, titreEvenement, date) => {
        await createNotification(
            userId,
            'evenement',
            `🎉 Rappel : "${titreEvenement}" est demain !`
        );
        sendBrowserNotif(
            'Rappel événement 🎉',
            `${titreEvenement} - ${date}`
        );
    },
};

export default alertes;