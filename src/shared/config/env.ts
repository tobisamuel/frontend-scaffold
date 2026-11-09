import * as z from "zod";

/**
 * The app's environment, parsed once at startup so a missing variable fails
 * loudly on boot instead of as a malformed request URL later.
 *
 * Only `VITE_`-prefixed variables reach the browser bundle. Add a variable
 * here and in `.env.example` together.
 */
const envSchema = z.object({
  VITE_API_URL: z.url().default("http://localhost:8080/api/"),
});

export const env = envSchema.parse(import.meta.env);
