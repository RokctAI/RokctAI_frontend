# Fleet board (control persona)

Staff-only, read-only view of every docker the hub knows about. Part of the
federated hubs plan, work package WP1b. Path: **Hands-on > Fleet**
(`/handson/control/fleet`), visible to System Manager and Administrator.

## The board

- **Summary strip**: total dockers, counts by health, total sites. Click a
  health count to filter the list to that colour.
- **Per server**: each docker shows its id and type (hub, tenant,
  deliveryplatform, polaris, supacharge), state and hosting tier, time since
  the last heartbeat, settings revision applied / desired, and site count.
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

Click a row. Shows state and since when, last beat, build (version, template,
lock SHA), then:

- **Sites and lifecycle**: Company Subscriptions placed on the docker with
  billing status and `lifecycle_state` (Active, Lapsed, ReadOnly,
  ExportWindow, Stopped, Archived, Removed), since when and the next timer.
  System Managers can extend a site or request its export from the
  **Staff actions** card below.
- **Usage samples**: the daily rows from the beat (requests, active users,
  storage, CPU seconds, errors).
- **Settings revisions**: newest first, who issued each, the diff, and
  whether the docker applied it.

## Data and demo mode

All reads go through the platform gateway with `frappe.client.get_list` /
`frappe.client.get` on Docker Instance, Settings Revision and Company
Subscription. Set `ROKCT_DEMO_DATA=1` to show the fixtures in
`app/lib/fleet/demo.ts` (used by the guided tour). If the hub has no fleet
module yet, the board falls back to the fixtures and says so in a banner.

## Staff actions

The docker detail view has a **Staff actions** card (System Manager only).
Every action asks for confirmation, then sends a `control:` cmd through
`POST /api/v1/method/rokct.platform.api`, shows a toast and refetches the detail view. The card is hidden for
users without the System Manager role; the server enforces the same check.

| Action         | Cmd                          | Payload                                    |
| -------------- | ---------------------------- | ------------------------------------------ |
| Stop docker    | `control:docker_stop`        | `docker`                                   |
| Start docker   | `control:docker_start`       | `docker`                                   |
| Extend a site  | `control:lifecycle_extend`   | `subscription`, `days` (1 to 90), `reason` |
| Request export | `control:hub_request_export` | `subscription`                             |
| Start rollout  | `control:rollout_start`      | `rollout`, `reset_failed`                  |
| Pause rollout  | `control:rollout_pause`      | `rollout`, `reason`                        |
| Roll back      | `control:rollout_rollback`   | `rollout`                                  |

Rollouts are driven from the **Rollouts** panel by entering the rollout id.

These cmds ship with pending control updates. If the hub answers `cmd not
found`, the toast says the action is not available yet and nothing changes.
With `ROKCT_DEMO_DATA=1` actions are no-ops and the toast is marked "demo".
When a fleet cmd fails and the page falls back to demo fixtures (outside
`ROKCT_DEMO_DATA=1`), the actions panel is hidden and the server refuses any
action that names a fixture docker or subscription id.
