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


export type PreflightFinding = {
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  blocking?: boolean;
  fixed?: boolean;
};

export type PreflightReport = {
  score: number;
  blocked: boolean;
  findings: PreflightFinding[];
  file_url?: string;
};

export type Layout = {
  sheet: string;
  sheet_mm: [number, number];
  item_mm: [number, number];
  cols: number;
  rows: number;
  rotated: boolean;
  per_sheet: number;
  usage: number;
  sheets?: number;
};

export type Construction = {
  notes: string[];
  warnings: string[];
  overlay_svg: string;
};
