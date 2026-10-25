/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// Studio gateway cmds, each whitelisted by studio's own frappe/manifest.json
// (cmd co-location rule, SDK_ECOSYSTEM.md).

import { paasCall } from "@/app/services/base/platform-gateway";
import type { DesignSystem, DesignSystemDocument, Format, PaletteColour } from "@/app/actions/studio/systems/types";

export class SystemService {
  static list() {
    return paasCall<any[]>("api.design_system.list_design_systems", {});
  }

  static get(name: string) {
    return paasCall<DesignSystem>("api.design_system.get_design_system", { name });
  }

  /** 2-3 seed colours in, a full WCAG-safe system out. */
  static derive(seedColors: string[], name: string, customer?: string) {
    return paasCall<DesignSystem>("api.design_system.derive_design_system", {
      seed_colors: JSON.stringify(seedColors),
      name,
      customer,
    });
  }

  /** Import a canonical design-system document (the YAML/JSON schema). */
  static create(system: DesignSystemDocument, name?: string, customer?: string) {
    return paasCall<DesignSystem>("api.design_system.create_design_system", {
      system: JSON.stringify(system),
      name,
      customer,
    });
  }

  /** JSON merge patch over the canonical document; null removes a key. */
  static update(name: string, patch: Partial<DesignSystemDocument>, expectedFingerprint?: string) {
    return paasCall<DesignSystem>("api.design_system.update_design_system", {
      name,
      patch: JSON.stringify(patch),
      expected_fingerprint: expectedFingerprint,
    });
  }

  static extractPalette(fileUrl: string, n = 6) {
    return paasCall<PaletteColour[]>("api.design_system.extract_palette", { file_url: fileUrl, n });
  }

  static formats() {
    return paasCall<Format[]>("api.design_system.list_formats", {});
  }
}
