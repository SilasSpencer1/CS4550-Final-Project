import { useEffect, useRef, useState } from "react";
import { searchAddress, type GeocodeResult } from "../api/geocode";
import Icon from "./Icon";

export interface LocationValue {
  address: string;
  city: string;
  state?: string;
  lat: number | null;
  lng: number | null;
  displayName?: string;
}

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "search a venue, street, or city",
  label = "location",
  hint,
}: Props) {
  const [query, setQuery] = useState(value.displayName ?? value.address ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // debounced search
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (value.displayName === query || value.address === query) {
      // user just picked this; don't re-search
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      searchAddress(query)
        .then((r) => {
          setResults(r);
          setOpen(true);
          setHovered(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, value.displayName, value.address]);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function choose(r: GeocodeResult) {
    onChange({
      address: r.addressLine ?? r.displayName,
      city: r.city ?? "",
      state: r.state,
      lat: r.lat,
      lng: r.lng,
      displayName: r.displayName,
    });
    setQuery(r.displayName);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHovered((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHovered((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && hovered >= 0) {
      e.preventDefault();
      choose(results[hovered]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="field" ref={wrapperRef} style={{ position: "relative" }}>
      <label className="field-label">{label}</label>
      <div className="input-icon">
        <Icon name="mapPin" size={18} />
        <input
          className="input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // user is typing — clear the selection until they pick one
            if (
              value.displayName &&
              e.target.value !== value.displayName
            ) {
              onChange({ ...value, lat: null, lng: null, displayName: undefined });
            }
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      {hint && <div className="field-hint">{hint}</div>}
      {loading && query.length >= 3 && (
        <div className="field-hint">searching…</div>
      )}
      {value.lat != null && value.lng != null && !loading && (
        <div className="field-hint">
          <Icon name="check" size={12} /> verified · {value.lat.toFixed(4)},{" "}
          {value.lng.toFixed(4)}
        </div>
      )}
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-raised)",
            zIndex: 20,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {results.map((r, i) => (
            <button
              key={r.placeId}
              type="button"
              onClick={() => choose(r)}
              onMouseEnter={() => setHovered(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                border: "none",
                background:
                  hovered === i ? "var(--ink-050)" : "var(--bg-surface)",
                cursor: "pointer",
                borderBottom:
                  i < results.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
                font: "inherit",
                color: "var(--ink-900)",
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {r.addressLine || r.city || r.displayName.split(",")[0]}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-600)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.displayName}
              </div>
            </button>
          ))}
          <div
            style={{
              fontSize: 10,
              color: "var(--ink-500)",
              padding: "6px 12px",
              borderTop: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
            }}
          >
            © openstreetmap contributors
          </div>
        </div>
      )}
    </div>
  );
}
