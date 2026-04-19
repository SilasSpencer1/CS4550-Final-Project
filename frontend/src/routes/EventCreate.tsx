import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../api/events";
import { useAppSelector } from "../hooks";
import Button from "../ui/Button";
import Field from "../ui/Field";
import LocationAutocomplete, {
  type LocationValue,
} from "../ui/LocationAutocomplete";

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EventCreate() {
  const user = useAppSelector((s) => s.session.user)!;
  const isOrganizer = user.role === "organizer";
  const now = new Date();
  const later = new Date(Date.now() + 60 * 60 * 1000);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(toLocalInputValue(now));
  const [end, setEnd] = useState(toLocalInputValue(later));
  const [location, setLocation] = useState<LocationValue>({
    address: "",
    city: user.location?.city ?? "",
    state: user.location?.state,
    lat: null,
    lng: null,
  });
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"busy" | "friends" | "public">(
    isOrganizer ? "public" : user.defaultPrivacy
  );
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createEvent({
        title,
        description,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        location: {
          address: location.address,
          city: location.city,
          lat: location.lat,
          lng: location.lng,
        },
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        visibility,
      } as any);
      navigate(`/events/${created._id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 720 }}>
      <div className="eyebrow mb-2">new plan</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">
          {isOrganizer ? "host something." : "what's the plan?"}
        </span>
      </h1>

      <form onSubmit={handleSubmit} className="stack">
        <Field label="title" hint="be specific — 'dinner at mel's' beats 'dinner'">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="thursday pizza at mel's"
          />
        </Field>
        <Field label="description" hint="the details — dress code, what to bring, the vibe">
          <textarea
            className="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid grid-2" style={{ gap: 16 }}>
          <Field label="start">
            <input
              className="input"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </Field>
          <Field label="end">
            <input
              className="input"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </Field>
        </div>
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          label="location"
          hint="pick from the dropdown to verify the address and map it"
        />
        <Field label="tags" hint="comma separated — helps people find it">
          <input
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="brunch, outdoors, music"
          />
        </Field>
        {!isOrganizer ? (
          <Field label="who sees this?">
            <select
              className="select"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
            >
              <option value="public">public — anyone can see it</option>
              <option value="friends">friends — just your people</option>
              <option value="busy">busy — just a time slot, no details</option>
            </select>
          </Field>
        ) : (
          <p className="muted">
            organizer events always go out as <b>public</b>.
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="hero" disabled={saving}>
            {saving ? "saving…" : "post it"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
