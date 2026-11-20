/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import {
  getLeaveTypes,
  createLeaveApplication,
} from "@/app/actions/handson/all/hrms/leave";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";

import t from "@/app/lib/i18n";
export default function ApplyLeavePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [halfDay, setHalfDay] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [empData, typeData, companyData] = await Promise.all([
      getEmployees(),
      getLeaveTypes(),
      getCompanies(),
    ]);
    setEmployees(empData || []);
    setLeaveTypes(typeData || []);
    setCompanies(companyData || []);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Find company for the selected employee
    const employeeObj = employees.find((emp) => emp.name === selectedEmployee);
    const company = employeeObj?.company || companies[0]?.name;

    const data = {
      employee: selectedEmployee,
      leave_type: selectedType,
      from_date: fromDate,
      to_date: toDate,
      half_day: halfDay,
      reason: formData.get("reason"),
      company: company,
    };

    const result = await createLeaveApplication(data);

    if (result.success) {
      toast.success("Leave application submitted successfully");
      router.push("/handson/all/hr/leave");
    } else {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("erp.apply_for_leave")}</h1>
        <p className="text-muted-foreground">
          {t("erp.submit_a_new_leave_request_for_approval")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.leave_details")}</CardTitle>
          <CardDescription>
            {t("erp.fill_in_the_dates_and_type_of_leave_required")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>{t("erp.employee")}</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("erp.select_employee")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("erp.leave_type")}</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("erp.select_leave_type")} />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.leave_type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("erp.from_date")}</Label>
                <Input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("erp.to_date")}</Label>
                <Input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="half_day"
                checked={halfDay}
                onCheckedChange={(checked) => setHalfDay(checked as boolean)}
              />
              <Label htmlFor="half_day">{t("erp.half_day")}</Label>
            </div>

            <div className="space-y-2">
              <Label>{t("erp.reason")}</Label>
              <Textarea
                name="reason"
                placeholder="e.g. Sick leave, Personal commitments..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t("erp.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
