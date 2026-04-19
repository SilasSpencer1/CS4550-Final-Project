import EventRow from "../ui/EventRow";
import type { UserEvent } from "../api/types";

interface Props {
  event: UserEvent;
  compact?: boolean;
  sticker?: boolean;
}

export default function EventCard({ event, sticker }: Props) {
  return <EventRow event={event} sticker={sticker} />;
}
