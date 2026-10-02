export interface TrafficIncident {
  id: number;
  uid: string;
  category: string;
  categoryIcon: number;
  magnitude: number; // 0: Info/Travaux mineurs, 1: Ralentissement, 2: Bouchon modéré, 3: Bouchon sévère, 4: Bloqué / Fermé
  fromStreet: string;
  toStreet: string;
  lengthMeters: number;
  delaySeconds: number | null;
  description: string;
  coordinates: [number, number][]; // [lng, lat][]
  color: string;
}

export const LAUSANNE_TRAFFIC_INCIDENTS: TrafficIncident[] = [
  {
    id: 1,
    uid: "TTI-A1-COTTENS",
    category: "Travaux",
    categoryIcon: 9,
    magnitude: 0,
    fromStreet: "Cottens (Kantonsstrasse)",
    toStreet: "Clarmont (Kantonsstrasse)",
    lengthMeters: 139.6,
    delaySeconds: null,
    description: "Travaux d'assainissement",
    coordinates: [[6.45067, 46.54851], [6.45062, 46.54836], [6.45043, 46.54794], [6.45019, 46.54730]],
    color: "#F5B041"
  },
  {
    id: 3,
    uid: "TTI-DENENS-FERME",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Villars-sous-Yens (Kantonsstrasse)",
    toStreet: "Denens (Kantonsstrasse)",
    lengthMeters: 1442.3,
    delaySeconds: null,
    description: "Route fermée pour réfection complète",
    coordinates: [[6.43917, 46.51142], [6.44279, 46.51290], [6.44675, 46.51435], [6.45056, 46.51576], [6.45436, 46.51861]],
    color: "#EF4444"
  },
  {
    id: 8,
    uid: "TTI-A1-SORTIE15",
    category: "Trafic en accordéon",
    categoryIcon: 6,
    magnitude: 2,
    fromStreet: "Sortie [15] Morges-Est",
    toStreet: "Route de la Longeraie",
    lengthMeters: 35.2,
    delaySeconds: 53,
    description: "Trafic en accordéon à la bretelle",
    coordinates: [[6.48571, 46.50582], [6.48583, 46.50601], [6.48579, 46.50612]],
    color: "#F97316"
  },
  {
    id: 9,
    uid: "TTI-TOLOCHENAZ-FERME",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Chemin de Tolochenaz",
    toStreet: "Avenue Monod / Avenue de la Gottaz",
    lengthMeters: 161.4,
    delaySeconds: null,
    description: "Route fermée pour pose de conduites",
    coordinates: [[6.48557, 46.51044], [6.48633, 46.50969], [6.48671, 46.50924]],
    color: "#EF4444"
  },
  {
    id: 11,
    uid: "TTI-LONGERAIE-A1",
    category: "Travaux",
    categoryIcon: 9,
    magnitude: 1,
    fromStreet: "Route de la Longeraie",
    toStreet: "A1 Entrée Autoroute",
    lengthMeters: 229.2,
    delaySeconds: 35,
    description: "Travaux de raccordement d'échangeur",
    coordinates: [[6.48688, 46.50650], [6.48735, 46.50722], [6.48800, 46.50766], [6.48859, 46.50813]],
    color: "#F5B041"
  },
  {
    id: 19,
    uid: "TTI-A1-ECUBLENS-MORGES",
    category: "Travaux majeurs",
    categoryIcon: 9,
    magnitude: 2,
    fromStreet: "Échangeur d'Écublens (A1)",
    toStreet: "Morges-Ouest (A1)",
    lengthMeters: 2170.6,
    delaySeconds: 145,
    description: "Voies rétrécies et vitesse limitée à 80 km/h",
    coordinates: [
      [6.50618, 46.51754], [6.50447, 46.51677], [6.50154, 46.51573],
      [6.49775, 46.51441], [6.49338, 46.51169], [6.48825, 46.50808],
      [6.48419, 46.50550]
    ],
    color: "#F59E0B"
  },
  {
    id: 25,
    uid: "TTI-PREVERENGES-PLAINE",
    category: "Travaux",
    categoryIcon: 9,
    magnitude: 1,
    fromStreet: "Route de la Plaine",
    toStreet: "Route d'Yverdon",
    lengthMeters: 466.9,
    delaySeconds: 106,
    description: "Réfection de giratoire",
    coordinates: [[6.53810, 46.52524], [6.54054, 46.52525], [6.54178, 46.52522], [6.54158, 46.52682]],
    color: "#F5B041"
  },
  {
    id: 27,
    uid: "TTI-BUSSIGNY-RECULAN",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Route de Reculan",
    toStreet: "Chemin du Vallon",
    lengthMeters: 232.7,
    delaySeconds: null,
    description: "Affaissement de chaussée - circulation interdite",
    coordinates: [[6.55156, 46.54362], [6.55149, 46.54411], [6.55089, 46.54482], [6.55017, 46.54529]],
    color: "#EF4444"
  },
  {
    id: 32,
    uid: "TTI-RENENS-TIR-FEDERAL",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Avenue du Tir-Fédéral",
    toStreet: "Route du Bois",
    lengthMeters: 234.4,
    delaySeconds: null,
    description: "Aménagement d'îlots de sécurisation",
    coordinates: [[6.57102, 46.53435], [6.57042, 46.53465], [6.56943, 46.53480], [6.56819, 46.53507]],
    color: "#EF4444"
  },
  {
    id: 33,
    uid: "TTI-RENENS-PONT-BLEU",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Route du Pont Bleu / Chemin du Bochet",
    toStreet: "Route de la Maladière / Rue du Villars",
    lengthMeters: 862.9,
    delaySeconds: null,
    description: "Fermeture pour pose de passerelle ferroviaire",
    coordinates: [
      [6.57199, 46.53573], [6.57145, 46.53495], [6.57028, 46.53333],
      [6.56869, 46.53111], [6.56704, 46.52876]
    ],
    color: "#EF4444"
  },
  {
    id: 35,
    uid: "TTI-BUSSIGNY-AVENIR",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Route de Bussigny / Rue du Mont",
    toStreet: "Rue de l'Avenir / Rue du Simplon",
    lengthMeters: 318.2,
    delaySeconds: null,
    description: "Travaux de chauffage à distance",
    coordinates: [[6.57830, 46.53812], [6.57915, 46.53772], [6.58050, 46.53697], [6.58186, 46.53679]],
    color: "#EF4444"
  },
  {
    id: 37,
    uid: "TTI-RENENS-LAC",
    category: "Route fermée",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Rue du Lac",
    toStreet: "Avenue du Léman / Rue du Léman",
    lengthMeters: 142.4,
    delaySeconds: null,
    description: "Remplacement réseau eau potable",
    coordinates: [[6.58729, 46.52959], [6.58656, 46.52990], [6.58609, 46.52997], [6.58567, 46.53018]],
    color: "#EF4444"
  },
  {
    id: 52,
    uid: "TTI-A9-BLECHERETTE-VILLARS",
    category: "Travaux nocturnes A9",
    categoryIcon: 9,
    magnitude: 2,
    fromStreet: "Lausanne-Blécherette (A9)",
    toStreet: "Échangeur Villars-Ste-Croix (A9)",
    lengthMeters: 3124.8,
    delaySeconds: 180,
    description: "Réfection du tablier et balisage dynamique",
    coordinates: [
      [6.61741, 46.55191], [6.61391, 46.55243], [6.60841, 46.55322],
      [6.60258, 46.55409], [6.59865, 46.55597], [6.59165, 46.56059],
      [6.58107, 46.56231]
    ],
    color: "#F59E0B"
  },
  {
    id: 54,
    uid: "TTI-LAUSANNE-GREY",
    category: "Forte congestion",
    categoryIcon: 6,
    magnitude: 3,
    fromStreet: "Avenue du Grey (sens montant)",
    toStreet: "Avenue du Grey (rond-point)",
    lengthMeters: 153.1,
    delaySeconds: 448,
    description: "Bouchon dense et feux tricolores perturbés",
    coordinates: [[6.62139, 46.53616], [6.62139, 46.53653], [6.62112, 46.53710], [6.62078, 46.53743]],
    color: "#DC2626"
  },
  {
    id: 55,
    uid: "TTI-GENEVE-SEBEILLON",
    category: "Travaux Tramway",
    categoryIcon: 9,
    magnitude: 1,
    fromStreet: "Rue de Sébeillon (Rue de Genève)",
    toStreet: "Place De L'Europe (Flon)",
    lengthMeters: 115.0,
    delaySeconds: 40,
    description: "Chantier ligne Tram t1 Lausanne-Renens",
    coordinates: [[6.62295, 46.52305], [6.62369, 46.52295], [6.62418, 46.52289], [6.62442, 46.52284]],
    color: "#F5B041"
  },
  {
    id: 60,
    uid: "TTI-FLON-SEBEILLON-FERME",
    category: "Voie fermée Tram t1",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Rue de Sébeillon (Rue de Genève)",
    toStreet: "Place De L'Europe (Flon)",
    lengthMeters: 354.5,
    delaySeconds: null,
    description: "Chantier majeur du Tramway Lausannois. Accès réservé aux riverains.",
    coordinates: [
      [6.62648, 46.52228], [6.62736, 46.52205], [6.62893, 46.52165],
      [6.62996, 46.52128], [6.63009, 46.52110], [6.62993, 46.52074]
    ],
    color: "#EF4444"
  },
  {
    id: 63,
    uid: "TTI-RIPONNE-TUNNEL-FERME",
    category: "Zone piétonne & Marché",
    categoryIcon: 8,
    magnitude: 4,
    fromStreet: "Lausanne Centre",
    toStreet: "Rue du Tunnel / Place de la Riponne",
    lengthMeters: 97.7,
    delaySeconds: null,
    description: "Accès Riponne fermé par bornes automatiques",
    coordinates: [[6.63420, 46.52440], [6.63375, 46.52414], [6.63345, 46.52394], [6.63319, 46.52395]],
    color: "#EF4444"
  },
  {
    id: 69,
    uid: "TTI-A9-VENNES-BLECHERETTE",
    category: "Travaux",
    categoryIcon: 9,
    magnitude: 1,
    fromStreet: "Lausanne-Vennes (A9)",
    toStreet: "Lausanne-Blécherette (A9)",
    lengthMeters: 337.8,
    delaySeconds: 30,
    description: "Entretien d'enrobé phonique",
    coordinates: [[6.64663, 46.54282], [6.64548, 46.54280], [6.64383, 46.54262], [6.64228, 46.54237]],
    color: "#F5B041"
  },
  {
    id: 73,
    uid: "TTI-A9-VENNES-BELMONT",
    category: "Voies rétrécies",
    categoryIcon: 7,
    magnitude: 2,
    fromStreet: "Lausanne-Vennes (A9)",
    toStreet: "Belmont (A9)",
    lengthMeters: 2093.0,
    delaySeconds: 180,
    description: "Réduction à 1 voie dans les virages de Belmont",
    coordinates: [
      [6.66116, 46.53775], [6.66432, 46.53657], [6.66772, 46.53589],
      [6.67108, 46.53538], [6.67449, 46.53413], [6.67763, 46.53155],
      [6.68006, 46.52634]
    ],
    color: "#F97316"
  },
  {
    id: 79,
    uid: "TTI-A9-CHEXBRES-LACROIX",
    category: "Voies rétrécies",
    categoryIcon: 7,
    magnitude: 2,
    fromStreet: "Chexbres (A9)",
    toStreet: "Échangeur La Croix (A9)",
    lengthMeters: 3768.0,
    delaySeconds: 240,
    description: "Régulation dynamique de vitesse Lavaux",
    coordinates: [
      [6.75217, 46.49347], [6.74932, 46.49541], [6.74427, 46.49701],
      [6.73876, 46.49865], [6.73230, 46.50004], [6.72469, 46.49919],
      [6.71694, 46.50081], [6.71169, 46.50391], [6.70969, 46.50570]
    ],
    color: "#F97316"
  }
];

