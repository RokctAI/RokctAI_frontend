## 1.1.1

* fix(icons): `lucide-react` icons replaced with `@remixicon/react`, per the
  one-icon-set standard. Manifest dependency swapped to
  `@remixicon/react ^4.6.0`.

## 1.1.0

* Pages for the rest of studio: `/studio` (home and request history),
  `/studio/requests/new` (trace artwork or generate from a prompt),
  `/studio/requests/[name]` (candidates: preview, construction guides,
  select, SVG edit with re-check, PNG / press PDF, proof),
  `/studio/check` (brand check then fix uploaded artwork),
  `/studio/systems`, `/studio/systems/new` (derive from 2-3 colours or a
  logo's palette), `/studio/systems/[name]` (tokens, fonts, brand book),
  `/studio/campaigns`, `/studio/campaigns/new`, `/studio/campaigns/[name]`,
  `/studio/documents`, `/studio/documents/[name]`.
* Sliced like the other SDKs: gateway calls in
  `app/services/all/studio/<resource>.ts`, server actions and types in
  `app/actions/studio/<resource>/{actions,types}.ts`. Replaces
  `app/actions/studio/print-shop.ts`.
* New backend cmds `design_request.upload_file` (base64 upload, returns a
  private file url) and `design_request.get_candidate_svg`.

## 1.0.0

* First Next.js half of the studio SDK. Pages: `/studio/print` (print
  jobs board), `/studio/print/[job]` (production fields, Make press-ready:
  press PDF, imposed sheet, job ticket), `/studio/preflight` (client PDF
  preflight + imposition), `/studio/review/[token]` (public client proof
  review), `/studio/settings/hot-folder`. Components: `ConstructionPanel`
  (construction guides toggle) and `ProofPanel` (download or email a proof
  for sign-off). Server actions in `app/actions/studio/print-shop.ts` call
  only studio's own whitelisted cmds.
