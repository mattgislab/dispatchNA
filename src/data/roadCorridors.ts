/**
 * Real road network corridors in Lausanne, Morges, and Pully.
 * Coordinates follow actual streets so vehicles only move along paved thoroughfares.
 */

export interface RoadWaypoint {
  lng: number;
  lat: number;
  streetName: string;
}

export interface RoadCorridor {
  id: string;
  name: string;
  waypoints: RoadWaypoint[];
}

export const LAUSANNE_ROAD_CORRIDORS: Record<string, RoadCorridor> = {
  // Corridor 1: Flon - Riponne - CHUV - Bessières
  centreChuv: {
    id: 'centreChuv',
    name: 'Axe Centre Urbain & CHUV',
    waypoints: [
      { lng: 6.6265, lat: 46.5222, streetName: 'Rue de Genève (Flon)' },
      { lng: 6.6295, lat: 46.5215, streetName: 'Place de l\'Europe' },
      { lng: 6.6315, lat: 46.5225, streetName: 'Rue Centrale' },
      { lng: 6.6335, lat: 46.5240, streetName: 'Place de la Riponne' },
      { lng: 6.6342, lat: 46.5244, streetName: 'Rue du Tunnel' },
      { lng: 6.6375, lat: 46.5248, streetName: 'Place du Vallon' },
      { lng: 6.6405, lat: 46.5252, streetName: 'Rue Cité-Devant' },
      { lng: 6.6438, lat: 46.5255, streetName: 'Rue du Bugnon (CHUV)' },
      { lng: 6.6465, lat: 46.5270, streetName: 'Chemin des Boveresses' },
      { lng: 6.6438, lat: 46.5255, streetName: 'Rue du Bugnon (CHUV)' },
      { lng: 6.6405, lat: 46.5252, streetName: 'Pont Bessières' },
      { lng: 6.6335, lat: 46.5240, streetName: 'Place de la Riponne' }
    ]
  },

  // Corridor 2: Ouchy Littoral - Pully
  littoralPully: {
    id: 'littoralPully',
    name: 'Axe Littoral Ouchy - Pully',
    waypoints: [
      { lng: 6.6044, lat: 46.5162, streetName: 'Rond-Point de la Maladière' },
      { lng: 6.6120, lat: 46.5135, streetName: 'Avenue de Rhodanie' },
      { lng: 6.6210, lat: 46.5090, streetName: 'Quai de Bellerive' },
      { lng: 6.6265, lat: 46.5065, streetName: 'Place de la Navigation (Ouchy)' },
      { lng: 6.6320, lat: 46.5060, streetName: 'Quai d\'Ouchy' },
      { lng: 6.6410, lat: 46.5075, streetName: 'Quai de Belgique' },
      { lng: 6.6500, lat: 46.5085, streetName: 'Route de Lausanne (Pully)' },
      { lng: 6.6600, lat: 46.5098, streetName: 'Avenue Général Guisan (Pully)' },
      { lng: 6.6710, lat: 46.5120, streetName: 'Port de Pully' },
      { lng: 6.6600, lat: 46.5098, streetName: 'Avenue Général Guisan (Pully)' },
      { lng: 6.6265, lat: 46.5065, streetName: 'Place de la Navigation (Ouchy)' }
    ]
  },

  // Corridor 3: Morges - Préverenges - Renens
  ouestMorges: {
    id: 'ouestMorges',
    name: 'Axe Ouest Morges - Renens',
    waypoints: [
      { lng: 6.4950, lat: 46.5120, streetName: 'Place de la Gare (Morges)' },
      { lng: 6.5020, lat: 46.5160, streetName: 'Avenue de la Gottaz' },
      { lng: 6.5180, lat: 46.5185, streetName: 'Route Cantonale (Tolochenaz)' },
      { lng: 6.5380, lat: 46.5252, streetName: 'Route de la Plaine (Préverenges)' },
      { lng: 6.5550, lat: 46.5260, streetName: 'Route de Saint-Sulpice' },
      { lng: 6.5710, lat: 46.5343, streetName: 'Avenue du Tir-Fédéral (Renens)' },
      { lng: 6.5860, lat: 46.5358, streetName: 'Rue de Lausanne (Renens)' },
      { lng: 6.6020, lat: 46.5300, streetName: 'Avenue de Provence' },
      { lng: 6.6200, lat: 46.5200, streetName: 'Avenue Ruchonnet' },
      { lng: 6.5710, lat: 46.5343, streetName: 'Avenue du Tir-Fédéral (Renens)' },
      { lng: 6.4950, lat: 46.5120, streetName: 'Place de la Gare (Morges)' }
    ]
  },

  // Corridor 4: Nord - Blécherette - Avenue du Grey
  nordBlecherette: {
    id: 'nordBlecherette',
    name: 'Axe Nord Blécherette - Grey',
    waypoints: [
      { lng: 6.6180, lat: 46.5450, streetName: 'Aérodrome de la Blécherette' },
      { lng: 6.6213, lat: 46.5365, streetName: 'Avenue du Grey' },
      { lng: 6.6240, lat: 46.5320, streetName: 'Chemin de Montétan' },
      { lng: 6.6280, lat: 46.5260, streetName: 'Place Chauderon' },
      { lng: 6.6335, lat: 46.5240, streetName: 'Place de la Riponne' },
      { lng: 6.6280, lat: 46.5260, streetName: 'Place Chauderon' },
      { lng: 6.6213, lat: 46.5365, streetName: 'Avenue du Grey' },
      { lng: 6.6180, lat: 46.5450, streetName: 'Aérodrome de la Blécherette' }
    ]
  },

  // Corridor 5: Autoroute A9 Écublens - Belmont
  autorouteA9: {
    id: 'autorouteA9',
    name: 'Axe Rocade Autoroutière A9',
    waypoints: [
      { lng: 6.5650, lat: 46.5620, streetName: 'Échangeur Villars-Ste-Croix (A9)' },
      { lng: 6.5820, lat: 46.5618, streetName: 'A9 Traversée Ouest' },
      { lng: 6.6025, lat: 46.5540, streetName: 'A9 Jonction Blécherette' },
      { lng: 6.6340, lat: 46.5530, streetName: 'A9 Tranchée Couverte' },
      { lng: 6.6465, lat: 46.5428, streetName: 'A9 Jonction Vennes' },
      { lng: 6.6620, lat: 46.5370, streetName: 'A9 Belmont' },
      { lng: 6.6800, lat: 46.5260, streetName: 'A9 Viaduc de Lutry' },
      { lng: 6.6620, lat: 46.5370, streetName: 'A9 Belmont' },
      { lng: 6.6465, lat: 46.5428, streetName: 'A9 Jonction Vennes' },
      { lng: 6.5820, lat: 46.5618, streetName: 'A9 Traversée Ouest' }
    ]
  }
};
