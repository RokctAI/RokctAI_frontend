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

export const ExperienceCertificateTemplate = `
<div class="print-format">
    <div class="header text-center">
        <img src="{{ doc.company_logo }}" style="max-height: 80px;" />
        <h1>{{ doc.company }}</h1>
        <p>{{ doc.company_address }}</p>
    </div>
    
    <hr>

    <div class="content" style="margin-top: 50px; line-height: 1.8;">
        <h2 style="text-align: center; text-decoration: underline; margin-bottom: 40px;">TO WHOM IT MAY CONCERN</h2>

        <p>This is to certify that <strong>{{ doc.employee_name }}</strong> was employed with <strong>{{ doc.company }}</strong> as <strong>{{ doc.designation }}</strong> from <strong>{{ doc.joining_date }}</strong> to <strong>{{ doc.relieving_date }}</strong>.</p>

        <p>During their tenure with us, we found them to be sincere, hardworking, and result-oriented. They have displayed professional conduct and successfully performed their duties.</p>

        <p>We wish them all the best in their future endeavors.</p>

        <div class="signature" style="margin-top: 80px;">
            <p><strong>Authorized Signatory</strong></p>
            <p>{{ doc.company }}</p>
        </div>
    </div>
</div>
`;
