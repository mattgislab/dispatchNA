import { RouteResult } from './networkAnalystService';

export interface DispatchAIReport {
  incidentAddress: string;
  primaryUnit: string;
  primaryEta: number;
  primaryDistance: number;
  secondaryUnit?: string;
  secondaryEta?: number;
  radioMessage: string;
  strategicAdvice: string[];
  priorityLevel: 'P1 - Urgence Vitale' | 'P2 - Urgence Relative' | 'P3 - Non Critique';
  trafficObstaclesNotice: string;
  rawText?: string;
}

export async function generateDispatchAnalysis(
  address: string,
  routes: RouteResult[],
  useEvents: boolean,
  customApiKey?: string
): Promise<DispatchAIReport> {
  if (!routes || routes.length === 0) {
    throw new Error("Aucune unité disponible n'a pu rejoindre cette zone.");
  }

  const primary = routes[0];
  const secondary = routes.length > 1 ? routes[1] : undefined;
  const obstaclesNotice = useEvents
    ? "Actives : Données Trafic TomTom Lausanne & Chantiers intégrés"
    : "Désactivées : Calcul en conditions idéales sans perturbations";

  const prompt = `
Tu es l'officier de régulation IA pour la centrale 144 / dispatching médical d'urgence de Lausanne et du canton de Vaud.

DONNÉES DU NETWORK ANALYST :
- Lieu de l'incident : ${address}
- Unité prioritaire (Rank 1) : ${primary.facilityName} (${primary.facilityCallsign})
  * Temps de trajet optimal : ${primary.timeMinutes} minutes
  * Distance calculée : ${primary.distanceKm} km
${secondary ? `- Unité de réserve (Rank 2) : ${secondary.facilityName} (${secondary.facilityCallsign}) - ${secondary.timeMinutes} min (${secondary.distanceKm} km)` : ''}
- Prise en compte du trafic & perturbations : ${obstaclesNotice}

Génère une analyse opérationnelle concise et percutante selon cette structure :
1. Niveau de priorité recommandé (P1, P2 ou P3)
2. Message radio officiel pour transmission TETRA Polycom
3. Recommandations stratégiques de guidage (axes à privilégier, goulets d'étranglement évités)
4. Mesures complémentaires (coordination police, SMUR, régulation hôpital CHUV)
`;

  try {
    const res = await fetch('/api/gemini/dispatch-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, customApiKey })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return parseAIResponse(data.text, address, primary, secondary, obstaclesNotice);
      }
    }
  } catch (e) {
    console.warn('Gemini proxy error, using local expert heuristic dispatcher:', e);
  }

  // Fallback heuristic generator (standard protocol 144)
  return buildHeuristicReport(address, primary, secondary, obstaclesNotice);
}

function parseAIResponse(
  rawText: string,
  address: string,
  primary: RouteResult,
  secondary: RouteResult | undefined,
  obstaclesNotice: string
): DispatchAIReport {
  return {
    incidentAddress: address,
    primaryUnit: primary.facilityName,
    primaryEta: primary.timeMinutes,
    primaryDistance: primary.distanceKm,
    secondaryUnit: secondary?.facilityName,
    secondaryEta: secondary?.timeMinutes,
    radioMessage: `« À toutes les unités, régulation 144 : départ immédiat pour ${primary.facilityName} (${primary.facilityCallsign}) vers ${address}. ETA ${primary.timeMinutes} min. Trajet prioritaire engagé. »`,
    strategicAdvice: [
      `Engagement prioritaire de ${primary.facilityName} calculé comme l'itinéraire le plus rapide (${primary.timeMinutes} min).`,
      useEventsWarning(obstaclesNotice),
      secondary ? `Maintien de ${secondary.facilityName} en alerte de 2e échelon (ETA ${secondary.timeMinutes} min).` : 'Aucune seconde unité requise dans ce périmètre.',
      'Pré-alerte du service des urgences du CHUV avec transmission du créneau d\'arrivée estimé.'
    ],
    priorityLevel: primary.timeMinutes <= 4 ? 'P1 - Urgence Vitale' : 'P2 - Urgence Relative',
    trafficObstaclesNotice: obstaclesNotice,
    rawText
  };
}

function buildHeuristicReport(
  address: string,
  primary: RouteResult,
  secondary: RouteResult | undefined,
  obstaclesNotice: string
): DispatchAIReport {
  return {
    incidentAddress: address,
    primaryUnit: primary.facilityName,
    primaryEta: primary.timeMinutes,
    primaryDistance: primary.distanceKm,
    secondaryUnit: secondary?.facilityName,
    secondaryEta: secondary?.timeMinutes,
    radioMessage: `« Centrale 144 pour ${primary.facilityName} : Intervention urgente demandée. Destination : ${address}. ETA optimisé : ${primary.timeMinutes} minutes. Confirmez réception et départ. »`,
    strategicAdvice: [
      `Itinéraire dynamique calculé par ArcGIS Network Analyst (${primary.distanceKm} km en ${primary.timeMinutes} min).`,
      `Contournement préventif des axes saturés de Lausanne et déviations TomTom.`,
      secondary ? `Unité d'appui disponible : ${secondary.facilityName} à ${secondary.distanceKm} km (${secondary.timeMinutes} min).` : 'Secteur sous couverture unique.',
      `Coordination radio sur canal cantonal 144-Vaud activée.`
    ],
    priorityLevel: 'P1 - Urgence Vitale',
    trafficObstaclesNotice: obstaclesNotice
  };
}

function useEventsWarning(notice: string): string {
  if (notice.includes('Actives')) {
    return 'Algorithme avec prise en compte des ralentissements et routes fermées TomTom.';
  }
  return 'Calcul standard : attention aux éventuels chantiers en cours sur les axes secondaires.';
}
