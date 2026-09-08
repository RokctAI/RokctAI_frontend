# Changelog

## 1.1.0

* The server actions call the platform through `paasCall` from the
  base kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0)
  instead of the host shell's `app/lib/paas-gateway.ts` helper: an
  import-path change in 1 file (`app/actions/comms/whatsapp.ts`). The kernel's
  `paasCall` keeps the shell helper's exact semantics (`Unauthorized`
  without a session, `PaaS gateway call failed: <cmd>` on any gateway
  failure; the tenant site and credentials come from the session), so the
  actions' try/catch error handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration
  or template-path changes.

## 1.0.0

* First Next.js half of the comms SDK (the directory was a
  `.gitignore`-only placeholder). Consolidates the paas-era messaging
  surfaces that lived under the `RokctAI_frontend` shell into 6 flat
  templates in one top-level `installs` list.
  * Admin surfaces: `app/admin/content/notifications/page.tsx`,
    `app/admin/settings/email/page.tsx`,
    `app/admin/settings/notifications/page.tsx`,
    `app/admin/settings/whatsapp/page.tsx`,
    `app/admin/support/notifications/page.tsx`.
  * Manager surface: the WhatsApp server action
    `app/actions/comms/whatsapp.ts`.
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X` and `app/actions/paas/X` to `app/actions/comms/X`. Import
  specifiers and route strings were rewritten mechanically to match.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* `requires` lists the host-shell prerequisites the templates import but
  this SDK does not ship (`components/ui/*`, `app/lib/*`,
  `components/custom/WhatsAppLinkCard.tsx`, the `app/(auth)/auth` helper),
  the cross-SDK `app/actions/base/admin/{content,settings}.ts` from base_sdk
  and the still-unmapped `app/actions/paas/admin/support.ts`; `_comment`
  names the owner of each.
* `install.py` follows `telemetry/nextjs/install.py`, with its `sdk_name` set to
  `comms_sdk` (the manifest name).
