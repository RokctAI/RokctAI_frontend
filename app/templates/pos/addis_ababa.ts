export const AddisAbabaPOS = `
<div class="pos-receipt theme-addis-ababa" style="max-width: 300px; margin: auto; padding: 15px; border: 1px solid #ffeeba; background: #fff3cd; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #856404;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px;">
        <h3 style="margin: 0;">{{ doc.company }}</h3>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px dotted #856404; padding-bottom: 5px;">
        <p style="margin: 0;">R: {{ doc.name }}</p>
        <p style="margin: 0;">D: {{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
             <tr style="border-bottom: 1px dotted #856404;">
                <th style="text-align: left;">Itm</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Amt</th>
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

    <div style="border-top: 1px dotted #856404; padding-top: 5px;">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">TOTAL:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">{{ doc.grand_total }}</td>
            </tr>
        </table>
         {% if pos_qr_display %}
        <div style="text-align: center; margin-top: 10px;">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data={{ doc.name }}" />
        </div>
        {% endif %}
    </div>
</div>
`;
