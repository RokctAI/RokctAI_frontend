export const RioTemplate = `
<div class="invoice-box theme-rio" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <div style="background: #ff5722; color: #fff; padding: 20px; margin: -30px -30px 30px -30px;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left; color: #fff;">
            <tr>
                <td class="title">
                    <table style="width: 100%;">
                        <tr>
                            <td style="vertical-align: middle;">
                                {% if invoice_qr_display %}
                                <div class="qr-code" style="margin-right: 20px;">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ doc.name }}" />
                                </div>
                                {% endif %}
                            </td>
                            <td style="vertical-align: middle;">
                                <img src="{{ doc.print_logo or doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
                                <h1 style="margin:0;">{{ doc.company }}</h1>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="text-align: right;">
                    <span style="font-size: 2em; font-weight: bold;">INVOICE</span><br>
                    # {{ doc.name }}
                </td>
            </tr>
        </table>
    </div>

    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr>
            <td colspan="4" style="padding-bottom: 20px;">
                <table style="width: 100%;">
                    <tr>
                        <td>
                            <strong>Bill To:</strong><br>
                            {{ doc.customer_name }}<br>
                            {{ doc.address_display }}
                        </td>
                        <td style="text-align: right;">
                            Date: {{ doc.posting_date }}<br>
                            Due: {{ doc.due_date }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; color: #ff5722;">Item</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Price</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Qty</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Total</td>
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
            <td colspan="3" style="text-align: right; padding-top: 20px; font-weight: bold;">Grand Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold; color: #ff5722; border-bottom: 3px double #ff5722;">{{ doc.grand_total }}</td>
        </tr>
    </table>
</div>
`;
