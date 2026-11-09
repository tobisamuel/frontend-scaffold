import ky from "ky";

import { env } from "@/shared/config/env";

/**
 * The HTTP client every live request goes through.
 *
 * Nothing calls it yet: every feature reads from its `requests.mock.ts`. When
 * an endpoint exists, write the same function in the feature's `requests.ts`
 * against this client and point `queries.ts` at it (docs/mocking.md). The
 * response is validated with the feature's wire schema through ky's
 * standard-schema support, so a contract drift fails at the boundary:
 *
 *   api.get("orders", { searchParams }).json(ordersPageSchema)
 *
 * Retries are Query's job, not the client's: two retry layers multiply into
 * slow failures. `retry: 0` leaves exactly one owner.
 */
export const api = ky.create({
  baseUrl: env.VITE_API_URL,
  retry: 0,
});
