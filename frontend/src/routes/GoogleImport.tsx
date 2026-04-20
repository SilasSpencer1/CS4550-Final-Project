import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuthUrl, sync, disconnect } from "../api/gcal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

export default function GoogleImport() {
  const [params] = useSearchParams();
  const connected = params.get("connected") === "1";
  const [status, setStatus] = useState<string | null>(
    connected ? "google calendar connected." : null
  );
  const [imported, setImported] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    setBusy(true);
    try {
      const url = await getAuthUrl();
      window.location.href = url;
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    setBusy(true);
    setStatus(null);
    try {
      const r = await sync();
      setImported(r.imported);
      setStatus(`pulled in ${r.imported} event${r.imported === 1 ? "" : "s"}.`);
    } catch (err: any) {
      setStatus(err?.response?.data?.error ?? "couldn't sync. try again?");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    try {
      await disconnect();
      setStatus("disconnected.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 640 }}>
      <div className="eyebrow mb-2">connect</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">pull in your google calendar.</span>
      </h1>

      <div className="card">
        <p className="mb-4">
          import your upcoming google calendar events into roster. we store
          your tokens server-side and only read when you click sync.
        </p>

        {status && (
          <div className="alert alert-info">{status}</div>
        )}
        {imported !== null && imported > 0 && (
          <div className="alert alert-success">
            imported <b>{imported}</b>.
          </div>
        )}

        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          <Button onClick={handleConnect} disabled={busy} variant="hero">
            <Icon name="external" size={16} />
            connect
          </Button>
          <Button
            variant="secondary"
            onClick={handleSync}
            disabled={busy}
          >
            sync now
          </Button>
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            disabled={busy}
          >
            disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
