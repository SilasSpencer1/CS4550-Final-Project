import Chip from "../ui/Chip";
import Icon from "../ui/Icon";
import type { Visibility } from "../api/types";

const LABEL: Record<Visibility, { kind: "public" | "friends" | "busy"; label: string; icon: string }> = {
  public: { kind: "public", label: "public", icon: "globe" },
  friends: { kind: "friends", label: "friends", icon: "users" },
  busy: { kind: "busy", label: "busy", icon: "lock" },
};

export default function PrivacyBadge({ visibility }: { visibility: Visibility }) {
  const info = LABEL[visibility];
  return (
    <Chip kind={info.kind}>
      <Icon name={info.icon} size={12} />
      {info.label}
    </Chip>
  );
}
