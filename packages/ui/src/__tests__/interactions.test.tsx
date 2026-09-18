import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { PasswordInput, OtpInput, SearchField } from "../components/fields";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../components/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/overlays";
import { SegmentedControl } from "../components/segmented-control";
import { FilterChip } from "../components/filter-chip";
import { NotificationPanel } from "../components/identity";

describe("Reusable interaction contracts", () => {
  it("keeps button loading disabled even if disabled=false was passed", async () => {
    const click = vi.fn();
    render(
      <Button isLoading disabled={false} onClick={click}>
        Salvar
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
  it("gives repeated labels unique ids and persistent error descriptions", () => {
    render(
      <>
        <Input label="Nome" />
        <Input label="Nome" errorMessage="Obrigatório" />
      </>,
    );
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(inputs[1]).toHaveAttribute("aria-invalid", "true");
    expect(inputs[1]).toHaveAccessibleDescription("Obrigatório");
  });
  it("allows password visibility and full OTP paste without losing the value", async () => {
    function Fields() {
      const [code, setCode] = useState("");
      return (
        <>
          <PasswordInput label="Senha" defaultValue="example" />
          <OtpInput value={code} onValueChange={setCode} />
        </>
      );
    }
    render(<Fields />);
    await userEvent.click(
      screen.getByRole("button", { name: "Mostrar senha" }),
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByLabelText("Código de verificação"));
    await userEvent.paste("012-345");
    expect(screen.getByLabelText("Código de verificação")).toHaveValue(
      "012345",
    );
  });
  it("closes dialogs with Escape and restores trigger focus", async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Abrir</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Editar</DialogTitle>
          <DialogDescription>Edite os dados.</DialogDescription>
          <Input label="Nome" />
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Abrir" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("supports arrow key navigation between tabs", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Exemplo">
          <TabsTrigger value="a">Primeira</TabsTrigger>
          <TabsTrigger value="b">Segunda</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A</TabsContent>
        <TabsContent value="b">B</TabsContent>
      </Tabs>,
    );
    screen.getByRole("tab", { name: "Primeira" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Segunda" })).toHaveFocus();
  });
  it("debounces search and cancels its callback on unmount", async () => {
    vi.useFakeTimers();
    const search = vi.fn();
    const { rerender, unmount } = render(
      <SearchField value="a" onValueChange={() => {}} onSearch={search} />,
    );
    rerender(
      <SearchField value="ab" onValueChange={() => {}} onSearch={search} />,
    );
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(search).toHaveBeenCalledExactlyOnceWith("ab");
    rerender(
      <SearchField value="abc" onValueChange={() => {}} onSearch={search} />,
    );
    unmount();
    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it("announces and changes a segmented view selection", async () => {
    function ViewSelector() {
      const [view, setView] = useState<"board" | "list">("board");
      return (
        <SegmentedControl
          label="Visualização"
          value={view}
          onValueChange={(value) => setView(value as "board" | "list")}
          items={[
            { value: "board", label: "Quadro" },
            { value: "list", label: "Lista" },
          ]}
        />
      );
    }
    render(<ViewSelector />);
    const board = screen.getByRole("button", { name: "Quadro" });
    const list = screen.getByRole("button", { name: "Lista" });
    expect(board).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(list);
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(board).toHaveAttribute("aria-pressed", "false");
  });
  it("exposes filter state and result count", async () => {
    const toggle = vi.fn();
    render(
      <FilterChip selected count={3} onClick={toggle}>
        Redes sociais
      </FilterChip>,
    );
    const filter = screen.getByRole("button", { name: /Redes sociais/ });
    expect(filter).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("3 resultados")).toBeVisible();
    await userEvent.click(filter);
    expect(toggle).toHaveBeenCalledOnce();
  });
  it("renders an honest empty notification center", () => {
    render(<NotificationPanel items={[]} />);
    expect(screen.getByRole("region", { name: "Central de notificações" })).toBeVisible();
    expect(screen.getByText("Tudo em dia")).toBeVisible();
  });
});
