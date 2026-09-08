# Product discovery

The primary shopping route is `/products`. Home shows four latest products, database category links, and a three-slide React Bootstrap carousel. It advances every five seconds, pauses on hover or focus, supports manual controls and a Pause button, and disables automatic motion when the operating system requests reduced motion.

## API

`GET /api/products` returns `{ products, page, pages, totalProducts }`, replacing the old array. Home, catalog, and admin product lists consume this envelope.

| Parameter | Meaning |
| --- | --- |
| keyword | Literal case-insensitive substring in name, brand, description; max 100 characters |
| category | Exact stored category; max 100 characters |
| minPrice, maxPrice | Inclusive non-negative bounds; minimum cannot exceed maximum |
| inStock | true selects stock greater than zero; false includes all stock states |
| rating | 1 through 5; selects actual ratings greater than or equal to this value |
| sort | newest (default), price_asc, price_desc, rating_desc |
| page | Positive integer; default 1, maximum 100000 |
| limit | Positive integer; default 12, maximum 100 |

Unknown parameters, repeated/object values and invalid options return 400. Search regex metacharacters are escaped. Sorting uses an ID tie-breaker before pagination. Empty matches have pages: 0; out-of-range pages return no products with the requested page and actual total.

`GET /api/products/categories` returns `{ categories: [...], priceRange: { min, max } }` from current MongoDB values. Admin inputs suggest these categories and accept new ones. There is no Category collection.

## URL and controls

Example: `/products?category=Audio&minPrice=100&inStock=true&sort=price_asc&page=2`.

Header search navigates to the catalog. Category, star threshold and stock apply immediately. The dual price sliders and manual minimum/maximum inputs share draft state and apply only after validation; equality is allowed and minimum greater than maximum is rejected without changing the URL. Filter/sort changes reset page; pagination preserves filters. Refresh and Back/Forward restore applied state. Clear all resets discovery. Mobile filters stack above results and can be collapsed. Prices use the shared INR formatter.

## Redis

Validated, normalized parameters form versioned `ecommerce:products:list` keys. Defaults share a key; different rating thresholds, filters, sort, page and limit do not. Categories use the list prefix so product and review mutations invalidate them along with lists. Review mutations also invalidate the affected product-detail key. Configured TTL, observability and MongoDB fallback remain unchanged.

## Data and testing

Six existing seed products retain prices, images and stock. Seed categories now cover Audio, Phones, Cameras, Gaming and Accessories. No live migration or reseed is performed. Existing products may still be Electronics; recategorize them in admin without deleting products/orders. Do not run the destructive seeder merely to update categories.

Use `/products?limit=2` to exercise pagination with six products; no duplicate seed products are needed.

Isolated backend tests cover query combinations, metadata, literal search, sort, input rejection and mocked Redis invalidation/fallback. Frontend tests cover URL state. Run `npm test --prefix backend`, `npm test --prefix frontend -- --watchAll=false`, and `npm run build --prefix frontend`.

Manual checks: Home → category → Products; header search; category/price/stock combinations; sorting; Next with limit=2; refresh and Back; empty results; product detail and cart. Check 320/375/768/1024/1440px. Payment logic is outside this phase.

Substring regex and offset pagination suit this small catalog; this is not full-text relevance search or a large-scale search service.

## Catalog hardening

Category dropdown destinations use separate pathname/search fields because the installed react-router-bootstrap LinkContainer treats string destinations as a pathname. Native React Router homepage and pagination links accept complete strings.

Search is intentionally submit-only: typing does not update the URL or request products. Enter or the Search button submits one trimmed, encoded keyword; empty submission clears discovery state to `/products`. There is no live-search debounce timer to cancel or duplicate navigation. Catalog queries come exclusively from URL state; RTK Query `currentData` prevents previous-filter results showing under a new filter. Same-query refresh keeps cards visible with an updating indicator; new queries show stable placeholders rather than stale cards.

The star filter is applied with the other filters and resets page. Rating participates in normalized cache keys; values 3 and 4 and their category/search combinations remain isolated. Existing CRUD invalidation is unchanged.

Virtualization is intentionally not added: customer and admin grids render 12 items by default, and the API caps pages at 100. The current small category list also does not warrant a virtualized menu.

An outer React error boundary and a router error element show recovery actions without exception details. Unknown routes show a dedicated 404; invalid/missing product IDs show Product not found. API outages use safe messages and Retry; 400 query errors offer Clear filters; empty matches remain a separate state. Price-range validation is inline, associated with inputs and checked before URL updates. Category API errors leave the static navigation available.
