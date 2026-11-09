# Fleet board (control persona)

Staff-only view of every docker and server the hub knows about, with the
staff fleet actions. Part of the federated hubs plan, work package WP1b.
Path: **Hands-on > Fleet** (`/handson/control/fleet`), visible to System
Manager and Administrator.

## The board

- **Summary strip**: total dockers, counts by health, total sites. Click a
  health count to filter the list to that colour.
- **Per server**: each docker shows its id and type (hub, tenant,
  deliveryplatform, polaris, supacharge), state and hosting tier, time since
  the last heartbeat, settings revision applied / desired, and site count.
  The server header shows a **drift** tag with the number of dockers on it
  that have drift.
- **Red alert and probe**: a red docker shows when its alert opened
  (`red_alert_at`) and the result of the one outside HTTP probe the hub runs
  per red incident (`last_probe_at`, `last_probe_status`, `last_probe_ok`).
- **Drift**: a docker that reports sites the registry does not have carries
  a **drift** tag (`drift`, `drift_sites`). Alert, probe and drift are
  display only; nothing automatic acts on them.
- **Servers and agents**: one row per server with its agent status, version,
  last beat, enrolment date and last key rotation. A server without an agent
  says so.
- Refreshes every 30 seconds.

### Health

Taken from `last_heartbeat_at` against the one-minute beat (spec 7.5):

| Colour | Meaning                                                        |
| ------ | -------------------------------------------------------------- |
| green  | beat within the last 3 intervals                               |
| amber  | 3 to 10 beats missed                                           |
| red    | more than 10 missed, or the hub reports a failing health check |
| grey   | Stopped, Archived or Removed; no beat expected                 |

### Settings revision

`applied / desired`. **in sync** when they match, **applying** when the docker
is one revision behind (normal, picked up on the next beat), **behind** when
it lags by more than one.

## Docker detail

Click a row. Shows state and since when, last beat (and the last outside
probe), build (version, template, lock SHA). A red alert and drift each get a
banner, drift with the list of unknown sites. Then:

- **Sites and lifecycle**: Company Subscriptions placed on the docker with
  billing status and `lifecycle_state` (Active, Lapsed, ReadOnly,
  ExportWindow, Stopped, Archived, Removed), since when and the next timer.
  System Managers act on a site from the **Staff actions** card.
- **Moves**: Move Jobs from or to this docker, with state, the not-before
  time and quiet hours. A planned move can be postponed once; a move can be
  aborted until the switch (planned, freezing, copying, verifying). A
  switched move shows how long it can be rolled back and has a Rollback
  button until then; `rolling_back` and `rolled_back` are its rollback
  states.
- **Company links**: Company Links where this docker is either side, with
  state (requested, consented, active, refused, revoked), ownership kind, and
  per side the link revision it has acked and any ack error. Dockers
  request, consent and revoke links themselves; the board only shows them.
- **Usage samples**: the daily rows from the beat (requests, active users,
  storage, CPU seconds, errors).
- **Settings revisions**: newest first, who issued each, the diff, and
  whether the docker applied it.

## Data and demo mode

Every read is a `control:` staff cmd (System Manager only) through the
platform gateway: `control:fleet_board` for the board,
`control:fleet_docker` for the docker detail, `control:server_agent_list`
for the servers card, and `control:company_link_list` and
`control:move_list` (each with `docker_id`) for the links and moves cards.
The list cmds return named fields only, never keys. If the agents, links or
moves read fails, its card says so and the rest of the page still shows. Set `ROKCT_DEMO_DATA=1` to show the fixtures in
`app/lib/fleet/demo.ts` (used by the guided tour). If the hub has no fleet
module yet, the board falls back to the fixtures and says so in a banner.

## Staff actions

The docker detail view has a **Staff actions** card and the **Moves** card;
the board has the **Servers and agents** card (System Manager only). Every
action asks for confirmation, then sends a `control:` cmd through
`POST /api/v1/method/rokct.platform.api`, shows a toast and refetches. The
action buttons are hidden for users without the System Manager role; the
server enforces the same check.

