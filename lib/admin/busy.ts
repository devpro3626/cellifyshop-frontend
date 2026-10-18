"use client";

import { useSyncExternalStore } from "react";

/**
 * Counts admin actions in flight so the portal can show one progress bar
 * across the top while anything is saving, deleting or refreshing.
 */
let active = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Run an async action while the admin progress bar is shown. */
export async function withBusy<T>(work: () => Promise<T>): Promise<T> {
  active++;
  emit();
  try {
    return await work();
  } finally {
    active--;
    emit();
  }
}

export function useAdminBusy() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => active > 0,
    () => false,
  );
}
