/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Filter, Download, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import t from "@/app/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  runCustomReport,
  getStandardReports,
  StandardReportDef,
} from "@/app/actions/handson/all/reports/analytics";

const DOC_TYPES = {
  SALES_INVOICE: "Sales Invoice",
  PURCHASE_INVOICE: "Purchase Invoice",
  CUSTOMER: "Customer",
  ITEM: "Item",
  LEAD: "Lead",
} as const;

function AdvancedReportViewer() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("report");

  const [loading, setLoading] = useState(false);
  const [reportMeta, setReportMeta] = useState<StandardReportDef | null>(null);
  const [data, setData] = useState<any[]>([]);

  // Config State
  const [doctype, setDoctype] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([
    "name",
    "creation",
    "modified",
    "owner",
    "docstatus",
  ]);

  // Simplistic field discovery mock - in real app would fetch meta
  useEffect(() => {
    if (doctype === DOC_TYPES.SALES_INVOICE)
      setAvailableColumns([
        "name",
        "customer_name",
        "posting_date",
        "grand_total",
        "status",
        "company",
      ]);
    if (doctype === "Customer")
      setAvailableColumns([
        "name",
        "customer_name",
        "customer_group",
        "territory",
        "customer_type",
        "email_id",
      ]);
    // ... add more mocks or generic fallback
  }, [doctype]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const standards = await getStandardReports();
      const found = standards.find((r) => r.name === reportId);

      if (found) {
        setReportMeta(found);
        setDoctype(found.doctype);
        setColumns(found.defaultColumns);
        // Auto-run if standard
        await runReport(found.doctype, found.defaultColumns);
      } else {
        // Custom Mode
        setReportMeta(null);
        setDoctype(DOC_TYPES.SALES_INVOICE); // Default
        setColumns(["name", "status"]);
      }
      setLoading(false);
    }
    init();
  }, [reportId]);

  async function runReport(dt: string, cols: string[]) {
    setLoading(true);
    try {
      const res = await runCustomReport(dt, cols);
      if (res.success) {
        setData(res.data);
        toast.success(`Fetched ${res.data.length} records`);
      } else {
        toast.error("Failed to fetch data: " + res.error);
      }
    } catch (e) {
      toast.error("Error executing report");
    } finally {
      setLoading(false);
    }
  }

  const handleColumnToggle = (col: string) => {
    if (columns.includes(col)) {
      setColumns(columns.filter((c) => c !== col));
    } else {
      setColumns([...columns, col]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {reportMeta ? reportMeta.title : "Custom Report Builder"}
            {reportMeta && (
              <Badge variant="secondary">{reportMeta.category}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {reportMeta
              ? reportMeta.description
              : "Select parameters to generate a custom view."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => runReport(doctype, columns)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
           <Button variant="secondary">
             <Download className="mr-2 h-4 w-4" /> {t('app.reports.advanced.export_csv')}
           </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-muted/30 p-4 rounded-lg flex flex-wrap gap-4 items-end border">
        {!reportMeta && (
          <div className="space-y-2 w-full md:w-auto">
             <Label>{t('app.reports.advanced.label_doctype')}</Label>
             <Select value={doctype} onValueChange={setDoctype}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DOC_TYPES.SALES_INVOICE}>{t('app.reports.advanced.sales_invoice')}</SelectItem>
                  <SelectItem value={DOC_TYPES.PURCHASE_INVOICE}>
                    {t('app.reports.advanced.purchase_invoice')}
                  </SelectItem>
                   <SelectItem value={DOC_TYPES.CUSTOMER}>{t('app.reports.advanced.customer')}</SelectItem>
                  <SelectItem value={DOC_TYPES.ITEM}>{t('app.reports.advanced.item')}</SelectItem>
                  <SelectItem value={DOC_TYPES.LEAD}>{t('app.reports.advanced.lead')}</SelectItem>
               </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
             <Label>{t('app.reports.advanced.label_columns')}</Label>
             <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                {columns.length} Selected{" "}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                 <DropdownMenuLabel>{t('app.reports.advanced.available_fields')}</DropdownMenuLabel>
                 <DropdownMenuSeparator />
              {availableColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={columns.includes(col)}
                  onCheckedChange={() => handleColumnToggle(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Placeholders for Date Range, etc */}
        <div className="space-y-2">
             <Label>{t('app.reports.advanced.label_date_range')}</Label>
             <div className="flex gap-2">
            <Input type="date" className="w-[140px]" />
            <span className="self-center text-muted-foreground">-</span>
            <Input type="date" className="w-[140px]" />
          </div>
        </div>

        <div className="ml-auto pb-0.5">
          {!reportMeta && (
             <Button onClick={() => runReport(doctype, columns)}>
               {t('common.generate')}
             </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="capitalize">
                  {col.replace(/_/g, " ")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                   <TableCell
                     colSpan={columns.length}
                     className="text-center py-12"
                   >
                     {t('app.reports.advanced.loading_data')}
                   </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                   <TableCell
                     colSpan={columns.length}
                     className="text-center py-12 text-muted-foreground"
                   >
                     {t('app.reports.advanced.no_records')}
                   </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={row.name || idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {typeof row[col] === "object"
                        ? JSON.stringify(row[col])
                        : row[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdvancedReportPage() {
  return (
     <Suspense fallback={<div>{t('app.reports.advanced.loading_report')}</div>}>
       <AdvancedReportViewer />
     </Suspense>
  );
}
