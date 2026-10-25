# Changelog

## 1.0.1

* fix(icons): icons come from `@remixicon/react` (the fleet's one icon set)
  instead of `lucide-react`. `@remixicon/react` ^4.6.0 is declared in
  `dependencies`. Icons only.

## 1.0.0

* Initial Next.js half. 1 paas-era manager surface consolidated from the RokctAI_frontend shell (restaurant kitchens), a flat template in the one top-level `installs` list; there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03). Host path drops the `paas` segment (`app/manager/restaurant/kitchens`); the operations action it imports stays owned by products_sdk and is listed in `requires`.
