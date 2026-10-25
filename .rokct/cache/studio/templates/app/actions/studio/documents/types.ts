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


export type NewDocumentRequest = {
  business_name: string;
  document_scope: string;
  title?: string;
  questions_file?: string;
  artifacts?: string;
  design_system?: string;
};

export type DocumentStatus = {
  status: string;
  error_message: string | null;
  warnings: string | null;
  completeness: number | null;
  outputs: { file_path: string; kind: string }[];
};
