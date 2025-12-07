import React, { useState, useCallback } from 'react';
import { WeatherCanvas } from './components/WeatherCanvas';
import { Controls } from './components/Controls';
import { ChatWidget } from './components/ChatWidget';
import { PRESETS } from './constants';
import { WeatherPreset, AIWeatherResponse } from './types';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<WeatherPreset>(PRESETS.rain);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleReset = useCallback(() => {
    // Force a re-mount or reset of the particles by creating a new object reference
    setCurrentPreset(prev => ({ ...prev }));
  }, []);

  const handleWeatherUpdate = (data: AIWeatherResponse) => {
    setCurrentPreset({
      name: data.description.length > 20 ? 'AI Custom' : data.description,
      mode: 'custom',
      background: data.backgroundHex,
      config: data.config
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      
      <WeatherCanvas preset={currentPreset} />
      
      <Controls 
        currentPreset={currentPreset}
        onPresetChange={setCurrentPreset}
        onReset={handleReset}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      <ChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        onWeatherUpdate={handleWeatherUpdate}
      />

      {/* Footer / Instructions */}
      <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
        <p className="text-slate-600/50 text-sm font-light">
          Move cursor to interact • Push/Pull particles
        </p>
      </div>
    </div>
  );
}
