# DVTV SDK examples

Standalone examples for integrating [DVTV](https://www.dvtv.cz) content via [`@tivio/sdk-react`](https://www.npmjs.com/package/@tivio/sdk-react).

Each example is a small, runnable React component demonstrating one SDK feature. The app is built with [Vite](https://vite.dev/) and mirrors the structure of the internal `examples/sdk-react` project in the Tivio monorepo.

## Quick start

```sh
yarn install
yarn start
```

Open [http://localhost:5173](http://localhost:5173) and pick an example from the sidebar.

The default is **DVTV-DEV predproduction** (`7oraqYzNbV2g4tji` → `core-react-dom_7.10.0.js`). Override via `.env` or URL:

```
http://localhost:5173/?secret=7oraqYzNbV2g4tji
```

### Which secret to use?

`@tivio/sdk-react` loads a remote JS bundle from Firebase Remote Config. The secret must point to a **web** bundle (`core-react-dom`), not a native one.

| Secret | Use with sdk-react on web? | Notes |
|--------|---------------------------|-------|
| `7oraqYzNbV2g4tji` | Yes (**default**) | DVTV-DEV predproduction — `core-react-dom_7.10.0` |
| `dvtvomEgYekvgICtWS9h` | Yes | DVTV demo web (older 5.x bundle) |
| `pdvtvM4PCofoVav0AHGe` | Yes | Legacy DVTV web (deprecated) |
| `0tA91lLNyZbSu1dbCIlF` | **No** | tvOS/native bundle — causes `@react-native-async-storage/async-storage` error on web |

Each secret belongs to one organization. **`applicationId` must exist in that same org** — known pairs are resolved automatically in `getTivioApplicationId()`.

Older remote bundles (`core-react-dom` 5.x) also require shared deps that `@tivio/sdk-react` 10.x no longer ships (`i18next`, `react-spring`, …). This repo registers them via `src/tivioSharedExtras.ts` and patches `resolveShared` in a `postinstall` script — not needed for the default 7.10.0 bundle, but kept for demo/legacy secrets.

| Secret | applicationId (auto) |
|--------|---------------------|
| `7oraqYzNbV2g4tji` | `UIwGV0qOZgbj0WctI5CR` |
| `dvtvomEgYekvgICtWS9h` | `hzHlMaAcABw771DO9XeF` |
| `pdvtvM4PCofoVav0AHGe` | `hzHlMaAcABw771DO9XeF` |

dvtv.cz uses `0tA91lLNyZbSu1dbCIlF` for Firebase auth, but bundles `core-react-dom` directly (not via sdk-react). For a third-party web integration, ask Tivio for a web SDK secret or use `bundleUrlOverride` during development.

See [`src/config.ts`](src/config.ts) for `applicationId` and other DVTV ids.

## Examples

| Example | SDK APIs |
|---------|----------|
| Login & registration | `useUser`, `bundle.auth.signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut` |
| Series | `bundle.tivio.getOrganizationIdsInTivioPro`, `getTivioProApplicationsByOrganizationIds` |
| Articles (Časopisy) | `useRowsInScreen`, `useItemsInRow` |
| Article detail | `bundle.tivio.getArticleByIdOrUrlName` |
| Subscriptions | `useOrganizationSubscriptions`, `usePurchaseSubscription` |
| Voucher | `useVoucher` |
| Cancel subscription | `useCancelSubscription`, `useUser` |

IDs for screens, rows and articles are configured in [`src/config.ts`](src/config.ts). Adjust them to match your DVTV administration setup.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` / `yarn dev` | Dev server (`vite --force` re-bundles linked deps) |
| `yarn build` | Production build → `./build` |
| `yarn preview` | Serve production build locally |
| `yarn deploy` | Build + deploy to Cloudflare Pages |

## Cloudflare Pages

`public/_redirects` keeps SPA routing working. Deploy with `yarn deploy` after `wrangler login` (or CI tokens).

Example URL:

```
https://<project>.pages.dev/?secret=<tivioClientSecret>
```

## Adding a new example

1. Create `src/examples/MyExample.tsx`.
2. Export a component with a descriptive name.
3. Register it in `src/examples/index.ts` and `src/App.tsx`.

Keep each example self-contained and focused on one SDK feature.
