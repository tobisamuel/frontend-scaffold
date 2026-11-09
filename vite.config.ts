import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Must be first. Strips the <TanStackDevtools> shell from production
    // builds and powers go-to-source in dev. The unified shell does not gate
    // itself on NODE_ENV the way the classic panels do, so this is what keeps
    // it out of the bundle.
    devtools({ removeDevtoolsOnBuild: true }),
    // Must run before @vitejs/plugin-react. autoCodeSplitting puts each route's
    // component in its own chunk; overlay routes are preloaded once their
    // page resolves (see src/router.tsx).
    tanstackRouter({ autoCodeSplitting: true, target: "react" }),
    // React Compiler through oxc-transform-react, the Rust port. oxlint's
    // react-compiler rules (react-doctor) are the gate: a component they flag
    // is one the compiler silently skips. So no useMemo/useCallback by hand.
    react({ compiler: true }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
});
