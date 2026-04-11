import { useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';

// Rain canvas
function RainCanvas({ intensity = 80 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops = Array.from({ length: intensity }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 4 + Math.random() * 6,
      length: 12 + Math.random() * 16,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.strokeStyle = `rgba(174,214,241,${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.length; d.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [intensity]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      zIndex: 9990, opacity: 0.7,
    }} />
  );
}

// Snow canvas
function SnowCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const flakes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0.4 + Math.random() * 0.5,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > canvas.height) { f.y = -f.r; f.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990,
    }} />
  );
}

// Fog overlay
function FogOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9989,
      background: 'linear-gradient(180deg, rgba(200,210,220,0.18) 0%, rgba(180,195,210,0.08) 100%)',
      backdropFilter: 'blur(0.5px)',
      animation: 'fogDrift 12s ease-in-out infinite alternate',
    }}>
      <style>{`
        @keyframes fogDrift {
          0%   { opacity: 0.6; transform: translateX(0); }
          100% { opacity: 0.9; transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}

// Frost/ice overlay for cold
function FrostOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9989,
    }}>
      {/* Corner frost crystals */}
      {[
        { top: 0, left: 0, transform: 'none' },
        { top: 0, right: 0, transform: 'scaleX(-1)' },
        { bottom: 0, left: 0, transform: 'scaleY(-1)' },
        { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
      ].map((pos, i) => (
        <svg key={i} width="180" height="180" viewBox="0 0 180 180"
             style={{ position: 'absolute', ...pos, opacity: 0.25 }}>
          <path d="M0,0 Q60,20 40,60 Q20,100 80,90 Q140,80 120,140 Q100,180 180,180 L0,180 Z"
                fill="rgba(200,230,255,0.6)" />
          <line x1="0" y1="0" x2="60" y2="60" stroke="rgba(180,220,255,0.8)" strokeWidth="1"/>
          <line x1="0" y1="20" x2="40" y2="50" stroke="rgba(180,220,255,0.5)" strokeWidth="0.5"/>
          <line x1="20" y1="0" x2="50" y2="40" stroke="rgba(180,220,255,0.5)" strokeWidth="0.5"/>
        </svg>
      ))}
      {/* Subtle icy blue tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(180,220,255,0.04)',
      }} />
    </div>
  );
}

// Lightning flash for storm
function StormOverlay() {
  const flashRef = useRef(null);
  useEffect(() => {
    const flash = () => {
      if (!flashRef.current) return;
      flashRef.current.style.opacity = '0.15';
      setTimeout(() => {
        if (flashRef.current) flashRef.current.style.opacity = '0';
        // Double flash
        setTimeout(() => {
          if (flashRef.current) flashRef.current.style.opacity = '0.1';
          setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = '0'; }, 80);
        }, 100);
      }, 80);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.6) flash();
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <RainCanvas intensity={140} />
      <div ref={flashRef} style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9991,
        background: 'white', opacity: 0,
        transition: 'opacity 0.05s',
      }} />
      {/* Dark dramatic overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9988,
        background: 'rgba(10,10,30,0.25)',
      }} />
    </>
  );
}

// Heat shimmer
function SunnyOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9989,
      background: 'linear-gradient(180deg, rgba(255,200,50,0.04) 0%, transparent 40%)',
      animation: 'heatShimmer 4s ease-in-out infinite',
    }}>
      <style>{`
        @keyframes heatShimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Stars for night
function NightOverlay() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 40,
    size: Math.random() > 0.8 ? 2 : 1,
    delay: Math.random() * 3,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9989 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          animation: `starTwinkle 2s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes starTwinkle {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

export default function WeatherEffects() {
  const { effect, tempC } = useWeather();
  const { isNeon }        = useTheme();

  // Don't show weather effects over neon theme — they clash
  if (isNeon || !effect || effect === 'clear') return null;

  const isCold = tempC !== null && tempC < 5;

  return (
    <>
      {effect === 'rain'   && <RainCanvas />}
      {effect === 'snow'   && <><SnowCanvas />{isCold && <FrostOverlay />}</>}
      {effect === 'fog'    && <FogOverlay />}
      {effect === 'storm'  && <StormOverlay />}
      {effect === 'sunny'  && <SunnyOverlay />}
      {effect === 'night'  && <NightOverlay />}
      {effect === 'cloudy' && null}
      {isCold && effect !== 'snow' && <FrostOverlay />}
    </>
  );
}