# Image Builder Frontend

React/TypeScript frontend for console.redhat.com, also built as an on-premises Cockpit plugin. Changes must respect both targets.

Before changing store code, how components consume store state/APIs, or API generation (`api/`), read [src/store/AGENTS.md](src/store/AGENTS.md) for architecture and code-generation rules. Do not assume nested guidance is loaded automatically.

## Commands

```bash
npm ci                  # Install dependencies
npm run start:stage     # Develop against staging
npm run start:prod      # Develop against production
npm run types           # Type-check
npm run lint:check      # Check lint without rewriting files
npm run format:check    # Check formatting
npm run test            # Vitest; append -- <test-path> to narrow the run
npm run build           # Hosted production build
npm run build:cockpit   # Cockpit build
```

`npm run lint` auto-fixes files; `npm run format` rewrites formatting. Prefer checks when verifying a change. Test scripts set `TZ=UTC`.

## Code conventions

- Keep changes focused and commits atomic; avoid unrelated refactors.
- Use `type`, not `interface`. Avoid JSDoc; comment only to explain non-obvious reasons.
- Use PatternFly components and existing project patterns. Component filenames use PascalCase.
- Use RTK Query hooks for API data, not manual fetching in components.
- Use `@/` imports outside the current or parent directory; no `../../` imports. ESLint enforces alphabetical grouping: external, internal, then relative imports.
- Prefer satisfying lint rules. When an intentional pattern needs `eslint-disable-next-line`, put a short explanation immediately above it.

## Testing and review

- Test observable behavior and meaningful failure cases, not implementation details or individual changed lines.
- Inspect existing coverage first. Add or update tests when changed behavior or a regression is not adequately covered; reuse existing tests when they are sufficient.
- A fixup commit, refactor, or small correction does not need a new test merely because code changed. Judge coverage across the complete change, not whether each commit adds tests.
- Choose verification proportionate to behavioral risk. A one-line change can still warrant a regression test.
- Use Vitest and React Testing Library for unit tests, querying UI by role or text; use Playwright for critical end-to-end flows. Co-locate unit tests in `tests/`, with local `mocks/` and `helpers.tsx` as needed. Mock API responses with Vitest.
- In reviews, recommend changes only for concrete defects, meaningful risks, or unmet requirements. Do not invent findings or request extra code or tests to make a review appear useful. No findings is a valid outcome.

## Feature flags

- Use `useFlag` from `@/Utilities/useGetEnvironment`, not Unleash directly. Cockpit has no Unleash; enable on-prem flags in that module's `onPremFlag` function.
- Use `useFlagWithEphemDefault` for QA/ephemeral defaults. Mock flag values when testing gated behavior.
