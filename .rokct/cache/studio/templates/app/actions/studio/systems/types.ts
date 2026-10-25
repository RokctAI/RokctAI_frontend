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


export type Format = {
  name: string;
  width: number;
  height: number;
  category: string;
  description: string;
};

export type PaletteColour = { hex: string; coverage: number };

/**
 * The canonical design-system document every product reads
 * (docs/DESIGN_SYSTEM_CONTRACT.md). Readers ignore keys they don't know;
 * product-only settings live under extensions.<product>.
 */
export type DesignSystemDocument = {
  schema_version?: number;
  name?: string;
  brand?: { name?: string };
  color?: {
    tokens?: Record<string, { hex: string; role?: string } | null>;
    max_colors?: number;
    snap_warning_distance?: number;
  };
  typography?: { fonts?: string[]; scale?: number[] };
  layout?: { grid?: number; min_element_size?: number };
  stroke?: { widths?: number[] };
  gradient?: { allowed?: boolean; max_stops?: number };
  accessibility?: { min_contrast_text?: number; min_contrast_large_text?: number; large_text_size?: number };
  print?: { bleed?: number; min_stroke?: number; max_ink_coverage?: number };
  extensions?: Record<string, Record<string, unknown> | null>;
};

export type DesignSystem = {
  name: string;
  system_name: string;
  brand_name?: string;
  customer?: string;
  is_default?: boolean;
  seed_colors?: string[];
  tokens: { name: string; hex: string; role: string; derived?: boolean }[];
  fonts: { name: string; descriptor: string }[];
  type_scale?: string;
  grid?: number;
  stroke_widths?: string;
  max_colors?: number;
  gradient?: { allowed: boolean; max_stops: number };
  contrast?: { min_text: number; min_large_text: number; large_text_size: number };
  schema_version?: number;
  fingerprint?: string;
  modified?: string;
  system?: DesignSystemDocument;
};
