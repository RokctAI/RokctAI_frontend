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

export const SydneyQuotation = `
<div class="quotation-box theme-sydney" style="max-width: 800px; margin: auto; padding: 30px; border: 1px dashed #ccc; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 80px;">
    </div>
    <h2 style="color: #00bcd4; margin-top: 0;">Quotation</h2>
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr>
            <td colspan="4" style="padding-bottom: 20px;">
                <table style="width: 100%;">
                    <tr>
                        <td>
                            {{ doc.company }}<br>
                            {{ doc.company_address }}
                        </td>
                        <td style="text-align: right;">
                             {{ doc.customer_name }}<br>
                             {{ doc.address_display }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="border-bottom: 2px solid #00bcd4; padding: 10px; color: #00bcd4;">Item</td>
            <td style="border-bottom: 2px solid #00bcd4; padding: 10px; text-align: right; color: #00bcd4;">Rate</td>
            <td style="border-bottom: 2px solid #00bcd4; padding: 10px; text-align: right; color: #00bcd4;">Qty</td>
            <td style="border-bottom: 2px solid #00bcd4; padding: 10px; text-align: right; color: #00bcd4;">Amount</td>
        </tr>
        
        {% for item in doc.items %}
        <tr class="item">
            <td style="border-bottom: 1px dotted #ccc; padding: 10px;">{{ item.item_name }}</td>
            <td style="border-bottom: 1px dotted #ccc; padding: 10px; text-align: right;">{{ item.rate }}</td>
            <td style="border-bottom: 1px dotted #ccc; padding: 10px; text-align: right;">{{ item.qty }}</td>
            <td style="border-bottom: 1px dotted #ccc; padding: 10px; text-align: right;">{{ item.amount }}</td>
        </tr>
        {% endfor %}

        <tr class="total">
            <td colspan="3" style="text-align: right; padding-top: 20px;">Grand Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold; color: #00bcd4;">{{ doc.grand_total }}</td>
        </tr>
    </table>
     {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
