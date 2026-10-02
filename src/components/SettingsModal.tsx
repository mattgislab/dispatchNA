import React, { useState } from 'react';
import { X, Key, Upload, Shield, Check, RefreshCw, FileText } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  arcgisKey: string;
  onSaveArcgisKey: (key: string) => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
  onImportCustomGeoJSON: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  arcgisKey,
  onSaveArcgisKey,
  geminiKey,
  onSaveGeminiKey,
  onImportCustomGeoJSON
}) => {
  const [localArcgis, setLocalArcgis] = useState(arcgisKey);
  const [localGemini, setLocalGemini] = useState(geminiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveArcgisKey(localArcgis);
    onSaveGeminiKey(localGemini);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleConfigFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const esriMatch = text.match(/ESRI_Key\s*=\s*"([^"]+)"/i);
      const geminiMatch = text.match(/Gemini_Key\s*=\s*"([^"]+)"/i);

      if (esriMatch && esriMatch[1]) setLocalArcgis(esriMatch[1]);
      if (geminiMatch && geminiMatch[1]) setLocalGemini(geminiMatch[1]);
    };
    reader.readAsText(file);
  };

  const handleGeoJSONInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onImportCustomGeoJSON(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Configuration des Accès & Données
              </h2>
              <p className="text-[11px] text-slate-400">Services ArcGIS, Gemini IA & Trafic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Quick Import from API_Key.txt */}
          <div className="p-3.5 bg-slate-950/60 border border-dashed border-emerald-500/40 rounded-xl">
            <label className="text-xs text-emerald-400 font-bold uppercase block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Importer API_Key.txt (ArcGIS & Gemini)
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleConfigFile}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Extrait automatiquement ESRI_Key="..." et Gemini_Key="..."
            </p>
          </div>

          {/* ArcGIS API Key */}
          <div>
            <label className="text-xs text-blue-400 font-bold uppercase block mb-1 flex items-center justify-between">
              <span>Clé ArcGIS API (Network Analyst REST)</span>
              <span className="text-[10px] text-slate-500 normal-case">Optionnel (Mode simulation inclus)</span>
            </label>
            <input
              type="text"
              value={localArcgis}
              onChange={(e) => setLocalArcgis(e.target.value)}
              placeholder="AAPK..."
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none font-mono"
            />
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="text-xs text-purple-400 font-bold uppercase block mb-1 flex items-center justify-between">
              <span>Clé Google Gemini API (Analyse Cognitive)</span>
              <span className="text-[10px] text-slate-500 normal-case">Injectée côté serveur par défaut</span>
            </label>
            <input
              type="password"
              value={localGemini}
              onChange={(e) => setLocalGemini(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-purple-500 outline-none font-mono"
            />
          </div>

          {/* Custom GeoJSON Loader */}
          <div className="p-3.5 bg-slate-950/60 border border-dashed border-amber-500/40 rounded-xl">
            <label className="text-xs text-amber-400 font-bold uppercase block mb-1.5 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Importer Données Trafic Personnalisées (.json)
            </label>
            <input
              type="file"
              accept=".json,.geojson"
              onChange={handleGeoJSONInput}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer transition-colors"
            />
            {fileName ? (
              <p className="text-[11px] text-emerald-400 mt-1">Fichier actif : {fileName}</p>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1">
                Jeu de données TomTom Lausanne (80 segments) déjà pré-chargé en mémoire par défaut.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Enregistré !
              </>
            ) : (
              'Appliquer les paramètres'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
