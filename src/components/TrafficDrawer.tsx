import React from 'react';
import { 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Car, 
  ShieldAlert,
  Construction,
  Ban,
  Boxes,
  Grid
} from 'lucide-react';

interface TrafficDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hasTomtomKey: boolean;
  onOpenSettings: () => void;
  incidentsEnabled: boolean;
  onToggleIncidents: (enabled: boolean) => void;
  incidentsOpacity: number;
  onChangeIncidentsOpacity: (opacity: number) => void;
  flowEnabled: boolean;
  onToggleFlow: (enabled: boolean) => void;
  flowOpacity: number;
  onChangeFlowOpacity: (opacity: number) => void;
  trafficMode: 'vector' | 'raster';
  onChangeTrafficMode: (mode: 'vector' | 'raster') => void;
}

export const TrafficDrawer: React.FC<TrafficDrawerProps> = ({
  isOpen,
  onClose,
  hasTomtomKey,
  onOpenSettings,
  incidentsEnabled,
  onToggleIncidents,
  incidentsOpacity,
  onChangeIncidentsOpacity,
  flowEnabled,
  onToggleFlow,
  flowOpacity,
  onChangeFlowOpacity,
  trafficMode,
  onChangeTrafficMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-4 z-30 w-[400px] max-h-[calc(100vh-100px)] flex flex-col bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#002D62] text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E20613] text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Trafic TomTom Temps Réel
            </h2>
            <p className="text-[11px] text-blue-200">Vectoriel 3D & Dalles d'Incidents / Flux</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] text-xs">
        {/* Status notification */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
          hasTomtomKey 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          {hasTomtomKey ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-xs">
              {hasTomtomKey ? "Clé API TomTom Active" : "Clé API TomTom Requise"}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {hasTomtomKey ? (
                <>Services connectés aux tuiles vectorielles & raster TomTom Orbis v2.</>
              ) : (
                <>Renseignez votre <span className="font-bold">Tomtom_Key</span> pour afficher les couches de trafic sur la carte.</>
              )}
            </p>
            {!hasTomtomKey && (
              <button
                onClick={onOpenSettings}
                className="mt-1 px-3 py-1 bg-[#E20613] text-white font-bold rounded-md text-[11px] shadow-sm hover:bg-red-700 transition-colors inline-block"
              >
                Renseigner Tomtom_Key
              </button>
            )}
          </div>
        </div>

        {/* MODE SELECTOR: 3D Vectoriel vs Raster */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-[#002D62]" />
              Mode d'Affichage Cartographique
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-900">
              {trafficMode === 'vector' ? 'Optimisé 3D' : 'Standard 2D'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeTrafficMode('vector')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                trafficMode === 'vector'
                  ? 'bg-blue-900 text-white border-blue-950 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Boxes className={`w-3.5 h-3.5 ${trafficMode === 'vector' ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>Vectoriel 3D</span>
              </div>
              <p className={`text-[10px] mt-1 leading-tight ${trafficMode === 'vector' ? 'text-blue-200' : 'text-slate-500'}`}>
                Tuiles vectorielles PBF drapées + Balises aériennes 3D au-dessus du bâti.
              </p>
            </button>

            <button
              onClick={() => onChangeTrafficMode('raster')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                trafficMode === 'raster'
                  ? 'bg-blue-900 text-white border-blue-950 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Grid className={`w-3.5 h-3.5 ${trafficMode === 'raster' ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>Dalles Raster</span>
              </div>
              <p className={`text-[10px] mt-1 leading-tight ${trafficMode === 'raster' ? 'text-blue-200' : 'text-slate-500'}`}>
                Images PNG transparentes (256x256) sur le sol.
              </p>
            </button>
          </div>
        </div>

        {/* 1. SERVICE INCIDENTS (Vectoriel ou Raster) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  {trafficMode === 'vector' ? 'Vector Incident Tiles (PBF)' : 'Raster Incident Tiles'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Événements, fermetures de routes et chantiers
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={incidentsEnabled}
                onChange={(e) => onToggleIncidents(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#002D62]"></div>
            </label>
          </div>

          {incidentsEnabled && (
            <>
              {/* Opacity Slider */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    Opacité du calque d'incidents
                  </span>
                  <span className="font-mono font-bold text-[#002D62]">
                    {Math.round(incidentsOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={incidentsOpacity}
                  onChange={(e) => onChangeIncidentsOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#002D62] cursor-pointer"
                />
              </div>

              {/* Incidents Legend */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Légende des Incidents TomTom
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                    <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Route fermée</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Accident / Danger</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                    <Construction className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Chantier / Travaux</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Voie bloquée</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. SERVICE FLOW TILES (Vectoriel ou Raster) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Car className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  {trafficMode === 'vector' ? 'Vector Flow Tiles (PBF)' : 'Raster Flow Tiles'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Vitesse relative en temps réel (désactivé au démarrage)
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={flowEnabled}
                onChange={(e) => onToggleFlow(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {flowEnabled ? (
            <>
              {/* Opacity Slider */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    Opacité du flux de trafic
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {Math.round(flowOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={flowOpacity}
                  onChange={(e) => onChangeFlowOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Flow Legend */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Légende des Vitesses Relatives TomTom
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="font-medium text-slate-800">Fluide (Vitesse normale)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">100%</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="font-medium text-slate-800">Ralentissement modéré</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">50 - 75%</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                      <span className="font-medium text-slate-800">Trafic dense / Congestion</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">25 - 50%</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600"></span>
                      <span className="font-medium text-slate-800">Bouchon sévère / Bloqué</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">&lt; 25%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-slate-500 italic pt-1">
              Activez le calque ci-dessus pour superposer le flux de vitesse en temps réel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
