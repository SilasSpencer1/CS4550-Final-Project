import type { ReactNode } from "react";

type Kind =
  | "going"
  | "maybe"
  | "out"
  | "host"
  | "tag"
  | "new"
  | "public"
  | "friends"
  | "busy"
  | "organizer";

export default function Chip({
  kind = "tag",
  children,
  className,
}: {
  kind?: Kind;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`chip chip-${kind} ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}
