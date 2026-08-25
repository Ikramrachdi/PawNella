import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

let modelPromise = null;

// Charge le modèle une seule fois. On laisse TensorFlow choisir son backend
// tout seul (ne pas forcer webgl : conflit avec face-api.js).
function getModel() {
    if (!modelPromise) {
        modelPromise = mobilenet.load({ version: 2, alpha: 1.0 });
    }
    return modelPromise;
}
  // Lance le chargement du modèle en avance (au démarrage de l'app)
export function prechargerModele() {
    getModel().catch(e => console.warn('Préchargement modèle animal échoué (non bloquant):', e));
}
// Mots-clés MobileNet regroupés par espèce.
// MobileNet renvoie des labels précis (ex: "golden retriever", "tabby cat")
// qu'on rattache à une espèce générale.
const MOTS_CLES = {
    chien: ['dog', 'puppy', 'retriever', 'terrier', 'spaniel', 'poodle', 'hound', 'bulldog', 'boxer', 'chihuahua', 'husky', 'shepherd', 'collie', 'rottweiler', 'dalmatian', 'pug', 'beagle', 'doberman', 'setter', 'mastiff', 'corgi', 'dachshund', 'pekinese', 'pomeranian', 'schnauzer', 'greyhound', 'whippet', 'malamute', 'samoyed'],
    chat: ['cat', 'kitten', 'tabby', 'siamese', 'persian cat', 'egyptian cat', 'tiger cat', 'lynx'],
    oiseau: ['bird', 'parrot', 'macaw', 'cockatoo', 'parakeet', 'canary', 'finch', 'lorikeet', 'budgerigar', 'bee eater', 'jay', 'magpie', 'chickadee', 'sparrow', 'toucan', 'hornbill'],
    lapin: ['rabbit', 'bunny', 'hare', 'wood rabbit', 'angora'],
    hamster: ['hamster', 'guinea pig', 'mouse', 'rodent', 'gerbil'],
    cochon_dinde: ['guinea pig', 'hamster', 'rodent'],
    tortue: ['turtle', 'tortoise', 'terrapin', 'loggerhead'],
    poisson: ['fish', 'goldfish', 'anemone fish', 'puffer', 'tench', 'eel'],
    reptile: ['lizard', 'gecko', 'iguana', 'chameleon', 'snake', 'agama', 'reptile', 'frilled lizard', 'komodo'],
    autre: ['ferret', 'weasel', 'horse', 'pony', 'goat', 'sheep', 'pig', 'hog', 'boar', 'ox', 'cow', 'cattle', 'bull', 'donkey', 'llama', 'camel', 'hedgehog', 'chinchilla', 'squirrel', 'raccoon', 'otter', 'monkey', 'ape', 'hen', 'chicken', 'cock', 'rooster', 'duck', 'goose', 'turkey', 'peacock', 'animal', 'mammal'],};

// Espèces bien reconnues par le modèle → on peut être strict
const ESPECES_FIABLES = ['chien', 'chat', 'oiseau', 'lapin'];

/**
 * Vérifie qu'une image correspond à l'espèce attendue.
 * @param {HTMLImageElement|string} imageSource  élément <img> ou URL/base64
 * @param {string} espece  espèce attendue (chien, chat, ...)
 * @returns {Promise<{ok:boolean, statut:'valide'|'incoherent'|'incertain', message:string, detecte:string}>}
 */
