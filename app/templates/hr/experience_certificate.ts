/*
 * Copyright (c) 2026 RokctAI
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
