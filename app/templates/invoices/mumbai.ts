export const MumbaiTemplate = `
<div class="invoice-box theme-mumbai" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #d4edda; background-color: #f8fff9; font-size: 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #155724;">
    <table style="width: 100%; margin-bottom: 30px;">
        <tr>
            <td>
                <img src="{{ doc.company_logo }}" style="max-height: 60px;">
            </td>
            <td style="text-align: right;">
                <h2 style="color: #28a745; margin: 0;">TAX INVOICE</h2>
                <small>{{ doc.name }}</small>
            </td>
        </tr>
    </table>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #fff; padding: 15px; border: 1px solid #c3e6cb; border-radius: 5px;">
        <div>
            <strong>BILLED TO:</strong><br>
            {{ doc.customer_name }}<br>
            {{ doc.address_display }}
            {% if invoice_qr_display %}
            <div class="qr-code" style="margin-top: 20px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ doc.name }}" />
            </div>
            {% endif %}
        </div>
        <div style="text-align: right;">
            <strong>SHIPPED FROM:</strong><br>
            {{ doc.company }}<br>
            {{ doc.company_address }}
        </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; background: #fff;">
        <thead>
            <tr style="background-color: #28a745; color: white;">
                <th style="padding: 12px; text-align: left;">Description</th>
                <th style="padding: 12px; text-align: right;">Qty</th>
                <th style="padding: 12px; text-align: right;">Unit Price</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for item in doc.items %}
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">{{ item.item_name }}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">{{ item.qty }}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">{{ item.rate }}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">{{ item.amount }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div style="margin-top: 20px; text-align: right;">
        <table style="display: inline-table; width: 40%;">
            <tr>
                <td style="padding: 5px;">Subtotal:</td>
                <td style="text-align: right; padding: 5px;">{{ doc.net_total }}</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: bold; color: #28a745;">Total:</td>
                <td style="text-align: right; padding: 5px; font-weight: bold; color: #28a745;">{{ doc.grand_total }}</td>
            </tr>
        </table>
    </div>
</div>
`;
