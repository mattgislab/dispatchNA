import React, { useState } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Clock, 
  Truck, 
  RotateCcw,
  Radio, 
  Volume2,
  ChevronDown,
  ChevronUp,
  Layers,
  Pause,
  Play
} from 'lucide-react';
import { DEMO_SCENARIOS, Scenario } from '../data/scenarios';
import { RouteResult } from '../services/networkAnalystService';
import { DispatchAIReport } from '../services/geminiService';

interface DispatcherSidebarProps {
  hasIncident: boolean;
  incidentAddress: string;
  incidentCoords: [number, number] | null;
  routes: RouteResult[];
  aiReport: DispatchAIReport | null;
  aiLoading: boolean;
  showServiceAreas: boolean;
  onToggleServiceAreas: (val: boolean) => void;
  onSelectScenario: (scenario: Scenario) => void;
  onStartSketch: (tool: 'point' | 'polyline' | 'polygon') => void;
  onClearIncident: () => void;
  activeDrawingTool: string | null;
  isSimulationFrozen: boolean;
}

export const DispatcherSidebar: React.FC<DispatcherSidebarProps> = ({
  hasIncident,
  incidentAddress,
  incidentCoords,
  routes,
  aiReport,
  aiLoading,
  showServiceAreas,
  onToggleServiceAreas,
  onSelectScenario,
  onStartSketch,
  onClearIncident,
  activeDrawingTool,
  isSimulationFrozen
}) => {
  const [isAiCollapsed, setIsAiCollapsed] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [audioAnnounced, setAudioAnnounced] = useState(false);

  const primaryRoute = routes.length > 0 ? routes[0] : null;
  const secondaryRoute = routes.length > 1 ? routes[1] : null;

  const playRadioBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
      setAudioAnnounced(true);
      setTimeout(() => setAudioAnnounced(false), 2000);
    } catch (e) {
      // AudioContext policy
    }
  };

  return (
    <aside className="absolute top-20 left-4 z-20 w-[390px] max-h-[calc(100vh-95px)] flex flex-col gap-3 pointer-events-none">
      {/* 1. Main Dispatch Control Deck */}
      <div className="bg-white/95 text-slate-900 border border-slate-200 rounded-2xl p-4 shadow-xl backdrop-blur-md pointer-events-auto flex flex-col gap-3">
        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasIncident ? 'bg-red-500' : 'bg-blue-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${hasIncident ? 'bg-[#E20613]' : 'bg-[#002D62]'}`}></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              {hasIncident ? "Intervention en Cours" : "Veille Opérationnelle 144"}
            </span>
          </div>

          {hasIncident && (
            <button
              onClick={onClearIncident}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Quick Scenario Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Scénarios Démo d'Intervention (1 Clic)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_SCENARIOS.slice(0, 4).map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  onSelectScenario(sc);
                }}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  selectedScenarioId === sc.id
                    ? 'bg-blue-50 border-[#002D62] text-[#002D62] font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{sc.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{sc.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Incident Banner */}
        {hasIncident ? (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#E20613] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                Cible d'Intervention Déclarée
              </span>
              {incidentCoords && (
                <span className="font-mono text-[10px] text-slate-500 font-semibold">
                  {incidentCoords[1].toFixed(4)}°N, {incidentCoords[0].toFixed(4)}°E
                </span>
              )}
            </div>
            <p className="text-xs text-slate-900 font-bold leading-snug">
              {incidentAddress || "Localisation cadastrale en cours..."}
            </p>
            {isSimulationFrozen && (
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded border border-red-200">
                <Pause className="w-3 h-3 text-red-700" />
                Déplacement des véhicules figé pendant l'incident
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
            Cliquez sur la carte ou sélectionnez un scénario d'urgence pour déclencher le régulateur.
          </div>
        )}

        {/* Network Analyst Options */}
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Paramètres Network Analyst
            </label>
          </div>

          {/* Toggle Isochrones (Service Area) */}
          <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showServiceAreas}
              onChange={(e) => onToggleServiceAreas(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#002D62] rounded cursor-pointer shrink-0"
            />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-slate-800 block">
                Isochrones d'Accessibilité (Service Area)
              </span>
              <span className="text-[10px] text-slate-500 block mb-1">
                Anneaux 4, 6, 8 et 10 min (du plus près au plus loin)
              </span>
              <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-600">
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>4 min
                </span>
                <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>6 min
                </span>
                <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>8 min
                </span>
                <span className="flex items-center gap-1 bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>10 min
                </span>
              </div>
            </div>
          </label>

          {/* Manual Solver Barriers */}
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Ajouter des Barrières Temporaires au Solveur
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onStartSketch('point')}
                className={`p-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeDrawingTool === 'point'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ⚠️ Point
              </button>
              <button
                onClick={() => onStartSketch('polyline')}
                className={`p-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeDrawingTool === 'polyline'
                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🚧 Tronçon
              </button>
              <button
                onClick={() => onStartSketch('polygon')}
                className={`p-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeDrawingTool === 'polygon'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🚫 Zone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Closest Facility Results */}
      {hasIncident && routes.length > 0 && (
        <div className="bg-white/95 text-slate-900 border border-slate-200 rounded-2xl p-3.5 shadow-xl backdrop-blur-md pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#002D62] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#002D62]" />
              Plus Proches Équipements (Closest Facility)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Solveur Optimisé</span>
          </div>

          <div className="space-y-1.5">
            {/* Primary Unit */}
            {primaryRoute && (
              <div className="p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-400 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      {primaryRoute.facilityName}
                      <span className="text-[9px] text-white font-mono bg-cyan-600 px-1 py-0.5 rounded font-bold">
                        ENGAGÉ
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-600 font-mono flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-cyan-500 inline-block rounded"></span>
                      <span>{primaryRoute.distanceKm} km · Tracé Bleu Turquoise Continu</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-cyan-700 font-mono leading-none">
                    {primaryRoute.timeMinutes} min
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">ETA Estimé</div>
                </div>
              </div>
            )}

            {/* Secondary Unit */}
            {secondaryRoute && (
              <div className="p-2 rounded-xl bg-slate-50 border border-cyan-300/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs border border-cyan-300">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">
                      {secondaryRoute.facilityName}
                      <span className="text-[9px] text-slate-500 ml-1">(Unité de réserve)</span>
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-b border-dashed border-cyan-500 inline-block"></span>
                      <span>{secondaryRoute.distanceKm} km · Tracé Bleu Turquoise Pointillé</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700 font-mono">
                    {secondaryRoute.timeMinutes} min
                  </div>
                  <div className="text-[9px] text-slate-500">ETA Appui</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Cognitive AI Dispatcher Card */}
      {hasIncident && (
        <div className="bg-white/95 text-slate-900 border border-purple-300 rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto overflow-hidden">
          {/* Header */}
          <div
            onClick={() => setIsAiCollapsed(!isAiCollapsed)}
            className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 flex items-center justify-between cursor-pointer hover:bg-purple-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider block">
                  Régulateur IA Santé 144
                </span>
                <span className="text-[10px] text-purple-700 font-mono font-semibold">
                  {aiLoading ? "Synthèse neuronale en cours..." : "Transmission Validée"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-purple-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playRadioBeep();
                }}
                title="Bip radio Tetra Polycom"
                className="p-1 hover:text-purple-950"
              >
                <Volume2 className={`w-4 h-4 ${audioAnnounced ? 'text-green-600' : ''}`} />
              </button>
              {isAiCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* AI Body */}
          {!isAiCollapsed && (
            <div className="p-3.5 text-xs text-slate-800 space-y-2.5 max-h-[260px] overflow-y-auto">
              {aiLoading ? (
                <div className="py-4 text-center text-slate-500 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] italic">Évaluation de la gravité et préparation du message radio...</p>
                </div>
              ) : aiReport ? (
                <>
                  {/* Radio Box */}
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-inner border border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      Transmission Radio Officielle (TETRA Polycom 144)
                    </div>
                    <p className="text-xs text-slate-100 font-mono italic leading-relaxed">
                      {aiReport.radioMessage}
                    </p>
                  </div>

                  {/* Strategic Guidance */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Consignes Médicales & Guidage
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {aiReport.strategicAdvice.map((advice, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#002D62] shrink-0 font-bold">›</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-center py-2 text-xs">
                  Prêt pour l'engagement médical.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
