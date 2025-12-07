import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Sparkles } from 'lucide-react';
import { generateWeatherChat } from '../services/geminiService';
import { ChatMessage, AIWeatherResponse, WeatherPreset } from '../types';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onWeatherUpdate: (data: AIWeatherResponse) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, onWeatherUpdate }) => {
  // State for messages, input, and typing status
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'bot',
      text: "Hello! I'm the Atmosphere Director. Tell me what kind of world you want to see, or just say hi!",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Refs for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle sending message
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Prepare history string for context (last 5 messages)
    const historyContext = messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');

    // Call API
    const response = await generateWeatherChat(historyContext, userMsg.text);

    setIsTyping(false);

    if (response) {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.reply,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

      // Apply weather if included
      if (response.weatherData) {
        onWeatherUpdate(response.weatherData);
      }
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm flex flex-col pointer-events-none">
      
      {/* Main Chat Window */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[500px] pointer-events-auto transition-all animate-message">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Director</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-xs text-slate-400">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}
            >
              <div 
                className={`
                  max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-md'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex justify-start animate-message">
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask for rain, snow, or zero gravity..."
              className="w-full bg-slate-900 text-white text-sm rounded-xl py-3 pl-4 pr-12 border border-slate-700 focus:border-blue-500 focus:outline-none placeholder:text-slate-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className={`absolute right-2 p-2 rounded-lg transition-all ${
                inputText.trim() && !isTyping 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500">AI controls the simulation. Be creative.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
