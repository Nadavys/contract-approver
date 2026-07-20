// Resolves a root-relative public asset path (e.g. "/logo.svg") against the
// app's configured base URL (see vite.config.ts's `base`). Needed because
// Vite only rewrites asset URLs it can see at build time (bundled imports,
// index.html tags) — runtime string literals like fetch() targets, <img
// src>, and PDF URLs pulled from data are untouched, so under a GitHub
// Pages project subpath (BASE_URL === "/contract-approver/") they'd
// otherwise resolve against the domain root instead of the subpath.
export function assetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