export function getTrafficStats() {
  const totalIncidents = LAUSANNE_TRAFFIC_INCIDENTS.length;
  const blockedCount = LAUSANNE_TRAFFIC_INCIDENTS.filter(i => i.magnitude === 4).length;
  const severeDelayCount = LAUSANNE_TRAFFIC_INCIDENTS.filter(i => i.magnitude === 3).length;
  const totalLengthKm = (LAUSANNE_TRAFFIC_INCIDENTS.reduce((acc, i) => acc + i.lengthMeters, 0) / 1000).toFixed(1);
  const totalDelayMin = Math.round(LAUSANNE_TRAFFIC_INCIDENTS.reduce((acc, i) => acc + (i.delaySeconds || 0), 0) / 60);

  return {
    totalIncidents,
    blockedCount,
    severeDelayCount,
    totalLengthKm,
    totalDelayMin
  };
}

export function toGeoJSONFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: LAUSANNE_TRAFFIC_INCIDENTS.map(item => ({
      type: "Feature",
      id: item.id,
      geometry: {
        type: "LineString",
        coordinates: item.coordinates
      },
      properties: {
        OBJECTID: item.id,
        id: item.uid,
        magnitudeOfDelay: item.magnitude,
        eventDescription: item.description,
        fromStreet: item.fromStreet,
        toStreet: item.toStreet,
        length: item.lengthMeters,
        delay: item.delaySeconds,
        color: item.color,
        category: item.category
      }
    }))
  };
}
