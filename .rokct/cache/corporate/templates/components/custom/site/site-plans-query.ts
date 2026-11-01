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


// A local-data site sells from data/pricing.json, not platform plans: the
// landing lists no plans (and in local data mode base prefetches none).
import type { LandingPlansQuery } from "@/components/custom/landing/landing-config";

const SITE_PLANS_QUERY: LandingPlansQuery | null = null;
export default SITE_PLANS_QUERY;