export async function verifierPhotoAnimal(imageSource, espece, nomEspeceLibre = '') {    try {
        const model = await getModel();

        // On a besoin d'un élément <img> chargé
        let img = imageSource;
        if (typeof imageSource === 'string') {
            img = await new Promise((resolve, reject) => {
                const el = new Image();
                el.crossOrigin = 'anonymous';
                el.onload = () => resolve(el);
                el.onerror = reject;
                el.src = imageSource;
            });
        }

        const predictions = await model.classify(img, 5);
        const labels = predictions.map(p => p.className.toLowerCase());
        const topLabel = labels[0] || '';

        // L'image contient-elle un animal quelconque ?
        const toutesEspeces = Object.values(MOTS_CLES).flat();
        const estUnAnimal = labels.some(l => toutesEspeces.some(m => l.includes(m)));

        // Correspond-elle à l'espèce demandée ?
               const motsEspece = MOTS_CLES[espece] || [];
        const correspond = labels.some(l => motsEspece.some(m => l.includes(m)));

               // Espèce "autre" : on vérifie l'image avec le nom tapé par l'utilisateur
              // Espèce "autre" : on vérifie seulement que c'est bien un animal,
        // sans exiger que le nom exact corresponde (impossible de connaître tous les animaux)
        if (espece === 'autre' || !MOTS_CLES[espece] || MOTS_CLES[espece].length === 0) {
            if (estUnAnimal) {
                return {
                    ok: true,
                    statut: 'valide',
                    message: `Photo d'animal confirmée (détecté : "${topLabel}").`,
                    detecte: topLabel,
                };
            }
            return {
                ok: false,
                statut: 'incoherent',
                message: `Cette image ne semble pas être une photo d'animal (détecté : "${topLabel}"). Veuillez importer une vraie photo de votre animal.`,
                detecte: topLabel,
            };
        
            const nomTape = String(nomEspeceLibre || '').toLowerCase().trim();

            // Pas de nom saisi → on ne peut pas comparer, on accepte avec avertissement
            if (!nomTape) {
                return { ok: true, statut: 'incertain', message: `Précisez le type d'animal pour permettre la vérification.`, detecte: topLabel };
            }

            // Le nom tapé apparaît-il dans ce que le modèle a détecté ?
            // Mots à chercher : le nom tapé + ses traductions anglaises connues
            const motsRecherche = [nomTape, ...(TRAD_FR_EN[nomTape] || [])];
            const nomCorrespond = labels.some(l =>
                motsRecherche.some(m => l.includes(m) || m.includes(l.split(',')[0].trim()))
            );
            if (nomCorrespond) {
                return { ok: true, statut: 'valide', message: `Photo confirmée (${nomTape})`, detecte: topLabel };
            }

            // Le nom ne correspond pas, mais est-ce au moins un animal ?
            if (estUnAnimal) {
                return {
                    ok: false,
                    statut: 'incoherent',
                    message: `La photo semble montrer "${topLabel}", pas un(e) "${nomTape}". Vérifiez la photo ou le nom de l'animal.`,
                    detecte: topLabel,
                };
            }

            return {
                ok: false,
                statut: 'incoherent',
                message: `Cette image ne semble pas être une photo d'animal (détecté : "${topLabel}").`,
                detecte: topLabel,
            };
        }

        if (correspond) {
            return { ok: true, statut: 'valide', message: `Photo confirmée (${espece})`, detecte: topLabel };
        }

        // Pas de correspondance : deux cas
        if (!estUnAnimal) {
            return {
                ok: false,
                statut: 'incoherent',
                message: `Cette image ne semble pas être une photo d'animal (détecté : "${topLabel}"). Veuillez importer une vraie photo de votre ${espece}.`,
                detecte: topLabel,
            };
        }

        // C'est un animal, mais pas l'espèce attendue
        // Pour les espèces peu fiables, on reste souple (avertissement seulement)
        if (!ESPECES_FIABLES.includes(espece)) {
            return {
                ok: true,
                statut: 'incertain',
                message: `Vérification automatique limitée pour cette espèce. Assurez-vous que la photo correspond bien à votre ${espece}.`,
                detecte: topLabel,
            };
        }

        return {
            ok: false,
            statut: 'incoherent',
            message: `La photo semble montrer un autre animal (détecté : "${topLabel}") alors que vous avez choisi "${espece}". Vérifiez la photo ou l'espèce.`,
            detecte: topLabel,
        };

    }  catch (err) {
     console.error('Erreur vérification photo animal:', err);
        return { ok: true, statut: 'incertain', message: 'Vérification automatique indisponible.', detecte: '' };
    }
}