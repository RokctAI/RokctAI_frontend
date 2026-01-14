export const AddisAbabaQuotation = `
<div class="quotation-box theme-addis-ababa" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #856404; background-color: #fff3cd; font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #856404;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ doc.company_logo }}" style="max-height: 80px; margin-bottom: 15px;">
        <h1 style="margin: 0;">{{ doc.company }}</h1>
        <p>QUOTATION # {{ doc.name }}</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
        <tr>
            <td colspan="4" style="padding-bottom: 20px;">
                <strong>To:</strong> {{ doc.customer_name }}
            </td>
        </tr>
        
        <tr class="heading">
            <td style="background: #856404; color: #fff3cd; padding: 10px;">Item</td>
            <td style="background: #856404; color: #fff3cd; padding: 10px; text-align: right;">Rate</td>
            <td style="background: #856404; color: #fff3cd; padding: 10px; text-align: right;">Qty</td>
            <td style="background: #856404; color: #fff3cd; padding: 10px; text-align: right;">Amount</td>
        </tr>
        
        {% for item in doc.items %}
        <tr class="item">
           <td style="border-bottom: 1px solid #ffeeba; padding: 10px;">{{ item.item_name }}</td>
            <td style="border-bottom: 1px solid #ffeeba; padding: 10px; text-align: right;">{{ item.rate }}</td>
            <td style="border-bottom: 1px solid #ffeeba; padding: 10px; text-align: right;">{{ item.qty }}</td>
            <td style="border-bottom: 1px solid #ffeeba; padding: 10px; text-align: right;">{{ item.amount }}</td>
        </tr>
        {% endfor %}

        <tr class="total">
            <td colspan="3" style="text-align: right; padding-top: 20px;">Grand Total:</td>
            <td style="text-align: right; padding-top: 20px; font-weight: bold;">{{ doc.grand_total }}</td>
        </tr>
    </table>
     {% if proposal_qr_display %}
    <div style="text-align: center; margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ doc.name }}" />
    </div>
    {% endif %}
</div>
`;
