import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe } from "../api/users";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../store/session";
import Button from "../ui/Button";
import Field from "../ui/Field";

export default function ProfileEdit() {
  const user = useAppSelector((s) => s.session.user)!;
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [city, setCity] = useState(user.location?.city ?? "");
  const [state, setState] = useState(user.location?.state ?? "");
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
        location: { city, state },
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
        <Field label="bio" hint="a line or two — keep it light">
          <textarea
            className="textarea"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <div className="grid grid-2" style={{ gap: 16 }}>
          <Field label="city">
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>
          <Field label="state">
            <input
              className="input"
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
            />
          </Field>
        </div>
        <Field
          label="interests"
          hint="comma separated — we match these to local events"
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
            <option value="public">public — anyone can see</option>
            <option value="friends">friends only</option>
            <option value="busy">busy block — just show a time slot</option>
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
