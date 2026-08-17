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

import { format } from "date-fns";
import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import t from "@/app/lib/i18n";

import {
  getReservations,
  updateReservationStatus,
} from "@/app/actions/paas/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await getReservations(status);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (name: string, newStatus: string) => {
    try {
      await updateReservationStatus(name, newStatus);
      toast.success(t('app.paas.dashboard.booking.reservations.toast_update_success', { status: newStatus.toLowerCase() }));
      fetchData();
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error(t('app.paas.dashboard.booking.reservations.toast_update_fail'));
    }
  };
 
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('app.paas.dashboard.booking.reservations.title')}</h1>
          <p className="text-muted-foreground">
            {t('app.paas.dashboard.booking.reservations.desc')}
          </p>
        </div>
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('app.paas.dashboard.booking.reservations.ph_filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('app.paas.dashboard.booking.reservations.status_all')}</SelectItem>
              <SelectItem value="New">{t('app.paas.dashboard.booking.reservations.status_new')}</SelectItem>
              <SelectItem value="Accepted">{t('app.paas.dashboard.booking.reservations.status_accepted')}</SelectItem>
              <SelectItem value="Rejected">{t('app.paas.dashboard.booking.reservations.status_rejected')}</SelectItem>
              <SelectItem value="Cancelled">{t('app.paas.dashboard.booking.reservations.status_cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
 
      <Card>
        <CardHeader>
          <CardTitle>{t('app.paas.dashboard.booking.reservations.card_title')}</CardTitle>
          <CardDescription>{t('app.paas.dashboard.booking.reservations.card_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('app.paas.dashboard.booking.reservations.col_date_time')}</TableHead>
                  <TableHead>{t('app.paas.dashboard.booking.reservations.col_customer')}</TableHead>
                  <TableHead>{t('app.paas.dashboard.booking.reservations.col_table')}</TableHead>
                  <TableHead>{t('app.paas.dashboard.booking.reservations.col_guests')}</TableHead>
                  <TableHead>{t('app.paas.dashboard.booking.reservations.col_status')}</TableHead>
                  <TableHead className="text-right">{t('app.paas.dashboard.booking.reservations.col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      {t('app.paas.dashboard.booking.reservations.no_reservations')}
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((res) => (
                    <TableRow key={res.name}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(res.start_date), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(res.start_date), "HH:mm")} -{" "}
                          {format(new Date(res.end_date), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>{res.user}</TableCell>
                      <TableCell>{res.table}</TableCell>
                      <TableCell>{res.guest_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            res.status === "Accepted"
                              ? "default"
                              : res.status === "Rejected" ||
                                   res.status === "Cancelled"
                                 ? "destructive"
                                 : "secondary"
                          }
                        >
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {res.status === "New" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(res.name, "Accepted")
                              }
                            >
                              <Check className="size-4 mr-1" /> {t('app.paas.dashboard.booking.reservations.btn_accept')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(res.name, "Rejected")
                              }
                            >
                              <X className="size-4 mr-1" /> {t('app.paas.dashboard.booking.reservations.btn_reject')}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
