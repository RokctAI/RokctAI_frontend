# Changelog

## 1.0.0

* Initial Next.js half. 4 paas-era surfaces consolidated from the RokctAI_frontend shell: 3 admin (bonuses, cashback, referrals) and 1 manager (bonuses), all as flat templates in one top-level `installs` list. Host paths drop the `paas` segment; there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03). The marketing actions these pages import stay owned by promotions_sdk and are listed in `requires`.
