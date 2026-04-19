import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Button from "./Button";

describe("Button", () => {
  it("renders a <button> when no to/href", () => {
    render(<Button>click me</Button>);
    const el = screen.getByRole("button", { name: /click me/i });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveClass("btn");
    expect(el).toHaveClass("btn-primary");
  });

  it("renders a Router Link when `to` is provided", () => {
    render(
      <MemoryRouter>
        <Button to="/signup" variant="hero">get started</Button>
      </MemoryRouter>
    );
    const el = screen.getByRole("link", { name: /get started/i });
    expect(el).toHaveAttribute("href", "/signup");
    expect(el).toHaveClass("btn-hero");
  });

  it("renders an <a> when `href` is provided", () => {
    render(
      <Button href="https://example.com" target="_blank">
        external
      </Button>
    );
    const el = screen.getByRole("link", { name: /external/i });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("target", "_blank");
  });

  it("forwards onClick", () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>tap</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("applies size + block classes", () => {
    render(
      <Button size="sm" block>
        small block
      </Button>
    );
    const el = screen.getByRole("button");
    expect(el).toHaveClass("btn-sm");
    expect(el).toHaveClass("btn-block");
  });

  it("variant=link uses .btn-link without .btn", () => {
    render(<Button variant="link">see all</Button>);
    const el = screen.getByRole("button", { name: /see all/i });
    expect(el).toHaveClass("btn-link");
    expect(el).not.toHaveClass("btn");
  });
});
