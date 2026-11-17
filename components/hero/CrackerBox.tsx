"use client";

interface CrackerBoxProps {
  front: string;
  side: string;
  top: string;
  label: string;
}

export const CrackerBox = ({ front, side, top, label }: CrackerBoxProps) => (
  <svg
    viewBox="0 0 120 110"
    className="h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
  >
    <defs>
      <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={front} />
        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    <polygon points="10,30 70,18 112,30 52,44" fill={top} />
    <polygon points="52,44 112,30 112,88 52,104" fill={side} />
    <polygon points="10,30 52,44 52,104 10,88" fill={`url(#g-${label})`} />
    <polygon
      points="10,56 52,70 52,78 10,64"
      fill="#FFD54A"
      opacity="0.95"
    />
    <polygon
      points="52,70 112,56 112,64 52,78"
      fill="#E0A800"
      opacity="0.9"
    />
    <text
      x="26"
      y="52"
      fontSize="13"
      fill="#FFF3B0"
      transform="rotate(14 26 52)"
    >
      ★
    </text>
    <text
      x="64"
      y="94"
      fontSize="9"
      fontWeight="700"
      fill="#FFF3B0"
      transform="rotate(-14 64 94)"
    >
      DIWALI
    </text>
    <polygon
      points="10,30 70,18 112,30 52,44"
      fill="none"
      stroke="#FFF3B0"
      strokeOpacity="0.5"
      strokeWidth="0.8"
    />
  </svg>
);
