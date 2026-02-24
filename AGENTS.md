# Image Builder Frontend

React/TypeScript frontend for Red Hat's Image Builder service, running on console.redhat.com as a federated micro-frontend. Also available as a Cockpit plugin for on-premises use.

## Tech Stack

- **React 18** with TypeScript
- **Redux Toolkit / RTK Query** for state management and API calls
- **PatternFly 6** component library
- **Webpack** with module federation
- **Vitest** + React Testing Library for unit tests
- **Playwright** for E2E tests

## Project Structure

| Directory         | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `src/Components/` | React components organized by feature              |
| `src/store/`      | Redux store, slices, and RTK Query API definitions |
| `src/Utilities/`  | Shared utility functions                           |
| `src/Hooks/`      | Custom React hooks                                 |
| `src/test/`       | Vitest utilities and legacy integration tests      |
| `api/config/`     | RTK Query codegen configuration files              |
| `playwright/`     | Playwright E2E tests                               |
| `cockpit/`        | Cockpit plugin build configuration                 |

## Commands

```bash
npm ci                  # Install dependencies (prefer over npm install)
npm run start:prod      # Run against production
npm run start:stage     # Run against staging
npm run test            # Run all Vitest tests
npm run test:unit       # Run unit tests only (co-located with components)
npm run test:integration # Run integration tests only (src/test/) - legacy
npm run lint            # Run ESLint
npm run lint:js:fix     # Auto-fix lint errors
npm run api             # Regenerate RTK Query API code from OpenAPI specs
npm run build           # Production build
npm run build:cockpit   # Build Cockpit plugin
```

## API Code Generation

API endpoints are auto-generated from OpenAPI schemas using `@rtk-query/codegen-openapi`.

**Configuration files:** `api/config/*.ts`

Each config specifies:

- Remote OpenAPI schema URL
- Empty API slice to extend
- Output file location
- Endpoints to generate

**To add a new endpoint:** Update the `filterEndpoints` array in the relevant config file, then run `npm run api`.

**To add a new API:** Follow the pattern in README.md - create an empty API slice in `src/store/`, add the config in `api/config/`, and update `eslint.config.js` to ignore the generated file.

## Code Style

- **Avoid JSDoc comments** - TypeScript types document function signatures sufficiently
- **Comments should explain why, not what** - Code should be self-explanatory; use comments only to clarify intent or non-obvious decisions
- **Focused changes** - PRs should address a single concern; avoid unrelated refactors or improvements outside the task at hand
- **Atomic commits** - Each commit should represent a logical change
- Use PatternFly components; follow their usage patterns
- Follow existing file naming conventions (PascalCase for components)
- Keep components focused and reasonably sized
- Use RTK Query hooks for data fetching, not manual fetch calls

### Imports

Imports are enforced alphabetically by ESLint. Group order:

1. External packages
2. Internal modules (absolute paths)
3. Relative imports

## Testing

- All UI contributions must include tests
- **Unit tests** are co-located with components in a `tests/` subdirectory (e.g., `src/Components/Feature/tests/Feature.test.tsx`)
- Unit test directories can include:
  - `mocks/` - Component-specific mock data and vitest mocks for API responses
  - `helpers.tsx` - Shared test utilities and render wrappers
- Use React Testing Library patterns (query by role, text, etc.)
- Mock API responses using vitest mocks; MSW is legacy and should not be used for new tests
- Integration tests in `src/test/` are legacy; prefer co-located unit tests for new work
- Playwright tests for E2E coverage of critical flows
- The `TZ=UTC` prefix is applied automatically by npm scripts

## Feature Flags

Uses Unleash for feature toggles in the hosted service. Import `useFlag` from `src/Utilities/useGetEnvironment.ts` to check flag status:

```ts
import { useFlag } from '../../Utilities/useGetEnvironment';

const isEnabled = useFlag('image-builder.my-feature');
```

**On-premises (Cockpit):** Unleash is not available, so `useFlag` uses a local `onPremFlag` function instead. To enable a flag for on-premises, add a case to the switch statement in `onPremFlag`.

**Ephemeral environments:** Use `useFlagWithEphemDefault` to provide a default value for flags in QA/ephemeral environments.

Mock flags in tests when testing both code paths.

## Build Targets

1. **Hosted service** - Federated module for console.redhat.com
2. **Cockpit plugin** - Standalone plugin for on-premises use (`npm run build:cockpit`)
