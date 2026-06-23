# DVTV SDK examples

Standalone examples for integrating [DVTV](https://www.dvtv.cz) content via [`@tivio/sdk-react`](https://www.npmjs.com/package/@tivio/sdk-react).

Each example is a small, runnable React component demonstrating one SDK feature. The app is built with [Vite](https://vite.dev/).

## Quick start

```sh
yarn install
cp .env.example .env
# fill in VITE_TIVIO_SECRET and VITE_TIVIO_APPLICATION_ID (provided by Tivio)
yarn start
```

Open [http://localhost:5173](http://localhost:5173) and pick an example from the sidebar.

### Configuration

SDK credentials are read from environment variables only (never commit `.env`):

| Variable | Description |
|----------|-------------|
| `VITE_TIVIO_SECRET` | Web SDK secret — must point to a **core-react-dom** bundle |
| `VITE_TIVIO_APPLICATION_ID` | Application id from the **same organization** as the secret |

For Cloudflare Pages or other hosting, set the same variables in the deployment environment (not in the public repo).

Screen, row, tag and article ids for examples are in [`src/config.ts`](src/config.ts).

## Examples

| Example | SDK APIs |
|---------|----------|
| Login & registration | `useUser`, `bundle.auth.signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut` |
| Series | `bundle.tivio.getOrganizationIdsInTivioPro`, `getTivioProApplicationsByOrganizationIds` |
| Articles (Časopisy) | `getArticlesByTagId` or `useRowsInScreen` + `useItemsInRow` |
| Article detail | `bundle.tivio.getArticleByIdOrUrlName` |
| Subscriptions | `useOrganizationSubscriptions`, `usePurchaseSubscription` |
| Voucher | `useVoucher` |
| Cancel subscription | `useCancelSubscription`, `useUser` |

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` / `yarn dev` | Dev server |
| `yarn build` | Production build → `./build` |
| `yarn preview` | Serve production build locally |
| `yarn deploy` | Build + deploy to Cloudflare Pages |

## Cloudflare Pages

`public/_redirects` keeps SPA routing working. Deploy with `yarn deploy` after `wrangler login` (or CI tokens). Set `VITE_TIVIO_SECRET` and `VITE_TIVIO_APPLICATION_ID` as environment variables in the Cloudflare project settings.

## Adding a new example

1. Create `src/examples/MyExample.tsx`.
2. Export a component with a descriptive name.
3. Register it in `src/examples/index.ts` and `src/App.tsx`.

Keep each example self-contained and focused on one SDK feature.
