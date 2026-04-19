import axios from "axios";

// OpenStreetMap / Nominatim geocoding.
// Usage policy: https://operations.osmfoundation.org/policies/nominatim/
// - Max 1 request per second (we serialize through a queue)
// - Must include a descriptive User-Agent
// - Attribution required — we include "© OpenStreetMap contributors" in the UI

const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA =
  process.env.NOMINATIM_USER_AGENT ??
  "Roster-SocialCalendar/1.0 (cs4550-final-project)";

export interface GeocodeResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  type?: string;
  importance?: number;
}

interface CacheEntry {
  at: number;
  data: unknown;
}
const cache = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;

// Serialized queue — Nominatim caps at ~1 rps per IP.
let chain: Promise<unknown> = Promise.resolve();
const MIN_INTERVAL_MS = 1100;
let lastAt = 0;

function queue<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(async () => {
    const delta = Date.now() - lastAt;
    if (delta < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - delta));
    }
    try {
      const result = await fn();
      lastAt = Date.now();
      return result;
    } catch (err) {
      lastAt = Date.now();
      throw err;
    }
  });
  chain = next.catch(() => undefined);
  return next as Promise<T>;
}

function cacheGet<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return e.data as T;
}

function cacheSet(key: string, data: unknown) {
  cache.set(key, { at: Date.now(), data });
}

function shape(r: any): GeocodeResult {
  const a = r.address ?? {};
  return {
    placeId: String(r.place_id ?? r.osm_id ?? ""),
    displayName: r.display_name ?? "",
    lat: Number(r.lat),
    lng: Number(r.lon),
    addressLine: [a.house_number, a.road].filter(Boolean).join(" ") || undefined,
    city: a.city ?? a.town ?? a.village ?? a.hamlet ?? undefined,
    state: a.state ?? a.region ?? undefined,
    country: a.country ?? undefined,
    postcode: a.postcode ?? undefined,
    type: r.type,
    importance: typeof r.importance === "number" ? r.importance : undefined,
  };
}

export async function searchAddress(
  q: string,
  limit = 5
): Promise<GeocodeResult[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const key = `search:${trimmed.toLowerCase()}:${limit}`;
  const hit = cacheGet<GeocodeResult[]>(key);
  if (hit) return hit;

  return queue(async () => {
    const resp = await axios.get(`${NOMINATIM}/search`, {
      params: {
        q: trimmed,
        format: "jsonv2",
        addressdetails: 1,
        limit,
      },
      headers: {
        "User-Agent": UA,
        "Accept-Language": "en",
      },
      timeout: 10_000,
    });
    const data = Array.isArray(resp.data) ? resp.data.map(shape) : [];
    cacheSet(key, data);
    return data;
  });
}

export async function reverse(
  lat: number,
  lng: number
): Promise<GeocodeResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const key = `reverse:${lat.toFixed(5)}:${lng.toFixed(5)}`;
  const hit = cacheGet<GeocodeResult | null>(key);
  if (hit !== null) return hit;

  return queue(async () => {
    const resp = await axios.get(`${NOMINATIM}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: "jsonv2",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": UA,
        "Accept-Language": "en",
      },
      timeout: 10_000,
    });
    const data = resp.data && !resp.data.error ? shape(resp.data) : null;
    cacheSet(key, data);
    return data;
  });
}
