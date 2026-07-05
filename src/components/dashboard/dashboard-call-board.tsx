"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { CallListItemCard } from "@/components/dashboard/call-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CallListItem, CallOutcome } from "@/types/call";
import { cn } from "@/lib/utils";

type CallFilter = "all" | "blocked" | "suspect" | "answered";

type DashboardCallBoardProps = {
  calls: CallListItem[];
};

const PAGE_SIZE = 6;

const filters: Array<{ id: CallFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "blocked", label: "Bloqueadas" },
  { id: "suspect", label: "Sospechosas" },
  { id: "answered", label: "Atendidas" },
];

const blockedOutcomes: CallOutcome[] = ["rejected", "silent_hangup"];
const answeredOutcomes: CallOutcome[] = ["completed", "pending_summary"];

function matchesFilter(call: CallListItem, filter: CallFilter) {
  if (filter === "all") return true;
  if (filter === "blocked") return blockedOutcomes.includes(call.outcome);
  if (filter === "answered") return answeredOutcomes.includes(call.outcome);

  return (
    call.urgency === "alta" ||
    call.category === "cobranza" ||
    call.category === "spam_comercial" ||
    call.isDegraded
  );
}

function matchesSearch(call: CallListItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    call.callerNumber,
    call.callerName,
    call.callerCompany,
    call.summary,
    call.reason,
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalizedSearch));
}

export function DashboardCallBoard({ calls }: DashboardCallBoardProps) {
  const [activeFilter, setActiveFilter] = useState<CallFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredCalls = useMemo(
    () =>
      calls.filter(
        (call) => matchesFilter(call, activeFilter) && matchesSearch(call, search),
      ),
    [activeFilter, calls, search],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCalls = filteredCalls.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const start = filteredCalls.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, filteredCalls.length);

  function updateFilter(filter: CallFilter) {
    setActiveFilter(filter);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => updateFilter(filter.id)}
              className={cn(activeFilter !== filter.id && "bg-card")}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            className="bg-card pl-10"
            placeholder="Buscar por número..."
            aria-label="Buscar llamada por número, contacto o resumen"
          />
        </div>
      </div>

      {visibleCalls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No encontramos llamadas con esos filtros.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCalls.map((call) => (
            <CallListItemCard key={call.id} call={call} />
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando {start}-{end} de {filteredCalls.length} llamadas
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="bg-card"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <span aria-hidden>‹</span>
          </Button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(0, 3)
            .map((pageNumber) => (
              <Button
                key={pageNumber}
                type="button"
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                className={cn(currentPage !== pageNumber && "bg-card")}
                onClick={() => setPage(pageNumber)}
                aria-label={`Página ${pageNumber}`}
              >
                {pageNumber}
              </Button>
            ))}
          {totalPages > 3 && (
            <>
              <span className="px-1 text-muted-foreground" aria-hidden>
                ...
              </span>
              <Button
                type="button"
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon"
                className={cn(currentPage !== totalPages && "bg-card")}
                onClick={() => setPage(totalPages)}
                aria-label={`Página ${totalPages}`}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="bg-card"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            <span aria-hidden>›</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
