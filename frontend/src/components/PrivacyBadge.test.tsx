import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyBadge from "./PrivacyBadge";

describe("PrivacyBadge", () => {
  it("shows 'public' label with public chip style", () => {
    render(<PrivacyBadge visibility="public" />);
    const el = screen.getByText("public");
    expect(el).toHaveClass("chip-public");
  });

  it("shows 'friends' label with friends chip style", () => {
    render(<PrivacyBadge visibility="friends" />);
    const el = screen.getByText("friends");
    expect(el).toHaveClass("chip-friends");
  });

  it("shows 'busy' label with busy chip style", () => {
    render(<PrivacyBadge visibility="busy" />);
    const el = screen.getByText("busy");
    expect(el).toHaveClass("chip-busy");
  });
});
