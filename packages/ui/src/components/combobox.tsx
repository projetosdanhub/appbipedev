"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./overlays";
import { Button } from "./button";
import { Input } from "./input";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  disabled,
  placeholder = "Selecionar",
}: {
  label: string;
  options: readonly ComboboxOption[];
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false),
    [query, setQuery] = React.useState(""),
    [active, setActive] = React.useState(0);
  const id = React.useId(),
    input = React.useRef<HTMLInputElement>(null);
  const filtered = options.filter((option) =>
    option.label
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const enabled = filtered.filter((option) => !option.disabled);
  const choose = (next: string) => {
    onValueChange(next);
    setOpen(false);
  };
  const activeOption = enabled[active];
  return (
    <div className="ui-field">
      <span className="ui-label" id={`${id}-label`}>
        {label}
      </span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setQuery("");
          setActive(0);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="md"
            disabled={disabled}
            aria-labelledby={`${id}-label ${id}-value`}
            aria-haspopup="dialog"
          >
            <span id={`${id}-value`}>
              {options.find((option) => option.value === value)?.label ??
                placeholder}
            </span>
            <ChevronsUpDown aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label={label}
          align="start"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus();
          }}
        >
          <Input
            ref={input}
            role="combobox"
            label={`Pesquisar ${label.toLocaleLowerCase("pt-BR")}`}
            value={query}
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={
              activeOption
                ? `${id}-${filtered.indexOf(activeOption)}`
                : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) =>
                  enabled.length
                    ? (current +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        enabled.length) %
                      enabled.length
                    : 0,
                );
              }
              if (event.key === "Home") {
                event.preventDefault();
                setActive(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                setActive(Math.max(0, enabled.length - 1));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                if (activeOption) choose(activeOption.value);
              }
            }}
          />
          <ul
            role="listbox"
            aria-label={label}
            id={`${id}-list`}
            className="ui-combobox-list"
          >
            {filtered.map((option, i) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                id={`${id}-${i}`}
                className="ui-menu-item ui-combobox-option"
                data-highlighted={option === activeOption ? "" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!option.disabled) choose(option.value);
                }}
              >
                {option.label}
                {option.value === value && (
                  <Check aria-hidden="true" className="ui-icon" />
                )}
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p role="status" className="ui-help">
              Nenhuma opção encontrada.
            </p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
export const TenantSwitcher = Combobox;
