"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { RARITIES, type BiomeId, type RarityId } from "@/data/steal-an-egg";

export type SortId = "biome" | "rarity" | "income-desc" | "income-asc" | "name";
export type OwnedFilter = "all" | "collected" | "missing";

export const BROWSE_ANCHOR = "browse";
export const biomeAnchor = (id: BiomeId) => `biome-${id}`;

const SORT_IDS: SortId[] = ["biome", "rarity", "income-desc", "income-asc", "name"];
const RARITY_IDS = new Set(RARITIES.map((r) => r.id));
const OWNED_IDS: OwnedFilter[] = ["all", "collected", "missing"];

/* ── the query string is the source of truth, so any view is shareable ──── */

const URL_EVENT = "sp:url";

const subscribeUrl = (listener: () => void) => {
  window.addEventListener("popstate", listener);
  window.addEventListener(URL_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(URL_EVENT, listener);
  };
};

const getUrl = () => window.location.search;
const getServerUrl = () => "";

function writeParams(mutate: (params: URLSearchParams) => void) {
  const params = new URLSearchParams(window.location.search);
  mutate(params);
  const qs = params.toString();
  // replaceState, not push — filtering shouldn't fill up the back button
  history.replaceState(null, "", qs ? `?${qs}${location.hash}` : `${location.pathname}${location.hash}`);
  window.dispatchEvent(new Event(URL_EVENT));
}

interface BrowseState {
  query: string;
  setQuery: (v: string) => void;
  rarities: RarityId[];
  toggleRarity: (v: RarityId) => void;
  sort: SortId;
  setSort: (v: SortId) => void;
  owned: OwnedFilter;
  setOwned: (v: OwnedFilter) => void;
  dirty: boolean;
  reset: () => void;
  /** the nav navigates — this scrolls to a biome section, it does not filter */
  jumpTo: (id: BiomeId | "all" | "limited") => void;
}

const Ctx = createContext<BrowseState | null>(null);

export function BrowseProvider({ children }: { children: React.ReactNode }) {
  const search = useSyncExternalStore(subscribeUrl, getUrl, getServerUrl);

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const query = params.get("q") ?? "";

  const rarities = useMemo(
    () =>
      (params.get("rarity") ?? "")
        .split(",")
        .filter((r): r is RarityId => RARITY_IDS.has(r as RarityId)),
    [params]
  );

  const sortParam = params.get("sort") as SortId | null;
  const sort = sortParam && SORT_IDS.includes(sortParam) ? sortParam : "biome";

  const ownedParam = params.get("owned") as OwnedFilter | null;
  const owned = ownedParam && OWNED_IDS.includes(ownedParam) ? ownedParam : "all";

  const setQuery = useCallback((v: string) => {
    writeParams((p) => (v ? p.set("q", v) : p.delete("q")));
  }, []);

  const setSort = useCallback((v: SortId) => {
    writeParams((p) => (v === "biome" ? p.delete("sort") : p.set("sort", v)));
  }, []);

  const setOwned = useCallback((v: OwnedFilter) => {
    writeParams((p) => (v === "all" ? p.delete("owned") : p.set("owned", v)));
  }, []);

  const toggleRarity = useCallback((v: RarityId) => {
    writeParams((p) => {
      const current = (p.get("rarity") ?? "").split(",").filter(Boolean);
      const next = current.includes(v) ? current.filter((r) => r !== v) : [...current, v];
      if (next.length) p.set("rarity", next.join(","));
      else p.delete("rarity");
    });
  }, []);

  const reset = useCallback(() => {
    writeParams((p) => ["q", "rarity", "sort", "owned"].forEach((k) => p.delete(k)));
  }, []);

  const jumpTo = useCallback(
    (id: BiomeId | "all" | "limited") => {
      // Fast path: the section is already on the page, so scroll right away.
      if (scrollToSection(id)) return;

      // Otherwise the sort or filters are hiding it — clear them, then scroll
      // once React has committed the grouped view.
      reset();
      afterPaint(() => scrollToSection(id));
      setTimeout(() => scrollToSection(id), 150);
    },
    [reset]
  );

  const value = useMemo<BrowseState>(
    () => ({
      query,
      setQuery,
      rarities,
      toggleRarity,
      sort,
      setSort,
      owned,
      setOwned,
      dirty: query !== "" || rarities.length > 0 || sort !== "biome" || owned !== "all",
      reset,
      jumpTo,
    }),
    [query, setQuery, rarities, toggleRarity, sort, setSort, owned, setOwned, reset, jumpTo]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function afterPaint(fn: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

/** Scrolls a biome section into view. Returns false when it isn't rendered. */
function scrollToSection(id: BiomeId | "all" | "limited") {
  const anchor = id === "all" ? BROWSE_ANCHOR : id === "limited" ? "limited" : biomeAnchor(id);
  const el = document.getElementById(anchor);
  if (!el) return false;
  // Smooth-scrolling the length of an 88-egg page takes seconds; snap instead
  // once the target is more than a couple of screens away.
  const far = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2;
  el.scrollIntoView({ behavior: far ? "instant" : "smooth", block: "start" });
  return true;
}

export function useBrowse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBrowse must be used inside <BrowseProvider>");
  return ctx;
}
