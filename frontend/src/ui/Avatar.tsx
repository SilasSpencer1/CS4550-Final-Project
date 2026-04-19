import type { CSSProperties } from "react";

const PALETTE = [
  "#E42B01", // persimmon
  "#7AC2C8", // mint
  "#E4DC4E", // citron (text-dark)
  "#8069C7", // grape
  "#FFBBAB", // blush
  "#16838C", // mint-600
  "#4A453E", // ink-700
];

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[1][0] ?? "")).toUpperCase();
}

interface Props {
  name: string;
  size?: number;
  ring?: boolean;
  avatarUrl?: string;
  style?: CSSProperties;
}

export default function Avatar({ name, size = 36, ring, avatarUrl, style }: Props) {
  const bg = hashColor(name);
  const fg = bg === "#E4DC4E" ? "#1F1D1A" : "#fff";
  const fontSize = Math.round(size * 0.4);
  const base: CSSProperties = {
    width: size,
    height: size,
    fontSize,
    background: bg,
    color: fg,
    ...style,
  };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`avatar ${ring ? "avatar-ring" : ""}`}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    );
  }
  return (
    <span className={`avatar ${ring ? "avatar-ring" : ""}`} style={base}>
      {initialsOf(name)}
    </span>
  );
}
