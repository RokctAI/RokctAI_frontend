export const LondonQuotation = `
<div class="quotation-box theme-london" style="max-width: 800px; margin: auto; padding: 40px; border: none; font-size: 14px; line-height: 22px; font-family: 'Times New Roman', Times, serif; color: #000;">
    <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
        <table style="width: 100%;">
            <tr>
                <td>
                    <img src="{{ doc.company_logo }}" style="max-height: 60px; margin-bottom: 10px;">
                    <h1 style="margin: 0; font-weight: normal; text-transform: uppercase; letter-spacing: 2px;">Quotation</h1>
                </td>
                <td style="text-align: right; vertical-align: bottom;">{{ doc.name }}</td>
            </tr>
        </table>
    </div>

    <table style="width: 100%; margin-bottom: 30px;">
        <tr>
            <td style="vertical-align: top; width: 50%;">
                <p><strong>From:</strong><br>
                {{ doc.company }}<br>
                {{ doc.company_address }}</p>
            </td>
            <td style="vertical-align: top; width: 50%; text-align: right;">
                 <p><strong>To:</strong><br>
                {{ doc.customer_name }}<br>
                {{ doc.address_display }}</p>
            </td>
        </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 1px solid #000;">
                <th style="padding: 10px 0; text-align: left;">Description</th>
                <th style="padding: 10px 0; text-align: right;">Quantity</th>
                <th style="padding: 10px 0; text-align: right;">Rate</th>
                <th style="padding: 10px 0; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for item in doc.items %}
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 10px 0;">{{ item.item_name }}</td>
                <td style="padding: 10px 0; text-align: right;">{{ item.qty }}</td>
                <td style="padding: 10px 0; text-align: right;">{{ item.rate }}</td>
                <td style="padding: 10px 0; text-align: right;">{{ item.amount }}</td>
            </tr>
            {% endfor %}
        </tbody>
        <tfoot>
             <tr>
                <td colspan="3" style="text-align: right; font-weight: bold; padding-top: 5px;">Grand Total:</td>
                <td style="text-align: right; font-weight: bold; padding-top: 5px;">{{ doc.grand_total }}</td>
            </tr>
        </tfoot>
    </table>
    {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
