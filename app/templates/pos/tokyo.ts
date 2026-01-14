export const TokyoPOS = `
<div class="pos-receipt theme-tokyo" style="max-width: 300px; margin: auto; padding: 15px; border: 2px solid #000; font-size: 12px; font-weight: bold; font-family: 'Courier New', Courier, monospace; color: #000;">
    <div style="text-align: center; margin-bottom: 20px; background: #000; color: #fff; padding: 5px;">
        <img src="{{ doc.print_logo or doc.company_logo }}" style="max-height: 50px; margin-bottom: 5px; filter: invert(1);">
        <h3 style="margin: 0;">{{ doc.company }}</h3>
    </div>
    
    <div style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        <p style="margin: 0;"># {{ doc.name }}</p>
        <p style="margin: 0;">{{ doc.posting_date }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
            <tr style="border-bottom: 1px solid #000;">
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

     <div style="border-top: 2px solid #000; padding-top: 5px; text-align: right;">
        <h2 style="margin: 0;">{{ doc.grand_total }}</h2>
    </div>
    {% if pos_qr_display %}
    <div style="text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
