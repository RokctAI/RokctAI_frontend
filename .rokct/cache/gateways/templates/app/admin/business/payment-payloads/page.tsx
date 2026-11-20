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

import { RiLoader4Line } from "@remixicon/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getPaymentPayloads } from "@/app/actions/gateways/admin/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function PaymentPayloadsPage() {
  const [loading, setLoading] = useState(true);
  const [payloads, setPayloads] = useState<any[]>([]);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);

  useEffect(() => {
    loadPayloads();
  }, []);

  async function loadPayloads() {
    try {
      const data = await getPaymentPayloads();
      setPayloads(data);
    } catch (error) {
      toast.error("Failed to load payment payloads");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("gateways.payment_payloads")}</h2>
        <p className="text-muted-foreground">
          {t("gateways.view_raw_payment_webhook_payloads_for_debugging")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("gateways.recent_payloads")}</CardTitle>
          <CardDescription>
            {t("gateways.a_list_of_the_most_recent_payment_payloads_recei")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("gateways.id")}</TableHead>
                <TableHead>{t("gateways.date")}</TableHead>
                <TableHead>{t("gateways.preview")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payloads.map((payload) => (
                <TableRow
                  key={payload.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPayload(payload)}
                >
                  <TableCell className="font-medium">{payload.name}</TableCell>
                  <TableCell>
                    {new Date(payload.creation).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {typeof payload.payload === "string"
                      ? payload.payload
                      : JSON.stringify(payload.payload)}
                  </TableCell>
                </TableRow>
              ))}
              {payloads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("gateways.no_payment_payloads_found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPayload}
        onOpenChange={(open) => !open && setSelectedPayload(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("gateways.payload_details")}</DialogTitle>
            <DialogDescription>
              {selectedPayload?.name} -{" "}
              {new Date(selectedPayload?.creation).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 bg-muted p-4 rounded-md overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {selectedPayload &&
                JSON.stringify(
                  typeof selectedPayload.payload === "string"
                    ? JSON.parse(selectedPayload.payload)
                    : selectedPayload.payload,
                  null,
                  2,
                )}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
