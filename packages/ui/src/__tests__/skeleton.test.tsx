import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../components/skeleton";

describe("Skeleton", () => {
  it("renders a div with animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div.className).toContain("animate-pulse");
  });

  it("accepts custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("h-10");
    expect(div.className).toContain("w-full");
  });
});
