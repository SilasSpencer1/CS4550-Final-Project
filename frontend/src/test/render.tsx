import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import session from "../store/session";
import search from "../store/search";
import type { SessionUser } from "../api/types";

interface Options extends Omit<RenderOptions, "wrapper"> {
  user?: SessionUser | null;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  { user = null, initialEntries = ["/"], ...rest }: Options = {}
) {
  const store = configureStore({ reducer: { session, search } });
  if (user) {
    store.dispatch({ type: "session/setUser", payload: user });
  } else {
    store.dispatch({ type: "session/markLoaded" });
  }
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...rest }) };
}

export function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    _id: "user-1",
    username: "alice",
    email: "alice@example.com",
    role: "user",
    displayName: "Alice",
    bio: "",
    avatarUrl: "",
    interests: [],
    location: { city: "Boston", state: "MA" },
    defaultPrivacy: "friends",
    ...overrides,
  };
}
