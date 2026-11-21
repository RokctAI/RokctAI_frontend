# Divisions registry

The rokct.ai home lists a division only when a card for it is in this folder.
This is the division hider (agent_sdk 1.29.0, `landing/rokct-divisions.ts`).
Each file is one repo's card, named `<owner>__<repo>.json`.

Do not edit cards here. A division's site or repo keeps its card at
`.rokct/division.json`. Its `division.yml` workflow calls RokctAI/shared-workflows
`division-announce.yml`, which opens a pull request here. The division shows once
that pull request is merged. This works the way site cards reach Cortex Media's
`showcase/`.

The three cards below were seeded when the hider shipped (2026-11-21), from the
sites that already existed: Juvo-platforms, polaris-web and hosting (Cortex
Media). Each repo's own `.rokct/division.json` and caller take over from there.
