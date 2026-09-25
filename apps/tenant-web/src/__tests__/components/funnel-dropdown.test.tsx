import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@bipesend/ui";

function TestFunnelDropdown() {
  const [selected, setSelected] = useState("Funil Principal");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div data-testid="outside-area">Outside Area</div>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger className="crm-funnel-trigger">
          <span>{selected}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="crm-funnel-menu">
          <DropdownMenuItem onSelect={() => setSelected("Criar funil")}>
            Criar novo funil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSelected("Funil 2")}>
            Funil 2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

describe("Funnel Dropdown", () => {
  it("opens on trigger click, closes on outside click", async () => {
    const user = userEvent.setup();
    render(<TestFunnelDropdown />);

    const trigger = screen.getByRole("button", { name: "Funil Principal" });
    const outside = screen.getByTestId("outside-area");

    // Initially closed
    expect(screen.queryByText("Criar novo funil")).not.toBeInTheDocument();

    // Click trigger to open
    await user.click(trigger);
    expect(screen.getByText("Criar novo funil")).toBeInTheDocument();

    // Click outside to close
    await user.click(outside);
    await waitFor(() => {
      expect(screen.queryByText("Criar novo funil")).not.toBeInTheDocument();
    });
  });

  it("closes when trigger is clicked again", async () => {
    const user = userEvent.setup();
    render(<TestFunnelDropdown />);

    const trigger = screen.getByRole("button", { name: "Funil Principal" });

    // Open
    await user.click(trigger);
    expect(screen.getByText("Criar novo funil")).toBeInTheDocument();

    // Click trigger again to close
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByText("Criar novo funil")).not.toBeInTheDocument();
    });
  });
});
