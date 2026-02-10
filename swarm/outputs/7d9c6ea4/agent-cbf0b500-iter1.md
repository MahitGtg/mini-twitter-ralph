Summary:
- Switched Convex auth config to provider credentials object and fixed password imports.
- Moved Convex test setup into `src/test` with glob including `_generated`.
- Updated TS path mapping and auth hooks; removed `any` in Convex tests.

Tests:
- `npm test -- --run`
- `npm run build`
- `npm run lint` (warnings only)
