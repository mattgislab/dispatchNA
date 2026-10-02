import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Upload, 
  Check, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Radio, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AuthKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  esriKey: string;
  onSaveEsriKey: (key: string) => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
  tomtomKey: string;
  onSaveTomtomKey: (key: string) => void;
  isInitialStartup?: boolean;
}

export const AuthKeyModal: React.FC<AuthKeyModalProps> = ({
  isOpen,
  onClose,
  esriKey,
  onSaveEsriKey,
  geminiKey,
  onSaveGeminiKey,
  tomtomKey,
  onSaveTomtomKey,
  isInitialStartup = false
}) => {
  const [localEsri, setLocalEsri] = useState(esriKey);
  const [localGemini, setLocalGemini] = useState(geminiKey);
  const [localTomtom, setLocalTomtom] = useState(tomtomKey);
  const [importedFilename, setImportedFilename] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      let foundCount = 0;

      // Match ESRI_Key / Arcgis_Key
      const esriMatch = text.match(/(?:ESRI_Key|Arcgis_Key|ARCGIS_API_KEY)\s*[:=]\s*["']?([^"'\r\n;]+)["']?/i);
      if (esriMatch && esriMatch[1]) {
        setLocalEsri(esriMatch[1].trim());
        foundCount++;
      }

      // Match Gemini_Key
      const geminiMatch = text.match(/(?:Gemini_Key|GEMINI_API_KEY)\s*[:=]\s*["']?([^"'\r\n;]+)["']?/i);
      if (geminiMatch && geminiMatch[1]) {
        setLocalGemini(geminiMatch[1].trim());
        foundCount++;
      }

      // Match Tomtom_Key
      const tomtomMatch = text.match(/(?:Tomtom_Key|TomTom_Key|TOMTOM_API_KEY)\s*[:=]\s*["']?([^"'\r\n;]+)["']?/i);
      if (tomtomMatch && tomtomMatch[1]) {
        setLocalTomtom(tomtomMatch[1].trim());
        foundCount++;
      }

      setNotification(`${foundCount} clé(s) détectée(s) et injectée(s) depuis ${file.name}`);
      setTimeout(() => setNotification(null), 3500);
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    onSaveEsriKey(localEsri.trim());
    onSaveGeminiKey(localGemini.trim());
    onSaveTomtomKey(localTomtom.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* CHUV 144 Header Bar */}
        <div className="bg-[#002D62] text-white p-5 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Swiss Emergency 144 Badge */}
            <div className="flex items-center justify-center bg-[#E20613] text-white font-extrabold px-3 py-1.5 rounded-lg text-lg tracking-wider shadow-md border border-red-400">
              144
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">CHUV · Urgences Santé</span>
              </div>
              <h2 className="text-base font-bold text-white">Centrale d'Engagement & Régulation Médicale</h2>
              <p className="text-[11px] text-blue-200">Vaud · Neuchâtel · Fribourg · Céligny</p>
            </div>
          </div>

          {!isInitialStartup && (
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-sm">
          {/* Introduction */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#002D62] block mb-1">
              Configuration des Accès API & Moteur Cartographique
            </span>
            Vous pouvez importer directement votre fichier <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-900">API_Key.txt</code> ou renseigner manuellement vos clés d'accès. Le solveur fonctionne avec les services officiels REST d'ArcGIS, le flux de trafic TomTom et l'intelligence de régulation Gemini.
          </div>

          {/* 1. Fast Import from File */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-blue-50 border-2 border-dashed border-[#002D62]/30 rounded-xl hover:border-[#002D62] transition-colors">
            <label className="text-xs font-bold text-[#002D62] uppercase block mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E20613]" />
              Importer automatiquement depuis un fichier texte (.txt)
            </label>
            <input
              type="file"
              accept=".txt,.env,.json"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#002D62] file:text-white hover:file:bg-[#001D42] cursor-pointer transition-colors"
            />
            {importedFilename ? (
              <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Fichier chargé : {importedFilename}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Reconnaît les variables <code className="font-mono text-slate-700">ESRI_Key="..."</code>, <code className="font-mono text-slate-700">Gemini_Key="..."</code> et <code className="font-mono text-slate-700">Tomtom_Key="..."</code>
              </p>
            )}
          </div>

          {notification && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {notification}
            </div>
          )}

          {/* 2. Manual Inputs */}
          <div className="space-y-4">
            {/* ESRI_Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#002D62] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#002D62]" />
                  ESRI_Key (ArcGIS Maps SDK & Network Analyst)
                </label>
                <span className="text-[10px] text-slate-500">Closest Facility & Service Area</span>
              </div>
              <input
                type="text"
                value={localEsri}
                onChange={(e) => setLocalEsri(e.target.value)}
                placeholder="AAPK... (ArcGIS Location Platform Token)"
                className="w-full bg-white border border-slate-300 focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62] p-2.5 rounded-lg text-xs font-mono text-slate-900 outline-none transition-all shadow-sm"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Utilisé pour le calcul d'itinéraires d'urgence et les polygones d'isochrones (simulation de secours locale active si vide).
              </p>
            </div>

            {/* Tomtom_Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#E20613] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#E20613]" />
                  Tomtom_Key (Dalles Raster Incidents & Trafic)
                </label>
                <span className="text-[10px] font-semibold text-slate-600">Flux Orbis v2/v4</span>
              </div>
              <input
                type="text"
                value={localTomtom}
                onChange={(e) => setLocalTomtom(e.target.value)}
                placeholder="TomTom API Traffic Flow Key..."
                className="w-full bg-white border border-slate-300 focus:border-[#E20613] focus:ring-1 focus:ring-[#E20613] p-2.5 rounded-lg text-xs font-mono text-slate-900 outline-none transition-all shadow-sm"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Active le chargement des tuiles raster <code className="font-mono text-slate-700">api.tomtom.com/traffic/map/4/tile</code> en temps réel.
              </p>
            </div>

            {/* Gemini_Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  Gemini_Key (Régulation IA & Dispatcher Médical)
                </label>
                <span className="text-[10px] text-slate-500">Google AI Studio</span>
              </div>
              <input
                type="password"
                value={localGemini}
                onChange={(e) => setLocalGemini(e.target.value)}
                placeholder="AIzaSy... (Clé API Gemini)"
                className="w-full bg-white border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 p-2.5 rounded-lg text-xs font-mono text-slate-900 outline-none transition-all shadow-sm"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Génère les transmissions radio TETRA Polycom et les directives d'engagement médical en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {isInitialStartup ? "Continuer en mode démonstration" : "Fermer"}
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2.5 text-xs font-bold bg-[#002D62] hover:bg-[#001D42] text-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Lancer la Centrale 144
          </button>
        </div>
      </div>
    </div>
  );
};
