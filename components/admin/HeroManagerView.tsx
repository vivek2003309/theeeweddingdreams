"use client";

import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Film,
  Loader2,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CornerBrackets } from "@/components/ui/Ornaments";
import { useAdminStore } from "./AdminStoreContext";
import type { AdminHeroSlide, VideoProcessingStatus } from "@/lib/admin/types";

function TranscodeBadge({
  status,
  onCycle,
}: {
  status: VideoProcessingStatus;
  onCycle: () => void;
}) {
  const styles =
    status === "ready"
      ? "border-success/40 bg-ivory text-success"
      : status === "processing"
        ? "border-lotus/50 bg-blush text-ink"
        : "border-hairline bg-silk text-gold-text";
  const Icon =
    status === "ready"
      ? CheckCircle2
      : status === "processing"
        ? Loader2
        : Clock;

  return (
    <button
      type="button"
      onClick={onCycle}
      title="Click to simulate 4K HLS transcode progression"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] cursor-pointer transition-colors hover:border-crimson",
        styles
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span>HLS {status}</span>
    </button>
  );
}

export function HeroManagerView() {
  const {
    state,
    reorderHero,
    toggleHeroPublish,
    updateHeroSlide,
    advanceHeroProcessing,
    addHeroSlide,
    revertHeroSlides,
  } = useAdminStore();

  const [selectedId, setSelectedId] = useState<string>(
    state.heroSlides[0]?.id ?? ""
  );
  const selectedSlide: AdminHeroSlide | undefined =
    state.heroSlides.find((s) => s.id === selectedId) ?? state.heroSlides[0];

  const [draftPrefix, setDraftPrefix] = useState(
    selectedSlide?.headlinePrefix ?? ""
  );
  const [draftItalic, setDraftItalic] = useState(
    selectedSlide?.headlineItalic ?? ""
  );
  const [draftSuffix, setDraftSuffix] = useState(
    selectedSlide?.headlineSuffix ?? ""
  );
  const [draftSubtitle, setDraftSubtitle] = useState(
    selectedSlide?.subtitle ?? ""
  );
  const [draftCity, setDraftCity] = useState(selectedSlide?.cityLabel ?? "");
  const [draftVenue, setDraftVenue] = useState(selectedSlide?.venueTitle ?? "");
  const [draftSchedule, setDraftSchedule] = useState(
    selectedSlide?.scheduleWindow ?? ""
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapter, setNewChapter] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [newItalic, setNewItalic] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCity, setNewCity] = useState("Udaipur");
  const [newVenue, setNewVenue] = useState("Aravalli Marble Courtyard");
  const [newSchedule, setNewSchedule] = useState("Dec 2026 – Feb 2027");

  const selectSlide = (slide: AdminHeroSlide) => {
    setSelectedId(slide.id);
    setDraftPrefix(slide.headlinePrefix);
    setDraftItalic(slide.headlineItalic);
    setDraftSuffix(slide.headlineSuffix);
    setDraftSubtitle(slide.subtitle);
    setDraftCity(slide.cityLabel);
    setDraftVenue(slide.venueTitle);
    setDraftSchedule(slide.scheduleWindow);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide) return;
    updateHeroSlide(selectedSlide.id, {
      headlinePrefix: draftPrefix,
      headlineItalic: draftItalic,
      headlineSuffix: draftSuffix,
      subtitle: draftSubtitle,
      cityLabel: draftCity,
      venueTitle: draftVenue,
      scheduleWindow: draftSchedule,
    });
  };

  const handleCreateSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim() || !newPrefix.trim()) return;
    addHeroSlide({
      chapterName: newChapter,
      headlinePrefix: newPrefix,
      headlineItalic: newItalic || "luminous",
      subtitle: newSubtitle || "Curated daylight wedding chapter.",
      cityLabel: newCity,
      venueTitle: newVenue,
      scheduleWindow: newSchedule,
    });
    setNewChapter("");
    setNewPrefix("");
    setNewItalic("");
    setNewSubtitle("");
    setShowAddForm(false);
  };

  const publishedCount = state.heroSlides.filter((s) => s.isPublished).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
            Hero Video Manager · Processional Window
          </p>
          <h1
            className="mt-1 font-display font-normal text-ink leading-[1.08]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            4K HLS <em className="italic text-crimson-deep">chapter</em>{" "}
            sequence.
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Reorder ceremonial chapters, toggle publication, manage seasonal
            windows, and simulate adaptive 4K HLS transcode states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              revertHeroSlides();
              const first = state.heroSlides[0];
              if (first) selectSlide(first);
            }}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            <span>Revert Sequence</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span>Add 4K Chapter</span>
          </Button>
        </div>
      </header>

      {/* Optional Add 4K Chapter Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSlide}
          className="rounded-[20px] border border-gold bg-silk/90 p-6 shadow-soft space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">
              Queue New 4K Hero Chapter (Placeholder HLS)
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-crimson cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Chapter Name
              </span>
              <input
                type="text"
                required
                placeholder="e.g., Haldi Courtyard"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                City
              </span>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Featured Venue
              </span>
              <input
                type="text"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Schedule Window
              </span>
              <input
                type="text"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Headline Lead
              </span>
              <input
                type="text"
                required
                placeholder="Marigold light"
                value={newPrefix}
                onChange={(e) => setNewPrefix(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Italic Accent Word
              </span>
              <input
                type="text"
                placeholder="sunlit"
                value={newItalic}
                onChange={(e) => setNewItalic(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                Subtitle
              </span>
              <input
                type="text"
                placeholder="Daylight garden seating and folk strings."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3.5 text-sm text-ink"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Queue Placeholder 4K Upload
            </Button>
          </div>
        </form>
      )}

      {/* Main Split: Chapter Queue + Live Preview & Editor */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Ordered Slide Stack */}
        <section
          aria-label="Hero chapter order"
          className="lg:col-span-7 space-y-3"
        >
          <div className="flex items-center justify-between text-xs text-ink-soft px-1">
            <span className="tabular-nums">
              {publishedCount} published · {state.heroSlides.length} total
              chapters
            </span>
            <span className="uppercase tracking-[0.16em] text-[10px] text-gold-text">
              Use arrows to reorder sequence
            </span>
          </div>

          <ul data-testid="hero-slides-list" className="space-y-3">
            {state.heroSlides.map((slide, idx) => {
              const isSelected = selectedSlide?.id === slide.id;
              return (
                <li
                  key={slide.id}
                  data-slide-id={slide.id}
                  className={cn(
                    "rounded-[20px] border p-4 transition-colors",
                    isSelected
                      ? "border-crimson/50 bg-blush/55 shadow-soft"
                      : "border-hairline-soft bg-glass hover:border-hairline"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => selectSlide(slide)}
                      className="flex items-center gap-3.5 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div
                        className="h-14 w-20 shrink-0 rounded-xl border border-hairline-soft flex items-center justify-center"
                        style={{
                          background: slide.visualMotif.backdropGradient,
                        }}
                      >
                        <span className="font-display text-lg font-medium tabular-nums text-crimson">
                          {slide.chapterIndex}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-gold-text">
                            {slide.chapterName} · {slide.cityLabel}
                          </span>
                        </div>
                        <p className="truncate font-display text-xl text-ink">
                          {slide.headlinePrefix}{" "}
                          <em className="italic text-crimson-deep">
                            {slide.headlineItalic}
                          </em>{" "}
                          {slide.headlineSuffix}
                        </p>
                        <p className="text-xs text-ink-soft truncate">
                          {slide.scheduleWindow} · {slide.hlsUrl}
                        </p>
                      </div>
                    </button>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <TranscodeBadge
                        status={slide.processingStatus}
                        onCycle={() => advanceHeroProcessing(slide.id)}
                      />

                      <button
                        type="button"
                        onClick={() => toggleHeroPublish(slide.id)}
                        aria-label={
                          slide.isPublished
                            ? `Unpublish ${slide.chapterName}`
                            : `Publish ${slide.chapterName}`
                        }
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium cursor-pointer transition-colors",
                          slide.isPublished
                            ? "border-success/40 bg-ivory text-success"
                            : "border-hairline bg-silk text-ink-soft"
                        )}
                      >
                        {slide.isPublished ? (
                          <>
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>

                      <div className="inline-flex items-center rounded-full border border-hairline bg-ivory p-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderHero(idx, -1)}
                          aria-label={`Move ${slide.chapterName} up`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink disabled:opacity-35 hover:bg-blush cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === state.heroSlides.length - 1}
                          onClick={() => reorderHero(idx, 1)}
                          aria-label={`Move ${slide.chapterName} down`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink disabled:opacity-35 hover:bg-blush cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Right: Miniature Processional Window Preview + Editor */}
        {selectedSlide && (
          <aside className="lg:col-span-5 space-y-5">
            <div className="relative overflow-hidden rounded-[24px] rounded-tr-[96px] border border-hairline bg-blush p-6 shadow-soft">
              <CornerBrackets />
              <div
                className="relative overflow-hidden rounded-[18px] rounded-tr-[72px] border border-hairline-soft p-6 min-h-[210px] flex flex-col justify-between"
                style={{
                  background: selectedSlide.visualMotif.backdropGradient,
                }}
              >
                <div className="flex items-center justify-between gap-2 pr-10">
                  <span className="rounded-full border border-hairline bg-glass-strong px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-text tabular-nums">
                    CHAPTER {selectedSlide.chapterIndex} /{" "}
                    {String(state.heroSlides.length).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-glass-strong px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                    <Film className="h-3 w-3 text-crimson" strokeWidth={1.5} />
                    <span>4K HLS</span>
                  </span>
                </div>

                <div className="mt-8 rounded-2xl bg-glass-strong/90 p-4 border border-hairline-soft">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text">
                    {selectedSlide.chapterName} · {draftCity} · {draftVenue}
                  </p>
                  <p className="mt-1 font-display text-2xl leading-tight text-ink">
                    {draftPrefix}{" "}
                    <em className="italic text-crimson-deep">{draftItalic}</em>{" "}
                    {draftSuffix}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{draftSubtitle}</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="rounded-[20px] border border-hairline-soft bg-glass p-6 shadow-soft space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">
                  Edit Chapter {selectedSlide.chapterIndex}
                </h2>
                <span className="text-xs text-ink-soft">
                  {selectedSlide.chapterName}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Headline Lead
                  </span>
                  <input
                    type="text"
                    value={draftPrefix}
                    onChange={(e) => setDraftPrefix(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Italic Word
                  </span>
                  <input
                    type="text"
                    value={draftItalic}
                    onChange={(e) => setDraftItalic(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm italic text-crimson-deep"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Ending
                  </span>
                  <input
                    type="text"
                    value={draftSuffix}
                    onChange={(e) => setDraftSuffix(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-xs">
                <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                  Editorial Subtitle
                </span>
                <textarea
                  rows={2}
                  value={draftSubtitle}
                  onChange={(e) => setDraftSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-ivory p-3 text-sm text-ink"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    City
                  </span>
                  <input
                    type="text"
                    value={draftCity}
                    onChange={(e) => setDraftCity(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Estate Label
                  </span>
                  <input
                    type="text"
                    value={draftVenue}
                    onChange={(e) => setDraftVenue(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium uppercase tracking-[0.14em] text-gold-text">
                    Window
                  </span>
                  <input
                    type="text"
                    value={draftSchedule}
                    onChange={(e) => setDraftSchedule(e.target.value)}
                    className="h-11 w-full rounded-xl border border-hairline bg-ivory px-3 text-sm text-ink"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-hairline-soft bg-silk/70 p-3 text-[11px] text-ink-soft space-y-1">
                <p className="font-medium uppercase tracking-[0.14em] text-gold-text">
                  Adaptive Media Assets (Placeholder)
                </p>
                <p className="truncate">HLS Master: {selectedSlide.hlsUrl}</p>
                <p className="truncate">
                  720p Preview: {selectedSlide.previewMp4Url}
                </p>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                <Save className="h-4 w-4" strokeWidth={1.5} />
                <span>Save Chapter Changes</span>
              </Button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
