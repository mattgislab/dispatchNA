export interface Ambulance {
  id: string;
  name: string;
  type: 'SMUR' | 'Ambulance d\'Urgence' | 'VIR' | 'Rega Hélico';
  callsign: string;
  coords: [number, number]; // [lng, lat]
  available: boolean;
  status: 'DISPONIBLE' | 'EN MISSION' | 'EN TRANSIT' | 'MAINTENANCE';
  baseStation: string;
  crew: string;
  equipment: string[];
  batteryLevel: number;
  speedKmH: number;
  corridorId?: string;
  waypointIndex?: number;
  direction?: 1 | -1;
}

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'unit-1',
    name: 'Alpha-3',
    callsign: 'SMUR-101',
    type: 'SMUR',
    coords: [6.6335, 46.5240], // Riponne
    available: true,
    status: 'DISPONIBLE',
    baseStation: 'Base Riponne - Lausanne',
    crew: 'Dr. Favre (Urgentiste) / Inf. Chenaux',
    equipment: ['DSA Corpuls 3', 'Échographe portable', 'Kit intubation RSI', 'Perfusion téléguidée'],
    batteryLevel: 94,
    speedKmH: 34,
    corridorId: 'centreChuv',
    waypointIndex: 3,
    direction: 1
  },
  {
    id: 'unit-2',
    name: 'Bravo-2',
    callsign: 'AMB-204',
    type: 'Ambulance d\'Urgence',
    coords: [6.6265, 46.5065], // Ouchy
    available: false,
    status: 'EN MISSION',
    baseStation: 'Centre Ouchy - Lac',
    crew: 'Ambulancier dipl. Rochat / Aux. Meyer',
    equipment: ['Stryker Power-PRO', 'Ventilateur Hamilton T1', 'DSA Zoll X', 'Trousse pédiatrique'],
    batteryLevel: 78,
    speedKmH: 42,
    corridorId: 'littoralPully',
    waypointIndex: 3,
    direction: 1
  },
  {
    id: 'unit-3',
    name: 'Charlie-1',
    callsign: 'VIR-305',
    type: 'VIR',
    coords: [6.5710, 46.5343], // Renens
    available: true,
    status: 'DISPONIBLE',
    baseStation: 'Poste Ouest Renens',
    crew: 'Paramédic Martin / Chauffeur Renaud',
    equipment: ['Sac réanimation primaire', 'DSA Schiller', 'Extraction KED', 'Radio Tetra polycom'],
    batteryLevel: 89,
    speedKmH: 36,
    corridorId: 'ouestMorges',
    waypointIndex: 5,
    direction: 1
  },
  {
    id: 'unit-4',
    name: 'Delta-2',
    callsign: 'AMB-402',
    type: 'Ambulance d\'Urgence',
    coords: [6.6213, 46.5365], // Blécherette / Grey
    available: true,
    status: 'DISPONIBLE',
    baseStation: 'Poste Nord Blécherette',
    crew: 'Ambulancier dipl. Blanc / Inf. Dubuis',
    equipment: ['Brancard bariatrique', 'Moniteur multi-paramètres', 'Oxymètre Rad-57', 'Attelles sous vide'],
    batteryLevel: 91,
    speedKmH: 32,
    corridorId: 'nordBlecherette',
    waypointIndex: 1,
    direction: 1
  },
  {
    id: 'unit-5',
    name: 'Echo-3',
    callsign: 'AMB-501',
    type: 'Ambulance d\'Urgence',
    coords: [6.5020, 46.5160],
    available: false,
    status: 'MAINTENANCE',
    baseStation: 'Atelier Morges-Est',
    crew: 'En révision technique',
    equipment: ['Standard réanimation'],
    batteryLevel: 62,
    speedKmH: 0
  },
  {
    id: 'unit-6',
    name: 'Foxtrot-1',
    callsign: 'SMUR-601',
    type: 'SMUR',
    coords: [6.6600, 46.5098], // Pully
    available: true,
    status: 'DISPONIBLE',
    baseStation: 'Antenne Est Pully-Penthalaz',
    crew: 'Dr. Vauthey / Inf. Reymond',
    equipment: ['Lucas 3 (Masseur cardiaque)', 'Écho Butterfly iQ+', 'Vidéolaryngoscope', 'Analyseur I-Stat'],
    batteryLevel: 98,
    speedKmH: 38,
    corridorId: 'littoralPully',
    waypointIndex: 7,
    direction: -1
  },
  {
    id: 'unit-7',
    name: 'Golf-4',
    callsign: 'VIR-702',
    type: 'VIR',
    coords: [6.4950, 46.5120], // Morges
    available: true,
    status: 'DISPONIBLE',
    baseStation: 'Hôpital de Morges',
    crew: 'Paramédic Gaillard / Inf. Bovet',
    equipment: ['Kit trauma lourd', 'Garrots tourniquet CAT', 'DSA Tempus Pro'],
    batteryLevel: 85,
    speedKmH: 30,
    corridorId: 'ouestMorges',
    waypointIndex: 0,
    direction: 1
  }
];
