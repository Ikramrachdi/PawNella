// Calcul de la distance/durée routière (OSRM) et du prix du taxi animalier

const PRIX_PAR_KM = 7;     // DH par km
const PRIX_MINIMUM = 30;   // DH minimum

// Distance routière (km) + durée (min) via OSRM, prix ajusté selon l'espèce
export async function calculerTrajetTaxi(departLat, departLon, arriveeLat, arriveeLon, espece = 'chien') {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${departLon},${departLat};${arriveeLon},${arriveeLat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            return { ok: false, message: 'Impossible de calculer l\'itinéraire' };
        }

        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        const dureeMin = Math.round(route.duration / 60);

        // Supplément selon l'espèce (petits animaux = normal, gros = plus cher)
        const multiplicateurs = {
            chat: 1, oiseau: 1, hamster: 1, cochon_dinde: 1, poisson: 1,
            lapin: 1.1, tortue: 1.1, reptile: 1.1,
            chien: 1.2,
            cheval: 2,      // transport spécial
        };
        const mult = multiplicateurs[espece] || 1.2;

        const prix = Math.max(PRIX_MINIMUM, Math.round(distanceKm * PRIX_PAR_KM * mult));

        return {
            ok: true,
            distance: Math.round(distanceKm * 10) / 10,
            duree: dureeMin,
            prix,
            espece,
        };
    } catch (err) {
        console.error('Erreur calcul trajet taxi:', err);
        return { ok: false, message: 'Erreur réseau lors du calcul de l\'itinéraire' };
    }
}

// Convertit une adresse texte en coordonnées GPS (via Nominatim)
async function geocoder(adresse) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ma&q=${encodeURIComponent(adresse)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

export async function calculerTrajetDepuisAdresses(adresseDepart, adresseArrivee, espece = 'chien') {
    try {
        const depart = await geocoder(adresseDepart);
        const arrivee = await geocoder(adresseArrivee);

        if (!depart || !arrivee) {
            return { ok: false, message: 'Adresse introuvable. Précisez davantage.' };
        }

        return await calculerTrajetTaxi(depart.lat, depart.lon, arrivee.lat, arrivee.lon, espece);
    } catch (err) {
        console.error('Erreur trajet taxi:', err);
        return { ok: false, message: 'Erreur lors du calcul du trajet' };
    }
}