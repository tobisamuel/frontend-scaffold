import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Customers this browser opened recently, newest first.
 *
 * Why zustand, when most state here is not: this is client-only state (no
 * server owns it, so not Query), it is not part of any URL (so not the
 * router), and it is written by one subtree (the profile route) and read by a
 * distant one (the sidebar), so not component state. Those three together are
 * the bar a store must clear (docs/state.md).
 *
 * It stores ids only. Names come from `customerQueryOptions`, so the sidebar
 * never shows a stale copy of a name the server has changed.
 */
const RECENT_LIMIT = 5;

interface RecentlyViewedState {
  customerIds: string[];
  visit: (customerId: string) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      customerIds: [],
      visit: (customerId) =>
        set((state) => ({
          customerIds: [
            customerId,
            ...state.customerIds.filter((id) => id !== customerId),
          ].slice(0, RECENT_LIMIT),
        })),
    }),
    {
      name: "recently-viewed-customers",
      // Persist the data, never the actions.
      partialize: (state) => ({ customerIds: state.customerIds }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
