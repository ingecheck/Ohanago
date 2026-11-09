import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  density: number;
  opacity: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAngle: number;
}

export const SnowfallCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Lightweight particle count for ultra-smooth 60 FPS on any device
    const flakeCount = width < 768 ? 32 : 55;
    const flakes: Snowflake[] = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.8, // 0.8px to 2.6px
        density: Math.random() * flakeCount,
        opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7
        speedY: Math.random() * 0.8 + 0.4, // gentle fall speed
        speedX: Math.random() * 0.25 - 0.12, // gentle drift
        swaySpeed: Math.random() * 0.015 + 0.008,
        swayAngle: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = performance.now();
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = (time: number) => {
      if (!isVisible) return;
      const delta = Math.min((time - lastTime) / 16.67, 1.8);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.swayAngle += f.swaySpeed * delta;
        f.y += f.speedY * delta;
        f.x += (Math.sin(f.swayAngle) * 0.5 + f.speedX) * delta;

        // Wrap around borders seamlessly
        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) {
          f.x = -5;
        } else if (f.x < -5) {
          f.x = width + 5;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
      }}
      aria-hidden="true"
    />
  );
};
