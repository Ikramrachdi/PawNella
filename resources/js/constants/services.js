// Source unique des types de services.
// Les clés correspondent exactement à PRIX_MIN_PAR_TYPE dans utils/validation.js
// et aux valeurs stockées dans users.services_offerts (minuscules).

export const SERVICE_TYPES = [
    { key: 'promenade',  label: 'Promenade',  icon: '🚶',  color: '#FFF0EE', unite: '/ 30min'  },
    { key: 'garde',      label: 'Garde',      icon: '🏠',  color: '#E8F5E9', unite: '/ jour'   },
    { key: 'pension',    label: 'Pension',    icon: '🏨',  color: '#E3F2FD', unite: '/ nuit'   },
    { key: 'visite',     label: 'Visite',     icon: '🏥',  color: '#FDF5F0', unite: '/ visite' },
    { key: 'toilettage', label: 'Toilettage', icon: '✂️',  color: '#F3E5F5', unite: '/ séance' },
    { key: 'taxi',       label: 'Taxi',       icon: '🚗',  color: '#FFF8E1', unite: '/ trajet' },
    { key: 'soins',      label: 'Soins',      icon: '💊',  color: '#E8F5E9', unite: '/ séance' },
    { key: 'dressage',   label: 'Dressage',   icon: '📋',  color: '#E3F2FD', unite: '/ séance' },
];

// Retourne l'unité d'affichage d'un type (ex: 'promenade' -> '/ 30min')
export function getUnite(type) {
    const t = String(type || '').toLowerCase().trim();
    return SERVICE_TYPES.find(s => s.key === t)?.unite || '';
}

// Retourne le libellé affichable (ex: 'promenade' -> 'Promenade')
export function getLabel(type) {
    const t = String(type || '').toLowerCase().trim();
    return SERVICE_TYPES.find(s => s.key === t)?.label || type;
}
