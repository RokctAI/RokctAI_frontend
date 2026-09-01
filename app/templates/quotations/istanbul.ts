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

export const IstanbulQuotation = `
<div class="quotation-box theme-istanbul" style="max-width: 800px; margin: auto; padding: 30px; border: 4px solid #333; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #333;">
    <div style="text-align: center; border-bottom: 2px dashed #333; padding-bottom: 20px; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 80px; margin-bottom: 10px;">
        <h2 style="margin: 0; text-transform: uppercase;">{{ doc.company }}</h2>
        <p>{{ doc.company_address }}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
        <table style="width: 100%;">
            <tr>
                <td>
                    <strong>QUOTATION NO:</strong> {{ doc.name }}
                </td>
                <td style="text-align: right;">
                    <strong>DATE:</strong> {{ doc.transaction_date }}
                </td>
            </tr>
            <tr>
                <td>
                    <strong>CUSTOMER:</strong> {{ doc.customer_name }}
                </td>
                 <td style="text-align: right;">
                     <strong>VALID:</strong> {{ doc.valid_till }}
                </td>
            </tr>
        </table>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background: #333; color: #fff;">
            <th style="padding: 10px; text-align: left;">ITEM</th>
            <th style="padding: 10px; text-align: right;">QTY</th>
            <th style="padding: 10px; text-align: right;">RATE</th>
            <th style="padding: 10px; text-align: right;">AMT</th>
        </tr>
        {% for item in doc.items %}
        <tr>
            <td style="padding: 10px; border-bottom: 1px dotted #333;">{{ item.item_name }}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px dotted #333;">{{ item.qty }}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px dotted #333;">{{ item.rate }}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px dotted #333;">{{ item.amount }}</td>
        </tr>
        {% endfor %}
    </table>

    <div style="text-align: right; border-top: 2px dashed #333; padding-top: 10px;">
        <h3 style="margin: 10px 0; border-top: 1px solid #333; display: inline-block; padding-top: 5px;">TOTAL: {{ doc.grand_total }}</h3>
    </div>
    {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
