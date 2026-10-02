export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'Accident' | 'Urgence Médicale' | 'Chantier A9' | 'Catastrophe';
  address: string;
  coords: [number, number]; // [lng, lat]
  severity: 'Critique' | 'Majeure' | 'Urgente';
  description: string;
  recommendedView: '2D' | '3D';
  trafficImpact: string;
}

export const DEMO_SCENARIOS: Scenario[] = [
  {
    id: 'sc-1',
    title: 'Carambolage Urbain Riponne',
    subtitle: 'Centre-ville Lausanne · 3 véhicules impliqués',
    category: 'Accident',
    address: 'Place de la Riponne 1, 1005 Lausanne',
    coords: [6.6335, 46.5240],
    severity: 'Critique',
    description: 'Carambolage bloquant l\'accès nord de la Riponne. Forte affluence piétonne et chantier du tramway à proximité.',
    recommendedView: '3D',
    trafficImpact: 'Forte congestion Avenue de l\'Université et Rue du Tunnel'
  },
  {
    id: 'sc-2',
    title: 'Urgence Cardiaque CHUV Bugnon',
    subtitle: 'Quartier Hospitalier · Arrêt cardio-respiratoire',
    category: 'Urgence Médicale',
    address: 'Rue du Bugnon 46, 1011 Lausanne',
    coords: [6.6438, 46.5255],
    severity: 'Critique',
    description: 'Patient 58 ans en ACR dans un immeuble de bureaux. Nécessité d\'un SMUR équipé d\'un compresseur Lucas 3 en moins de 5 minutes.',
    recommendedView: '3D',
    trafficImpact: 'Trafic fluide sur le pont Bessières, ralentissement rue de la Barre'
  },
  {
    id: 'sc-3',
    title: 'Collision Autoroutière A9 Écublens',
    subtitle: 'Échangeur A9 / A1 · Poids lourd en ciseaux',
    category: 'Chantier A9',
    address: 'Autoroute A9 Km 14.2, 1024 Écublens',
    coords: [6.5750, 46.5630],
    severity: 'Majeure',
    description: 'Voies neutralisées en direction de Villars-Ste-Croix. Chantier nocturne TomTom déjà en place sur la voie de droite.',
    recommendedView: '2D',
    trafficImpact: 'Bouchon de 4.2 km remontant jusqu\'à Lausanne-Blécherette'
  },
  {
    id: 'sc-4',
    title: 'Incident Quai d\'Ouchy',
    subtitle: 'Bord du lac Léman · Chute avec trauma crânien',
    category: 'Urgence Médicale',
    address: 'Place de la Navigation, 1006 Lausanne',
    coords: [6.6265, 46.5065],
    severity: 'Urgente',
    description: 'Chute sur les berges d\'Ouchy. Zone à circulation ralentie nécessitant un accès prioritaire par l\'Avenue d\'Ouchy.',
    recommendedView: '3D',
    trafficImpact: 'Trafic modéré sur les quais, zone piétonne réservée'
  },
  {
    id: 'sc-5',
    title: 'Évacuation Gare de Morges',
    subtitle: 'Quai CFF Morges · Collision avec bus urbain',
    category: 'Accident',
    address: 'Place de la Gare 2, 1110 Morges',
    coords: [6.4950, 46.5120],
    severity: 'Majeure',
    description: 'Accident à l\'intersection de l\'avenue de la Gottaz. Nécessite déploiement combiné VIR Morges et renfort SMUR Lausanne.',
    recommendedView: '2D',
    trafficImpact: 'Déviation obligatoire par la route cantonale RC1'
  }
];
