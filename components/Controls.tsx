import React from 'react';
import { CloudRain, Snowflake, CloudFog, Zap, MessageSquare, RefreshCcw } from 'lucide-react';
import { WeatherPreset } from '../types';
import { PRESETS } from '../constants';

interface ControlsProps {
  currentPreset: WeatherPreset;
  onPresetChange: (preset: WeatherPreset) => void;
  onReset: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ currentPreset, onPresetChange, onReset, onToggleChat, isChatOpen }) => {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 max-w-xs w-full pointer-events-none">
      
      {/* Title Card */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Atmosphere Sim
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Interactive Particle Physics System
        </p>
      </div>

      {/* Mode Selectors */}
      <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-auto grid grid-cols-2 gap-2">
        <button
          onClick={() => onPresetChange(PRESETS.rain)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${currentPreset.mode === 'rain' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <CloudRain size={20} />
          <span className="text-xs font-medium">Rain</span>
        </button>

        <button
          onClick={() => onPresetChange(PRESETS.snow)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${currentPreset.mode === 'snow' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Snowflake size={20} />
          <span className="text-xs font-medium">Snow</span>
        </button>
        
        <button
          onClick={() => onPresetChange(PRESETS.fog)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${currentPreset.mode === 'fog' ? 'bg-slate-500 text-white shadow-lg shadow-slate-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <CloudFog size={20} />
          <span className="text-xs font-medium">Fog</span>
        </button>
        
        <button
          onClick={() => onPresetChange(PRESETS.lightning)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${currentPreset.mode === 'lightning' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Zap size={20} />
          <span className="text-xs font-medium">Storm</span>
        </button>
      </div>

      {/* AI & Reset */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl pointer-events-auto space-y-3">
        
        <button 
            onClick={onToggleChat}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${isChatOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
        >
            <MessageSquare size={16} />
            {isChatOpen ? 'Close AI Director' : 'Chat with AI Director'}
        </button>
        
        <div className="h-px bg-slate-700 w-full" />
        
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Controls</span>
            <button 
                onClick={onReset}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
                <RefreshCcw size={12} /> Reset Particles
            </button>
        </div>
      </div>
      
      {/* Current Settings Display */}
      <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg text-[10px] text-slate-500 font-mono pointer-events-auto">
        <p>GRAVITY: {currentPreset.config.gravity.toFixed(3)}</p>
        <p>WIND: {currentPreset.config.wind.toFixed(3)}</p>
        <p>PARTICLES: {currentPreset.config.count}</p>
        <p>INTERACTION: {currentPreset.config.interactionForce.toFixed(1)}</p>
      </div>

    </div>
  );
};
