import { api } from "./client";

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

export async function searchAddress(q: string, limit = 5): Promise<GeocodeResult[]> {
  if (q.trim().length < 3) return [];
  const { data } = await api.get<GeocodeResult[]>("/geocode/search", {
    params: { q, limit },
  });
  return data;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult | null> {
  try {
    const { data } = await api.get<GeocodeResult>("/geocode/reverse", {
      params: { lat, lng },
    });
    return data;
  } catch {
    return null;
  }
}
