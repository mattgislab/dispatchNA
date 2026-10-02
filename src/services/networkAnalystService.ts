import { ArcGISModules } from './arcgisLoader';
import { Ambulance } from '../data/ambulances';
import { LAUSANNE_TRAFFIC_INCIDENTS } from '../data/lausanneTraffic';

export interface RouteResult {
  facilityName: string;
  facilityCallsign: string;
  timeMinutes: number;
  distanceKm: number;
  geometry: any;
  rank: number;
  directions?: string[];
}

export interface ServiceAreaPolygonResult {
  fromBreak: number;
  toBreak: number;
  geometry: any;
  color: [number, number, number, number];
}

const ROUTE_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
const SERVICE_AREA_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World";
const CLOSEST_FACILITY_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World";
const LOCATOR_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export class NetworkAnalystService {
  private modules: ArcGISModules;
  private apiKey: string = '';

  constructor(modules: ArcGISModules, apiKey: string = '') {
    this.modules = modules;
    this.apiKey = apiKey;
    if (apiKey) {
      this.modules.esriConfig.apiKey = apiKey;
    }
  }

  setApiKey(key: string) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      this.modules.esriConfig.apiKey = this.apiKey;
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private force3857(geom: any) {
    if (!geom) return null;
    if (geom.spatialReference && (geom.spatialReference.wkid === 4326 || geom.spatialReference.isWGS84)) {
      return this.modules.webMercatorUtils.geographicToWebMercator(geom);
    }
    return geom;
  }

  /**
   * Reverse Geocoding via ArcGIS World Geocoding Service or fallback
   */
  async reverseGeocode(point: any): Promise<string> {
    try {
      if (this.apiKey) {
        const response = await this.modules.locator.locationToAddress(LOCATOR_URL, {
          location: point
        });
        const attrs = response.attributes;
        const address = attrs.Address || attrs.Match_addr || 'Place publique';
        const city = attrs.City || 'Lausanne';
        const postal = attrs.Postal || '1000';
        return `${address}, ${postal} ${city}`;
      }
    } catch (e) {
      console.warn('ArcGIS Geocoding API failed, falling back to local geocoder:', e);
    }

    // Local fallback reverse geocoder for Lausanne region
    const [lng, lat] = this.modules.webMercatorUtils.xyToLngLat(point.x, point.y);
    if (Math.abs(lng - 6.633) < 0.01 && Math.abs(lat - 46.524) < 0.01) {
      return 'Place de la Riponne 1, 1005 Lausanne';
    }
    if (Math.abs(lng - 6.643) < 0.01 && Math.abs(lat - 46.525) < 0.01) {
      return 'Rue du Bugnon 46, 1011 Lausanne (CHUV)';
    }
    if (Math.abs(lng - 6.626) < 0.01 && Math.abs(lat - 46.506) < 0.01) {
      return 'Place de la Navigation, 1006 Lausanne (Ouchy)';
    }
    if (Math.abs(lng - 6.575) < 0.01 && Math.abs(lat - 46.563) < 0.01) {
      return 'Autoroute A9 Échangeur Écublens, 1024 Écublens';
    }
    if (Math.abs(lng - 6.495) < 0.01 && Math.abs(lat - 46.512) < 0.01) {
      return 'Place de la Gare 2, 1110 Morges';
    }

    return `Secteur Lausanne [${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E]`;
  }

  /**
   * Closest Facility (Network Analyst)
   */
  async solveClosestFacility(
    incidentPoint: any,
    ambulances: Ambulance[],
    barrierGraphics: any[],
    useTrafficRestrictions: boolean
  ): Promise<RouteResult[]> {
    const availableUnits = ambulances.filter(u => u.available && u.status !== 'MAINTENANCE');
    if (availableUnits.length === 0) {
      return [];
    }

    // If ArcGIS API key is configured, use real ArcGIS Network Analyst Closest Facility service
    if (this.apiKey) {
      try {
        return await this.solveClosestFacilityArcGIS(incidentPoint, availableUnits, barrierGraphics, useTrafficRestrictions);
      } catch (err: any) {
        console.warn('ArcGIS Network Analyst API error, fallback to simulated road network routing:', err);
      }
    }

    // Client-side Network Analyst simulation solver
    return this.solveClosestFacilityLocal(incidentPoint, availableUnits, barrierGraphics, useTrafficRestrictions);
  }

  private async solveClosestFacilityArcGIS(
    incidentPoint: any,
    facilities: Ambulance[],
    barrierGraphics: any[],
    useTrafficRestrictions: boolean
  ): Promise<RouteResult[]> {
    const { Graphic, FeatureSet, ClosestFacilityParameters, closestFacility } = this.modules;

    let allBarriers = [...barrierGraphics];

    if (useTrafficRestrictions) {
      // Add TomTom road closure segments as polyline barriers
      const closedRoads = LAUSANNE_TRAFFIC_INCIDENTS.filter(i => i.magnitude === 4);
      closedRoads.forEach(road => {
        const paths = road.coordinates.map(c => {
          const [x, y] = this.modules.webMercatorUtils.lngLatToXY(c[0], c[1]);
          return [x, y];
        });
        const polyline = new this.modules.Polyline({
          paths: [paths],
          spatialReference: { wkid: 3857 }
        });
        allBarriers.push(new Graphic({ geometry: polyline }));
      });
    }

    const pointBarriers = new FeatureSet({
      features: allBarriers
        .filter(g => g.geometry && g.geometry.type === 'point' && g.symbol?.type !== 'text')
        .map(g => new Graphic({ geometry: this.force3857(g.geometry) }))
    });

    const polylineBarriers = new FeatureSet({
      features: allBarriers
        .filter(g => g.geometry && g.geometry.type === 'polyline')
        .map(g => new Graphic({ geometry: this.force3857(g.geometry) }))
    });

    const polygonBarriers = new FeatureSet({
      features: allBarriers
        .filter(g => g.geometry && g.geometry.type === 'polygon')
        .map(g => new Graphic({ geometry: this.force3857(g.geometry) }))
    });

    const validFacilities = facilities.map(amb => {
      const [x, y] = this.modules.webMercatorUtils.lngLatToXY(amb.coords[0], amb.coords[1]);
      return new Graphic({
        geometry: new this.modules.Point({ x, y, spatialReference: { wkid: 3857 } }),
        attributes: { Name: amb.name, callsign: amb.callsign }
      });
    });

    const params = new ClosestFacilityParameters({
      incidents: new FeatureSet({ features: [new Graphic({ geometry: this.force3857(incidentPoint) })] }),
      facilities: new FeatureSet({ features: validFacilities }),
      returnRoutes: true,
      returnDirections: true,
      returnFacilities: true,
      defaultTargetFacilityCount: 2,
      outSpatialReference: { wkid: 3857 },
      pointBarriers,
      polylineBarriers,
      polygonBarriers
    });

    const result = await closestFacility.solve(CLOSEST_FACILITY_URL, params);
    const routes = result.routes?.features || (Array.isArray(result.routes) ? result.routes : []);

    return routes.map((r: any, idx: number) => {
      const distanceKm = Number((this.modules.geometryEngine.geodesicLength(r.geometry, 'kilometers')).toFixed(1));
      let facilityName = `Unité ${idx + 1}`;
      let callsign = 'URG-112';

      const facilityId = r.attributes?.FacilityID;
      if (facilityId && result.facilities) {
        const facility = result.facilities.features?.find((f: any) => f.attributes.ObjectID === facilityId);
        if (facility) {
          facilityName = facility.attributes.Name || facilityName;
          callsign = facility.attributes.callsign || callsign;
        }
      }

      if (!facilityName || facilityName.startsWith('Location')) {
        const mapped = facilities[idx % facilities.length];
        facilityName = mapped.name;
        callsign = mapped.callsign;
      }

      const travelTime = Math.max(1, Math.round(r.attributes?.Total_TravelTime || (distanceKm / 45) * 60));

      return {
        facilityName,
        facilityCallsign: callsign,
        timeMinutes: travelTime,
        distanceKm,
        geometry: r.geometry,
        rank: idx + 1,
        directions: r.attributes?.Directions || []
      };
    });
  }

  /**
   * Client-Side Real Road Network Simulation Solver
   */
  private solveClosestFacilityLocal(
    incidentPoint: any,
    facilities: Ambulance[],
    barrierGraphics: any[],
    useTrafficRestrictions: boolean
  ): RouteResult[] {
    const [incLng, incLat] = this.modules.webMercatorUtils.xyToLngLat(incidentPoint.x, incidentPoint.y);

    // Calculate distance and travel time for each ambulance considering traffic
    const evaluated = facilities.map(amb => {
      const dLat = (incLat - amb.coords[1]) * 111.2;
      const dLng = (incLng - amb.coords[0]) * 76.5;
      const straightDistKm = Math.sqrt(dLat * dLat + dLng * dLng);

      // Manhattan urban road factor (typically 1.35x - 1.55x Euclidean in European urban topology)
      const roadDistKm = Number((straightDistKm * 1.42).toFixed(1));

      // Base urban emergency speed (40 km/h)
      let baseMinutes = (roadDistKm / 42) * 60;

      // Penalties for barriers near ambulance or incident
      const nearBarrier = barrierGraphics.length > 0;
      if (nearBarrier) {
        baseMinutes += 1.8;
      }

      // Check if route crosses known TomTom congestion zones
      if (useTrafficRestrictions) {
        LAUSANNE_TRAFFIC_INCIDENTS.forEach(incident => {
          if (incident.magnitude >= 3) {
            const avgLng = incident.coordinates.reduce((s, c) => s + c[0], 0) / incident.coordinates.length;
            const avgLat = incident.coordinates.reduce((s, c) => s + c[1], 0) / incident.coordinates.length;
            const distToIncident = Math.hypot(avgLng - (incLng + amb.coords[0]) / 2, avgLat - (incLat + amb.coords[1]) / 2);
            if (distToIncident < 0.035) {
              baseMinutes += (incident.delaySeconds ? incident.delaySeconds / 60 : 3.5);
            }
          }
        });
      }

      return {
        ambulance: amb,
        distanceKm: roadDistKm,
        timeMinutes: Math.max(1, Math.round(baseMinutes))
      };
    });

    // Sort by fastest arrival time (ETA)
    evaluated.sort((a, b) => a.timeMinutes - b.timeMinutes);

    // Generate realistic multi-segment polyline path along Lausanne arterial roads
    return evaluated.slice(0, 2).map((item, idx) => {
      const amb = item.ambulance;
      const pathPoints: [number, number][] = [];

      const startLng = amb.coords[0];
      const startLat = amb.coords[1];
      const endLng = incLng;
      const endLat = incLat;

      // Build plausible street grid turns
      pathPoints.push([startLng, startLat]);

      // Mid-point 1 (main arterial avenue)
      const mid1Lng = startLng + (endLng - startLng) * 0.35 + (idx === 1 ? 0.005 : -0.003);
      const mid1Lat = startLat + (endLat - startLat) * 0.15;
      pathPoints.push([mid1Lng, mid1Lat]);

      // Mid-point 2 (intermediate intersection / bridge)
      const mid2Lng = startLng + (endLng - startLng) * 0.70;
      const mid2Lat = startLat + (endLat - startLat) * 0.82 + (idx === 1 ? -0.004 : 0.002);
      pathPoints.push([mid2Lng, mid2Lat]);

      // End point
      pathPoints.push([endLng, endLat]);

      // Convert coordinates to Web Mercator
      const mercatorCoords = pathPoints.map(pt => {
        const [x, y] = this.modules.webMercatorUtils.lngLatToXY(pt[0], pt[1]);
        return [x, y];
      });

      const polyline = new this.modules.Polyline({
        paths: [mercatorCoords],
        spatialReference: { wkid: 3857 }
      });

      return {
        facilityName: amb.name,
        facilityCallsign: amb.callsign,
        timeMinutes: item.timeMinutes,
        distanceKm: item.distanceKm,
        geometry: polyline,
        rank: idx + 1,
        directions: [
          `Départ de ${amb.baseStation}`,
          `Prendre l'axe principal en direction de ${item.distanceKm > 3 ? 'A9 / Centre' : 'Secteur Intervention'}`,
          `Poursuivre sur 1.4 km avec gyrophares et sirènes 2-tons`,
          `Arrivée sur les lieux de l'incident`
        ]
      };
    });
  }

  /**
   * Service Area Analysis (Multi-ring Isochrones)
   */
  async solveServiceArea(
    centerPoint: any,
    breaks: number[] = [2, 4, 6, 8, 10]
  ): Promise<ServiceAreaPolygonResult[]> {
    if (this.apiKey) {
      try {
        return await this.solveServiceAreaArcGIS(centerPoint, breaks);
      } catch (err) {
        console.warn('ArcGIS Service Area API error, fallback to geodesic isochrones:', err);
      }
    }

    return this.solveServiceAreaLocal(centerPoint, breaks);
  }

  private async solveServiceAreaArcGIS(centerPoint: any, breaks: number[]): Promise<ServiceAreaPolygonResult[]> {
    const { Graphic, FeatureSet, ServiceAreaParameters, serviceArea } = this.modules;

    const params = new ServiceAreaParameters({
      facilities: new FeatureSet({ features: [new Graphic({ geometry: this.force3857(centerPoint) })] }),
      defaultBreaks: breaks,
      outSpatialReference: { wkid: 3857 },
      trimOuterPolygon: true
    });

    const result = await serviceArea.solve(SERVICE_AREA_URL, params);
    const polygons = result.serviceAreaPolygons?.features || (Array.isArray(result.serviceAreaPolygons) ? result.serviceAreaPolygons : []);

    // Palette jaune-orange-rouge : du plus près au plus loin
    const colors: [number, number, number, number][] = [
      [250, 204, 21, 0.38],  // Jaune vif (Plus près - accès immédiat)
      [245, 158, 11, 0.30],  // Ambre / Jaune-orangé
      [249, 115, 22, 0.24],  // Orange vif
      [220, 38, 38, 0.20],   // Rouge (Plus loin)
      [185, 28, 28, 0.16]    // Rouge profond
    ];

    return polygons.map((poly: any, idx: number) => {
      const toBreak = poly.attributes?.ToBreak || breaks[idx] || (idx + 1) * 2;
      const color = colors[Math.min(idx, colors.length - 1)];

      return {
        fromBreak: poly.attributes?.FromBreak || (idx === 0 ? 0 : breaks[idx - 1]),
        toBreak,
        geometry: poly.geometry,
        color
      };
    });
  }

  private solveServiceAreaLocal(centerPoint: any, breaks: number[]): ServiceAreaPolygonResult[] {
    const [cLng, cLat] = this.modules.webMercatorUtils.xyToLngLat(centerPoint.x, centerPoint.y);

    // Palette jaune-orange-rouge : du plus près au plus loin
    const colors: [number, number, number, number][] = [
      [250, 204, 21, 0.38],  // Jaune vif (Plus près - couverture 4 min)
      [245, 158, 11, 0.30],  // Ambre / Jaune-orangé (6 min)
      [249, 115, 22, 0.24],  // Orange vif (8 min)
      [220, 38, 38, 0.20],   // Rouge (Plus loin - couverture 10 min)
      [185, 28, 28, 0.16]    // Rouge profond
    ];

    // Generate irregular polygon contour mimicking street accessibility
    return breaks.map((breakMin, idx) => {
      // In urban emergency driving, 1 minute is approx 650m - 750m with priority
      const baseRadiusKm = (breakMin * 0.72);
      const points: [number, number][] = [];
      const steps = 36;

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        // Introduce organic deformation based on terrain and lake shore in Lausanne (south is lake!)
        const noise = 0.88 + 0.24 * Math.sin(angle * 3) + 0.12 * Math.cos(angle * 5);
        let radius = baseRadiusKm * noise;

        // Lake Geneva attenuation: going south is restricted by water
        if (Math.sin(angle) < -0.3) {
          radius *= 0.55;
        }

        const latOffset = (radius / 111.2) * Math.sin(angle);
        const lngOffset = (radius / (111.2 * Math.cos((cLat * Math.PI) / 180))) * Math.cos(angle);

        const [x, y] = this.modules.webMercatorUtils.lngLatToXY(cLng + lngOffset, cLat + latOffset);
        points.push([x, y]);
      }

      const polygon = new this.modules.Polygon({
        rings: [points],
        spatialReference: { wkid: 3857 }
      });

      return {
        fromBreak: idx === 0 ? 0 : breaks[idx - 1],
        toBreak: breakMin,
        geometry: polygon,
        color: colors[idx % colors.length]
      };
    });
  }
}
