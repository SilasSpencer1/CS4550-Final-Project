import axios from "axios";

const BASE = "https://app.ticketmaster.com/discovery/v2";

export interface TmSearchParams {
  city?: string;
  keyword?: string;
  startDateTime?: string;
  size?: number;
  page?: number;
}

export interface TmEventSummary {
  id: string;
  name: string;
  url: string;
  image: string | null;
  startDateTime: string | null;
  venue: string;
  city: string;
  classifications: string[];
}

function apiKey(): string {
  const k = process.env.TICKETMASTER_API_KEY;
  if (!k) throw new Error("TICKETMASTER_API_KEY is not set");
  return k;
}

function pickImage(images: any[] | undefined): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const big = images.find((i) => i.width >= 640) || images[0];
  return big?.url ?? null;
}

function classifications(tm: any): string[] {
  const c = tm?.classifications?.[0];
  if (!c) return [];
  return [c.segment?.name, c.genre?.name, c.subGenre?.name].filter(
    (x) => x && x !== "Undefined"
  );
}

function toSummary(e: any): TmEventSummary {
  const venue = e?._embedded?.venues?.[0];
  return {
    id: e.id,
    name: e.name,
    url: e.url,
    image: pickImage(e.images),
    startDateTime: e?.dates?.start?.dateTime ?? e?.dates?.start?.localDate ?? null,
    venue: venue?.name ?? "",
    city: venue?.city?.name ?? "",
    classifications: classifications(e),
  };
}

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 5 * 60 * 1000;

export async function searchEvents(params: TmSearchParams): Promise<TmEventSummary[]> {
  const key = JSON.stringify(params);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data as TmEventSummary[];

  const resp = await axios.get(`${BASE}/events.json`, {
    params: {
      apikey: apiKey(),
      city: params.city || undefined,
      keyword: params.keyword || undefined,
      startDateTime: params.startDateTime || undefined,
      size: params.size ?? 20,
      page: params.page ?? 0,
    },
  });
  const events = resp.data?._embedded?.events ?? [];
  const summaries = events.map(toSummary);
  cache.set(key, { at: Date.now(), data: summaries });
  return summaries;
}

export async function getEvent(id: string): Promise<any> {
  const resp = await axios.get(`${BASE}/events/${id}.json`, {
    params: { apikey: apiKey() },
  });
  const e = resp.data;
  const venue = e?._embedded?.venues?.[0];
  return {
    id: e.id,
    name: e.name,
    info: e.info ?? "",
    pleaseNote: e.pleaseNote ?? "",
    url: e.url,
    image: pickImage(e.images),
    startDateTime: e?.dates?.start?.dateTime ?? e?.dates?.start?.localDate ?? null,
    priceRanges: e.priceRanges ?? [],
    venue: venue
      ? {
          name: venue.name,
          city: venue?.city?.name ?? "",
          state: venue?.state?.name ?? "",
          address: venue?.address?.line1 ?? "",
        }
      : null,
    classifications: classifications(e),
  };
}
