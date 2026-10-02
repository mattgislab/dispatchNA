import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Settings, 
  Truck, 
  Boxes, 
  Compass,
  Key,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  viewMode: '2D' | '3D';
  onToggleViewMode: (mode: '2D' | '3D') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenTraffic: () => void;
  onOpenFleet: () => void;
  onOpenSettings: () => void;
  hasIncident: boolean;
  availableAmbulanceCount: number;
  totalAmbulanceCount: number;
  hasTomtomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onToggleViewMode,
  theme,
  onToggleTheme,
  onOpenTraffic,
  onOpenFleet,
  onOpenSettings,
  hasIncident,
  availableAmbulanceCount,
  totalAmbulanceCount,
  hasTomtomKey
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 h-16 bg-[#002D62] text-white border-b-2 border-[#E20613] px-4 flex items-center justify-between shadow-xl">
      {/* CHUV 144 Logo & Identity */}
      <div className="flex items-center gap-3">
        {/* Official Swiss Red 144 Emergency Badge */}
        <div className="flex items-center gap-2 bg-[#E20613] text-white px-3 py-1.5 rounded-lg shadow-md border border-red-400">
          <span className="text-xl font-black tracking-tight leading-none">144</span>
          <div className="border-l border-red-300 pl-2 leading-tight">
            <span className="block text-[9px] font-extrabold uppercase tracking-wider">URGENCES</span>
            <span className="block text-[8px] font-bold uppercase tracking-wider opacity-90">SANTÉ</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-wide uppercase text-white">
              CHUV · Centrale d'Engagement 144
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-blue-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Vaud · Neuchâtel · Fribourg · Céligny
            </span>
          </div>
        </div>
      </div>

      {/* Large Digital Clock in Header */}
      <div className="flex items-center bg-[#001D42] border border-blue-800/80 px-4 py-1.5 rounded-xl shadow-inner">
        <span className="font-mono text-xl font-black text-white tracking-widest leading-none drop-shadow-sm">
          {time}
        </span>
      </div>

      {/* 2D / 3D Viewport Controls & OSM Buildings & Theme Switcher */}
      <div className="flex items-center gap-2 bg-[#001D42] p-1 rounded-xl border border-blue-900 shadow-inner">
        <div className="flex rounded-lg overflow-hidden bg-[#002654] p-0.5 border border-blue-800">
          <button
            onClick={() => onToggleViewMode('2D')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              viewMode === '2D'
                ? 'bg-white text-[#002D62] shadow-md'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Plan 2D
          </button>
          <button
            onClick={() => onToggleViewMode('3D')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              viewMode === '3D'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Jumeau 3D
          </button>
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Passer en thème clair" : "Passer en thème sombre"}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border bg-[#002654] text-amber-300 border-blue-800 hover:text-white hover:bg-blue-900/60 flex items-center gap-1.5 transition-all"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-300" />
              <span>Sombre</span>
            </>
          )}
        </button>
      </div>

      {/* Action Badges & Buttons */}
      <div className="flex items-center gap-2.5">
        {/* TomTom Traffic Raster Toggle / Info */}
        <button
          onClick={onOpenTraffic}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasTomtomKey
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/50'
              : 'bg-[#001D42] border-blue-800 text-blue-200 hover:bg-blue-900/60'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasTomtomKey ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${hasTomtomKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span>Trafic TomTom</span>
          <span className="text-[10px] opacity-80 font-mono">
            {hasTomtomKey ? "Raster Actif" : "Config requise"}
          </span>
        </button>

        {/* Fleet Monitor Button */}
        <button
          onClick={onOpenFleet}
          className="flex items-center gap-2 bg-[#001D42] hover:bg-blue-900/60 border border-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
        >
          <Truck className="w-3.5 h-3.5 text-blue-300" />
          <span>Moyens Engagés</span>
          <span className="font-mono bg-blue-950 px-1.5 py-0.5 rounded text-emerald-400 font-bold border border-blue-800">
            {availableAmbulanceCount}/{totalAmbulanceCount} disp.
          </span>
        </button>

        {/* API Credentials Setup Button */}
        <button
          onClick={onOpenSettings}
          title="Configurer ESRI_Key, Gemini_Key et Tomtom_Key"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E20613] hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Clés API</span>
        </button>
      </div>
    </header>
  );
};

