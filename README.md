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
| Series | `getOrganizationIdsInTivioPro`, `getTivioProApplicationsByOrganizationIds` |
| Series detail | `getVideosByOrganizationId` (published videos), optional `getSeriesContentByOrganizationId` metadata, client-side season filtering |
| Articles (Časopisy) | `getArticlesByTagId` or `useRowsInScreen` + `useItemsInRow` |
| Article detail | `bundle.tivio.getArticleByIdOrUrlName` |
| Subscriptions | `useOrganizationSubscriptions`, `usePurchaseSubscription` |
| Voucher | `useVoucher` |
| Cancel subscription | `useCancelSubscription`, `useUser` |
| Video preview & paywall | `switchApplicationByHandle`, `useVideo`, `WebPlayer`; linked `TASTING` preview and automatic payment overlay |
| Qerko checkout | `purchaseSubscriptionWithQerko`, `webPaymentGatewayLink`, purchase status from `useUser` |

For videos in a TivioPro series application, await
`tivio.organization.switchApplicationByHandle(urlHandle)` before mounting `WebPlayer`.
The player must receive the main `videos/<id>` path: a paid video with a linked
`TASTING` plays the preview and then shows the paywall, while a paid video without
a valid `TASTING` shows the paywall before playback.

Open a specific example directly with the `example` query parameter, for example
[`?example=qerko-checkout`](http://localhost:5173/?example=qerko-checkout).

For [`?example=gift-subscription`](http://localhost:5173/?example=gift-subscription),
enter the series application handle (for example `cobykdyby`). The example awaits
the application switch, verifies the active handle and organization ID, then calls
`tivio.getSubscriptionsByOrganizationId(organizationId)`. This includes one-time
offers, unlike the default `useOrganizationSubscriptions()` call. Only enabled
offers with `isPurchasableAsVoucher` are selectable. An invalid application clears
the offers instead of falling back to the main DVTV subscription.

The voucher grants access through the selected monetization, not directly through
the series ID. The series needs its own giftable subscription monetization if the
gift should cover only that series.

The Qerko example creates an order with a Qerko `webTheme` UUID and opens the
returned `webPaymentGatewayLink` in an iframe. The optional checkout options are
the sixth argument of `purchaseSubscriptionWithQerko` (after `quantity` and
`gateway`). The bundle must advertise `supportsQerkoWebTheme`; older bundles
are rejected before creating an order.

The frame uses `allow="payment *"` without a sandbox. `challengeWindowSize=01`
is added to the returned URL for 3DS. The example observes the matching
`purchaseId` in the user's purchases and closes the frame on `PAID` or a failed
terminal status. Closing the frame manually does not cancel the order.
Return URLs are navigation destinations, not proof of payment. The result comes
from Qerko's webhook to Tivio. Card, wallet, and bank 3DS behavior must be tested
on the deployment domain before production use.

To test a locally built remote bundle, add this to `.env.development.local`:

```dotenv
VITE_TIVIO_BUNDLE_URL=/__tivio-local-bundle.js
TIVIO_LOCAL_BUNDLE_PATH=/absolute/path/to/core-react-dom/dist/index.js
```

This file is ignored by Git. The dev server serves only the configured bundle;
it is not included in production builds. Remove these settings to use the remote
bundle configured for your SDK secret.

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
