import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadArcGIS, ArcGISModules } from '../services/arcgisLoader';
import { NetworkAnalystService, RouteResult, ServiceAreaPolygonResult } from '../services/networkAnalystService';
import { Ambulance, INITIAL_AMBULANCES } from '../data/ambulances';
import { LAUSANNE_ROAD_CORRIDORS } from '../data/roadCorridors';
import { Scenario } from '../data/scenarios';
import { BasemapSelector, ESRI_BASEMAPS } from './BasemapSelector';

// Resolve basemap ID cleanly for 2D vs 3D
export function resolveBasemap(basemapId: string, mode: '2D' | '3D'): string {
  const option = ESRI_BASEMAPS.find(b => b.id === basemapId || b.id3D === basemapId || b.id2D === basemapId);
  if (option) {
    return mode === '3D' ? option.id3D : option.id2D;
  }
  if (mode === '2D') {
    if (basemapId.startsWith('osm')) return 'osm';
    const converted = basemapId.replace('-3d', '-vector');
    return converted === 'osm-vector' ? 'osm' : converted;
  } else {
    if (basemapId === 'osm') return 'osm-3d';
    return basemapId.replace('-vector', '-3d');
  }
}

// High-DPI PNG Data URIs generated via Offscreen Canvas
// This completely avoids SVG XML path inspection by ArcGIS IconSymbol3DLayer and eliminates the
// "path cannot be mapped to Icon symbol. Fallback to circle" warning in 3D SceneView.
const vehiclePngCache: Record<string, string> = {};

function getVehiclePngDataUri(type: string, isAvailable: boolean, isSMUR: boolean): string {
  const cacheKey = `${type}_${isAvailable}_${isSMUR}`;
  if (vehiclePngCache[cacheKey]) return vehiclePngCache[cacheKey];

  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;

  const bg = !isAvailable ? '#64748b' : (isSMUR ? '#002D62' : type === 'VIR' ? '#0284c7' : '#E20613');
  const ring = !isAvailable ? '#94a3b8' : (isSMUR ? '#38bdf8' : type === 'VIR' ? '#7dd3fc' : '#ffffff');

  // 1. Drop shadow & Base Disc
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Outer White Border & Accent Inner Ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = ring;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(cx, cy, 35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Flashing Blue Beacon on Top
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(cx - 5, cy - 25, 10, 5);

  // 4. Ambulance Silhouette Body
  ctx.fillStyle = '#ffffff';
  // Rear box
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(cx - 24, cy - 18, 30, 24, 3);
    ctx.fill();
  } else {
    ctx.fillRect(cx - 24, cy - 18, 30, 24);
  }

  // Front cabin
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy - 18);
  ctx.lineTo(cx + 15, cy - 18);
  ctx.lineTo(cx + 24, cy - 6);
  ctx.lineTo(cx + 24, cy + 6);
  ctx.lineTo(cx + 6, cy + 6);
  ctx.closePath();
  ctx.fill();

  // Windshield
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 16);
  ctx.lineTo(cx + 14, cy - 16);
  ctx.lineTo(cx + 21, cy - 6);
  ctx.lineTo(cx + 8, cy - 6);
  ctx.closePath();
  ctx.fill();

  // 5. Wheels
  const drawWheel = (wx: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, cy + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(wx, cy + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawWheel(cx - 14);
  drawWheel(cx + 14);

  // 6. Swiss Medical Cross on ambulance door
  ctx.fillStyle = bg;
  const crossSize = 12;
  const crossThick = 4;
  ctx.fillRect(cx - 15, cy - 10, crossSize, crossThick);
  ctx.fillRect(cx - 11, cy - 14, crossThick, crossSize);

  const dataUri = canvas.toDataURL('image/png');
  vehiclePngCache[cacheKey] = dataUri;
  return dataUri;
}

let targetPinPngCache = '';

function getTargetPinPngDataUri(): string {
  if (targetPinPngCache) return targetPinPngCache;
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;

  // Outer Reticle Ring
  ctx.strokeStyle = '#E20613';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, 43, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner White Ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.stroke();

  // Cardinal Ticks
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 2, 2, 4, 10);
  ctx.fillRect(cx - 2, size - 12, 4, 10);
  ctx.fillRect(2, cy - 2, 10, 4);
  ctx.fillRect(size - 12, cy - 2, 10, 4);

  // Center Target Disc with Glow
  ctx.save();
  ctx.shadowColor = 'rgba(226, 6, 19, 0.7)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#E20613';
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // White Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Swiss Medical Emergency Cross
  ctx.fillStyle = '#ffffff';
  const cW = 22;
  const cT = 6;
  ctx.fillRect(cx - cW / 2, cy - cT / 2, cW, cT);
  ctx.fillRect(cx - cT / 2, cy - cW / 2, cT, cW);

  const dataUri = canvas.toDataURL('image/png');
  targetPinPngCache = dataUri;
  return dataUri;
}

interface MapContainerProps {
  viewMode: '2D' | '3D';
  ambulances?: Ambulance[];
  showServiceAreas: boolean;
  hasIncident?: boolean;
  esriKey: string;
  tomtomKey: string;
  trafficMode: 'vector' | 'raster';
  incidentsEnabled: boolean;
  incidentsOpacity: number;
  flowEnabled: boolean;
  flowOpacity: number;
  theme: 'dark' | 'light';
  activeBasemap: string;
  onSelectBasemap: (id: string) => void;
  isSimulationFrozen: boolean;
  onIncidentTriggered: (coords: [number, number], address: string, routes: RouteResult[]) => void;
  onIncidentCleared: () => void;
  onFleetUpdated: (ambulances: Ambulance[]) => void;
  externalFocusCoords: [number, number] | null;
  activeDrawingTool: 'point' | 'polyline' | 'polygon' | null;
  onDrawingComplete: () => void;
  selectedScenario: Scenario | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  viewMode,
  ambulances = INITIAL_AMBULANCES,
  showServiceAreas,
  hasIncident = false,
  esriKey,
  tomtomKey,
  trafficMode,
  incidentsEnabled,
  incidentsOpacity,
  flowEnabled,
  flowOpacity,
  theme,
  activeBasemap,
  onSelectBasemap,
  isSimulationFrozen,
  onIncidentTriggered,
  onIncidentCleared,
  onFleetUpdated,
  externalFocusCoords,
  activeDrawingTool,
  onDrawingComplete,
  selectedScenario
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<ArcGISModules | null>(null);
  const naServiceRef = useRef<NetworkAnalystService | null>(null);

