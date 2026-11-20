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
import { format } from "date-fns";
import {
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import {
  getMyAttendanceList,
  markMyAttendance,
} from "@/app/actions/handson/all/hrms/me/attendance";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";

import t from "@/app/lib/i18n";
const attendanceSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  attendance_date: z.date({ required_error: "Date is required" }),
  status: z.enum(["Present", "Absent", "Half Day", "On Leave"]),
  company: z.string().min(1, "Company is required"),
});

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      status: "Present",
      attendance_date: new Date(),
    },
  });

  async function fetchData() {
    setLoading(true);
    try {
      const [attList, emps, comps] = await Promise.all([
        getMyAttendanceList(),
        getEmployees(),
        getCompanies(),
      ]);
      setAttendanceList(attList || []);
      setEmployees(emps || []);
      setCompanies(comps || []);

      if (comps && comps.length > 0) {
        form.setValue("company", comps[0].name);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof attendanceSchema>) => {
    try {
      const formattedDate = format(values.attendance_date, "yyyy-MM-dd");
      const res = await markMyAttendance({
        ...values,
        attendance_date: formattedDate,
      });

      if (res.success) {
        toast.success("Attendance marked");
        fetchData();
        setIsDialogOpen(false);
        form.reset({
          status: "Present",
          attendance_date: new Date(),
          company: values.company,
        });
      } else {
        toast.error("Failed: " + res.error);
      }
    } catch (e) {
      toast.error("Error submitting attendance");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("erp.attendance")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>{t("erp.mark_attendance")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("erp.mark_attendance")}</DialogTitle>
              <DialogDescription>
                {t("erp.record_daily_attendance_for_an_employee")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("erp.employee")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("erp.select_employee")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.name} value={emp.name}>
                              {emp.employee_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendance_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("erp.date")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>{t("erp.pick_a_date")}</span>
                              )}
                              <RiCalendarLine className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("erp.status")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("erp.status")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Present">{t("erp.present")}</SelectItem>
                          <SelectItem value="Absent">{t("erp.absent")}</SelectItem>
                          <SelectItem value="Half Day">{t("erp.half_day")}</SelectItem>
                          <SelectItem value="On Leave">{t("erp.on_leave")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("erp.company")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("erp.company")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.company_name || c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">{t("erp.save")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.attendance_history")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead>{t("erp.employee")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("erp.no_records_found")}
                  </TableCell>
                </TableRow>
              ) : (
                attendanceList.map((att) => (
                  <TableRow key={att.name}>
                    <TableCell>
                      {format(new Date(att.attendance_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {att.employee_name}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          att.status === "Present" &&
                            "bg-green-100 text-green-800",
                          att.status === "Absent" && "bg-red-100 text-red-800",
                          att.status === "Half Day" &&
                            "bg-yellow-100 text-yellow-800",
                          att.status === "On Leave" &&
                            "bg-blue-100 text-blue-800",
                        )}
                      >
                        {att.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
