import { WeatherPreset } from './types';

export const PRESETS: Record<string, WeatherPreset> = {
  rain: {
    name: 'Heavy Rain',
    mode: 'rain',
    background: '#0f172a',
    config: {
      count: 800,
      speedBase: 15,
      speedVar: 5,
      gravity: 0.5,
      wind: 0,
      sizeBase: 2,
      sizeVar: 1,
      color: '#94a3b8',
      opacity: 0.6,
      interactionForce: 2,
      trace: true
    }
  },
  snow: {
    name: 'Blizzard',
    mode: 'snow',
    background: '#1e293b',
    config: {
      count: 400,
      speedBase: 2,
      speedVar: 1,
      gravity: 0.05,
      wind: 1.5,
      sizeBase: 3,
      sizeVar: 2,
      color: '#f8fafc',
      opacity: 0.8,
      interactionForce: 4,
      trace: false
    }
  },
  fog: {
    name: 'Deep Fog',
    mode: 'fog',
    background: '#18181b',
    config: {
      count: 150,
      speedBase: 0.5,
      speedVar: 0.2,
      gravity: -0.01, // Slight drift up
      wind: 0.2,
      sizeBase: 100, // Large particles
      sizeVar: 50,
      color: '#52525b',
      opacity: 0.05,
      interactionForce: 8,
      trace: false
    }
  },
  lightning: {
    name: 'Thunderstorm',
    mode: 'lightning',
    background: '#020617',
    config: {
      count: 100, // Rain during storm
      speedBase: 20,
      speedVar: 2,
      gravity: 0.8,
      wind: -2,
      sizeBase: 2,
      sizeVar: 0,
      color: '#60a5fa',
      opacity: 0.4,
      interactionForce: 1,
      trace: true
    }
  }
};
