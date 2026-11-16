# Store architecture

Paths below are relative to `src/store/` unless prefixed with `@/` or described as repository-root paths.

## Store and API boundaries

- Use the typed hooks in `@/store/hooks` and exported selectors/actions. This keeps components independent of the state layout and preserves `RootState`/`AppDispatch` typing.
- Import API hooks/types through service entry points such as `@/store/api/backend` and `@/store/api/contentSources`. They select hosted or on-prem implementations so consumers do not duplicate backend selection. Hosted backend types are the canonical shared contract.
- Keep server data in RTK Query and editable wizard/UI state in slices. Put API transport and response adaptation in `api/`, not components.
- `index.ts` configures both stores. Register new API reducers and middleware for the relevant targets, once per API instance. On-prem composer and content-source endpoints share `api/shared/emptyOnPremApi.ts`; registering both aliases duplicates middleware/reducers. Do not split that shared cache or remove hosted registrations from the on-prem store without checking remaining consumers.
- Use `onPremQueryHandler` from `@/store/api/shared` for on-prem query functions; it converts thrown failures into RTK Query errors.

## Hosted and on-prem backends

- `api/backend/hosted/` and `api/backend/onprem/` are separate because their APIs have diverged. This split is intentional, not duplication to eliminate. The shared entry point lets components reuse operations without knowing how each environment implements them.
- Hosted is a conventional API client: the remote service handles persistence and build orchestration.
- Cockpit is a fat client: it manages local blueprint files, invokes host commands, orchestrates builds, and interprets their results. Keep that logic in the on-prem implementation rather than forcing it into the hosted model.

### On-prem security model

Host command execution and filesystem access are intentional Cockpit capabilities. Do not flag an authenticated operator's ability to perform operations already available through their terminal as a vulnerability, or apply hosted multi-tenant assumptions to local operations. Security findings must identify a concrete trust-boundary violation or harm—not merely the presence of command execution. Still consider externally supplied data triggering unintended operations, unauthorized privilege use, credential exposure, and accidental data loss.

## Wizard state and request conversion

- `slices/wizard/` is split by domain (content, output, registration, etc.), combined in `slices/wizard/slice.ts`. Keep domain state, reducers, selectors, and conversion logic together; add only the files the behavior needs.
- Shared actions in `slices/wizard/actions.ts` let each domain handle initialization and loading through `extraReducers`. Extend that mechanism when adding state, rather than coordinating resets from components.
- Parsers turn API blueprints into editable state; mappers turn state into API request fragments. `parseStateFromRequest` and `mapStateToRequest` compose the domain implementations. Keep conversions here so create, edit, and import paths do not grow separate implementations.
- Mapper `createSelector` calls provide declarative composition, not primarily memoization. The top-level `mapStateToRequest` is a plain function called from event handlers; do not convert it into a render-time subscription.
- Consumers use `@/store/slices/wizard` or domain entry points, not individual implementation files. Within a domain, import local files directly rather than its own barrel to avoid dependency cycles.

## Cross-domain reactions

- Wizard listener effects live in `slices/wizard/listeners.ts`; `middleware/listeners.ts` registers them. Keep reactions such as clearing unsupported settings or synchronizing cloud targets here rather than duplicating them in component effects.
- Listeners run after reducers, so their dispatched updates are not part of the original reducer transition. Preserve that ordering when changing dependent reactions.
- Import listener effects directly from their file, not the wizard barrel: re-exporting them there creates circular dependencies. Keep listener middleware prepended before the default middleware in both stores.

## API generation

- Repository-root `api/config/*.ts` identifies generated outputs, schemas, and endpoint filters. Do not edit generated files. Update the relevant `filterEndpoints` and run `npm run api` from the repository root.
- Keep handwritten behavior such as cache tags and invalidation in the existing enhancement layer (`api/backend/hosted/enhancedImageBuilderApi.ts`, for example), so regeneration does not overwrite it.
- For a new generated API, follow a neighboring service: add its empty API, codegen config, invocation in root `api/codegen.sh`, and generated-file ignore in root `eslint.config.js`; wire exports and store registration as appropriate. Reuse the shared on-prem API when applicable.

Existing wizard behavior tests are in `slices/wizard/tests/`, including mapping, roundtrips, validation, and listener reactions. Inspect those before adding coverage; a test per helper is not the goal.
