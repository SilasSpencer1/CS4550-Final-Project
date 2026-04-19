import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventRow from "./EventRow";
import type { UserEvent } from "../api/types";

function makeEvent(overrides: Partial<UserEvent> = {}): UserEvent {
  return {
    _id: "evt-1",
    title: "Pizza at Mel's",
    description: "",
    startTime: new Date(2026, 3, 24, 19, 0).toISOString(), // fri apr 24 7pm
    endTime: new Date(2026, 3, 24, 21, 0).toISOString(),
    location: { address: "", city: "Boston", lat: null, lng: null },
    createdBy: "creator-1",
    source: "user",
    visibility: "friends",
    tags: [],
    maxAttendees: null,
    ...overrides,
  };
}

describe("EventRow", () => {
  it("renders title + lowercase dow + day-of-month", () => {
    render(
      <MemoryRouter>
        <EventRow event={makeEvent()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Pizza at Mel's")).toBeInTheDocument();
    expect(screen.getByText("fri")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders time + city in the meta line", () => {
    render(
      <MemoryRouter>
        <EventRow event={makeEvent()} />
      </MemoryRouter>
    );
    expect(screen.getByText(/7pm.*Boston/)).toBeInTheDocument();
  });

  it("links to the event detail route", () => {
    render(
      <MemoryRouter>
        <EventRow event={makeEvent()} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/events/evt-1");
  });

  it("falls back to 'Busy' when title is missing (privacy-stripped event)", () => {
    render(
      <MemoryRouter>
        <EventRow event={makeEvent({ title: "", visibility: "busy" })} />
      </MemoryRouter>
    );
    expect(screen.getByText("Busy")).toBeInTheDocument();
  });

  it("applies sticker class when sticker=true", () => {
    const { container } = render(
      <MemoryRouter>
        <EventRow event={makeEvent()} sticker />
      </MemoryRouter>
    );
    const link = container.querySelector("a.event-row");
    expect(link).toHaveClass("event-row-sticker");
  });
});
