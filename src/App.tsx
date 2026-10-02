import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MapContainer } from './components/MapContainer';
import { DispatcherSidebar } from './components/DispatcherSidebar';
import { TrafficDrawer } from './components/TrafficDrawer';
import { FleetModal } from './components/FleetModal';
import { AuthKeyModal } from './components/AuthKeyModal';
import { RouteResult } from './services/networkAnalystService';
import { Ambulance, INITIAL_AMBULANCES } from './data/ambulances';
import { Scenario } from './data/scenarios';
import { generateDispatchAnalysis, DispatchAIReport } from './services/geminiService';

export default function App() {
  // Visualizer settings & theme
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeBasemap, setActiveBasemap] = useState<string>('dark-gray-3d');
  const [showServiceAreas, setShowServiceAreas] = useState<boolean>(true);

  // API credentials (ESRI_Key, Gemini_Key, Tomtom_Key)
  const [esriKey, setEsriKey] = useState<string>(() => localStorage.getItem('esri_api_key') || '');
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || 'AIzaSyAEuiugClJ52WaZE63MqJJfZfqxMZbBtCI';
  });
  const [tomtomKey, setTomtomKey] = useState<string>(() => localStorage.getItem('tomtom_api_key') || '');

  // TomTom Traffic Display Mode: 'vector' (optimized for 3D) vs 'raster'
  const [trafficMode, setTrafficMode] = useState<'vector' | 'raster'>('vector');

  // TomTom Traffic Layer controls
  // 1. Incidents (enabled by default)
  const [incidentsEnabled, setIncidentsEnabled] = useState<boolean>(true);
  const [incidentsOpacity, setIncidentsOpacity] = useState<number>(0.85);

  // 2. Flow (disabled at startup)
  const [flowEnabled, setFlowEnabled] = useState<boolean>(false);
  const [flowOpacity, setFlowOpacity] = useState<number>(0.80);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('has_configured_keys');
  });
  const [isTrafficOpen, setIsTrafficOpen] = useState<boolean>(false);
  const [isFleetOpen, setIsFleetOpen] = useState<boolean>(false);

  // Drawing tool
  const [activeDrawingTool, setActiveDrawingTool] = useState<'point' | 'polyline' | 'polygon' | null>(null);

  // Incident & Network Analyst states
  const [hasIncident, setHasIncident] = useState<boolean>(false);
  const [incidentAddress, setIncidentAddress] = useState<string>('');
  const [incidentCoords, setIncidentCoords] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);

  // AI Dispatch report
  const [aiReport, setAiReport] = useState<DispatchAIReport | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Focus & Scenario
  const [externalFocusCoords, setExternalFocusCoords] = useState<[number, number] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Key savers
  const handleSaveEsriKey = (key: string) => {
    setEsriKey(key);
    localStorage.setItem('esri_api_key', key);
    localStorage.setItem('has_configured_keys', 'true');
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('has_configured_keys', 'true');
  };

  const handleSaveTomtomKey = (key: string) => {
    setTomtomKey(key);
    localStorage.setItem('tomtom_api_key', key);
    localStorage.setItem('has_configured_keys', 'true');
  };

  // Synchronize theme toggle with Esri 3D basemaps
  const handleToggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'light') {
        setActiveBasemap('gray-3d');
      } else {
        setActiveBasemap('dark-gray-3d');
      }
      return nextTheme;
    });
  };

  // Basemap selection callback
  const handleSelectBasemap = (id: string) => {
    setActiveBasemap(id);
    if (id.includes('gray-3d') || id.includes('gray-vector')) {
      if (id.includes('dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  };

  // Incident triggered on map or via scenario
  const handleIncidentTriggered = useCallback(
    async (coords: [number, number], address: string, solvedRoutes: RouteResult[]) => {
      setHasIncident(true);
      setIncidentCoords(coords);
      setIncidentAddress(address);
      setRoutes(solvedRoutes);

      // Trigger AI Dispatch Analysis
      if (solvedRoutes.length > 0) {
        setAiLoading(true);
        try {
          const report = await generateDispatchAnalysis(
            address,
            solvedRoutes,
            true,
            geminiKey
          );
          setAiReport(report);
        } catch (e) {
          console.error("AI Dispatch error:", e);
        } finally {
          setAiLoading(false);
        }
      }
    },
    [geminiKey]
  );

  // Clear incident
  const handleClearIncident = useCallback(() => {
    setHasIncident(false);
    setIncidentCoords(null);
    setIncidentAddress('');
    setRoutes([]);
    setAiReport(null);
    setSelectedScenario(null);
  }, []);

  // Scenario selection
  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    if (scenario.recommendedView) {
      setViewMode(scenario.recommendedView);
    }
  }, []);

  // Drawing complete
  const handleDrawingComplete = useCallback(() => {
    setActiveDrawingTool(null);
  }, []);

  // Fleet update from real-time movement
  const handleFleetUpdated = useCallback((updated: Ambulance[]) => {
    setAmbulances(updated);
  }, []);

  const availableAmbulances = ambulances.filter(a => a.available && a.status !== 'MAINTENANCE');

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} font-sans select-none`}>
      {/* CHUV 144 Header Bar */}
      <Header
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenTraffic={() => setIsTrafficOpen(!isTrafficOpen)}
        onOpenFleet={() => setIsFleetOpen(true)}
        onOpenSettings={() => setIsAuthModalOpen(true)}
        hasIncident={hasIncident}
        availableAmbulanceCount={availableAmbulances.length}
        totalAmbulanceCount={ambulances.length}
        hasTomtomKey={Boolean(tomtomKey)}
      />

      {/* Main 2D / 3D Map Viewport */}
      <main className="w-full h-full">
        <MapContainer
          viewMode={viewMode}
          ambulances={ambulances}
          showServiceAreas={showServiceAreas}
          hasIncident={hasIncident}
          esriKey={esriKey}
          tomtomKey={tomtomKey}
          trafficMode={trafficMode}
          incidentsEnabled={incidentsEnabled}
          incidentsOpacity={incidentsOpacity}
          flowEnabled={flowEnabled}
          flowOpacity={flowOpacity}
          theme={theme}
          activeBasemap={activeBasemap}
          onSelectBasemap={handleSelectBasemap}
          isSimulationFrozen={hasIncident}
          onIncidentTriggered={handleIncidentTriggered}
          onIncidentCleared={handleClearIncident}
          onFleetUpdated={handleFleetUpdated}
          externalFocusCoords={externalFocusCoords}
          activeDrawingTool={activeDrawingTool}
          onDrawingComplete={handleDrawingComplete}
          selectedScenario={selectedScenario}
        />
      </main>

      {/* Floating Tactical Dispatcher Panel (CHUV 144 Style) */}
      <DispatcherSidebar
        hasIncident={hasIncident}
        incidentAddress={incidentAddress}
        incidentCoords={incidentCoords}
        routes={routes}
        aiReport={aiReport}
        aiLoading={aiLoading}
        showServiceAreas={showServiceAreas}
        onToggleServiceAreas={setShowServiceAreas}
        onSelectScenario={handleSelectScenario}
        onStartSketch={setActiveDrawingTool}
        onClearIncident={handleClearIncident}
        activeDrawingTool={activeDrawingTool}
        isSimulationFrozen={hasIncident}
      />

      {/* TomTom Traffic Control Drawer (Vectoriel 3D & Raster) */}
      <TrafficDrawer
        isOpen={isTrafficOpen}
        onClose={() => setIsTrafficOpen(false)}
        hasTomtomKey={Boolean(tomtomKey)}
        onOpenSettings={() => {
          setIsTrafficOpen(false);
          setIsAuthModalOpen(true);
        }}
        trafficMode={trafficMode}
        onChangeTrafficMode={setTrafficMode}
        incidentsEnabled={incidentsEnabled}
        onToggleIncidents={setIncidentsEnabled}
        incidentsOpacity={incidentsOpacity}
        onChangeIncidentsOpacity={setIncidentsOpacity}
        flowEnabled={flowEnabled}
        onToggleFlow={setFlowEnabled}
        flowOpacity={flowOpacity}
        onChangeFlowOpacity={setFlowOpacity}
      />

      {/* Fleet Monitor Modal (Moyens sanitaires engagés) */}
      <FleetModal
        isOpen={isFleetOpen}
        onClose={() => setIsFleetOpen(false)}
        ambulances={ambulances}
        onSelectAmbulance={(amb) => setExternalFocusCoords(amb.coords)}
        activeDispatchedUnitId={routes[0]?.facilityName ? ambulances.find(a => a.name === routes[0].facilityName)?.id : undefined}
        isSimulationFrozen={hasIncident}
      />

      {/* Auth & API Key Startup Modal (ESRI_Key, Gemini_Key, Tomtom_Key) */}
      <AuthKeyModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        esriKey={esriKey}
        onSaveEsriKey={handleSaveEsriKey}
        geminiKey={geminiKey}
        onSaveGeminiKey={handleSaveGeminiKey}
        tomtomKey={tomtomKey}
        onSaveTomtomKey={handleSaveTomtomKey}
        isInitialStartup={!localStorage.getItem('has_configured_keys')}
      />
    </div>
  );
}
