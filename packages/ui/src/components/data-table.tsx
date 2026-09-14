"use client";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./fields";
import { EmptyState, ErrorState } from "./feedback";
import { Skeleton } from "./skeleton";

export interface DataColumn<T> {
  id: string;
  header: string;
  cell(row: T): ReactNode;
  sortable?: boolean;
}
export interface DataTableProps<T> {
  caption: string;
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  rowKey(row: T): string;
  loading?: boolean;
  error?: string;
  onRetry?(): void;
  empty?: ReactNode;
  sort?: { id: string; direction: "asc" | "desc" };
  onSort?(sort: { id: string; direction: "asc" | "desc" }): void;
  selected?: readonly string[];
  onSelectionChange?(ids: string[]): void;
  renderMobileCard?(row: T): ReactNode;
}
/** Filtering, sorting and paging are controlled by the feature/API. Selection means loaded rows only. */
export function DataTable<T>({
  caption,
  rows,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  empty,
  sort,
  onSort,
  selected = [],
  onSelectionChange,
  renderMobileCard,
}: DataTableProps<T>) {
  if (error) return <ErrorState description={error} onRetry={onRetry} />;
  if (loading)
    return (
      <div role="status" aria-label="Carregando dados" aria-busy="true">
        <Skeleton className="h-16" />
        <Skeleton className="h-48 mt-3" />
      </div>
    );
  if (!rows.length)
    return (
      empty ?? (
        <EmptyState
          title="Nenhum resultado"
          description="Ajuste os filtros ou adicione o primeiro registro."
        />
      )
    );
  const toggle = (id: string, checked: boolean) =>
    onSelectionChange?.(
      checked
        ? [...new Set([...selected, id])]
        : selected.filter((value) => value !== id),
    );
  return (
    <>
      <div
        className={`ui-table-scroll ${renderMobileCard ? "ui-desktop-table" : ""}`}
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table className="ui-table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {onSelectionChange && (
                <th scope="col">
                  <Checkbox
                    label={
                      <span className="sr-only">
                        Selecionar linhas desta página
                      </span>
                    }
                    checked={rows.every((row) =>
                      selected.includes(rowKey(row)),
                    )}
                    onChange={(event) =>
                      onSelectionChange(
                        event.target.checked
                          ? [...new Set([...selected, ...rows.map(rowKey)])]
                          : selected.filter(
                              (id) => !rows.some((row) => rowKey(row) === id),
                            ),
                      )
                    }
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    sort?.id === column.id
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {column.sortable && onSort ? (
                    <Button
                      size="compact"
                      variant="ghost"
                      onClick={() =>
                        onSort({
                          id: column.id,
                          direction:
                            sort?.id === column.id && sort.direction === "asc"
                              ? "desc"
                              : "asc",
                        })
                      }
                    >
                      {column.header}
                      {sort?.id === column.id &&
                        (sort.direction === "asc" ? (
                          <ArrowUp aria-hidden="true" />
                        ) : (
                          <ArrowDown aria-hidden="true" />
                        ))}
                    </Button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {onSelectionChange && (
                  <td>
                    <Checkbox
                      label={
                        <span className="sr-only">
                          Selecionar registro {rowKey(row)}
                        </span>
                      }
                      checked={selected.includes(rowKey(row))}
                      onChange={(event) =>
                        toggle(rowKey(row), event.target.checked)
                      }
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.id}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderMobileCard && (
        <div className="ui-mobile-cards" aria-label={caption}>
          {rows.map((row) => (
            <article key={rowKey(row)} className="ui-card p-4">
              {onSelectionChange && (
                <Checkbox
                  label="Selecionar registro"
                  checked={selected.includes(rowKey(row))}
                  onChange={(event) =>
                    toggle(rowKey(row), event.target.checked)
                  }
                />
              )}
              {renderMobileCard(row)}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function Pagination({
  page,
  pageCount,
  onPageChange,
  disabled,
}: {
  page: number;
  pageCount: number;
  onPageChange(page: number): void;
  disabled?: boolean;
}) {
  return (
    <nav className="ui-pagination" aria-label="Paginação">
      <span>
        Página {page} de {Math.max(1, pageCount)}
      </span>
      <div className="ui-filter-bar">
        <Button
          variant="outline"
          size="md"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={disabled || page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
