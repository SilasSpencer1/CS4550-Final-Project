import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Chip from "./Chip";

describe("Chip", () => {
  it("defaults to kind='tag'", () => {
    render(<Chip>jazz</Chip>);
    const el = screen.getByText("jazz");
    expect(el).toHaveClass("chip");
    expect(el).toHaveClass("chip-tag");
  });

  it("renders each kind with matching class", () => {
    const kinds = [
      "going",
      "maybe",
      "out",
      "host",
      "new",
      "public",
      "friends",
      "busy",
      "organizer",
    ] as const;
    for (const k of kinds) {
      const { unmount } = render(<Chip kind={k}>{k}</Chip>);
      expect(screen.getByText(k)).toHaveClass(`chip-${k}`);
      unmount();
    }
  });
});
