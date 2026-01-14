export const NOCTemplate = `
<div class="print-format">
    <div class="header text-center">
        <img src="{{ doc.company_logo }}" style="max-height: 80px;" />
        <h1>{{ doc.company }}</h1>
    </div>
    
    <div class="content" style="margin-top: 50px; line-height: 1.8;">
        <h3 style="text-align: center; margin-bottom: 30px;">No Objection Certificate</h3>

        <p><strong>Date:</strong> {{ doc.custom_date }}</p>
        
        <p>To,</p>
        <p><strong>{{ doc.employee_name }}</strong></p>

        <p>This is to certify that valid from <strong>{{ doc.custom_date }}</strong>, <strong>{{ doc.company }}</strong> has no objection to Mr./Ms. <strong>{{ doc.employee_name }}</strong> ({{ doc.designation }}) regarding {{ doc.purpose }}.</p>

        <p>This certificate is issued upon the request of the employee.</p>

        <div class="signature" style="margin-top: 60px;">
            <p>Sincerely,</p>
            <br>
            <p><strong>Manager, HR</strong></p>
            <p>{{ doc.company }}</p>
        </div>
    </div>
</div>
`;
