import Avatar from "./Avatar";

interface Props {
  names: string[];
  size?: number;
  max?: number;
}

export default function AvatarStack({ names, size = 32, max = 5 }: Props) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} ring />
      ))}
      {rest > 0 && (
        <span
          className="avatar avatar-ring"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.38),
            background: "#F1ECDE",
            color: "#1F1D1A",
          }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
