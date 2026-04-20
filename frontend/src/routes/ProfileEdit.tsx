import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe } from "../api/users";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../store/session";
import Button from "../ui/Button";
import Field from "../ui/Field";
import LocationAutocomplete, {
  type LocationValue,
} from "../ui/LocationAutocomplete";

export default function ProfileEdit() {
  const user = useAppSelector((s) => s.session.user)!;
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [location, setLocation] = useState<LocationValue>({
    address: "",
    city: user.location?.city ?? "",
    state: user.location?.state,
    lat: null,
    lng: null,
    displayName:
      user.location?.city && user.location?.state
        ? `${user.location.city}, ${user.location.state}`
        : user.location?.city ?? undefined,
  });
  const [interests, setInterests] = useState((user.interests ?? []).join(", "));
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [defaultPrivacy, setDefaultPrivacy] = useState(user.defaultPrivacy);
  const [saving, setSaving] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe({
        displayName,
        bio,
        avatarUrl,
        defaultPrivacy,
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: { city: location.city, state: location.state ?? "" },
      });
      dispatch(setUser(updated));
      navigate(`/profile/${user.username}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 720 }}>
      <div className="eyebrow mb-2">your profile</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">make it yours.</span>
      </h1>

      <form onSubmit={handleSubmit} className="stack">
        <div className="grid grid-2" style={{ gap: 16 }}>
          <Field label="display name">
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>
          <Field label="avatar url" hint="paste a square image url">
            <input
              className="input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <Field label="bio" hint="a line or two, keep it light.">
          <textarea
            className="textarea"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          label="where are you based?"
          placeholder="search a city"
          hint="pick from the dropdown so we can match you to local events"
        />
        {location.city && (
          <div className="mono subtle" style={{ fontSize: 12, marginTop: -8 }}>
            city: {location.city}
            {location.state ? `, ${location.state}` : ""}
          </div>
        )}
        <Field
          label="interests"
          hint="comma separated. we match these to local events."
        >
          <input
            className="input"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="jazz, hiking, brunch"
          />
        </Field>
        <Field
          label="default privacy"
          hint="applies when you post a new event. change per-event any time."
        >
          <select
            className="select"
            value={defaultPrivacy}
            onChange={(e) => setDefaultPrivacy(e.target.value as any)}
          >
            <option value="public">public (anyone can see)</option>
            <option value="friends">friends only</option>
            <option value="busy">busy block (no details)</option>
          </select>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "saving…" : "save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
