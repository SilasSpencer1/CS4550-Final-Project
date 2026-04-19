import type { CSSProperties } from "react";

const PATHS: Record<string, string[]> = {
  plus: ["M12 5v14", "M5 12h14"],
  check: ["M20 6L9 17l-5-5"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  chevronRight: ["M9 18l6-6-6-6"],
  chevronLeft: ["M15 18l-6-6 6-6"],
  chevronDown: ["M6 9l6 6 6-6"],
  calendar: [
    "M8 2v4",
    "M16 2v4",
    "M3 10h18",
    "M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z",
  ],
  users: [
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
    "M9 11a4 4 0 100-8 4 4 0 000 8",
    "M23 21v-2a4 4 0 00-3-3.87",
    "M16 3.13a4 4 0 010 7.75",
  ],
  user: [
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2",
    "M12 11a4 4 0 100-8 4 4 0 000 8",
  ],
  bell: [
    "M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9",
    "M10.3 21a1.94 1.94 0 003.4 0",
  ],
  home: [
    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    "M9 22V12h6v10",
  ],
  heart: [
    "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z",
  ],
  mapPin: [
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z",
    "M12 13a3 3 0 100-6 3 3 0 000 6z",
  ],
  clock: ["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 6v6l4 2"],
  search: ["M21 21l-4.3-4.3", "M10 18a8 8 0 100-16 8 8 0 000 16z"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"],
  moreH: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  sparkle: ["M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"],
  lock: [
    "M5 11h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z",
    "M7 11V7a5 5 0 0110 0v4",
  ],
  globe: [
    "M12 22a10 10 0 100-20 10 10 0 000 20z",
    "M2 12h20",
    "M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  ],
  pencil: [
    "M12 20h9",
    "M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  ],
  trash: [
    "M3 6h18",
    "M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
    "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  ],
  logOut: [
    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4",
    "M16 17l5-5-5-5",
    "M21 12H9",
  ],
  arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  arrowLeft: ["M19 12H5", "M12 19l-7-7 7-7"],
  external: [
    "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6",
    "M15 3h6v6",
    "M10 14L21 3",
  ],
  party: ["M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"],
  menu: ["M3 12h18", "M3 6h18", "M3 18h18"],
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}

export default function Icon({
  name,
  size = 20,
  color = "currentColor",
  stroke = 1.75,
  style,
  className,
}: Props) {
  const paths = PATHS[name] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
