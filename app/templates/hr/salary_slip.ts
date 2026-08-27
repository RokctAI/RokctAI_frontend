/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
