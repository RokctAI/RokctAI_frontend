# Changelog

## 1.2.0

* Subscribers tab on `app/admin/finance/customer-subscriptions`: every customer enrolment with status (Pending, Active, Past Due, Cancelled, Expired), period, payment method (wallet or card), auto-renew and the last payment error, filterable by status, with Activate (Pending) and Cancel (immediate) through the existing `get_customer_subscriptions`, `activate_customer_subscription` and `cancel_customer_subscription_admin` endpoints.

## 1.1.0

* Admin customer subscription plans (Uber One style: a customer pays per period for benefits such as free delivery). New page `app/admin/finance/customer-subscriptions` with create/edit/delete and a benefits editor, backed by the new `api.admin_customer_subscription.*` endpoints and the `Customer Subscription Plan` / `Customer Subscription Benefit` doctypes in loyalty/frappe. Same level as shop subscriptions, not tenant subscriptions.

## 1.0.0

* Initial Next.js half. 4 paas-era surfaces consolidated from the RokctAI_frontend shell: 3 admin (bonuses, cashback, referrals) and 1 manager (bonuses), all as flat templates in one top-level `installs` list. Host paths drop the `paas` segment; there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03). The marketing actions these pages import stay owned by promotions_sdk and are listed in `requires`.
