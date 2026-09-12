import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../components/input";

describe("Input", () => {
  it("renders a text input by default", () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders with a label when provided", () => {
    render(<Input label="Email" placeholder="you@example.com" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders helper text", () => {
    render(<Input helperText="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies error styling when error prop is true", () => {
    render(<Input error helperText="Invalid" />);
    const helper = screen.getByText("Invalid");
    expect(helper.className).toContain("danger");
  });

  it("renders a password type without built-in toggle", () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
    // No eye icon rendered by the component itself
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
