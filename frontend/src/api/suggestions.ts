import { api } from "./client";
import type { Suggestion } from "./types";

export async function getSuggestions() {
  const { data } = await api.get<Suggestion[]>("/suggestions");
  return data;
}
