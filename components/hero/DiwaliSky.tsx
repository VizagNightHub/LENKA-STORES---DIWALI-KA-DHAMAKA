"use client";

import { useEffect, useRef } from "react";

const PALETTES = [
  ["#FFD54A", "#FFB300", "#FFF3B0"],
  ["#FF4D6D", "#FF1744", "#FFB3C1"],
  ["#C77DFF", "#9D4EDD", "#E9C6FF"],
  ["#4ADE80", "#22C55E", "#BBF7D0"],
  ["#FF9A3C", "#FF6B00", "#FFD2A1"],
  ["#5CE1E6", "#38BDF8", "#C9F4FF"],
];

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  palette: string[];
  trail: { x: number; y: number }[];
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  crackle: boolean;
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

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const isMobile = w < 640;
    const maxSparks = isMobile ? 500 : 1400;

    const launch = () => {
      const x = w * (0.08 + Math.random() * 0.84);
      rockets.push({
        x,
        y: h * 0.7,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(5.5 + Math.random() * 2.5),
        targetY: h * (0.1 + Math.random() * 0.28),
        palette: PALETTES[Math.floor(Math.random() * PALETTES.length)],
        trail: [],
      });
    };

    const burst = (x: number, y: number, palette: string[]) => {
      const type = Math.floor(Math.random() * 3);
      const count = isMobile ? 60 : 110;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.1;
        let speed = 1.5 + Math.random() * 3.2;
        if (type === 2) speed = 3.2;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          decay:
            type === 1
              ? 0.007 + Math.random() * 0.005
              : 0.012 + Math.random() * 0.01,
          size: type === 1 ? 1.4 : 1.8 + Math.random() * 1.2,
          color: palette[Math.floor(Math.random() * palette.length)],
          crackle: Math.random() < 0.15,
        });
      }
      sparks.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 1,
        decay: 0.12,
        size: 26,
        color: "#FFFFFF",
        crackle: false,
      });
      if (sparks.length > maxSparks) {
        sparks.splice(0, sparks.length - maxSparks);
      }
    };

    const drawRocket = (r: Rocket) => {
      const angle = Math.atan2(r.vy, r.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(angle);

      const flameLen = 10 + Math.random() * 8;
      const fg = ctx.createLinearGradient(0, 6, 0, 6 + flameLen);
      fg.addColorStop(0, "rgba(255,240,150,1)");
      fg.addColorStop(0.5, "rgba(255,140,30,0.9)");
      fg.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-2.5, 6);
      ctx.lineTo(0, 6 + flameLen);
      ctx.lineTo(2.5, 6);
      ctx.fill();

      ctx.fillStyle = "#8a5a2b";
      ctx.fillRect(-0.6, 6, 1.2, 9);

      const bg = ctx.createLinearGradient(-3.5, 0, 3.5, 0);
      bg.addColorStop(0, "#7a0f1c");
      bg.addColorStop(0.45, "#ff4057");
      bg.addColorStop(1, "#8f1425");
      ctx.fillStyle = bg;
      ctx.fillRect(-3.5, -9, 7, 15);

      ctx.fillStyle = "#FFD54A";
      ctx.fillRect(-3.5, -2, 7, 2.2);

      const ng = ctx.createLinearGradient(-3.5, 0, 3.5, 0);
      ng.addColorStop(0, "#b8860b");
      ng.addColorStop(0.5, "#ffe27a");
      ng.addColorStop(1, "#b8860b");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.moveTo(-3.5, -9);
      ctx.lineTo(0, -17);
      ctx.lineTo(3.5, -9);
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    let nextLaunch = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (now > nextLaunch) {
        launch();
        if (Math.random() < 0.35) launch();
        nextLaunch = now + 900 + Math.random() * 1100;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy *= 0.992;
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 22) r.trail.shift();

        for (let t = 0; t < r.trail.length; t++) {
          const p = r.trail[t];
          const a = t / r.trail.length;
          ctx.fillStyle = `rgba(255,${180 + Math.floor(a * 60)},90,${a * 0.7})`;
          ctx.beginPath();
          ctx.arc(
            p.x + (Math.random() - 0.5) * 2,
            p.y,
            1.2 * a + 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        drawRocket(r);
        if (r.y <= r.targetY || r.vy > -1.2) {
          burst(r.x, r.y, r.palette);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + 0.045 * dt;
        s.life -= s.decay * dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        const twinkle =
          s.crackle && s.life < 0.4 && Math.random() < 0.5 ? 0.15 : 1;
        ctx.globalAlpha = Math.max(s.life, 0) * twinkle;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(
          s.x,
          s.y,
          s.size * (s.size > 10 ? s.life : 1),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

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
