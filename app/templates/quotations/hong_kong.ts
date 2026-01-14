export const HongKongQuotation = `
<div class="quotation-box theme-hong-kong" style="max-width: 100%; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <div style="border-bottom: 4px solid #d9534f; padding-bottom: 10px; margin-bottom: 20px; text-align: center;">
        <img src="{{ doc.company_logo }}" style="max-height: 80px; margin-bottom: 10px;">
        <h1 style="color: #d9534f; margin: 0;">QUOTATION</h1>
    </div>
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr>
            <td colspan="4" style="padding-bottom: 20px;">
                <table style="width: 100%;">
                    <tr>
                        <td>
                            <strong>{{ doc.company }}</strong><br>
                            {{ doc.company_address }}
                        </td>
                        <td style="text-align: right;">
                             <strong>To:</strong> {{ doc.customer_name }}<br>
                             Rate: {{ doc.transaction_date }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #d9534f; color: white; padding: 10px;">Item</td>
            <td style="background: #d9534f; color: white; padding: 10px; text-align: right;">Rate</td>
            <td style="background: #d9534f; color: white; padding: 10px; text-align: right;">Qty</td>
            <td style="background: #d9534f; color: white; padding: 10px; text-align: right;">Amount</td>
        </tr>
        
        {% for item in doc.items %}
        <tr class="item">
            <td style="border-bottom: 1px solid #eee; padding: 10px;">{{ item.item_name }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.rate }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.qty }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.amount }}</td>
        </tr>
        {% endfor %}

        <tr class="total">
            <td colspan="3" style="text-align: right; padding-top: 20px;">Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold; color: #d9534f;">{{ doc.grand_total }}</td>
        </tr>
    </table>
    {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
