import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TmSummary } from "../api/types";

interface SearchState {
  lastQuery: { city: string; keyword: string; startDateTime: string } | null;
  results: TmSummary[];
  loading: boolean;
}

const initialState: SearchState = {
  lastQuery: null,
  results: [],
  loading: false,
};

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setResults(
      state,
      action: PayloadAction<{
        query: { city: string; keyword: string; startDateTime: string };
        results: TmSummary[];
      }>
    ) {
      state.lastQuery = action.payload.query;
      state.results = action.payload.results;
      state.loading = false;
    },
  },
});

export const { setLoading, setResults } = slice.actions;
export default slice.reducer;
