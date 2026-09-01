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

export const OfferLetterTemplate = `
<div class="print-format">
    <div class="header">
        <h1>OFFER LETTER</h1>
        <p>{{ doc.company }}</p>
    </div>
    <div class="content">
        <p>Dear {{ doc.applicant_name }},</p>
        <p>We are excited to offer you a role at {{ doc.company }}...</p>
    </div>
</div>
`;
