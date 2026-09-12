import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "../components/label";

describe("Label", () => {
  it("renders text content", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders with htmlFor attribute", () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email");
  });
});
