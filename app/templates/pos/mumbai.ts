export const MumbaiPOS = `
<div class="pos-receipt theme-mumbai" style="max-width: 300px; margin: auto; padding: 15px; border: 1px solid #28a745; background: #f8fff9; font-size: 12px; font-family: 'Helvetica', sans-serif; color: #155724;">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px dotted #28a745; padding-bottom: 10px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0; color: #28a745;">{{ doc.company }}</h3>
        <p style="margin: 5px 0;">{{ doc.company_address }}</p>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px dotted #28a745; padding-bottom: 5px;">
        <p style="margin: 0;">Rcpt #: {{ doc.name }}</p>
        <p style="margin: 0;">Date: {{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 1px dotted #28a745; color: #28a745;">
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

    <div style="border-top: 1px dotted #28a745; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #28a745;">Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #28a745;">{{ doc.grand_total }}</td>
            </tr>
        </table>
    </div>
    
     <div style="text-align: center; margin-top: 20px;">
        <p>Thank you!</p>
         {% if pos_qr_display %}
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" style="margin-top: 5px;" />
        {% endif %}
    </div>
</div>
`;
