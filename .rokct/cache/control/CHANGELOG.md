# Changelog

## 1.8.0

* Move rollback on the board (hubs gap item 11, spec 7.3). The **Moves**
  card has a **Rollback** button on a switched move while its old site is
  kept (until `red_kept_until`). It sends `control:move_rollback` with
  `move_job` and a required reason. The card shows the rollback window, the
  rollback reason and why a rollback attempt stopped; the new states
  `rolling_back` (amber) and `rolled_back` (red) get their own pills. Demo
  fixture `MOVE-DEMO-3` is a switched move into `tenant-a71q`, and the
  moves tour step mentions rollback.

## 1.7.0

* Finish the fleet board (hubs gap item 10). New staff actions, each a
  `control:` cmd through `/api/v1/method/rokct.platform.api` with a confirm
  dialog:
  * Restore (`control:docker_restore`): for an Archived docker by
    `docker_id`, or for an Archived site by `subscription`, with an optional
    reason.
  * Remove an Archived site (`control:lifecycle_remove`, reason required).
  * Moves: plan from a site (`control:move_plan`: optional target docker,
    quiet hours, new dedicated docker), and postpone or abort from the new
    **Moves** card (`control:move_postpone`, `control:move_abort`).
  * Enrolment tokens for a docker (`control:hub_issue_enrolment_token`, by
    docker or by server and docker type) and a server agent
    (`control:server_issue_enrolment_token`), shown once with a copy button.
  * Key rotation for a docker (`control:hub_rotate_key`) and a server agent
    (`control:server_rotate_key`).
* New read-only views: **Servers and agents** on the board (Server Agent) and
  **Company links** on the docker detail (Company Link, with per-side acked
  revision and ack errors), plus the **Moves** card. They read the new
  fleet staff cmds `control:server_agent_list`, `control:company_link_list`
  and `control:move_list` (with `docker_id`); every board read is a
  `control:` cmd. A failed read shows on its card only.
* The board shows the new `control:fleet_board` fields: per docker `drift`,
  `drift_sites`, `red_alert_at` and the outside probe (`last_probe_at`,
  `last_probe_status`, `last_probe_ok`); per server the `drift` count. The
  docker detail adds a red alert banner and a drift banner.
* Fix: docker stop and start sent `docker`; the hub cmds take `docker_id`.
  The per-site actions now send the Company Subscription name
  (`subscription` from `control:fleet_docker`, fleet 1.8.0) instead of the
  site name.
* Demo fixtures cover all of it (an Archived docker and an Archived site, a
  red docker with a failed probe, drift, three server agents, links and
  moves). Two tour steps (`fleet_servers`, `fleet_moves`) and the guide are
  updated. Removed the stale `control:docker_set_state` comment.

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
