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

import { RiLoader4Line, RiEyeLine, RiCheckboxCircleLine, RiCloseCircleLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  getReservations,
  updateReservationStatus,
} from "@/app/actions/booking/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import t from "@/app/lib/i18n";
interface Reservation {
  name: string;
  customer_name: string;
  booking_date: string;
  booking_time: string;
  number_of_guests: number;
  status: string;
  table?: string;
}

export default function BookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReservations() {
    setLoading(true);
    try {
      const data = await getReservations();
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  async function handleStatusUpdate(name: string, status: string) {
    try {
      await updateReservationStatus(name, status);
      toast.success(`Reservation ${status.toLowerCase()}`);
      fetchReservations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("booking.reservations")}</h1>
          <p className="text-muted-foreground">{t("booking.manage_your_table_bookings")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("booking.all_bookings")}</CardTitle>
          <CardDescription>
            {t("booking.view_and_manage_all_reservation_requests")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("booking.customer")}</TableHead>
                <TableHead>{t("booking.date_time")}</TableHead>
                <TableHead>{t("booking.guests")}</TableHead>
                <TableHead>{t("booking.table")}</TableHead>
                <TableHead>{t("booking.status")}</TableHead>
                <TableHead className="text-right">{t("booking.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("booking.no_reservations_found")}
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.name}>
                    <TableCell className="font-medium">
                      {res.customer_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(res.booking_date), "MMM d, yyyy")} at{" "}
                      {res.booking_time}
                    </TableCell>
                    <TableCell>{res.number_of_guests}</TableCell>
                    <TableCell>{res.table || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          res.status === "Approved"
                            ? "default" // default is usually primary/black
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
                      <div className="flex justify-end gap-2">
                        {res.status === "Pending" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(res.name, "Approved")
                              }
                              title={t("booking.approve")}
                            >
                              <RiCheckboxCircleLine className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(res.name, "Rejected")
                              }
                              title={t("booking.reject")}
                            >
                              <RiCloseCircleLine className="size-4" />
                            </Button>
                          </>
                        )}
                        <Link href={`/manager/bookings/${res.name}`}>
                          <Button variant="ghost" size="icon">
                            <RiEyeLine className="size-4" />
                          </Button>
                        </Link>
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
