export const RioPOS = `
<div class="pos-receipt theme-rio" style="max-width: 300px; margin: auto; padding: 15px; border: 1px solid #eee; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #000;">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ff5722; padding-bottom: 10px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0; color: #ff5722;">{{ doc.company }}</h3>
        <p style="margin: 5px 0;">{{ doc.company_address }}</p>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px dashed #ff5722; padding-bottom: 5px;">
        <p style="margin: 0;">Rcpt #: {{ doc.name }}</p>
        <p style="margin: 0;">Date: {{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 1px dashed #ff5722; color: #ff5722;">
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

    <div style="border-top: 1px dashed #ff5722; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #ff5722;">Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #ff5722;">{{ doc.grand_total }}</td>
            </tr>
        </table>
    </div>
    
     <div style="text-align: center; margin-top: 20px;">
        <p>Obrigado!</p>
         {% if pos_qr_display %}
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" style="margin-top: 5px;" />
        {% endif %}
    </div>
</div>
`;
