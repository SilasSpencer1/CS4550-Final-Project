import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import Navbar from "./Navbar";
import { renderWithProviders, makeUser } from "../test/render";

describe("Navbar", () => {
  it("shows 'sign in' + 'get started' for anonymous viewers", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get started/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/calendar/i)).not.toBeInTheDocument();
  });

  it("shows logged-in nav + avatar for signed-in users", () => {
    const user = makeUser({ username: "alice", displayName: "Alice" });
    renderWithProviders(<Navbar />, { user });
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/friends/i)).toBeInTheDocument();
    expect(screen.getByText(/for you/i)).toBeInTheDocument();
    // Avatar uses first letter
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("exposes the organizer link only to organizers", () => {
    renderWithProviders(<Navbar />, {
      user: makeUser({ role: "organizer" }),
    });
    expect(screen.getByRole("link", { name: /organizer/i })).toBeInTheDocument();
  });

  it("hides the organizer link for regular users", () => {
    renderWithProviders(<Navbar />, { user: makeUser() });
    expect(
      screen.queryByRole("link", { name: /organizer/i })
    ).not.toBeInTheDocument();
  });
});
