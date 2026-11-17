"use client";

import { Rotate3d } from "lucide-react";
import { useRef, useState } from "react";

interface ProductViewer3DProps {
  images: string[];
  alt: string;
  accent?: string;
}

export const ProductViewer3D = ({
  images,
  alt,
  accent = "#FFD54A",
}: ProductViewer3DProps) => {
  const safeImages = images.length > 0 ? images : ["/images/diwali.png"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rot.x,
      rotY: rot.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    const nextY = Math.max(-28, Math.min(28, startRef.current.rotY + dx * 0.25));
    const nextX = Math.max(-18, Math.min(18, startRef.current.rotX - dy * 0.2));
    setRot({ x: nextX, y: nextY });

    // If multiple angle photos exist, scrubbing left/right also switches angles
    if (safeImages.length > 1) {
      const step = Math.floor(Math.abs(dx) / 45) % safeImages.length;
      if (dx > 20) {
        setActiveIndex(step);
      } else if (dx < -20) {
        setActiveIndex((safeImages.length - step) % safeImages.length);
      }
    }
  };

  const handlePointerUp = () => {
    setDragging(false);
    setRot({ x: 0, y: 0 });
  };

  return (
    <div className="w-full">
      {/* 3D Touch-Drag Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative aspect-[4/3] w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-black/50 active:cursor-grabbing"
        style={{ perspective: "900px" }}
      >
        <div
          className="h-full w-full transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${
              dragging ? 1.04 : 1
            })`,
            transformStyle: "preserve-3d",
            transitionDuration: dragging ? "0ms" : "450ms",
          }}
        >
          <img
            src={safeImages[activeIndex]}
            alt={alt}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>

        {/* 360 Touch Hint Badge */}
        <div
          className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-[10px] font-medium backdrop-blur-md"
          style={{ color: accent }}
        >
          <Rotate3d className="h-3.5 w-3.5" />
          Drag 3D
        </div>
      </div>

      {/* Angle / Photo Thumbnails (shows when 2+ images are added) */}
      {safeImages.length > 1 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border transition-all ${
                activeIndex === i
                  ? "border-[#FFD54A] ring-1 ring-[#FFD54A]"
                  : "border-white/15 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt={`${alt} view ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
