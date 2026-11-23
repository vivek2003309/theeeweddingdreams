"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  Kanban,
  Lock,
  MessageSquarePlus,
  Table2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TierMarker } from "@/components/ui/TierMarker";
import { CONCIERGE_DIRECTORS, LEAD_STAGES } from "@/lib/admin/storeLogic";
import { escapeCsvCell } from "@/lib/security/csv";
import { canExportLeadsCsv, canManageLeads } from "@/lib/security/rbac";
import { useAdminStore } from "./AdminStoreContext";
import type { AdminLead, LeadStage } from "@/lib/admin/types";

export function LeadsKanbanView() {
  const {
    state,
    staffRole,
    moveLead,
    assignLeadDirector,
    addLeadNote,
    logLeadsCsvExport,
  } = useAdminStore();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");

  const allowLeads = canManageLeads(staffRole);
  const allowCsvExport = canExportLeadsCsv(staffRole);

  const selectedLead: AdminLead | null = useMemo(
    () => state.leads.find((l) => l.id === selectedLeadId) ?? null,
    [state.leads, selectedLeadId]
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteBody.trim()) return;
    addLeadNote(selectedLead.id, noteBody);
    setNoteBody("");
  };

  const handleExportCsv = () => {
    if (!allowCsvExport) return;
    const headers = [
      "Reference",
      "Couple Name",
      "City",
      "Celebration Date",
      "Guest Band",
      "Tier",
      "Stage",
      "Director",
    ];
    const rows = state.leads.map((l) =>
      [
        l.referenceCode,
        l.coupleName,
        l.city,
        l.celebrationDate,
        l.guestCount,
        l.tier,
        l.stage,
        l.assignedDirector,
      ]
        .map(escapeCsvCell)
        .join(",")
    );
    const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "the-wedding-dreams-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    logLeadsCsvExport(state.leads.length);
  };

  if (!allowLeads) {
    return (
      <div className="rounded-[24px] border border-hairline bg-blush/45 p-8 max-w-2xl space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <Lock className="h-4 w-4" strokeWidth={1.5} />
          <span>Role-Restricted Module · SECURITY.md §2</span>
        </p>
        <h1 className="font-display text-3xl text-ink">
          Couple leads are restricted to Admin and Concierge staff.
        </h1>
        <p className="text-sm text-ink-soft leading-relaxed">
          Editor accounts do not have read access to client enquiries or family
          contact details. Switch to Admin or Concierge in the sidebar to view
          the pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
            Concierge Pipeline · Couple Enquiries
          </p>
          <h1
            className="mt-1 font-display font-normal text-ink leading-[1.08]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            Concierge <em className="italic text-crimson-deep">leads</em>{" "}
            kanban.
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Track families from initial enquiry through curated shortlists,
            hosted walkthroughs, and confirmed celebrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          {allowCsvExport && (
            <Button variant="secondary" onClick={handleExportCsv}>
              <Download className="h-4 w-4" strokeWidth={1.5} />
              <span>Export CSV (Audited)</span>
            </Button>
          )}
          <div
            role="tablist"
            aria-label="Leads display view"
            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-blush/60 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "kanban"}
              onClick={() => setViewMode("kanban")}
              className={cn(
                "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors",
                viewMode === "kanban"
                  ? "bg-crimson text-ivory"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <Kanban className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "table"}
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors",
                viewMode === "table"
                  ? "bg-crimson text-ivory"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <Table2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </header>

      {/* KANBAN BOARD */}
      {viewMode === "kanban" ? (
        <div
          data-testid="leads-kanban-board"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          {LEAD_STAGES.map((stage) => {
            const stageLeads = state.leads.filter((l) => l.stage === stage.id);
            return (
              <section
                key={stage.id}
                data-stage-column={stage.id}
                aria-label={stage.label}
                className="flex flex-col rounded-[20px] border border-hairline-soft bg-blush/35 p-3.5"
              >
                <div className="flex items-center justify-between border-b border-hairline-soft pb-3 mb-3">
                  <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink">
                    {stage.label}
                  </h2>
                  <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full border border-hairline bg-ivory px-2 text-[11px] font-medium tabular-nums text-gold-text">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageLeads.map((lead) => (
                    <article
                      key={lead.id}
                      data-lead-card={lead.id}
                      className="rounded-2xl border border-hairline-soft bg-ivory p-4 shadow-soft space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                        <span className="font-medium tabular-nums whitespace-nowrap text-gold-text">
                          {lead.referenceCode}
                        </span>
                        <TierMarker tier={lead.tier} />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="text-left font-display text-xl leading-snug text-ink hover:text-crimson transition-colors cursor-pointer"
                        >
                          {lead.coupleName}
                        </button>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {lead.city} · {lead.celebrationDate}
                        </p>
                        {lead.requestedListing && (
                          <p className="mt-1 truncate text-xs font-medium text-crimson-deep">
                            {lead.requestedListing}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-ink-soft border-t border-hairline-soft pt-2.5">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <Users className="h-3 w-3 text-gold-text" strokeWidth={1.5} />
                          {lead.guestCount}
                        </span>
                        <span className="truncate">
                          {lead.assignedDirector.split(" ")[0]}
                        </span>
                      </div>

                      {/* Stacked Stage Switcher + Dossier so nothing clips inside 5-col cards */}
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="sr-only" htmlFor={`stage-${lead.id}`}>
                          Move {lead.coupleName} to stage
                        </label>
                        <select
                          id={`stage-${lead.id}`}
                          value={lead.stage}
                          onChange={(e) =>
                            moveLead(lead.id, e.target.value as LeadStage)
                          }
                          className="h-9 w-full rounded-full border border-hairline bg-silk/70 px-3 text-xs text-ink cursor-pointer"
                        >
                          {LEAD_STAGES.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="h-8 w-full rounded-full border border-crimson/35 bg-blush/50 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-crimson hover:bg-crimson hover:text-ivory transition-colors cursor-pointer"
                        >
                          Open Dossier
                        </button>
                      </div>
                    </article>
                  ))}

                  {stageLeads.length === 0 && (
                    <p className="rounded-xl border border-dashed border-hairline px-3 py-6 text-center text-xs text-ink-mute">
                      No enquiries in this stage
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-[20px] border border-hairline-soft bg-glass shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline-soft bg-blush/45 text-[11px] uppercase tracking-[0.16em] text-gold-text">
                <th className="px-5 py-3.5 font-medium">Ref</th>
                <th className="px-5 py-3.5 font-medium">Couple</th>
                <th className="px-5 py-3.5 font-medium">Destination &amp; Date</th>
                <th className="px-5 py-3.5 font-medium">Tier</th>
                <th className="px-5 py-3.5 font-medium">Director</th>
                <th className="px-5 py-3.5 font-medium">Stage</th>
                <th className="px-5 py-3.5 font-medium text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {state.leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-blush/25 transition-colors"
                >
                  <td className="px-5 py-4 text-xs font-medium tabular-nums text-gold-text">
                    {lead.referenceCode}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-display text-lg text-ink">
                      {lead.coupleName}
                    </p>
                    {lead.requestedListing && (
                      <p className="text-xs text-ink-soft">
                        {lead.requestedListing}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-soft">
                    <span className="font-medium text-ink">{lead.city}</span> ·{" "}
                    {lead.celebrationDate}
                  </td>
                  <td className="px-5 py-4">
                    <TierMarker tier={lead.tier} />
                  </td>
                  <td className="px-5 py-4 text-xs text-ink">
                    {lead.assignedDirector}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      aria-label={`Change stage for ${lead.coupleName}`}
                      value={lead.stage}
                      onChange={(e) =>
                        moveLead(lead.id, e.target.value as LeadStage)
                      }
                      className="h-9 rounded-full border border-hairline bg-ivory px-3 text-xs text-ink cursor-pointer"
                    >
                      {LEAD_STAGES.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="min-h-[36px] px-4 text-xs"
                    >
                      Open Dossier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Light Blush-Ivory Lead Dossier Drawer */}
      {selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Lead dossier for ${selectedLead.coupleName}`}
          className="fixed inset-0 z-50 flex justify-end bg-[rgba(253,238,242,0.72)] backdrop-blur-md"
        >
          <div className="flex h-full w-full max-w-xl flex-col border-l border-hairline bg-ivory shadow-lift overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-hairline-soft bg-blush/50 px-6 py-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-text tabular-nums">
                  {selectedLead.referenceCode} · Submitted {selectedLead.createdAt}
                </p>
                <h2 className="mt-1 font-display text-3xl text-ink">
                  {selectedLead.coupleName}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  <Calendar className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.5} />
                  <span>
                    {selectedLead.city} · {selectedLead.celebrationDate} ·{" "}
                    {selectedLead.guestCount} guests
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                aria-label="Close lead dossier"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-ivory text-ink hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Stage & Director Assignment */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Pipeline Stage
                  </span>
                  <select
                    value={selectedLead.stage}
                    onChange={(e) =>
                      moveLead(selectedLead.id, e.target.value as LeadStage)
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  >
                    {LEAD_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 font-medium uppercase tracking-[0.14em] text-gold-text">
                    <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Concierge Director</span>
                  </span>
                  <select
                    value={selectedLead.assignedDirector}
                    onChange={(e) =>
                      assignLeadDirector(selectedLead.id, e.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  >
                    {CONCIERGE_DIRECTORS.map((dir) => (
                      <option key={dir} value={dir}>
                        {dir}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Staff-Only Couple Contact Vault */}
              <div className="rounded-[20px] border border-crimson/25 bg-blush/40 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.16em] text-crimson">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Confidential Family Contact</span>
                  </span>
                  <TierMarker tier={selectedLead.tier} />
                </div>
                <p className="text-ink">
                  Email: <strong>{selectedLead.privateEmail}</strong>
                </p>
                <p className="text-ink tabular-nums">
                  Phone / WhatsApp: <strong>{selectedLead.privatePhone}</strong>
                </p>
                {selectedLead.requestedListing && (
                  <p className="text-ink-soft">
                    Primary Interest:{" "}
                    <strong className="text-ink">
                      {selectedLead.requestedListing}
                    </strong>
                  </p>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
                <label
                  htmlFor="new-concierge-note"
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-gold-text"
                >
                  Append Concierge Note
                </label>
                <textarea
                  id="new-concierge-note"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Record walkthrough feedback, family dietary preferences, or partner quotes..."
                  className="w-full rounded-2xl border border-hairline bg-ivory p-3.5 text-sm text-ink placeholder:text-ink-mute"
                />
                <Button type="submit" variant="primary" className="w-full">
                  <MessageSquarePlus className="h-4 w-4" strokeWidth={1.5} />
                  <span>Add Note to Dossier</span>
                </Button>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-gold-text">
                  Concierge Activity Notes ({selectedLead.notes.length})
                </h3>
                <ul className="space-y-2.5">
                  {selectedLead.notes.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-2xl border border-hairline-soft bg-silk/70 p-4 text-sm"
                    >
                      <div className="flex items-center justify-between text-[11px] text-ink-soft">
                        <span className="font-medium text-ink">{n.author}</span>
                        <span className="tabular-nums">{n.createdAt}</span>
                      </div>
                      <p className="mt-1.5 leading-relaxed text-ink-soft">
                        {n.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