| Action            | Where               | Cmd                                    | Payload                                                       |
| ----------------- | ------------------- | -------------------------------------- | ------------------------------------------------------------- |
| Stop docker       | Docker power        | `control:docker_stop`                  | `docker_id`                                                   |
| Start docker      | Docker power        | `control:docker_start`                 | `docker_id`                                                   |
| Restore docker    | Docker power        | `control:docker_restore`               | `docker_id`, `reason` (optional)                              |
| Rotate docker key | Docker key          | `control:hub_rotate_key`               | `docker_id`                                                   |
| Docker token      | Docker key          | `control:hub_issue_enrolment_token`    | `docker_id`, `docker_type`                                    |
| Extend a site     | Per site            | `control:lifecycle_extend`             | `subscription`, `days` (1 to 90), `reason`                    |
| Move a site       | Per site            | `control:move_plan`                    | `subscription`, `to_docker`, `quiet_hour_window`, `dedicated` |
| Request export    | Per site            | `control:hub_request_export`           | `subscription`                                                |
| Restore a site    | Per site (Archived) | `control:docker_restore`               | `subscription`, `reason` (optional)                           |
| Remove a site     | Per site (Archived) | `control:lifecycle_remove`             | `subscription`, `reason`                                      |
| Postpone move     | Moves               | `control:move_postpone`                | `move_job`                                                    |
| Abort move        | Moves               | `control:move_abort`                   | `move_job`, `reason` (optional)                               |
| Roll back move    | Moves (switched)    | `control:move_rollback`                | `move_job`, `reason`                                          |
| Agent token       | Servers and agents  | `control:server_issue_enrolment_token` | `server`                                                      |
| New docker token  | Servers and agents  | `control:hub_issue_enrolment_token`    | `server`, `docker_type`                                       |
| Rotate agent key  | Servers and agents  | `control:server_rotate_key`            | `server`                                                      |
| Start rollout     | Rollouts            | `control:rollout_start`                | `rollout`, `reset_failed`                                     |
| Pause rollout     | Rollouts            | `control:rollout_pause`                | `rollout`, `reason`                                           |
| Roll back         | Rollouts            | `control:rollout_rollback`             | `rollout`                                                     |

- **Restore** brings an Archived tenant back. For a dedicated docker the
  server agent restores the volumes from the archive snapshot, then starts
  the docker; its Archived subscriptions go Active only when the start is
  acked. A tenant on a running shared docker goes Active at once. No
  snapshot, or no recent server agent, and the hub refuses.
- **Remove** is for Archived tenants only and needs a reason.
- **Move**: leave the target empty to let placement pick a docker (a new
  dedicated one with the switch on). The tenant is told before the move may
  start.
- **Roll back move** shows on a switched move while its old site is still
  kept (until `red_kept_until`, `move_old_site_retention_days` after the
  switch). The new site goes read-only, the server agent takes a
  `snapshot_site` of it (every change made there since the switch, kept for
  replay), then the tenant is pointed back at the old docker, which is made
  writable, and the tenant is emailed. If the export fails or takes longer
  than the freeze cap, the move stays switched on the new site and the card
  shows why; try again. A reason is required. The hub cmd also takes
  `skip_export=1` for a new site that cannot be snapshotted; the board does
  not offer it, and the skip is recorded and the tenant told.
- **Tokens** are one-time, valid 24 hours, and shown once in the dialog with
  a copy button; the hub keeps only their hash.

Rollouts are driven from the **Rollouts** panel by entering the rollout id.

Some of these cmds ship with pending control updates. If the hub answers `cmd not
found`, the toast says the action is not available yet and nothing changes.
With `ROKCT_DEMO_DATA=1` actions are no-ops and the toast is marked "demo".
When a fleet cmd fails and the page falls back to demo fixtures (outside
`ROKCT_DEMO_DATA=1`), the actions panel is hidden and the server refuses any
action that names a fixture docker, server, subscription or move job id.
