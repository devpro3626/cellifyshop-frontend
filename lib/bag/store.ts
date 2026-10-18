"use client";

import { useSyncExternalStore } from "react";

/**
 * Shopping bag state. A tiny external store persisted to localStorage, read
 * through `useSyncExternalStore` so every subscriber stays in sync without a
 * context provider. Swap `persist`/`load` for API calls once checkout exists.
 */

export interface BagLine {
  /** variant id; one line per variant */
  id: string;
  productSlug: string;
  name: string;
  /** e.g. "Cosmic Orange · 256GB · Brand new" */
  description: string;
  image: string;
  tint: string;
  price: number;
  quantity: number;
  /** Product page link with this variant preselected (shared in the order message). */
  url?: string;
}

interface BagState {
  lines: BagLine[];
  open: boolean;
}

const STORAGE_KEY = "cellify.bag.v1";
const EMPTY: BagState = { lines: [], open: false };

let state: BagState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...state, lines: JSON.parse(raw) as BagLine[] };
  } catch {
    // Storage can be unavailable (private mode); the bag still works in memory.
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  } catch {
    // ignore
  }
}

function set(next: Partial<BagState>) {
  state = { ...state, ...next };
  if ("lines" in next) persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  // Notify once after hydration so persisted lines appear.
  listener();
  return () => listeners.delete(listener);
}

export const bag = {
  add(line: Omit<BagLine, "quantity">, quantity = 1) {
    const existing = state.lines.find((l) => l.id === line.id);
    const lines = existing
      ? state.lines.map((l) => (l.id === line.id ? { ...l, quantity: Math.min(l.quantity + quantity, 9) } : l))
      : [...state.lines, { ...line, quantity }];
    set({ lines, open: true });
  },
  setQuantity(id: string, quantity: number) {
    set({
      lines: quantity <= 0 ? state.lines.filter((l) => l.id !== id) : state.lines.map((l) => (l.id === id ? { ...l, quantity: Math.min(quantity, 9) } : l)),
    });
  },
  remove(id: string) {
    set({ lines: state.lines.filter((l) => l.id !== id) });
  },
  clear() {
    set({ lines: [] });
  },
  setOpen(open: boolean) {
    set({ open });
  },
};

export function useBag() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
  const count = snapshot.lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = snapshot.lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  return { ...snapshot, count, subtotal };
}
