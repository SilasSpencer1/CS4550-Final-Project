import { api } from "./client";
import type { TmSummary, TmDetail } from "./types";

export interface DiscoverQuery {
  city?: string;
  keyword?: string;
  startDateTime?: string;
  page?: number;
}

export async function discoverSearch(params: DiscoverQuery) {
  const { data } = await api.get<TmSummary[]>("/discover/search", { params });
  return data;
}

export async function discoverDetail(id: string) {
  const { data } = await api.get<TmDetail>(`/discover/${id}`);
  return data;
}
