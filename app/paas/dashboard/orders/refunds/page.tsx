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

import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getRefunds, updateRefund } from "@/app/actions/paas/refunds";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import t from "@/app/lib/i18n";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    try {
      const data = await getRefunds();
      setRefunds(data);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (refund: any) => {
    setSelectedRefund(refund);
    setAnswer(refund.answer || "");
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRefund) return;

    setProcessing(true);
    try {
      await updateRefund(selectedRefund.name, status, answer);
      toast.success(`Refund ${status.toLowerCase()} successfully`);
      setIsDialogOpen(false);
      fetchRefunds();
    } catch (error) {
      console.error("Error updating refund:", error);
      toast.error("Failed to update refund");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('app.paas.dashboard.orders.refunds.title')}</h1>
        <p className="text-muted-foreground">
          {t('app.paas.dashboard.orders.refunds.desc')}
        </p>
      </div>


       <Card>
         <CardHeader>
           <CardTitle>{t('app.paas.dashboard.orders.refunds.card_title')}</CardTitle>
           <CardDescription>
             {t('app.paas.dashboard.orders.refunds.card_desc')}
           </CardDescription>
         </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
               <TableRow>
                 <TableHead>{t('app.paas.dashboard.orders.refunds.col_order')}</TableHead>
                 <TableHead>{t('app.paas.dashboard.orders.refunds.col_reason')}</TableHead>
                 <TableHead>{t('app.paas.dashboard.orders.refunds.col_status')}</TableHead>
                 <TableHead>{t('app.paas.dashboard.orders.refunds.col_answer')}</TableHead>
                 <TableHead className="text-right">{t('common.actions')}</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.length === 0 ? (
                <TableRow>
                   <TableCell
                     colSpan={5}
                     className="text-center h-24 text-muted-foreground"
                   >
                     {t('app.paas.dashboard.orders.refunds.no_data')}
                   </TableCell>
                </TableRow>
              ) : (
                refunds.map((refund) => (
                  <TableRow key={refund.name}>
                    <TableCell className="font-medium">
                      {refund.order}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {refund.cause}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          refund.status === "Accepted"
                            ? "default"
                            : refund.status === "Canceled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {refund.answer || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {refund.status === "New" && (
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleOpenDialog(refund)}
                         >
                           {t('app.paas.dashboard.orders.refunds.btn_review')}
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{t('app.paas.dashboard.orders.refunds.dialog_title')}</DialogTitle>
             <DialogDescription>
               {t('app.paas.dashboard.orders.refunds.dialog_desc', { order: selectedRefund?.order })}
             </DialogDescription>
           </DialogHeader>
          <div className="space-y-4 py-4">
             <div>
               <Label className="font-semibold">{t('app.paas.dashboard.orders.refunds.label_reason')}</Label>
               <p className="text-sm text-muted-foreground mt-1">
                 {selectedRefund?.cause}
               </p>
             </div>
             <div className="space-y-2">
               <Label htmlFor="answer">{t('app.paas.dashboard.orders.refunds.label_answer')}</Label>
               <Textarea
                 id="answer"
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder={t('app.paas.dashboard.orders.refunds.ph_answer')}
                 rows={4}
               />
             </div>
          </div>
          <DialogFooter className="gap-2">
             <Button
               variant="outline"
               className="text-green-600 hover:text-green-700"
               onClick={() => handleUpdateStatus("Accepted")}
               disabled={processing}
             >
               <Check className="size-4 mr-2" />
               {t('app.paas.dashboard.orders.refunds.btn_accept')}
             </Button>
             <Button
               variant="outline"
               className="text-red-600 hover:text-red-700"
               onClick={() => handleUpdateStatus("Canceled")}
               disabled={processing}
             >
               <X className="size-4 mr-2" />
               {t('app.paas.dashboard.orders.refunds.btn_reject')}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
