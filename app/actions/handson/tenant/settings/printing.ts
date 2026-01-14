"use client";

import { getClient } from "@/app/lib/client";

export interface PrintFormat {
    name: string;
    doc_type: string;
    format: string; // The HTML content
    css?: string;
    standard: boolean;
}

import { NewYorkTemplate } from "@/app/templates/invoices/new_york";
import { TorontoTemplate } from "@/app/templates/invoices/toronto";
import { RioTemplate } from "@/app/templates/invoices/rio";
import { LondonTemplate } from "@/app/templates/invoices/london";
import { IstanbulTemplate } from "@/app/templates/invoices/istanbul";
import { MumbaiTemplate } from "@/app/templates/invoices/mumbai";
import { HongKongTemplate } from "@/app/templates/invoices/hong_kong";
import { TokyoTemplate } from "@/app/templates/invoices/tokyo";
import { SydneyTemplate } from "@/app/templates/invoices/sydney";
import { AddisAbabaTemplate } from "@/app/templates/invoices/addis_ababa";
import { NewYorkQuotation } from "@/app/templates/quotations/new_york";
import { TorontoQuotation } from "@/app/templates/quotations/toronto";
import { RioQuotation } from "@/app/templates/quotations/rio";
import { LondonQuotation } from "@/app/templates/quotations/london";
import { IstanbulQuotation } from "@/app/templates/quotations/istanbul";
import { MumbaiQuotation } from "@/app/templates/quotations/mumbai";
import { HongKongQuotation } from "@/app/templates/quotations/hong_kong";
import { TokyoQuotation } from "@/app/templates/quotations/tokyo";
import { SydneyQuotation } from "@/app/templates/quotations/sydney";
import { AddisAbabaQuotation } from "@/app/templates/quotations/addis_ababa";

import { NewYorkPOS } from "@/app/templates/pos/new_york";
import { TorontoPOS } from "@/app/templates/pos/toronto";
import { RioPOS } from "@/app/templates/pos/rio";
import { LondonPOS } from "@/app/templates/pos/london";
import { IstanbulPOS } from "@/app/templates/pos/istanbul";
import { MumbaiPOS } from "@/app/templates/pos/mumbai";
import { HongKongPOS } from "@/app/templates/pos/hong_kong";
import { TokyoPOS } from "@/app/templates/pos/tokyo";
import { SydneyPOS } from "@/app/templates/pos/sydney";
import { AddisAbabaPOS } from "@/app/templates/pos/addis_ababa";
import { AppointmentLetterTemplate } from "@/app/templates/hr/appointment_letter";
import { OfferLetterTemplate } from "@/app/templates/hr/offer_letter";
import { SalarySlipTemplate } from "@/app/templates/hr/salary_slip";
import { ExperienceCertificateTemplate } from "@/app/templates/hr/experience_certificate";
import { NOCTemplate } from "@/app/templates/hr/noc";
import { getMasterPrintFormats } from "@/app/actions/handson/control/print_formats/print_formats";

const DEFAULT_INVOICE_TEMPLATE = `
<div class="print-format">
    <div class="header">
        <div class="row">
            <div class="col-6">
                <h1>INVOICE</h1>
                <p class="text-muted">{{ doc.name }}</p>
            </div>
            <div class="col-6 text-right">
                <img src="{{ doc.company_logo }}" style="max-height: 80px;" />
                <p><strong>{{ doc.company }}</strong><br>
                {{ doc.company_address }}</p>
            </div>
        </div>
    </div>
    
    <div class="row info-section">
        <div class="col-6">
            <p><strong>Bill To:</strong><br>
            {{ doc.customer_name }}<br>
            {{ doc.address_display }}</p>
        </div>
        <div class="col-6 text-right">
            <table class="meta-table">
                <tr><td>Date:</td><td>{{ doc.posting_date }}</td></tr>
                <tr><td>Due Date:</td><td>{{ doc.due_date }}</td></tr>
            </table>
        </div>
    </div>

    <table class="table item-table">
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for item in doc.items %}
            <tr>
                <td>
                    <strong>{{ item.item_name }}</strong><br>
                    <span class="text-xs text-muted">{{ item.description }}</span>
                </td>
                <td class="text-right">{{ item.qty }}</td>
                <td class="text-right">{{ item.rate }}</td>
                <td class="text-right">{{ item.amount }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="row totals-section">
        <div class="col-6">
            {% if invoice_qr_display %}
            <div class="qr-code" style="margin-top: 20px;">
                <p><strong>Scan to Verify:</strong></p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ doc.name }}" style="border: 1px solid #eee; padding: 5px;" />
            </div>
            {% endif %}
        </div>
        <div class="col-6">
            <table class="table-borderless w-100">
                <tr>
                    <td class="text-right">Net Total</td>
                    <td class="text-right">{{ doc.net_total }}</td>
                </tr>
                 <tr>
                    <td class="text-right">Tax</td>
                    <td class="text-right">{{ doc.total_taxes_and_charges }}</td>
                </tr>
                 <tr class="grand-total-row">
                    <td class="text-right"><strong>Grand Total</strong></td>
                    <td class="text-right"><strong>{{ doc.grand_total }}</strong></td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
    </div>
</div>
`;

