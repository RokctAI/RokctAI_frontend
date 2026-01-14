export const RioQuotation = `
<div class="quotation-box theme-rio" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555;">
    <div style="background: #ff5722; color: #fff; padding: 20px; margin: -30px -30px 30px -30px;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left; color: #fff;">
            <tr>
                <td class="title">
                    <img src="{{ doc.print_logo or doc.company_logo }}" style="max-height: 60px; margin-bottom: 10px;">
                    <h1 style="margin:0;">{{ doc.company }}</h1>
                </td>
                <td style="text-align: right;">
                    <span style="font-size: 2em; font-weight: bold;">QUOTATION</span><br>
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
                            Date: {{ doc.transaction_date }}<br>
                            Valid Until: {{ doc.valid_till }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; color: #ff5722;">Item</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Rate</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Qty</td>
            <td style="background: #eee; border-bottom: 2px solid #ff5722; font-weight: bold; padding: 10px; text-align: right; color: #ff5722;">Amount</td>
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
    {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
