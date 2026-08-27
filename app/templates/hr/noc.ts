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

export const NOCTemplate = `
<div class="print-format">
    <div class="header text-center">
        <img src="{{ doc.company_logo }}" style="max-height: 80px;" />
        <h1>{{ doc.company }}</h1>
    </div>
    
    <div class="content" style="margin-top: 50px; line-height: 1.8;">
        <h3 style="text-align: center; margin-bottom: 30px;">No Objection Certificate</h3>

        <p><strong>Date:</strong> {{ doc.custom_date }}</p>
        
        <p>To,</p>
        <p><strong>{{ doc.employee_name }}</strong></p>

        <p>This is to certify that valid from <strong>{{ doc.custom_date }}</strong>, <strong>{{ doc.company }}</strong> has no objection to Mr./Ms. <strong>{{ doc.employee_name }}</strong> ({{ doc.designation }}) regarding {{ doc.purpose }}.</p>

        <p>This certificate is issued upon the request of the employee.</p>

        <div class="signature" style="margin-top: 60px;">
            <p>Sincerely,</p>
            <br>
            <p><strong>Manager, HR</strong></p>
            <p>{{ doc.company }}</p>
        </div>
    </div>
</div>
`;
