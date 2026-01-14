// NCR Statutory Limits (National Credit Act)
export const NCR_MAX_SERVICE_FEE_PM = 60.00; // Plus VAT
export const NCR_MAX_INITIATION_PERCENT = 15.00; // For small agreements
export const NCR_MAX_INTEREST_RATE_SHORT_TERM = 5.00; // Per Month (60% APR)
export const NCR_MAX_INTEREST_RATE_UNSECURED = 2.40; // Per Month (approx 29% APR)
export const NCR_MAX_INSURANCE_RATE_PER_1000 = 4.50; // Per Month per R1000
export const NCR_VAT_RATE = 15.00;

export interface QuoteParams {
    principal: number;
    days: number;
    interestRateMonthly: number; // e.g., 5 for 5%
    monthlyServiceFee: number;
    initiationFeePercent: number; // e.g., 15 for 15%
    vatRate: number; // e.g., 15 for 15%
    includeInsurance?: boolean; // NEW: Toggle Creditor Life Insurance
}

export interface QuoteResult {
    capital: number;
    interest: number;
    serviceFee: number;
    initiationFee: number;
    vat: number;
    insurance: number;
    totalCost: number;
    totalRepayment: number;
    breakdown: {
        interestCalculation: string;
        serviceFeeCalculation: string;
        vatCalculation: string;
    }
    validation: {
        isCompliant: boolean;
        warnings: string[];
    }
}

export function calculateNCRQuote(params: QuoteParams): QuoteResult {
    const { principal, days, interestRateMonthly, monthlyServiceFee, initiationFeePercent, vatRate, includeInsurance } = params;

    // 1. Initiation Fee (Max 15% of principal + VAT later)
    // Simplified Rule: 15% flat for now (as per user calc) on small amounts
    let initiationFee = principal * (initiationFeePercent / 100);
    // Hard cap check (e.g. R1000 + 10%) can be added here if passed as param, but user data suggests straight 15% on 500 (R75)
    const warnings: string[] = [];

    // --- Compliance Checks ---
    // 1. Service Fee Cap (Reg 44)
    if (monthlyServiceFee > NCR_MAX_SERVICE_FEE_PM) {
        warnings.push(`Service Fee R${monthlyServiceFee} exceeds NCR monthly max of R${NCR_MAX_SERVICE_FEE_PM.toFixed(2)}`);
    }

    // 2. Interest Rate Cap (Short Term)
    if (interestRateMonthly > NCR_MAX_INTEREST_RATE_SHORT_TERM) {
        warnings.push(`Interest Rate ${interestRateMonthly}%/mo exceeds Short Term Loan max of ${NCR_MAX_INTEREST_RATE_SHORT_TERM}%/mo`);
    }

    // 3. Initiation Fee Cap (Reg 42)
    // Formula: R165 + 10% of amount > R1000
    const maxInitiation = Math.min(1050, 165 + (Math.max(0, principal - 1000) * 0.10));
    const proposedInitiation = principal * (initiationFeePercent / 100);

    if (proposedInitiation > maxInitiation) {
        warnings.push(`Initiation Fee R${proposedInitiation.toFixed(2)} exceeds statutory max of R${maxInitiation.toFixed(2)}`);
    }

    // --- Calculations ---
    const dailyServiceFee = monthlyServiceFee / 31;
    const serviceFee = dailyServiceFee * days;

    const dailyInterest = (principal * (interestRateMonthly / 100)) / 30;
    const interest = dailyInterest * days;

    // Credit Life Insurance (Reg 106)
    // Rule: R4.50 per R1000 of Deffered Amount (Principal)
    let insurance = 0;
    if (includeInsurance) {
        const monthlyInsurance = (principal / 1000) * NCR_MAX_INSURANCE_RATE_PER_1000;
        // Insurance is typically charged per full month or part thereof
        const months = Math.ceil(days / 30);
        insurance = monthlyInsurance * months;
    }

    const initiationFeeFinal = proposedInitiation;

    // VAT is liable on Fees (Service + Initiation). Interest is Exempt. Insurance is Exempt (usually). 
    // Wait, is Credit Life VATable? Yes, Underwriting Managers charge VAT. 
    // BUT Section 106 says "actual cost".
    // For simplicity in this Loan Engine (Output VAT), we usually only charge VAT on OUR fees. 
    // Insurance is often a pass-through.
    // However, if the defined Fees include VAT, we apply it. 
    // I will exclude Insurance from OUR VAT calculation for now (assuming 3rd party or exempt).
    // If it *is* Vatable, it should be in the insurance premium. R4.50 is the CAP inclusive of all costs.
    const vat = (initiationFeeFinal + serviceFee) * (vatRate / 100);

    const totalCost = principal + interest + serviceFee + initiationFeeFinal + vat + insurance;

    const costOfCredit = totalCost - principal;
    if (costOfCredit > principal) {
        warnings.push(`Section 103(5) Violation: Cost of credit R${costOfCredit.toFixed(2)} exceeds principal debt R${principal.toFixed(2)}`);
    }

    return {
        capital: principal,
        interest: Number(interest.toFixed(2)),
        serviceFee: Number(serviceFee.toFixed(2)),
        initiationFee: Number(initiationFeeFinal.toFixed(2)),
        vat: Number(vat.toFixed(2)),
        insurance: Number(insurance.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        totalRepayment: Number(totalCost.toFixed(2)),
        breakdown: {
            interestCalculation: `(${principal} * ${interestRateMonthly}%) / 30 * ${days}`,
            serviceFeeCalculation: `(${monthlyServiceFee} / 31) * ${days}`,
            vatCalculation: `(${initiationFeeFinal.toFixed(2)} + ${serviceFee.toFixed(2)}) * ${vatRate}%`
        },
        validation: {
            isCompliant: warnings.length === 0,
            warnings
        }
    };
}