  const viewRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  // Layers
  const serviceAreaLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const tomtomIncidentsLayerRef = useRef<any>(null);
  const tomtomFlowLayerRef = useRef<any>(null);
  const traffic3DHazardsLayerRef = useRef<any>(null);
  const barrierLayerRef = useRef<any>(null);
  const ambulanceLayerRef = useRef<any>(null);
  const incidentLayerRef = useRef<any>(null);
  const sketchVMRef = useRef<any>(null);

  // Simulation & Animation references
  const initPatrolStates = (units: Ambulance[]) => {
    const states: { [id: string]: { corridorId: string; currentWaypointIdx: number; direction: 1 | -1; progress: number } } = {};
    units.forEach((amb, idx) => {
      const cId = amb.corridorId || 'centreChuv';
      states[amb.id] = {
        corridorId: cId,
        currentWaypointIdx: amb.waypointIndex ?? (idx % 3),
        direction: (amb.direction as 1 | -1) ?? 1,
        progress: (idx * 0.25) % 1
      };
    });
    return states;
  };

  const initialUnits = ambulances && ambulances.length > 0 ? ambulances : INITIAL_AMBULANCES;
  const ambulancesRef = useRef<Ambulance[]>(initialUnits);
  const patrolStatesRef = useRef<{ [id: string]: { corridorId: string; currentWaypointIdx: number; direction: 1 | -1; progress: number } }>(
    initPatrolStates(initialUnits)
  );
  const trackingIntervalRef = useRef<number | null>(null);
  const isSimulationFrozenRef = useRef<boolean>(isSimulationFrozen);

  // Target Dynamic Halo animation
  const haloAnimRef = useRef<number | null>(null);
  const haloPhaseRef = useRef<number>(0);
  const activeIncidentPointRef = useRef<any>(null);
  const currentBasemapIdRef = useRef<string>('');

