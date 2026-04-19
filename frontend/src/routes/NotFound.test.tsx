import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import NotFound from "./NotFound";

describe("NotFound", () => {
  it("shows 404 and a link back home", () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/that page doesn't exist/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to roster/i })
    ).toHaveAttribute("href", "/");
  });
});
