import React, { useEffect, useRef, useState } from 'react';
import { WeatherPreset } from '../types';

interface WeatherCanvasProps {
  preset: WeatherPreset;
}

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 0;
  life: number = 1;
  maxLife: number = 1;

  constructor(w: number, h: number, config: WeatherPreset['config']) {
    this.reset(w, h, config, true);
  }

  reset(w: number, h: number, config: WeatherPreset['config'], initial = false) {
    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : -20; // Start above screen if not initial
    this.size = config.sizeBase + (Math.random() * config.sizeVar);
    
    // Initial velocities
    this.vy = config.speedBase + (Math.random() * config.speedVar);
    this.vx = config.wind + (Math.random() - 0.5); 
    
    this.life = 1;
  }

  update(
    w: number, 
    h: number, 
    config: WeatherPreset['config'], 
    mouseX: number, 
    mouseY: number, 
    isMouseDown: boolean
  ) {
    // Apply gravity
    this.vy += config.gravity;
    
    // Apply wind variance (sine wave for snow feel)
    if (config.gravity < 0.2 && config.gravity > -0.2) {
       this.x += Math.sin(Date.now() / 500) * 0.5; // Drift
    }

    // Mouse Interaction
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Interaction radius
    if (dist < 200) {
      const forceDirectionX = dx / dist;
      const forceDirectionY = dy / dist;
      
      // Calculate force: stronger when closer
      // If trace is on (rain), we mainly push X. If floaty (fog), push all directions.
      const force = (200 - dist) / 200 * config.interactionForce;
      
      this.vx += forceDirectionX * force * 0.5;
      this.vy += forceDirectionY * force * 0.5;
    }

    // Apply Velocity
    this.x += this.vx;
    this.y += this.vy;

    // Drag / Air Resistance (simple damping)
    this.vx *= 0.98; 
    // If gravity is very low (fog), dampen Y too
    if (Math.abs(config.gravity) < 0.1) this.vy *= 0.98;

    // Reset if out of bounds
    if (this.y > h + 50 || this.x > w + 50 || this.x < -50 || this.y < -50) {
      this.reset(w, h, config);
    }
  }

  draw(ctx: CanvasRenderingContext2D, config: WeatherPreset['config']) {
    ctx.globalAlpha = config.opacity;
    ctx.fillStyle = config.color;
    
    if (config.trace) {
      // Draw rain-like streak
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      // Streak length depends on velocity
      ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
      ctx.strokeStyle = config.color;
      ctx.lineWidth = this.size;
      ctx.stroke();
    } else {
      // Draw circle (Snow/Fog)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Lightning specific logic helper
const triggerLightning = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  // Flash
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(0, 0, w, h);
  
  // Bolt
  const startX = Math.random() * w;
  let x = startX;
  let y = 0;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#60a5fa";

  while (y < h) {
    const nextY = y + Math.random() * 50 + 20;
    const nextX = x + (Math.random() - 0.5) * 80;
    ctx.lineTo(nextX, nextY);
    x = nextX;
    y = nextY;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
};

export const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ preset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000, down: false });
  const lightningTimerRef = useRef(0);

  // Initialize particles when config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize handling
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Init Particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < preset.config.count; i++) {
      newParticles.push(new Particle(canvas.width, canvas.height, preset.config));
    }
    particlesRef.current = newParticles;

    return () => window.removeEventListener('resize', handleResize);
  }, [preset]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      // Clear with background color trail (for smoothness) or hard clear
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      
      // If fog, we want less trail clearing for a "thick" look, otherwise clear completely
      if (preset.mode === 'fog') {
        ctx.fillStyle = `${preset.background}20`; // Hex + Alpha
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw Background
        ctx.fillStyle = preset.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Handle Lightning
      if (preset.mode === 'lightning') {
        if (Math.random() < 0.01 && time - lightningTimerRef.current > 500) { // 1% chance per frame, min 500ms delay
            triggerLightning(ctx, canvas.width, canvas.height);
            lightningTimerRef.current = time;
        }
      }

      // Update & Draw Particles
      const particles = particlesRef.current;
      // Adjust particle count dynamically if preset changed drastically
      if (particles.length !== preset.config.count) {
        if (particles.length < preset.config.count) {
           for(let i=0; i < preset.config.count - particles.length; i++) {
             particles.push(new Particle(canvas.width, canvas.height, preset.config));
           }
        } else {
           particles.splice(preset.config.count);
        }
      }

      particles.forEach(p => {
        p.update(
          canvas.width, 
          canvas.height, 
          preset.config, 
          mouseRef.current.x, 
          mouseRef.current.y,
          mouseRef.current.down
        );
        p.draw(ctx, preset.config);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [preset]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };
  
  const handleMouseDown = () => mouseRef.current.down = true;
  const handleMouseUp = () => mouseRef.current.down = false;
  const handleMouseLeave = () => {
    mouseRef.current.x = -1000; 
    mouseRef.current.y = -1000;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block z-0"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};