  // Intercept and swallow ArcGIS SDK AbortError from view destruction and basemap switching
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      if (
        reason?.name === 'AbortError' ||
        reason?.message === 'Aborted' ||
        (typeof reason?.message === 'string' && reason.message.includes('Aborted'))
      ) {
        // Prevent browser/runtime error overlay from treating cancelled HTTP requests as fatal crashes
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // React to hasIncident toggle: clear layers if incident was reset
  useEffect(() => {
    if (!hasIncident) {
      if (incidentLayerRef.current) incidentLayerRef.current.removeAll();
      if (routeLayerRef.current) routeLayerRef.current.removeAll();
      if (serviceAreaLayerRef.current) serviceAreaLayerRef.current.removeAll();
      if (haloAnimRef.current) {
        cancelAnimationFrame(haloAnimRef.current);
        haloAnimRef.current = null;
      }
      activeIncidentPointRef.current = null;
    }
  }, [hasIncident]);

  // React to showServiceAreas toggle: adjust visibility & calculate if newly activated
  useEffect(() => {
    if (serviceAreaLayerRef.current) {
      serviceAreaLayerRef.current.visible = showServiceAreas;
    }
    if (showServiceAreas && activeIncidentPointRef.current && naServiceRef.current && modulesRef.current && serviceAreaLayerRef.current) {
      if (serviceAreaLayerRef.current.graphics.length === 0) {
        const pt = activeIncidentPointRef.current;
        const Graphic = modulesRef.current.Graphic;
        naServiceRef.current.solveServiceArea(pt, [4, 6, 8, 10]).then((isochrones) => {
          if (!serviceAreaLayerRef.current || !activeIncidentPointRef.current) return;
          const sortedIsochrones = [...isochrones].sort((a, b) => b.toBreak - a.toBreak);
          sortedIsochrones.forEach((iso: ServiceAreaPolygonResult) => {
            const g = new Graphic({
              geometry: iso.geometry,
              attributes: { from: iso.fromBreak, to: iso.toBreak },
              symbol: {
                type: "simple-fill",
                color: iso.color,
                outline: {
                  color: [iso.color[0], iso.color[1], iso.color[2], 0.9],
                  width: 1.5
                }
              }
            });
            serviceAreaLayerRef.current.add(g);
          });
        }).catch(err => console.warn("Service area error:", err));
      }
    }
  }, [showServiceAreas]);

  // Ready indicator
  const [mapReady, setMapReady] = useState(false);

  // Keep isSimulationFrozen ref in sync
  useEffect(() => {
    isSimulationFrozenRef.current = isSimulationFrozen;
  }, [isSimulationFrozen]);

  // Sync ambulances when prop changes from outside
  useEffect(() => {
    if (ambulances && ambulances.length > 0) {
      ambulancesRef.current = ambulances;
      if (mapReady && modulesRef.current) {
        renderAmbulances(ambulances, modulesRef.current);
      }
    }
  }, [ambulances, mapReady]);

  // 1. Initial Map & Module Bootstrapping
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const modules = await loadArcGIS();
        if (isCancelled) return;

        modulesRef.current = modules;
        if (esriKey && modules.esriConfig) {
          modules.esriConfig.apiKey = esriKey;
        }

        // Intercept internal ArcGIS logger messages for harmless AbortErrors
        if (modules.esriConfig?.log?.interceptors) {
          modules.esriConfig.log.interceptors.push((_level: any, details: any) => {
            if (
              details?.error?.name === 'AbortError' ||
              details?.message?.includes('Aborted') ||
              details?.error?.message?.includes('Aborted') ||
              details?.message?.includes('Failed to load basemap')
            ) {
              return true; // Discard benign abort log
            }
            return false;
          });
        }

        naServiceRef.current = new NetworkAnalystService(modules, esriKey);

        const { Map, GraphicsLayer } = modules;

        // Initialize tactical layers
        serviceAreaLayerRef.current = new GraphicsLayer({ title: "Zones d'Isochrones (Service Area)", opacity: 0.85 });
        routeLayerRef.current = new GraphicsLayer({ title: "Itinéraires Network Analyst" });
        barrierLayerRef.current = new GraphicsLayer({ title: "Barrières du Solveur" });
        ambulanceLayerRef.current = new GraphicsLayer({ title: "Flotte Sanitaire 144" });
        incidentLayerRef.current = new GraphicsLayer({ title: "Incident Actif & Cible" });
        traffic3DHazardsLayerRef.current = new GraphicsLayer({ 
          title: "Balises Aériennes Trafic 3D", 
          elevationInfo: { mode: "relative-to-ground" },
          visible: viewMode === '3D' && incidentsEnabled
        });

        // Map setup with official 3D/2D Esri basemap (falls back to OSM if no key)
        const initialRawBasemap = resolveBasemap(activeBasemap, viewMode);
        const initialBasemap = (!esriKey && !initialRawBasemap.startsWith('osm')) ? 'osm' : initialRawBasemap;
        currentBasemapIdRef.current = initialBasemap;
        const mapLayers: any[] = [
          serviceAreaLayerRef.current,
          routeLayerRef.current,
          barrierLayerRef.current,
          ambulanceLayerRef.current,
          incidentLayerRef.current,
          traffic3DHazardsLayerRef.current
        ];

        mapRef.current = new Map({
          basemap: initialBasemap,
          ground: "world-elevation",
          layers: mapLayers
        });

        // Initialize TomTom Layers (Vectoriel 3D ou Raster)
        initTomtomLayers(modules, tomtomKey, trafficMode);

        // Create initial view
        createView(viewMode, modules);

        // Populate initial ambulances
        const unitsToRender = ambulances && ambulances.length > 0 ? ambulances : INITIAL_AMBULANCES;
        ambulancesRef.current = unitsToRender;
        patrolStatesRef.current = initPatrolStates(unitsToRender);
        renderAmbulances(unitsToRender, modules);

        // Start slow road-only patrol tracking
        startRoadPatrol(modules);

        setMapReady(true);
      } catch (err) {
        console.error("Map initialization failed:", err);
      }
    }

    init();

    return () => {
      isCancelled = true;
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (haloAnimRef.current) cancelAnimationFrame(haloAnimRef.current);
      if (viewRef.current) {
        try {
          viewRef.current.map = null;
          viewRef.current.container = null;
          viewRef.current.destroy();
        } catch (_) {}
        viewRef.current = null;
      }
    };
  }, []);

  // 2. Initialize TomTom Layers: Vector Tiles (3D Optimisé) or Raster Tiles
  const initTomtomLayers = (modules: ArcGISModules, key: string, mode: 'vector' | 'raster') => {
    if (!mapRef.current || !modules) return;

    if (tomtomIncidentsLayerRef.current) {
      mapRef.current.remove(tomtomIncidentsLayerRef.current);
      tomtomIncidentsLayerRef.current = null;
    }
    if (tomtomFlowLayerRef.current) {
      mapRef.current.remove(tomtomFlowLayerRef.current);
      tomtomFlowLayerRef.current = null;
    }

    if (!key) return;

    try {
      if (mode === 'vector' && modules.VectorTileLayer) {
        // --- 1. VECTOR TILES FOR 3D (MVT/Protobuf draped on terrain) ---
        // Vector Flow Tiles
        tomtomFlowLayerRef.current = new modules.VectorTileLayer({
          title: "Trafic TomTom - Flux Vectoriel 3D",
          opacity: flowOpacity,
          visible: flowEnabled,
          style: {
            version: 8,
            sources: {
              "tomtom-flow": {
                type: "vector",
                tiles: [
                  `https://api.tomtom.com/maps/orbis/traffic/flow/vector/tile/{z}/{x}/{y}?apiVersion=2&key=${key}`
                ],
                minzoom: 0,
                maxzoom: 22
              }
            },
            layers: [
              {
                id: "tomtom-flow-line-case",
                type: "line",
                source: "tomtom-flow",
                "source-layer": "Traffic flow",
                paint: {
                  "line-color": "#000000",
                  "line-width": 5,
                  "line-opacity": 0.4
                }
              },
              {
                id: "tomtom-flow-line",
                type: "line",
                source: "tomtom-flow",
                "source-layer": "Traffic flow",
                paint: {
                  "line-color": [
                    "case",
                    ["==", ["get", "road_closure"], true], "#b91c1c",
                    ["<=", ["get", "relative_speed"], 0.25], "#dc2626",
                    ["<=", ["get", "relative_speed"], 0.5], "#f97316",
                    ["<=", ["get", "relative_speed"], 0.75], "#eab308",
                    "#10b981"
                  ],
                  "line-width": 3.2,
                  "line-opacity": 0.95
                }
              }
            ]
          }
        });

        // Vector Incident Tiles
        tomtomIncidentsLayerRef.current = new modules.VectorTileLayer({
          title: "Trafic TomTom - Incidents Vectoriels 3D",
          opacity: incidentsOpacity,
          visible: incidentsEnabled,
          style: {
            version: 8,
            sources: {
              "tomtom-incidents": {
                type: "vector",
                tiles: [
                  `https://api.tomtom.com/maps/orbis/traffic/incidents/vector/tile/{z}/{x}/{y}?apiVersion=2&key=${key}`
                ],
                minzoom: 0,
                maxzoom: 22
              }
            },
            layers: [
              {
                id: "tomtom-incidents-glow",
                type: "line",
                source: "tomtom-incidents",
                "source-layer": "Traffic incident flow",
                paint: {
                  "line-color": "#E20613",
                  "line-width": 7,
                  "line-opacity": 0.4
                }
              },
              {
                id: "tomtom-incidents-flow",
                type: "line",
                source: "tomtom-incidents",
                "source-layer": "Traffic incident flow",
                paint: {
                  "line-color": "#ff2230",
                  "line-width": 3.8,
                  "line-opacity": 0.95
                }
              },
              {
                id: "tomtom-incidents-poi",
                type: "circle",
                source: "tomtom-incidents",
                "source-layer": "Traffic incident points",
                paint: {
                  "circle-radius": 7,
                  "circle-color": "#E20613",
                  "circle-stroke-width": 2.2,
                  "circle-stroke-color": "#ffffff"
                }
              }
            ]
          }
        });

        // Fetch live 3D tactical hazard beacons
        load3DTacticalHazards(modules, key);

      } else if (modules.WebTileLayer) {
        // --- 2. RASTER TILES FALLBACK ---
        tomtomFlowLayerRef.current = new modules.WebTileLayer({
          urlTemplate: `https://api.tomtom.com/maps/orbis/traffic/flow/raster/tile/{level}/{col}/{row}?apiVersion=2&key=${key}`,
          title: "Trafic TomTom - Flux Relatif (Raster)",
          opacity: flowOpacity,
          visible: flowEnabled
        });

        tomtomIncidentsLayerRef.current = new modules.WebTileLayer({
          urlTemplate: `https://api.tomtom.com/maps/orbis/traffic/incidents/raster/tile/{level}/{col}/{row}?apiVersion=2&key=${key}`,
          title: "Trafic TomTom - Incidents (Raster)",
          opacity: incidentsOpacity,
          visible: incidentsEnabled
        });

        if (traffic3DHazardsLayerRef.current) {
          traffic3DHazardsLayerRef.current.removeAll();
        }
      }

      // Add to map right above basemap
      if (tomtomFlowLayerRef.current) mapRef.current.add(tomtomFlowLayerRef.current, 1);
      if (tomtomIncidentsLayerRef.current) mapRef.current.add(tomtomIncidentsLayerRef.current, 2);
    } catch (e) {
      console.warn("Could not instantiate TomTom layers:", e);
    }
  };

  // Fetch live TomTom incident details and render 3D Elevated Aerial Beacons (above 3D buildings)
  const load3DTacticalHazards = async (modules: ArcGISModules, key: string) => {
    if (!key || !traffic3DHazardsLayerRef.current) return;
    try {
      const bbox = "6.46,46.49,6.72,46.56";
      const res = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${bbox}&fields=%7Bincidents%7Btype,geometry%7Btype,coordinates%7D,properties%7BiconCategory,magnitudeOfDelay,events%7Bdescription,code%7D%7D%7D%7D&key=${key}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.incidents || !Array.isArray(data.incidents)) return;

      const { Graphic, Point, Polyline } = modules;
      const newGraphics: any[] = [];

      data.incidents.slice(0, 30).forEach((inc: any) => {
        let lon: number | null = null;
        let lat: number | null = null;

        if (inc.geometry?.type === 'Point' && Array.isArray(inc.geometry.coordinates)) {
          [lon, lat] = inc.geometry.coordinates;
        } else if (inc.geometry?.type === 'LineString' && Array.isArray(inc.geometry.coordinates?.[0])) {
          [lon, lat] = inc.geometry.coordinates[0];
        } else if (inc.geometry?.type === 'MultiLineString' && Array.isArray(inc.geometry.coordinates?.[0]?.[0])) {
          [lon, lat] = inc.geometry.coordinates[0][0];
        }

        if (lon === null || lat === null) return;

        const iconCat = inc.properties?.iconCategory;
        const desc = inc.properties?.events?.[0]?.description || "Incident de circulation";
        
        let iconEmoji = "⚠️";
        let markerColor = "#f59e0b";
        if (iconCat === 9) { // Roadworks
          iconEmoji = "🚧";
          markerColor = "#f97316";
        } else if (iconCat === 8 || desc.toLowerCase().includes("closed")) { // Road closed
          iconEmoji = "⛔";
          markerColor = "#e20613";
        } else if (iconCat === 1 || iconCat === 6) { // Accident / Jam
          iconEmoji = "🚨";
          markerColor = "#dc2626";
        }

        const groundPt = modules.webMercatorUtils.lngLatToXY(lon, lat);

        // 1. Vertical laser callout line dropping from 55m altitude to ground
        const calloutLine = new Graphic({
          geometry: new Polyline({
            paths: [[[groundPt[0], groundPt[1], 0], [groundPt[0], groundPt[1], 55]]],
            spatialReference: { wkid: 102100 }
          }),
          symbol: {
            type: "simple-line",
            color: [...(markerColor === "#e20613" ? [226, 6, 19] : [245, 158, 11]), 0.7],
            width: 2,
            style: "dash"
          }
        });

        // 2. Elevated 3D tactical billboard marker at 55m altitude
        const elevatedMarker = new Graphic({
          geometry: new Point({
            x: groundPt[0],
            y: groundPt[1],
            z: 55,
            spatialReference: { wkid: 102100 }
          }),
          attributes: {
            title: desc,
            category: iconCat,
            type: "tactical-hazard"
          },
          symbol: {
            type: "text",
            text: iconEmoji,
            font: { size: 16, weight: "bold" },
            haloColor: markerColor,
            haloSize: "2.5px"
          },
          popupTemplate: {
            title: `Alerte Trafic TomTom: ${iconEmoji}`,
            content: `<b>Description :</b> ${desc}<br><b>Délai :</b> ${inc.properties?.magnitudeOfDelay ? inc.properties.magnitudeOfDelay + ' min' : 'Non spécifié'}`
          }
        });

        newGraphics.push(calloutLine, elevatedMarker);
      });

      traffic3DHazardsLayerRef.current.removeAll();
      traffic3DHazardsLayerRef.current.addMany(newGraphics);
    } catch (e) {
      console.warn("Could not load 3D tactical hazards:", e);
    }
  };

  // Update TomTom layers on key or mode change
  useEffect(() => {
    if (mapReady && modulesRef.current) {
      initTomtomLayers(modulesRef.current, tomtomKey, trafficMode);
    }
  }, [tomtomKey, trafficMode, mapReady]);

  // Update TomTom Incidents layer visibility & opacity
  useEffect(() => {
    if (tomtomIncidentsLayerRef.current) {
      tomtomIncidentsLayerRef.current.visible = incidentsEnabled;
      tomtomIncidentsLayerRef.current.opacity = incidentsOpacity;
    }
    if (traffic3DHazardsLayerRef.current) {
      traffic3DHazardsLayerRef.current.visible = incidentsEnabled;
    }
  }, [incidentsEnabled, incidentsOpacity]);

  // Update TomTom Flow layer visibility & opacity
  useEffect(() => {
    if (tomtomFlowLayerRef.current) {
      tomtomFlowLayerRef.current.visible = flowEnabled;
      tomtomFlowLayerRef.current.opacity = flowOpacity;
    }
  }, [flowEnabled, flowOpacity]);

  // Safe basemap applicator with AbortError prevention and caching
  const applyBasemap = useCallback((targetId: string) => {
    if (!mapRef.current) return;
    if (currentBasemapIdRef.current === targetId && mapRef.current.basemap) {
      return; // Already active, avoid redundant assignment that triggers AbortError
    }
    currentBasemapIdRef.current = targetId;

    try {
      mapRef.current.basemap = targetId;
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn("Could not set basemap:", e);
        try {
          mapRef.current.basemap = 'osm';
          currentBasemapIdRef.current = 'osm';
        } catch (_) {}
      }
    }
  }, []);

  // Update Map Basemap when activeBasemap or esriKey changes (viewMode is handled inside createView)
  useEffect(() => {
    if (mapRef.current) {
      const rawTargetBasemap = resolveBasemap(activeBasemap, viewMode);
      const targetBasemap = (!esriKey && !rawTargetBasemap.startsWith('osm')) ? 'osm' : rawTargetBasemap;
      applyBasemap(targetBasemap);
    }
  }, [activeBasemap, esriKey, applyBasemap]);

  // 4. Create View (2D MapView vs 3D SceneView)
  const createView = (mode: '2D' | '3D', modules: ArcGISModules) => {
    if (!containerRef.current || !mapRef.current) return;

    let safeCenter: [number, number] = [6.6323, 46.5197];
    let safeZoom = 13;

    if (viewRef.current) {
      try {
        const c = viewRef.current.center;
        if (c) {
          if (typeof c.longitude === 'number' && !isNaN(c.longitude) && Math.abs(c.longitude) <= 180) {
            safeCenter = [c.longitude, c.latitude];
          } else if (typeof c.x === 'number' && !isNaN(c.x)) {
            if (Math.abs(c.x) > 180) {
              const xyToLngLat = modules.webMercatorUtils?.xyToLngLat || modules.webMercatorUtils?.default?.xyToLngLat;
              if (xyToLngLat) {
                const [lng, lat] = xyToLngLat(c.x, c.y);
                if (!isNaN(lng) && !isNaN(lat)) safeCenter = [lng, lat];
              }
            } else {
              safeCenter = [c.x, c.y];
            }
          }
        } else if (viewRef.current.camera?.position?.longitude) {
          safeCenter = [viewRef.current.camera.position.longitude, viewRef.current.camera.position.latitude];
        }

        if (typeof viewRef.current.zoom === 'number' && !isNaN(viewRef.current.zoom)) {
          safeZoom = Math.min(18, Math.max(10, Math.round(viewRef.current.zoom)));
        }
      } catch (e) {
        console.warn("Could not read previous extent:", e);
      }

      if (sketchVMRef.current) {
        try {
          sketchVMRef.current.destroy();
        } catch (e) {}
        sketchVMRef.current = null;
      }

      try {
        viewRef.current.map = null;
        viewRef.current.container = null;
        viewRef.current.destroy();
      } catch (e) {
        console.warn("View destroy error:", e);
      }
      viewRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Configure 2D vs 3D map properties
    const rawTargetBasemap = resolveBasemap(activeBasemap, mode);
    const targetBasemap = (!esriKey && !rawTargetBasemap.startsWith('osm')) ? 'osm' : rawTargetBasemap;
    applyBasemap(targetBasemap);

    // Set elevation only in 3D mode
    if (mode === '3D') {
      mapRef.current.ground = "world-elevation";
    } else {
      mapRef.current.ground = null as any;
    }

    if (traffic3DHazardsLayerRef.current) {
      traffic3DHazardsLayerRef.current.visible = (mode === '3D' && incidentsEnabled);
    }

    const { MapView, SceneView, SketchViewModel } = modules;

    if (mode === '3D') {
      viewRef.current = new SceneView({
        container: containerRef.current,
        map: mapRef.current,
        center: safeCenter,
        zoom: Math.max(12, safeZoom),
        camera: {
          position: {
            longitude: safeCenter[0] - 0.012,
            latitude: safeCenter[1] - 0.024,
            z: 2200
          },
          tilt: 54,
          heading: 25
        },
        environment: {
          atmosphere: { quality: "high" },
          lighting: {
            directShadowsEnabled: true,
            date: new Date("2026-09-24T10:30:00")
          }
        },
        ui: { components: ["zoom", "compass", "navigation-toggle"] }
      });
    } else {
      viewRef.current = new MapView({
        container: containerRef.current,
        map: mapRef.current,
        center: safeCenter,
        zoom: safeZoom,
        constraints: { rotationEnabled: false },
        ui: { components: ["zoom", "compass"] }
      });
    }

    viewRef.current.when(() => {
      renderAmbulances(ambulancesRef.current, modules);

      // Synchronize 3D laser beam / beacon if incident is currently active
      if (activeIncidentPointRef.current && incidentLayerRef.current) {
        const graphics = incidentLayerRef.current.graphics.toArray();
        const pt = activeIncidentPointRef.current;
        const beamGraphic = graphics.find((g: any) => g.attributes?.type === 'incident-laser-beam');
        const beaconGraphic = graphics.find((g: any) => g.attributes?.type === 'incident-beacon3d');

        if (mode === '3D') {
          if (!beamGraphic && modules.Polyline) {
            const laserBeam = new modules.Graphic({
              geometry: new modules.Polyline({
                paths: [[[pt.x, pt.y, 0], [pt.x, pt.y, 90]]],
                spatialReference: pt.spatialReference
              }),
              attributes: { type: 'incident-laser-beam' },
              symbol: {
                type: "simple-line",
                color: [226, 6, 19, 0.85],
                width: 3.5
              }
            });
            const beacon3D = new modules.Graphic({
              geometry: new modules.Point({
                x: pt.x,
                y: pt.y,
                z: 90,
                spatialReference: pt.spatialReference
              }),
              attributes: { type: 'incident-beacon3d' },
              symbol: {
                type: "simple-marker",
                style: "circle",
                color: "#E20613",
                size: 20,
                outline: { color: "#FFFFFF", width: 2.5 }
              }
            });
            incidentLayerRef.current.addMany([laserBeam, beacon3D]);
          }
        } else {
          // In 2D: remove 3D elevated graphics that have no height dimension
          if (beamGraphic) incidentLayerRef.current.remove(beamGraphic);
          if (beaconGraphic) incidentLayerRef.current.remove(beaconGraphic);
        }

        startDynamicHaloAnimation();
      }
    }, (err: any) => {
      if (err?.name === 'AbortError' || err?.message?.includes('Aborted')) {
        return; // Harmless AbortError when view is destroyed or replaced
      }
      console.warn("View when error, falling back to OSM basemap:", err);
      if (mapRef.current && mapRef.current.basemap !== 'osm') {
        applyBasemap('osm');
      }
    });

    // SketchViewModel for manual barriers
    sketchVMRef.current = new SketchViewModel({
      view: viewRef.current,
      layer: barrierLayerRef.current,
      updateOnGraphicClick: true,
      defaultCreateOptions: { hasZ: false }
    });

    sketchVMRef.current.on('create', (event: any) => {
      if (event.state === 'complete') {
        onDrawingComplete();
        if (activeIncidentPointRef.current) {
          triggerIncidentSolve(activeIncidentPointRef.current);
        }
      }
    });

    // Map click -> Trigger incident
    viewRef.current.on('click', (event: any) => {
      if (sketchVMRef.current?.state === 'active') return;
      if (event.mapPoint) {
        triggerIncidentSolve(event.mapPoint);
      }
    });
  };

  // Re-create view when mode changes
  useEffect(() => {
    if (mapReady && modulesRef.current) {
      createView(viewMode, modulesRef.current);
    }
  }, [viewMode]);

  // Update Esri Key in NA service and esriConfig
  useEffect(() => {
    if (esriKey) {
      if (naServiceRef.current) {
        naServiceRef.current.setApiKey(esriKey);
      }
      if (modulesRef.current?.esriConfig) {
        modulesRef.current.esriConfig.apiKey = esriKey;
      }
    }
  }, [esriKey]);

  // External focus pan
  useEffect(() => {
    if (externalFocusCoords && viewRef.current && modulesRef.current) {
      const [lng, lat] = externalFocusCoords;
      const pt = new modulesRef.current.Point({
        longitude: lng,
        latitude: lat,
        spatialReference: { wkid: 4326 }
      });

      if (viewMode === '3D') {
        viewRef.current.goTo({
          target: pt,
          zoom: 15,
          tilt: 55,
          heading: 20
        }, { duration: 1400 });
      } else {
        viewRef.current.goTo({
          target: pt,
          zoom: 15
        }, { duration: 1200 });
      }
    }
  }, [externalFocusCoords, viewMode]);

  // Handle Scenario Selection
  useEffect(() => {
    if (selectedScenario && viewRef.current && modulesRef.current) {
      const [lng, lat] = selectedScenario.coords;
      const pt = new modulesRef.current.Point({
        longitude: lng,
        latitude: lat,
        spatialReference: { wkid: 4326 }
      });

      const webMercatorPt = modulesRef.current.webMercatorUtils.geographicToWebMercator(pt);
      triggerIncidentSolve(webMercatorPt, selectedScenario.address);

      viewRef.current.goTo({
        target: pt,
        zoom: 15,
        tilt: viewMode === '3D' ? 52 : 0
      }, { duration: 1400 });
    }
  }, [selectedScenario]);

  // Drawing tool activation
  useEffect(() => {
    if (sketchVMRef.current && activeDrawingTool) {
      sketchVMRef.current.create(activeDrawingTool);
    }
  }, [activeDrawingTool]);

  // 5. Render Flotte Sanitaire 144
  const renderAmbulances = useCallback((units: Ambulance[], modules: ArcGISModules) => {
    if (!ambulanceLayerRef.current || !modules) return;

    ambulanceLayerRef.current.removeAll();
    const { Graphic, Point } = modules;

    units.forEach(amb => {
      const [lng, lat] = amb.coords;
      const [gx, gy] = modules.webMercatorUtils.lngLatToXY(lng, lat);
      const geom = new Point({
        x: gx,
        y: gy,
        spatialReference: { wkid: 102100 }
      });

      const isSMUR = amb.type === 'SMUR';
      const isAvailable = amb.available && amb.status !== 'MAINTENANCE';

      // Halo
      const haloGraphic = new Graphic({
        geometry: geom,
        attributes: { id: amb.id, type: 'amb-halo' },
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: isAvailable ? (isSMUR ? [0, 45, 98, 0.25] : [34, 197, 94, 0.25]) : [239, 68, 68, 0.2],
          size: 28,
          outline: {
            color: isAvailable ? (isSMUR ? "#002D62" : "#22c55e") : "#94a3b8",
            width: 2.5
          }
        }
      });

      // Marker Icon (Ambulance with Swiss Cross - High-DPI PNG PictureMarkerSymbol: 100% 2D & 3D compatible)
      const markerGraphic = new Graphic({
        geometry: geom,
        attributes: { id: amb.id, type: 'amb-marker' },
        symbol: {
          type: "picture-marker",
          url: getVehiclePngDataUri(amb.type, isAvailable, isSMUR),
          width: 32,
          height: 32
        },
        popupTemplate: {
          title: `🚨 ${amb.name} [${amb.callsign}]`,
          content: `
            <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;"><b>Type :</b> ${amb.type}</p>
              <p style="margin: 0 0 4px 0;"><b>Statut :</b> <span style="color: ${isAvailable ? '#16a34a' : '#dc2626'}; font-weight: bold;">${amb.status}</span></p>
              <p style="margin: 0 0 4px 0;"><b>Base :</b> ${amb.baseStation}</p>
              <p style="margin: 0 0 4px 0;"><b>Équipage :</b> ${amb.crew}</p>
              <p style="margin: 0;"><b>Vitesse :</b> ${amb.speedKmH} km/h · <b>Batterie :</b> ${amb.batteryLevel}%</p>
            </div>
          `
        }
      });

      // Callsign Label positioned on top of the vehicle symbol
      const labelGraphic = new Graphic({
        geometry: geom,
        attributes: { id: amb.id, type: 'amb-label' },
        symbol: {
          type: "text",
          text: `${amb.name} [${amb.callsign}]`,
          color: isAvailable ? "#ffffff" : "#94a3b8",
          haloColor: "#002D62",
          haloSize: "2.5px",
          font: { size: 10, weight: "bold", family: "system-ui, sans-serif" },
          yoffset: 24,
          horizontalAlignment: "center"
        }
      });

      ambulanceLayerRef.current.addMany([haloGraphic, markerGraphic, labelGraphic]);
    });
  }, []);

  // 6. Realistic Slow Patrol Strictly on Road Corridors
  const startRoadPatrol = (modules: ArcGISModules) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    trackingIntervalRef.current = window.setInterval(() => {
      if (isSimulationFrozenRef.current) {
        return;
      }

      const prev = ambulancesRef.current;
      const nextUnits = prev.map(amb => {
        if (!amb.available && amb.status === 'MAINTENANCE') return amb;

        const pState = patrolStatesRef.current[amb.id];
        if (!pState) return amb;

        const corridor = LAUSANNE_ROAD_CORRIDORS[pState.corridorId];
        if (!corridor || corridor.waypoints.length < 2) return amb;

        const step = 0.008;
        let newProgress = pState.progress + step;
        let newIdx = pState.currentWaypointIdx;
        let newDir = pState.direction;

        if (newProgress >= 1.0) {
          newProgress = 0;
          newIdx += newDir;

          if (newIdx >= corridor.waypoints.length - 1) {
            newIdx = corridor.waypoints.length - 2;
            newDir = -1;
          } else if (newIdx < 0) {
            newIdx = 0;
            newDir = 1;
          }
        }

        const wpA = corridor.waypoints[newIdx];
        const wpB = corridor.waypoints[newIdx + 1];

        const lng = wpA.lng + (wpB.lng - wpA.lng) * newProgress;
        const lat = wpA.lat + (wpB.lat - wpA.lat) * newProgress;

        patrolStatesRef.current[amb.id] = {
          corridorId: pState.corridorId,
          currentWaypointIdx: newIdx,
          direction: newDir,
          progress: newProgress
        };

        return { ...amb, coords: [lng, lat] as [number, number] };
      });

      ambulancesRef.current = nextUnits;

      if (ambulanceLayerRef.current) {
        const graphics = ambulanceLayerRef.current.graphics.toArray();
        nextUnits.forEach(u => {
          const [gx, gy] = modules.webMercatorUtils.lngLatToXY(u.coords[0], u.coords[1]);
          graphics.forEach((g: any) => {
            if (g.attributes?.id === u.id) {
              g.geometry = new modules.Point({
                x: gx,
                y: gy,
                spatialReference: { wkid: 102100 }
              });
            }
          });
        });
      }

      onFleetUpdated(nextUnits);
    }, 1800);
  };

  // 7. Tactical Incident Target with Dynamic Halo Animation Loop
  const startDynamicHaloAnimation = () => {
    if (haloAnimRef.current) cancelAnimationFrame(haloAnimRef.current);

    const animate = () => {
      if (!activeIncidentPointRef.current || !incidentLayerRef.current) {
        haloAnimRef.current = null;
        return;
      }

      haloPhaseRef.current += 0.045;
      const phase = haloPhaseRef.current;

      // Wave 1: expanding outer shockwave (28px to 105px)
      const size1 = 28 + ((Math.sin(phase) + 1) / 2) * 77;
      const alpha1 = Math.max(0.04, 0.85 * (1 - (size1 - 28) / 77));

      // Wave 2: expanding mid radar wave (20px to 72px)
      const size2 = 20 + ((Math.sin(phase + 1.8) + 1) / 2) * 52;
      const alpha2 = Math.max(0.04, 0.75 * (1 - (size2 - 20) / 52));

      // Wave 3: fast inner radar ping (12px to 46px)
      const size3 = 12 + ((Math.sin(phase + 3.2) + 1) / 2) * 34;
      const alpha3 = Math.max(0.05, 0.9 * (1 - (size3 - 12) / 34));

      // Reticle rotation & core breath
      const pinSize = 30 + Math.sin(phase * 2) * 3; // 27px to 33px throb
      const reticleAngle = (phase * 25) % 360;

      if (incidentLayerRef.current) {
        const graphics = incidentLayerRef.current.graphics.toArray();
        const halo1 = graphics.find((g: any) => g.attributes?.type === 'incident-halo1');
        const halo2 = graphics.find((g: any) => g.attributes?.type === 'incident-halo2');
        const halo3 = graphics.find((g: any) => g.attributes?.type === 'incident-halo3');
        const pin = graphics.find((g: any) => g.attributes?.type === 'incident-pin');
        const reticle = graphics.find((g: any) => g.attributes?.type === 'incident-reticle');
        const beacon3d = graphics.find((g: any) => g.attributes?.type === 'incident-beacon3d');

        if (halo1) {
          halo1.symbol = {
            type: "simple-marker",
            style: "circle",
            color: [226, 6, 19, alpha1 * 0.3],
            size: size1,
            outline: { color: [226, 6, 19, alpha1], width: 2.2 }
          };
        }
        if (halo2) {
          halo2.symbol = {
            type: "simple-marker",
            style: "circle",
            color: [255, 255, 255, alpha2 * 0.15],
            size: size2,
            outline: { color: [255, 255, 255, alpha2 * 0.9], width: 1.8 }
          };
        }
        if (halo3) {
          halo3.symbol = {
            type: "simple-marker",
            style: "circle",
            color: [226, 6, 19, alpha3 * 0.45],
            size: size3,
            outline: { color: [255, 70, 70, alpha3], width: 1.5 }
          };
        }
        if (pin) {
          const sym = pin.symbol.clone();
          sym.width = `${Math.round(pinSize + 6)}px`;
          sym.height = `${Math.round(pinSize + 6)}px`;
          pin.symbol = sym;
        }
        if (reticle) {
          const sym = reticle.symbol.clone();
          sym.angle = reticleAngle;
          reticle.symbol = sym;
        }
        if (beacon3d) {
          const sym = beacon3d.symbol.clone();
          sym.size = 18 + Math.sin(phase * 2) * 4;
          beacon3d.symbol = sym;
        }
      }

      haloAnimRef.current = requestAnimationFrame(animate);
    };

    haloAnimRef.current = requestAnimationFrame(animate);
  };

  // 8. Incident Solve (Network Analyst: Closest Facility & Service Area)
  const triggerIncidentSolve = async (point: any, addressHint?: string) => {
    if (!modulesRef.current || !naServiceRef.current) return;

    activeIncidentPointRef.current = point;

    // Clear previous graphics
    incidentLayerRef.current.removeAll();
    routeLayerRef.current.removeAll();
    serviceAreaLayerRef.current.removeAll();

    const { Graphic } = modulesRef.current;

    // --- RECONFIGURED DYNAMIC TACTICAL TARGET SYMBOL & MULTI-WAVE HALO ---
    // 1. Dynamic Expanding Wave 1 (Outer shockwave)
    const halo1 = new Graphic({
      geometry: point,
      attributes: { type: 'incident-halo1' },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [226, 6, 19, 0.3],
        size: 40,
        outline: { color: [226, 6, 19, 0.9], width: 2.2 }
      }
    });

    // 2. Dynamic Expanding Wave 2 (Mid radar ring)
    const halo2 = new Graphic({
      geometry: point,
      attributes: { type: 'incident-halo2' },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [255, 255, 255, 0.15],
        size: 26,
        outline: { color: [255, 255, 255, 0.8], width: 1.8 }
      }
    });

    // 3. Dynamic Expanding Wave 3 (Inner sonar ping)
    const halo3 = new Graphic({
      geometry: point,
      attributes: { type: 'incident-halo3' },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [226, 6, 19, 0.4],
        size: 16,
        outline: { color: [255, 90, 90, 0.95], width: 1.5 }
      }
    });

    // 4. Tactical Rotating Crosshair Reticle Ring
    const reticleRing = new Graphic({
      geometry: point,
      attributes: { type: 'incident-reticle' },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [226, 6, 19, 0.08],
        size: 44,
        outline: { color: "#FFFFFF", width: 2, style: "dash" }
      }
    });

    // 5. Core Swiss Emergency Tactical Reticle Symbol (High-DPI PNG PictureMarkerSymbol: 100% compatible with 2D & 3D)
    const centerPin = new Graphic({
      geometry: point,
      attributes: { type: 'incident-pin' },
      symbol: {
        type: "picture-marker",
        url: getTargetPinPngDataUri(),
        width: "38px",
        height: "38px"
      }
    });

    // 6. High-Contrast Swiss Medical Cross
    const crossLabel = new Graphic({
      geometry: point,
      attributes: { type: 'incident-cross' },
      symbol: {
        type: "text",
        text: "✚",
        color: "#FFFFFF",
        font: { size: 14, weight: "bold", family: "system-ui, sans-serif" },
        yoffset: 0
      }
    });

    // 7. Tactical Callout Label: street address positioned to the right of the target symbol
    const initialText = addressHint || "Recherche d'adresse...";
    const targetLabel = new Graphic({
      geometry: point,
      attributes: { type: 'incident-label' },
      symbol: {
        type: "text",
        text: initialText,
        color: "#FFFFFF",
        haloColor: "#002D62",
        haloSize: "3px",
        font: { size: 11, weight: "bold", family: "system-ui, sans-serif" },
        xoffset: 28,
        yoffset: 0,
        horizontalAlignment: "left"
      }
    });

    incidentLayerRef.current.addMany([halo1, halo2, halo3, reticleRing, centerPin, targetLabel]);

    // 8. In 3D: Add vertical luminous laser beam & elevated 3D target beacon pin
    if (viewMode === '3D' && modulesRef.current.Polyline) {
      const laserBeam = new Graphic({
        geometry: new modulesRef.current.Polyline({
          paths: [[[point.x, point.y, 0], [point.x, point.y, 90]]],
          spatialReference: point.spatialReference
        }),
        attributes: { type: 'incident-laser-beam' },
        symbol: {
          type: "simple-line",
          color: [226, 6, 19, 0.85],
          width: 3.5
        }
      });

      const beacon3D = new Graphic({
        geometry: new modulesRef.current.Point({
          x: point.x,
          y: point.y,
          z: 90,
          spatialReference: point.spatialReference
        }),
        attributes: { type: 'incident-beacon3d' },
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: "#E20613",
          size: 20,
          outline: { color: "#FFFFFF", width: 2.5 }
        }
      });

      incidentLayerRef.current.addMany([laserBeam, beacon3D]);
    }

    // Start high-performance dynamic halo pulsing loop
    startDynamicHaloAnimation();

    // Reverse geocode or use addressHint
    const address = addressHint || await naServiceRef.current.reverseGeocode(point);
    const [lng, lat] = modulesRef.current.webMercatorUtils.xyToLngLat(point.x, point.y);

    // Update target label with the street address, positioned on the right
    if (incidentLayerRef.current) {
      const currentGraphics = incidentLayerRef.current.graphics.toArray();
      const labelGraphic = currentGraphics.find((g: any) => g.attributes?.type === 'incident-label');
      if (labelGraphic) {
        const sym = labelGraphic.symbol.clone();
        sym.text = address;
        labelGraphic.symbol = sym;
      }
    }

    // Solve Service Area (Isochrones) if enabled (Palette jaune-orange-rouge, du plus près au plus loin)
    if (showServiceAreas) {
      try {
        const isochrones = await naServiceRef.current.solveServiceArea(point, [4, 6, 8, 10]);
        // Sort descending by toBreak so outer rings (farthest, red) are added first,
        // and innermost ring (closest, bright yellow) is drawn on top!
        const sortedIsochrones = [...isochrones].sort((a, b) => b.toBreak - a.toBreak);
        sortedIsochrones.forEach((iso: ServiceAreaPolygonResult) => {
          const g = new Graphic({
            geometry: iso.geometry,
            attributes: { from: iso.fromBreak, to: iso.toBreak },
            symbol: {
              type: "simple-fill",
              color: iso.color,
              outline: {
                color: [iso.color[0], iso.color[1], iso.color[2], 0.9],
                width: 1.5
              }
            }
          });
          serviceAreaLayerRef.current.add(g);
        });
      } catch (err) {
        console.warn("Service Area solve error:", err);
      }
    }

    // Solve Closest Facility Routing
    try {
      const barrierGraphics = barrierLayerRef.current ? barrierLayerRef.current.graphics.toArray() : [];
      const solvedRoutes = await naServiceRef.current.solveClosestFacility(
        point,
        ambulancesRef.current,
        barrierGraphics,
        true
      );

      // Render routes with turquoise styling adapted for dark theme
      // 1. Closest facility (rank 1): Luminous electric turquoise (#00f5ff) with solid line
      // 2. Next best facility (rank > 1): Turquoise blue (#22d3ee) with dashed line ("en pointillé")
      // Sort in descending rank order so secondary is drawn underneath, and primary is on top
      const sortedRoutes = [...solvedRoutes].sort((a: RouteResult, b: RouteResult) => b.rank - a.rank);

      sortedRoutes.forEach((res: RouteResult) => {
        const isPrimary = res.rank === 1;
        // High-contrast turquoise blue tailored for dark theme visualization
        const mainColor = isPrimary ? [0, 245, 255, 1.0] : [0, 220, 245, 0.9];
        const casingColor = isPrimary ? [0, 120, 160, 0.4] : [0, 80, 110, 0.25];
        const mainWidth = isPrimary ? 5.5 : 3.8;
        const lineStyle = isPrimary ? "solid" : "dash";

        // Under-glow casing for tactical contrast against dark and complex basemaps
        const casingGraphic = new Graphic({
          geometry: res.geometry,
          attributes: { rank: res.rank, facility: res.facilityName, type: 'route-casing' },
          symbol: {
            type: "simple-line",
            color: casingColor,
            width: mainWidth + 4,
            style: lineStyle
          }
        });

        // Main luminous turquoise route line
        const routeGraphic = new Graphic({
          geometry: res.geometry,
          attributes: { rank: res.rank, facility: res.facilityName, time: res.timeMinutes, type: 'route-main' },
          symbol: {
            type: "simple-line",
            color: mainColor,
            width: mainWidth,
            style: lineStyle
          }
        });

        routeLayerRef.current.addMany([casingGraphic, routeGraphic]);
      });

      onIncidentTriggered([lng, lat], address, solvedRoutes);
    } catch (err) {
      console.error("Closest Facility solve error:", err);
      onIncidentTriggered([lng, lat], address, []);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 2D / 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Tactical Esri 3D Basemaps Selector in Bottom-Right Corner */}
      <div className="absolute bottom-6 right-6 z-20">
        <BasemapSelector
          currentBasemap={activeBasemap}
          onSelectBasemap={onSelectBasemap}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};
