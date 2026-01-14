export const AppointmentLetterTemplate = `
<div class="print-format">
    <div class="header text-center">
        <img src="{{ doc.company_logo }}" style="max-height: 80px;" />
        <h1>{{ doc.company }}</h1>
        <p>{{ doc.company_address }}</p>
    </div>
    
    <hr>

    <div class="content" style="margin-top: 40px; line-height: 1.6;">
        <p><strong>Date:</strong> {{ doc.custom_date }}</p>
        <p><strong>To,</strong><br>
        {{ doc.applicant_name }}<br>
        {{ doc.applicant_address }}</p>

        <h3 style="text-align: center; margin: 30px 0;">Subject: Appointment Letter for the post of {{ doc.designation }}</h3>

        <p>Dear {{ doc.applicant_name }},</p>

        <p>We are pleased to offer you the position of <strong>{{ doc.designation }}</strong> at <strong>{{ doc.company }}</strong>. We believe your skills and experience will be an ideal fit for our team.</p>

        <p><strong>Key Details:</strong></p>
        <ul>
            <li><strong>Joining Date:</strong> {{ doc.joining_date }}</li>
            <li><strong>Location:</strong> {{ doc.location }}</li>
            <li><strong>Annual CTC:</strong> {{ doc.total_salary }}</li>
        </ul>

        <p>You will be on a probation period of 3 months. Ideally, your employment will be governed by the standard terms and conditions of the company.</p>

        <p>We look forward to welcoming you aboard.</p>

        <div class="signature" style="margin-top: 60px;">
            <p>Sincerely,</p>
            <br>
            <p><strong>Authorized Signatory</strong><br>
            {{ doc.company }}</p>
        </div>
    </div>
</div>
`;
