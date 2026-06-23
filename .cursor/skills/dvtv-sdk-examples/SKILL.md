---
name: dvtv-sdk-examples
description: >-
  Standalone DVTV @tivio/sdk-react examples repo (Vite). Use when working in
  dvtv-sdk-examples, opening a new Cursor window for that folder, adding SDK
  examples for DVTV clients, or when the path is /Users/davidrus/Sites/tivio/dvtv-sdk-examples.
---

# DVTV SDK examples

Standalone repo — **not** the Tivio monorepo. Do not assume `libs/*`, Turborepo, or monorepo AGENTS.md rules.

**Path:** `/Users/davidrus/Sites/tivio/dvtv-sdk-examples`  
**Remote:** https://github.com/tiviostudio/dvtv-sdk-examples

## Open in Cursor (new window)

From terminal:

```bash
cursor -n /Users/davidrus/Sites/tivio/dvtv-sdk-examples
```

Or from the folder:

```bash
cd /Users/davidrus/Sites/tivio/dvtv-sdk-examples && cursor -n .
```

Alternative: Cursor menu **File → New Window**, then **File → Open Folder…** and select `dvtv-sdk-examples`.

## First-time setup

```bash
cd /Users/davidrus/Sites/tivio/dvtv-sdk-examples
yarn install
cp .env.example .env
# set VITE_TIVIO_SECRET in .env
yarn start
```

Secret can also be passed via URL: `?secret=<tivioClientSecret>`.

## Project layout

| Path | Purpose |
|------|---------|
| `src/examples/` | One component per SDK feature |
| `src/examples/index.ts` | Register new examples here + `App.tsx` |
| `src/config.ts` | DVTV screen/row/article/monetization ids |
| `src/hooks/useTivioApi.ts` | Access `tivio` from loaded remote bundle |
| `src/App.tsx` | Sidebar navigation between examples |

Stack: Vite 6, React 18, `@tivio/sdk-react` from npm.

## Adding an example

1. Create `src/examples/MyExample.tsx` — self-contained, one SDK feature.
2. Export from `src/examples/index.ts` (`exampleDefinitions` + export).
3. Add case in `src/App.tsx` switch.
4. Document the hook/API in the component header comment.
5. Run `yarn build` to verify TypeScript.

## SDK conventions (DVTV)

- **Default secret:** `7oraqYzNbV2g4tji` + `UIwGV0qOZgbj0WctI5CR` (DVTV-DEV, bundle 7.10.0). Demo/legacy secrets need i18next patch; never `0tA91lLNyZbSu1dbCIlF` on web.
- Import types/enums from `@tivio/sdk-react` (not `@tivio/types` — not on public npm).
- `useTivioApi()` for `tivio.getArticleByIdOrUrlName`, series APIs, etc.
- `bundle.auth?.signIn…` — auth may be null until bundle is ready.
- Articles detail: `useTivioApi().getArticleByIdOrUrlName(id)`.
- Articles list: NOT from embed screen `screen-spKopMMkpKnp8h_UrzRxu` (PDF iframe). Use either
  `articlesTagId` → `getArticlesByTagId`, or `articlesScreenId` + filter row → `useRowsInScreen` +
  `useItemsInRow`.
- Vouchers: `useVoucher` → `activate()`.
- Cancel subscription: `useCancelSubscription(monetizationId)` — stops renewal, access until `expirationDate`.

## Validation

```bash
yarn build
```

No eslint/jest in this repo unless added explicitly.

## Do not

- Add monorepo workspace dependencies (`libs/*`).
- Commit `.env` or secrets.
- Bump `@tivio/sdk-react` without testing all examples.
