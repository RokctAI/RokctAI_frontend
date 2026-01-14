export const SydneyTemplate = `
<div class="invoice-box theme-sydney" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr class="top">
            <td colspan="4">
                <table style="width: 100%;">
                    <tr>
                        <td class="title" style="padding-bottom: 5px; border-bottom: 2px dashed #ccc;">
                            <img src="{{ doc.company_logo }}" style="width:100%; max-width:150px;">
                        </td>
                        <td style="text-align: right; padding-bottom: 5px; border-bottom: 2px dashed #ccc;">
                            Invoice #: {{ doc.name }}<br>
                            Created: {{ doc.posting_date }}
                            {% if invoice_qr_display %}
                            <div style="margin-top: 5px;">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data={{ doc.name }}" />
                            </div>
                            {% endif %}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="padding: 10px; border-bottom: 1px solid #ccc;">Item</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ccc;">Rate</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ccc;">Qty</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ccc;">Amount</td>
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
            <td colspan="3" style="text-align: right; padding-top: 20px;">Grand Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold;">{{ doc.grand_total }}</td>
        </tr>
    </table>
</div>
`;
