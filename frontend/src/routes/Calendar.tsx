import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { myEvents } from "../api/events";
import type { UserEvent } from "../api/types";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function Calendar() {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    myEvents().then(setEvents);
  }, []);

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e._id,
        title: e.title,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        resource: e,
      })),
    [events]
  );

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <div className="eyebrow">your schedule</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.02em" }}>
            <span className="editorial">the whole picture.</span>
          </h1>
        </div>
        <Button variant="primary" to="/events/new">
          <Icon name="plus" size={16} />
          new event
        </Button>
      </div>
      <div className="calendar-wrap">
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={["month", "week", "day", "agenda"]}
          onSelectEvent={(ev: any) => navigate(`/events/${ev.id}`)}
          popup
        />
      </div>
    </div>
  );
}
