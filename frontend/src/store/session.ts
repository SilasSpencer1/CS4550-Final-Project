import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "../api/types";

interface State {
  user: SessionUser | null;
  loaded: boolean;
}

const initialState: State = { user: null, loaded: false };

const slice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
      state.loaded = true;
    },
    markLoaded(state) {
      state.loaded = true;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, markLoaded, clearUser } = slice.actions;
export default slice.reducer;
