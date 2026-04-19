import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("shows one uppercase letter for single-word names", () => {
    render(<Avatar name="quinn" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
  });

  it("shows two letters for multi-word names", () => {
    render(<Avatar name="alice parker" />);
    expect(screen.getByText("AP")).toBeInTheDocument();
  });

  it("renders an <img> when avatarUrl is provided", () => {
    const { container } = render(
      <Avatar name="alice" avatarUrl="https://example.com/a.png" />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("same name maps to a deterministic color", () => {
    const { container: c1, unmount } = render(<Avatar name="quinn" />);
    const bg1 = (c1.firstChild as HTMLElement).style.background;
    unmount();
    const { container: c2 } = render(<Avatar name="quinn" />);
    const bg2 = (c2.firstChild as HTMLElement).style.background;
    expect(bg1).toBe(bg2);
  });

  it("applies size as width/height", () => {
    const { container } = render(<Avatar name="q" size={48} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("48px");
    expect(el.style.height).toBe("48px");
  });
});
