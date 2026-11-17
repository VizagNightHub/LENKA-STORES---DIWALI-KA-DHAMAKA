"use client";

import { useEffect, useRef } from "react";

const PALETTES = [
  ["#FFE89E", "#FFB703", "#FB8500"], // warm gold
  ["#FFF3B0", "#FFD166", "#FFFFFF"], // champagne silver-gold
  ["#FF4D6D", "#FF758F", "#FFD6E0"], // crimson rose
  ["#38BDF8", "#7DD3FC", "#E0F2FE"], // electric sapphire
  ["#C77DFF", "#E0AAFF", "#FFF0F5"], // royal violet
];

interface Shell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  palette: string[];
  trail: { x: number; y: number; alpha: number }[];
}

interface Ember {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  strobe: boolean;
}

interface Flash {
  x: number;
  y: number;
  radius: number;
  life: number;
  color: string;
}

export const DiwaliSky = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const shells: Shell[] = [];
    const embers: Ember[] = [];
    const flashes: Flash[] = [];
    const isMobile = w < 640;
    const maxEmbers = isMobile ? 450 : 1200;

    const launch = () => {
      const x = w * (0.12 + Math.random() * 0.76);
      shells.push({
        x,
        y: h * 0.82,
        vx: (Math.random() - 0.5) * 1.1,
        vy: -(6.8 + Math.random() * 2.4),
        targetY: h * (0.12 + Math.random() * 0.28),
        palette: PALETTES[Math.floor(Math.random() * PALETTES.length)],
        trail: [],
      });
    };

    const burst = (x: number, y: number, palette: string[]) => {
      const style = Math.floor(Math.random() * 3);
      const count = isMobile ? 55 : 105;

      flashes.push({
        x,
        y,
        radius: isMobile ? 65 : 110,
        life: 1,
        color: palette[0],
      });

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.08;
        const speed =
          style === 2
            ? i % 2 === 0
              ? 4.1
              : 2.3
            : 1.4 + Math.random() * 3.8;

        embers.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay:
            style === 1
              ? 0.0065 + Math.random() * 0.004
              : 0.011 + Math.random() * 0.008,
          size: style === 1 ? 1.5 : 1.3 + Math.random() * 1.1,
          color:
            style === 1
              ? PALETTES[0][Math.floor(Math.random() * 3)]
              : palette[Math.floor(Math.random() * palette.length)],
          gravity: style === 1 ? 0.055 : 0.038,
          drag: style === 1 ? 0.978 : 0.984,
          strobe: Math.random() < 0.22,
        });
      }

      if (embers.length > maxEmbers) {
        embers.splice(0, embers.length - maxEmbers);
      }
    };

    let raf = 0;
    let last = performance.now();
    let nextLaunch = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (now > nextLaunch) {
        launch();
        if (Math.random() < 0.3) launch();
        nextLaunch = now + 950 + Math.random() * 1200;
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= 0.08 * dt;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        grad.addColorStop(0, `rgba(255, 248, 220, ${f.life * 0.45})`);
        grad.addColorStop(0.35, `rgba(255, 190, 90, ${f.life * 0.16})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy *= 0.988;
        s.trail.push({ x: s.x, y: s.y, alpha: 1 });
        if (s.trail.length > 18) s.trail.shift();

        for (let t = 1; t < s.trail.length; t++) {
          const prev = s.trail[t - 1];
          const curr = s.trail[t];
          const ratio = t / s.trail.length;
          ctx.strokeStyle = `rgba(255, 215, 130, ${ratio * 0.75})`;
          ctx.lineWidth = ratio * 2.2;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }

        ctx.fillStyle = "#FFF7D6";
        ctx.shadowColor = "#FFB703";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (s.y <= s.targetY || s.vy > -1.3) {
          burst(s.x, s.y, s.palette);
          shells.splice(i, 1);
        }
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.px = e.x;
        e.py = e.y;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= e.drag;
        e.vy = e.vy * e.drag + e.gravity * dt;
        e.life -= e.decay * dt;

        if (e.life <= 0) {
          embers.splice(i, 1);
          continue;
        }

        const flicker =
          e.strobe && e.life < 0.45 && Math.random() < 0.45 ? 0.15 : 1;
        ctx.globalAlpha = Math.max(e.life, 0) * flicker;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(e.px, e.py);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};
