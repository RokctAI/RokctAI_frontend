export const TokyoTemplate = `
<div class="invoice-box theme-tokyo" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #333; font-weight: bold;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr class="top">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td class="title" style="padding-bottom: 20px;">
                            <img src="{{ doc.company_logo }}" style="width:100%; max-width:150px;">
                        </td>
                        <td style="text-align: right; padding-bottom: 20px;">
                            INVOICE #: {{ doc.name }}<br>
                            DATE: {{ doc.posting_date }}
                            {% if invoice_qr_display %}
                            <br><br>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
                            {% endif %}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #333; color: white; padding: 10px;">Item</td>
            <td style="background: #333; color: white; padding: 10px; text-align: right;">Price</td>
            <td style="background: #333; color: white; padding: 10px; text-align: right;">Quantity</td>
            <td style="background: #333; color: white; padding: 10px; text-align: right;">Total</td>
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
            <td style="text-align: right; padding-top: 20px;">{{ doc.grand_total }}</td>
        </tr>
    </table>
</div>
`;
