export const IstanbulPOS = `
<div class="pos-receipt theme-istanbul" style="max-width: 300px; margin: auto; padding: 15px; border: 2px solid #333; font-size: 11px; font-weight: bold; font-family: 'Courier New', Courier, monospace; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0;">{{ doc.company }}</h3>
        <p style="margin: 5px 0;">{{ doc.company_address }}</p>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 2px dashed #333; padding-bottom: 5px;">
        <p style="margin: 0;">RCPT: {{ doc.name }}</p>
        <p style="margin: 0;">DATE: {{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 2px dashed #333;">
                <th style="text-align: left; padding: 5px 0;">ITEM</th>
                <th style="text-align: right; padding: 5px 0;">QTY</th>
                <th style="text-align: right; padding: 5px 0;">AMT</th>
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

    <div style="border-top: 2px dashed #333; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-size: 14px;">TOTAL:</td>
                <td style="text-align: right; font-size: 14px;">{{ doc.grand_total }}</td>
            </tr>
        </table>
    </div>
    
     <div style="text-align: center; margin-top: 20px;">
        <p>TESEKKURLER</p>
         {% if pos_qr_display %}
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" style="margin-top: 5px;" />
        {% endif %}
    </div>
</div>
`;
