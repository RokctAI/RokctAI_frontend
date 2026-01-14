export const OfferLetterTemplate = `
<div class="print-format">
    <div class="header">
        <h1>OFFER LETTER</h1>
        <p>{{ doc.company }}</p>
    </div>
    <div class="content">
        <p>Dear {{ doc.applicant_name }},</p>
        <p>We are excited to offer you a role at {{ doc.company }}...</p>
    </div>
</div>
`;
