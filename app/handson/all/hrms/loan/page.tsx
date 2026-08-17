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

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import { getLoans } from "@/app/actions/handson/all/hrms/loans";
import { Badge } from "@/components/ui/badge";

export default function EmployeeLoanPage() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getLoans();
    setLoans(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Loans</h1>
          <p className="text-muted-foreground">
            Manage salary advances and repayment schedules.
          </p>
        </div>
        <Link href="/handson/all/hr/loan/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Apply for Loan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-slate-50 flex flex-col items-center gap-2">
            <Wallet className="h-10 w-10 opacity-20" />
            No active loans found.
          </div>
        ) : (
          loans.map((loan) => (
            <Card key={loan.name}>
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {loan.employee}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {loan.name}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      loan.status === "Sanctioned" ? "default" : "secondary"
                    }
                  >
                    {loan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {loan.loan_amount}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-slate-100 p-2 rounded">
                  {loan.repayment_method}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
