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

// The Twitter card image is the Open Graph one: same copy, same drawing
// (see ./opengraph-image.tsx). The segment config is restated here rather
// than re-exported because Next reads `runtime` from this file's own
// source; the metadata exports are the same values by import.

import OpenGraphImage, {
  alt as openGraphAlt,
  contentType as openGraphContentType,
  size as openGraphSize,
} from "./opengraph-image";

export const runtime = "nodejs";
export const size = openGraphSize;
export const contentType = openGraphContentType;
export const alt = openGraphAlt;

export default OpenGraphImage;
