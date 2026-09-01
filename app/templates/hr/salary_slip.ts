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

export const SalarySlipTemplate = `
<div class="print-format">
    <div class="header text-center">
        <h1>PAYSLIP</h1>
        <p>{{ doc.company }} | {{ doc.month }} {{ doc.year }}</p>
    </div>
    <table class="table-borderless w-100" style="margin-bottom: 20px;">
        <tr>
            <td><strong>Employee:</strong> {{ doc.employee_name }}</td>
            <td class="text-right"><strong>Designation:</strong> {{ doc.designation }}</td>
        </tr>
        <tr>
            <td><strong>Department:</strong> {{ doc.department }}</td>
            <td class="text-right"><strong>Bank:</strong> {{ doc.bank_name }}</td>
        </tr>
    </table>

    <div class="row">
        <div class="col-6">
            <h3>Earnings</h3>
            <table class="table">
                {% for row in doc.earnings %}
                <tr>
                    <td>{{ row.salary_component }}</td>
                    <td class="text-right">{{ row.amount }}</td>
                </tr>
                {% endfor %}
            </table>
        </div>
        <div class="col-6">
            <h3>Deductions</h3>
            <table class="table">
                {% for row in doc.deductions %}
                <tr>
                    <td>{{ row.salary_component }}</td>
                    <td class="text-right">{{ row.amount }}</td>
                </tr>
                {% endfor %}
            </table>
        </div>
    </div>

    <div class="footer text-right" style="margin-top: 20px;">
        <h3>Net Pay: {{ doc.net_pay }}</h3>
    </div>
</div>
`;
