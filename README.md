# DVTV SDK examples

Standalone examples for integrating [DVTV](https://www.dvtv.cz) content via [`@tivio/sdk-react`](https://www.npmjs.com/package/@tivio/sdk-react).

Each example is a small, runnable React component demonstrating one SDK feature. The app is built with [Vite](https://vite.dev/) and mirrors the structure of the internal `examples/sdk-react` project in the Tivio monorepo.

## Quick start

```sh
yarn install
cp .env.example .env
# fill VITE_TIVIO_SECRET in .env
yarn start
```

Open [http://localhost:5173](http://localhost:5173) and pick an example from the sidebar.

Alternatively, pass the secret via URL (useful for Cloudflare Pages demos):

```
http://localhost:5173/?secret=<tivioClientSecret>
```

## Examples

| Example | SDK APIs |
|---------|----------|
| Login | `useUser`, `bundle.auth.signInWithEmailAndPassword`, `signOut` |
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
