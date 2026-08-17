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

export const HongKongPOS = `
<div class="pos-receipt theme-hong-kong" style="max-width: 300px; margin: auto; padding: 15px; border: 1px solid #d9534f; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #000;">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 3px double #d9534f; padding-bottom: 10px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0; color: #d9534f;">{{ doc.company }}</h3>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px dashed #d9534f; padding-bottom: 5px;">
        <p style="margin: 0;">Rcpt #: {{ doc.name }}</p>
        <p style="margin: 0;">Date: {{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 1px solid #d9534f; color: #d9534f;">
                <th style="text-align: left; padding: 5px 0;">Item</th>
                <th style="text-align: right; padding: 5px 0;">Qty</th>
                <th style="text-align: right; padding: 5px 0;">Amt</th>
            </tr>
        </thead>
        <tbody>
            {% for item in doc.items %}
            <tr>
                <td style="padding: 5px 0;">{{ item.item_name }}</td>
                <td style="text-align: right; padding: 5px 0;">{{ item.qty }}</td>
                <td style="text-align: right; padding: 5px 0;">{{ item.amount }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div style="border-top: 1px solid #d9534f; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #d9534f;">Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #d9534f;">{{ doc.grand_total }}</td>
            </tr>
        </table>
         {% if pos_qr_display %}
        <div style="text-align: center; margin-top: 10px;">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data={{ doc.name }}" />
        </div>
        {% endif %}
    </div>
</div>
`;
