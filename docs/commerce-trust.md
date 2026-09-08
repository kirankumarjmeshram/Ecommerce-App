# Commerce trust and fulfillment

## Verified buyer reviews

A verified buyer is an authenticated user whose order contains the product and is both paid and delivered. Only that user may create one review for the product. The API derives the reviewer ID, reviewer name, and `verifiedPurchase` flag from server-side state; client-supplied identity or verification fields are ignored. Owners may edit or delete their review. Administrators may delete reviews for moderation, but cannot create customer reviews, edit their scores, or grant verification.

Every create, update, and delete recomputes `rating` and `numReviews` atomically. Removing the last review produces `rating = 0` and `numReviews = 0`. Mutations invalidate the product detail and all catalog/list Redis keys, while RTK Query invalidates Product data so the detail, eligibility, and catalog aggregates refresh without a hard reload.

Existing legacy embedded reviews remain visible but are not retroactively marked verified.

## Users and commerce history

Accounts are active or suspended. Suspension is checked on every protected request, so an already-issued cookie cannot be used for profile changes, order creation, or review mutations while suspended. Reactivation restores normal protected access.

An account referenced by an order or product review cannot be permanently deleted. Administration should suspend it instead, preserving order and review history. Accounts with no commerce history retain the existing safe deletion behavior.

## Fulfillment

The forward-only sequence is:

`Placed -> Processing -> Shipped -> Delivered`

Only administrators can advance fulfillment, only paid orders can advance, and states cannot be skipped or moved backwards. Razorpay payment verification remains authoritative for `isPaid`; fulfillment requests cannot mark an order paid. On the final transition, the server sets `orderStatus = Delivered`, `isDelivered = true`, and `deliveredAt` from server time. The customer timeline displays only confirmed payment flags and actual processing, shipping, and delivery timestamps. Legacy delivered orders remain displayed as delivered.

## Storefront controls

The rating control has exactly five interactive stars. Selecting a star applies that minimum threshold (for example, the third star means 3 stars and above) and stores it in `rating` in the URL. The price control uses catalog-wide minimum and maximum values, synchronized range handles and manual INR inputs, with an explicit Apply action. Invalid ranges do not update the URL or issue a catalog request.

The homepage carousel advances every five seconds, wraps continuously, supports previous/next/indicator controls, pauses on hover or keyboard focus, and offers Pause/Play. With `prefers-reduced-motion: reduce`, transitions are disabled and automatic cycling is disabled.

## Verification

Automated backend tests use `mongodb-memory-server` and mocked Redis; they do not use Atlas, Razorpay, or Upstash credentials. `backend/scripts/commerce-preview.mjs` is a disposable local browser fixture and never reads `.env`. Use it only with a frontend build configured for its local API.