const LEGACY_INVOICE_TEMPLATES: Record<string, string> = {
    "New York": NewYorkTemplate,
    "Toronto": TorontoTemplate,
    "Rio": RioTemplate,
    "London": LondonTemplate,
    "Istanbul": IstanbulTemplate,
    "Mumbai": MumbaiTemplate,
    "Hong Kong": HongKongTemplate,
    "Tokyo": TokyoTemplate,
    "Sydney": SydneyTemplate,
    "Addis Ababa": AddisAbabaTemplate
};

const LEGACY_QUOTE_TEMPLATES: Record<string, string> = {
    "New York": NewYorkQuotation,
    "Toronto": TorontoQuotation,
    "Rio": RioQuotation,
    "London": LondonQuotation,
    "Istanbul": IstanbulQuotation,
    "Mumbai": MumbaiQuotation,
    "Hong Kong": HongKongQuotation,
    "Tokyo": TokyoQuotation,
    "Sydney": SydneyQuotation,
    "Addis Ababa": AddisAbabaQuotation
};

const POS_TEMPLATES: Record<string, string> = {
    "New York": NewYorkPOS,
    "Toronto": TorontoPOS,
    "Rio": RioPOS,
    "London": LondonPOS,
    "Istanbul": IstanbulPOS,
    "Mumbai": MumbaiPOS,
    "Hong Kong": HongKongPOS,
    "Tokyo": TokyoPOS,
    "Sydney": SydneyPOS,
    "Addis Ababa": AddisAbabaPOS
};

/**
 * Fetches Print Formats.
 */
export async function getPrintFormats(doctype: string) {
    const formats: any[] = [];

    // 1. Load Hardcoded Standard Templates
    try {
        if (doctype === "Sales Invoice") {
            formats.push({
                name: "Standard Invoice",
                doc_type: "Sales Invoice",
                format: DEFAULT_INVOICE_TEMPLATE,
                standard: true
            });
            Object.keys(LEGACY_INVOICE_TEMPLATES).forEach(key => {
                formats.push({
                    name: key,
                    doc_type: "Sales Invoice",
                    format: LEGACY_INVOICE_TEMPLATES[key],
                    standard: true
                });
            });
        } else if (doctype === "Quotation") {
            Object.keys(LEGACY_QUOTE_TEMPLATES).forEach(key => {
                formats.push({
                    name: key,
                    doc_type: "Quotation",
                    format: LEGACY_QUOTE_TEMPLATES[key],
                    standard: true
                });
            });
        } else if (doctype === "POS Invoice") {
            Object.keys(POS_TEMPLATES).forEach(key => {
                formats.push({
                    name: key + " (POS)",
                    doc_type: "POS Invoice",
                    format: POS_TEMPLATES[key],
                    standard: true
                });
            });
        } else if (doctype === "Appointment Letter") {
            formats.push({
                name: "Standard Appointment Letter",
                doc_type: "Appointment Letter",
                format: AppointmentLetterTemplate,
                standard: true
            });
        } else if (doctype === "Salary Slip") {
            formats.push({
                name: "Standard Payslip",
                doc_type: "Salary Slip",
                format: SalarySlipTemplate,
                standard: true
            });
        } else if (doctype === "Offer Letter") {
            formats.push({
                name: "Standard Offer Letter",
                doc_type: "Offer Letter",
                format: OfferLetterTemplate,
                standard: true
            });
        } else if (doctype === "Experience Certificate") {
            formats.push({
                name: "Standard Experience Certificate",
                doc_type: "Experience Certificate",
                format: ExperienceCertificateTemplate,
                standard: true
            });
        } else if (doctype === "No Objection Certificate") {
            formats.push({
                name: "Standard NOC",
                doc_type: "No Objection Certificate",
                format: NOCTemplate,
                standard: true
            });
        }

        // 2. Load Dynamic Master Templates from Control DB
        try {
            const masterFormats = await getMasterPrintFormats(doctype);
            if (masterFormats && masterFormats.length > 0) {
                masterFormats.forEach((mf: any) => {
                    // If a master format has same name as standard, it OVERRIDES it
                    const existingIndex = formats.findIndex(f => f.name === mf.name);
                    if (existingIndex >= 0) {
                        formats[existingIndex] = {
                            name: mf.name,
                            doc_type: mf.doc_type,
                            format: mf.html || "", // The DB field is 'html'
                            standard: true
                        };
                    } else {
                        formats.push({
                            name: mf.name,
                            doc_type: mf.doc_type,
                            format: mf.html || "",
                            standard: true
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Error loading master print formats from DB", e);
        }

        return formats;
    } catch (e: any) {
        console.error("Error generating print formats", e);
        return [];
    }
}

export async function savePrintFormat(name: string, html: string) {
    // Implementation to save to Frappe
    return { success: true };
}
