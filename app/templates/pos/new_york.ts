export const NewYorkPOS = `
<div class="pos-receipt" style="max-width: 300px; margin: auto; padding: 15px; border: 1px solid #eee; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #000;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0;">{{ doc.company }}</h3>
        <p style="margin: 5px 0;">{{ doc.company_address }}</p>
        <p style="margin: 5px 0;">VAT Reg: {{ doc.tax_id }}</p>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
        <p style="margin: 0;">Rcpt #: {{ doc.name }}</p>
        <p style="margin: 0;">Date: {{ doc.posting_date }} {{ doc.posting_time }}</p>
        <p style="margin: 0;">Cashier: {{ doc.owner }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 1px dashed #000;">
                <th style="text-align: left; padding: 5px 0;">Item</th>
                <th style="text-align: right; padding: 5px 0;">Qty</th>
                <th style="text-align: right; padding: 5px 0;">Amt</th>
            </tr>
        </thead>
        <tbody>
            {% for item in doc.items %}
            <tr>
                <td style="padding: 5px 0;">{{ item.item_name }}</td>
                <td style="text-align: right; padding: 5px 0;">{{ item.qty }}</td>
                <td style="text-align: right; padding: 5px 0;">{{ item.amount }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div style="border-top: 1px dashed #000; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right;">Subtotal:</td>
                <td style="text-align: right;">{{ doc.net_total }}</td>
            </tr>
            <tr>
                <td style="text-align: right;">Tax:</td>
                <td style="text-align: right;">{{ doc.total_taxes_and_charges }}</td>
            </tr>
            <tr>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">{{ doc.grand_total }}</td>
            </tr>
        </table>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
        <p>Thank you for shopping with us!</p>
        <div style="margin-top: 10px;">
            <img src="https://barcode.tec-it.com/barcode.ashx?data={{ doc.name }}&code=Code128&dpi=96" style="width: 100%; max-height: 50px;">
        </div>
        {% if pos_qr_display %}
        <div class="qr-code" style="margin-top: 10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
        </div>
        {% endif %}
    </div>
</div>
`;
