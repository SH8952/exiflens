# Vendored: libraw-wasm

These are the unmodified `dist/` build output files from the
[`libraw-wasm`](https://www.npmjs.com/package/libraw-wasm) npm package
(v1.6.0, ISC license, https://github.com/ybouane/LibRaw-Wasm), used by
`src/lib/raw-exif.ts` to read metadata and extract embedded JPEG previews
from camera RAW files (CR2/CR3/NEF/ARW/DNG/...).

**Why vendored here instead of a normal `node_modules` dependency:** the
package's own code does `new Worker(new URL('./worker.js', import.meta.url),
{ type: 'module' })` next to a co-located `.wasm` file, and importing it
directly makes Next.js's Turbopack production build (`next build`) hang
indefinitely trying to bundle it (confirmed 2026-08-31 — reproduced multiple
times, 5+ minutes with no progress). Serving the already-built files here as
plain static assets and loading them at runtime via
`import("/vendor/libraw-wasm/index.js")` sidesteps bundling entirely.

`libraw-wasm` is still listed in `package.json` as a **devDependency only**,
purely so `src/lib/raw-exif.ts` can `import type` its TypeScript types — it
is never imported as a value from application code and is not part of the
production bundle.

**To upgrade:** `npm view libraw-wasm version` to check for a newer release,
then `npm pack libraw-wasm@<version>` and copy `package/dist/*` over these
files (keep the filenames as-is). Bump the devDependency version in
`package.json` to match, and re-run `npm run build` to confirm Turbopack
still doesn't choke on it (it shouldn't — nothing about this file layout
changes).
