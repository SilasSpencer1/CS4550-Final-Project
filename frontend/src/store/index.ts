import { configureStore } from "@reduxjs/toolkit";
import session from "./session";
import search from "./search";

export const store = configureStore({
  reducer: { session, search },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
