import React from 'react';
import { X, Truck, BatteryCharging, CheckCircle, Clock, AlertTriangle, Radio, MapPin, Gauge } from 'lucide-react';
import { Ambulance } from '../data/ambulances';
import { LAUSANNE_ROAD_CORRIDORS } from '../data/roadCorridors';

interface FleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambulances: Ambulance[];
  onSelectAmbulance: (amb: Ambulance) => void;
  activeDispatchedUnitId?: string;
  isSimulationFrozen: boolean;
}

export const FleetModal: React.FC<FleetModalProps> = ({
  isOpen,
  onClose,
  ambulances,
  onSelectAmbulance,
  activeDispatchedUnitId,
  isSimulationFrozen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-150">
        {/* CHUV 144 Header */}
        <div className="p-4 border-b border-blue-900 flex items-center justify-between bg-[#002D62] text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-[#E20613] text-white font-extrabold px-2.5 py-1 rounded text-sm shadow-md">
              144
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Moyens Sanitaires Engagés & Disponibles
              </h2>
              <p className="text-xs text-blue-200">
                Unités en patrouille sur les axes routiers prioritaires
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSimulationFrozen && (
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Simulation figée (Incident actif)
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Units Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {ambulances.map((amb) => {
            const isAssigned = amb.id === activeDispatchedUnitId;
            const corridor = amb.corridorId ? LAUSANNE_ROAD_CORRIDORS[amb.corridorId] : null;

            return (
              <div
                key={amb.id}
                className={`p-3.5 rounded-xl border bg-white shadow-sm transition-all ${
                  isAssigned
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : amb.available
                    ? 'border-slate-200 hover:border-blue-400'
                    : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        isAssigned
                          ? 'bg-emerald-600 text-white'
                          : amb.type === 'SMUR'
                          ? 'bg-[#002D62] text-white'
                          : amb.available
                          ? 'bg-slate-100 text-[#002D62] border border-slate-300'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{amb.name}</h4>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                          {amb.callsign}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          amb.available
                            ? 'bg-emerald-100 text-emerald-800'
                            : amb.status === 'EN MISSION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {amb.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                        <span className="font-medium text-[#002D62]">{amb.baseStation}</span>
                        {corridor && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#E20613]" />
                              {corridor.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Speed */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1 justify-end">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        {amb.speedKmH} km/h
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isSimulationFrozen ? 'Vitesse figée' : 'Patrouille active'}
                      </div>
                    </div>

                    {/* Focus Map Button */}
                    <button
                      onClick={() => {
                        onSelectAmbulance(amb);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#002D62] hover:bg-[#001D42] text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Localiser
                    </button>
                  </div>
                </div>

                {/* Equipment chips */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                  {amb.equipment.slice(0, 3).map((eq, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {eq}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono ml-auto">
                    Batterie : {amb.batteryLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
