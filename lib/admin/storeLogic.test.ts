import test from "node:test";
import assert from "node:assert/strict";
import {
  appendLeadNote,
  createInitialAdminState,
  moveLeadToStage,
  prependAuditEntry,
  reorderHeroSlides,
  transitionPartnerApplication,
} from "./storeLogic";

test("createInitialAdminState seeds all 5 CMS modules cleanly", () => {
  const state = createInitialAdminState();
  assert.equal(state.heroSlides.length, 6);
  assert.equal(state.venues.length, 12);
  assert.equal(state.vendors.length, 18);
  assert.ok(state.applications.length >= 4);
  assert.ok(state.leads.length >= 5);
  assert.ok(state.auditLog.length >= 3);
});

test("reorderHeroSlides swaps slides and recalculates 01-06 chapterIndex", () => {
  const state = createInitialAdminState();
  const reordered = reorderHeroSlides(state.heroSlides, 0, 1);
  assert.equal(reordered[0].slug, "mehendi");
  assert.equal(reordered[0].chapterIndex, "01");
  assert.equal(reordered[1].slug, "sangeet");
  assert.equal(reordered[1].chapterIndex, "02");

  // Out-of-bounds move is a safe no-op
  const unchanged = reorderHeroSlides(state.heroSlides, 0, -1);
  assert.equal(unchanged[0].slug, "sangeet");
});

test("transitionPartnerApplication updates status and reviewer notes", () => {
  const state = createInitialAdminState();
  const updated = transitionPartnerApplication(
    state.applications,
    "app-1",
    "approved",
    "Approved after courtyard lighting verification."
  );
  const target = updated.find((a) => a.id === "app-1");
  assert.equal(target?.status, "approved");
  assert.equal(
    target?.reviewerNotes,
    "Approved after courtyard lighting verification."
  );
});

test("moveLeadToStage and appendLeadNote update lead Kanban state", () => {
  const state = createInitialAdminState();
  const moved = moveLeadToStage(state.leads, "lead-1", "shortlist_sent");
  assert.equal(
    moved.find((l) => l.id === "lead-1")?.stage,
    "shortlist_sent"
  );

  const noted = appendLeadNote(
    moved,
    "lead-1",
    "Ananya Rathore",
    "Shared 3 Udaipur palace dossiers.",
    "2026-11-20 19:00"
  );
  const lead = noted.find((l) => l.id === "lead-1")!;
  assert.equal(lead.notes[0].body, "Shared 3 Udaipur palace dossiers.");
});

test("prependAuditEntry adds latest entry at top", () => {
  const state = createInitialAdminState();
  const nextLog = prependAuditEntry(state.auditLog, {
    actor: "Ananya Rathore",
    role: "Admin",
    action: "Published hero slide",
    target: "Chapter 01 · Sangeet",
  });
  assert.equal(nextLog[0].action, "Published hero slide");
  assert.equal(nextLog.length, state.auditLog.length + 1);
});
