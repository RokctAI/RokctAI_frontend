export const TorontoTemplate = `
<div class="invoice-box theme-toronto" style="max-width: 800px; margin: auto; padding: 30px; border: none; border-top: 10px solid #007bff; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr class="top">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td class="title" style="padding-bottom: 20px;">
                            <h2 style="color: #007bff; margin: 0;">INVOICE</h2>
                            <span style="color: #777;"># {{ doc.name }}</span>
                        </td>
                        <td style="text-align: right; padding-bottom: 20px;">
                             <img src="{{ doc.company_logo }}" style="width:100%; max-width:100px;">
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
                    <tr>
                        <td>
                            <strong>Date:</strong> {{ doc.posting_date }}
                        </td>
                        <td style="text-align: right;">
                            <strong>Due:</strong> {{ doc.due_date }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #007bff; color: white; padding: 10px;">Item</td>
            <td style="background: #007bff; color: white; padding: 10px; text-align: right;">Price</td>
            <td style="background: #007bff; color: white; padding: 10px; text-align: right;">Qty</td>
            <td style="background: #007bff; color: white; padding: 10px; text-align: right;">Total</td>
        </tr>
        
        {% for item in doc.items %}
        <tr class="item">
            <td style="border-bottom: 1px solid #eee; padding: 10px;">
                {{ item.item_name }}
            </td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.rate }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.qty }}</td>
            <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">{{ item.amount }}</td>
        </tr>
        {% endfor %}

        <tr class="total">
            <td colspan="3" style="text-align: right; padding-top: 20px; font-weight: bold;">Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold; color: #007bff; font-size: 1.2em;">{{ doc.grand_total }}</td>
        </tr>
    </table>
    {% if invoice_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
