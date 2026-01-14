export const NewYorkQuotation = `
<div class="quotation-box" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr class="top">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td class="title" style="padding-bottom: 20px;">
                            <img src="{{ doc.company_logo }}" style="width:100%; max-width:150px;">
                        </td>
                        <td style="text-align: right; padding-bottom: 20px;">
                            <strong>QUOTATION</strong><br>
                            # {{ doc.name }}<br>
                            Date: {{ doc.transaction_date }}<br>
                            Valid Until: {{ doc.valid_till }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="information">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td style="padding-bottom: 40px;">
                            <strong>From:</strong><br>
                            {{ doc.company }}<br>
                            {{ doc.company_address }}
                        </td>
                        <td style="text-align: right; padding-bottom: 40px;">
                            <strong>To:</strong><br>
                            {{ doc.customer_name }}<br>
                            {{ doc.address_display }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="heading">
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px;">Item</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Rate</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Qty</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Amount</td>
        </tr>
        
        {% for item in doc.items %}
        <tr class="item">
            <td style="border-bottom: 1px solid #eee; padding: 10px;">
                {{ item.item_name }} <br>
                <span style="font-size: 12px; color: #777;">{{ item.description }}</span>
            </td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.rate }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.qty }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.amount }}</td>
        </tr>
        {% endfor %}

        <tr class="total">
            <td colspan="3" style="text-align: right; padding-top: 20px; font-weight: bold;">Grand Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold;">{{ doc.grand_total }}</td>
        </tr>
    </table>
    
    <div style="margin-top: 40px; font-size: 14px; text-align: center; color: #777;">
        <p>This quotation is valid for 30 days. Subject to terms and conditions.</p>
        {% if proposal_qr_display %}
        <div class="qr-code" style="margin-top: 20px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ doc.name }}" style="border: 1px solid #eee; padding: 5px;" />
        </div>
        {% endif %}
    </div>
</div>
`;
