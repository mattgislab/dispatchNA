import React, { useState } from 'react';
import { Layers, Check, Mountain, Building2, Moon, Sun, Compass, Globe } from 'lucide-react';

export interface EsriBasemapOption {
  id: string;
  id3D: string;
  id2D: string;
  name: string;
  category: '3D' | 'Standard';
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const ESRI_BASEMAPS: EsriBasemapOption[] = [
  {
    id: 'osm-3d',
    id3D: 'osm-3d',
    id2D: 'osm',
    name: 'Esri OpenStreetMap 3D',
    category: '3D',
    description: 'Bâtiments 3D détaillés et textures OpenStreetMap',
    icon: <Building2 className="w-4 h-4 text-emerald-400" />,
    badge: '3D Recommandé'
  },
  {
    id: 'dark-gray-3d',
    id3D: 'dark-gray-3d',
    id2D: 'dark-gray-vector',
    name: 'Esri 3D Sombre (Dark Canvas)',
    category: '3D',
    description: 'Fond noir contrasté avec volumes 3D intégrés',
    icon: <Moon className="w-4 h-4 text-blue-400" />,
    badge: 'Tactique 144'
  },
  {
    id: 'gray-3d',
    id3D: 'gray-3d',
    id2D: 'gray-vector',
    name: 'Esri 3D Clair (Light Canvas)',
    category: '3D',
    description: 'Fond clair haute lisibilité et volumes 3D',
    icon: <Sun className="w-4 h-4 text-amber-400" />
  },
  {
    id: 'streets-3d',
    id3D: 'streets-3d',
    id2D: 'streets-vector',
    name: 'Esri 3D Rues & Réseau',
    category: '3D',
    description: 'Axes routiers majeurs et bâti 3D',
    icon: <Compass className="w-4 h-4 text-indigo-400" />
  },
  {
    id: 'topo-3d',
    id3D: 'topo-3d',
    id2D: 'topo-vector',
    name: 'Esri 3D Relief Topographique',
    category: '3D',
    description: 'Modèle d’élévation mondial et courbes de niveau',
    icon: <Mountain className="w-4 h-4 text-teal-400" />
  },
  {
    id: 'satellite',
    id3D: 'satellite',
    id2D: 'satellite',
    name: 'Esri 3D Satellite / Hybride',
    category: '3D',
    description: 'Orthophotographies spatiales haute résolution',
    icon: <Globe className="w-4 h-4 text-cyan-400" />
  }
];

interface BasemapSelectorProps {
  currentBasemap: string;
  onSelectBasemap: (basemapId: string) => void;
  viewMode: '2D' | '3D';
}

export const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  currentBasemap,
  onSelectBasemap,
  viewMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = ESRI_BASEMAPS.find(b => 
    b.id === currentBasemap || b.id3D === currentBasemap || b.id2D === currentBasemap
  ) || ESRI_BASEMAPS[1]; // default dark-gray-3d

  return (
    <div className="relative pointer-events-auto select-none">
      {/* Dropup Menu */}
      {isOpen && (
        <div 
          className="absolute bottom-12 right-0 w-72 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E20613]" />
              {viewMode === '3D' ? 'Fonds de Carte 3D Esri' : 'Fonds de Carte 2D Plan'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-semibold border border-blue-700/50">
              Mode {viewMode}
            </span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pt-1 pr-0.5">
            {ESRI_BASEMAPS.map((option) => {
              const isSelected = activeOption.id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelectBasemap(viewMode === '3D' ? option.id3D : option.id2D);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border border-blue-500/60 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="p-1.5 rounded-md bg-slate-800/90 shrink-0 mt-0.5 border border-slate-700">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">
                        {option.name}
                      </span>
                      {option.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E20613]/30 text-red-200 border border-red-500/40 shrink-0 font-medium">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger Button in bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl backdrop-blur-md transition-all active:scale-95 group"
        title="Changer le fond 3D Esri"
      >
        <div className="p-1 rounded-md bg-slate-800 text-blue-400 border border-slate-700 group-hover:text-white transition-colors">
          {activeOption.icon}
        </div>
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
            {viewMode === '3D' ? 'Fond 3D Esri' : 'Fond Plan 2D'}
          </div>
          <div className="text-xs font-bold text-white leading-tight mt-0.5 truncate max-w-[130px]">
            {activeOption.name.replace('Esri ', '')}
          </div>
        </div>
        <Layers className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>
    </div>
  );
};
