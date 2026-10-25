# Changelog

## 1.6.1

* First release of the control Next.js layer (`control_sdk`). The fleet board
  from RokctAI_frontend#204 (and the formatting pass in #205) moves here
  unchanged, as templates at their shell paths under persona `rokctapp`:
  * `app/handson/control/fleet/` - `page.tsx`, `[docker]/page.tsx`,
    `fleet-ui.tsx`, `fleet-actions-ui.tsx`
  * `app/actions/handson/control/fleet/` - `fleet.ts`, `fleet-actions.ts`
  * `app/services/control/fleet.ts`, `app/services/control/fleet-actions.ts`
  * `app/lib/fleet/` - `types.ts`, `demo.ts` (fixtures for `ROKCT_DEMO_DATA=1`)
  * `docs/guides/control-fleet-board.md`
  * `tour/fragments/control-fleet.tour.yaml`
* The Fleet sidebar entry (`app/handson/layout.tsx`) and the control dashboard
  tile (`app/handson/control/page.tsx`) stay in the shell, which owns both
  files and has no SDK marker in them.
* Requires the host's `app/services/control/base.ts`, `app/lib/role_constants.ts`,
  auth_sdk's `app/(auth)/auth.ts` and the shadcn UI primitives listed in the
  manifest.
