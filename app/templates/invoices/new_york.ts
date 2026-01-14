export const NewYorkTemplate = `
<div class="invoice-box" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr class="top">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td class="title" style="padding-bottom: 20px;">
                            <img src="{{ doc.company_logo }}" style="width:100%; max-width:150px;">
                        </td>
                        <td style="text-align: right; padding-bottom: 20px;">
                            Invoice #: {{ doc.name }}<br>
                            Created: {{ doc.posting_date }}<br>
                            Due: {{ doc.due_date }}
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
                            <strong>{{ doc.company }}</strong><br>
                            {{ doc.company_address }}<br>
                        </td>
                        <td style="text-align: right; padding-bottom: 40px;">
                            <strong>{{ doc.customer_name }}</strong><br>
                            {{ doc.address_display }}<br>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr class="heading">
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px;">Item</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Price</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Qty</td>
            <td style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; text-align: right;">Total</td>
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
            <td colspan="3" style="text-align: right; padding-top: 20px; font-weight: bold;">Subtotal:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold;">{{ doc.net_total }}</td>
        </tr>
        <tr class="total">
            <td colspan="3" style="text-align: right; font-weight: bold;">Tax:</td>
            <td style="text-align: right; font-weight: bold;">{{ doc.total_taxes_and_charges }}</td>
        </tr>
        <tr class="total">
            <td colspan="3" style="text-align: right; font-weight: bold; border-top: 2px solid #eee;">Grand Total:</td>
            <td style="text-align: right; font-weight: bold; border-top: 2px solid #eee;">{{ doc.grand_total }}</td>
        </tr>
    </table>
    {% if invoice_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ doc.name }}" style="border: 1px solid #eee; padding: 5px;" />
    </div>
    {% endif %}
    
    <div style="margin-top: 40px; font-size: 14px; text-align: center; color: #777;">
        <p>Payment is due within 30 days. Thank you for your business.</p>
    </div>
</div>
`;
