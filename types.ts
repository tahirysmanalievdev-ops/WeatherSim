export type WeatherMode = 'rain' | 'snow' | 'fog' | 'lightning' | 'custom';

export interface ParticleConfig {
  count: number;
  speedBase: number;
  speedVar: number;
  gravity: number;
  wind: number;
  sizeBase: number;
  sizeVar: number;
  color: string;
  opacity: number;
  interactionForce: number; // Positive for push, negative for pull
  trace?: boolean;
}

export interface WeatherPreset {
  name: string;
  mode: WeatherMode;
  config: ParticleConfig;
  background: string;
}

export interface AIWeatherResponse {
  description: string;
  config: ParticleConfig;
  backgroundHex: string;
}

export interface AIChatResponse {
  reply: string;
  weatherData?: AIWeatherResponse | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}
