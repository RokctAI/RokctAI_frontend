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

import { format } from "date-fns";
import {
  RiArrowUpCircleLine,
  RiLoader4Line,
  RiWalletLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getSavedCards,
  getWallet,
  getWalletHistory,
  topUpWallet,
} from "@/app/actions/gateways/finance";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

import t from "@/app/lib/i18n";
// Wallet History.transaction_type values that add money to the wallet.
const CREDIT_TYPES = new Set([
  "Topup",
  "Referral",
  "Loan Disbursement",
  "Refund",
  "Payout Reversal",
  "Deposit",
]);

function isCredit(item: any): boolean {
  return CREDIT_TYPES.has(item?.transaction_type);
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [savedCard, setSavedCard] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [w, h, c] = await Promise.all([
        getWallet(),
        getWalletHistory(),
        getSavedCards(),
      ]);
      setWallet(w);
      setHistory(Array.isArray(h) ? h : []);
      setCards(c);
      if (c.length > 0) setSavedCard((prev) => prev || c[0].name);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  }

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!savedCard) {
      toast.error("Add a saved card before topping up");
      return;
    }

    setProcessing(true);
    try {
      await topUpWallet(amount, savedCard);
      toast.success("Wallet topped up successfully!");
      setIsTopUpOpen(false);
      setTopUpAmount("");
      fetchData();
    } catch (error) {
      console.error("Error topping up wallet:", error);
      toast.error("Failed to top up wallet");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("wallet.my_wallet")}</h1>
          <p className="text-muted-foreground">
            {t("wallet.manage_your_wallet_balance_and_view_transaction_")}
          </p>
        </div>
        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiArrowUpCircleLine className="mr-2 size-4" />
              {t("wallet.top_up_wallet")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("wallet.top_up_wallet")}</DialogTitle>
              <DialogDescription>
                {t("wallet.enter_the_amount_you_want_to_add_to_your_wallet")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  {t("wallet.amount")}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="saved-card" className="text-right">
                  {t("wallet.card")}
                </Label>
                {cards.length === 0 ? (
                  <p className="col-span-3 text-sm text-muted-foreground">
                    {t("wallet.no_saved_cards_save_a_card_first_to_top_up")}
                  </p>
                ) : (
                  <select
                    id="saved-card"
                    value={savedCard}
                    onChange={(e) => setSavedCard(e.target.value)}
                    className="col-span-3 h-9 rounded-md border bg-transparent px-3 text-sm"
                  >
                    {cards.map((card) => (
                      <option key={card.name} value={card.name}>
                        {(card.card_type || "Card") + " •••• " + (card.last_four || "")}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleTopUp} disabled={processing || !savedCard}>
                {processing ? (
                  <RiLoader4Line className="size-4 animate-spin" />
                ) : (
                  "Confirm Top Up"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("wallet.current_balance")}
            </CardTitle>
            <RiWalletLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("wallet.wallet_history")}</CardTitle>
          <CardDescription>
            {t("wallet.recent_transactions_affecting_your_wallet_balanc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("wallet.date")}</TableHead>
                <TableHead>{t("wallet.type")}</TableHead>
                <TableHead>{t("wallet.status")}</TableHead>
                <TableHead className="text-right">{t("wallet.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("wallet.no_history_found")}
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>
                      {item.creation
                        ? format(new Date(item.creation), "MMM d, yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>{item.description || item.transaction_type}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${isCredit(item) ? "text-green-600" : "text-red-600"}`}
                    >
                      {isCredit(item) ? "+" : "-"}
                      {formatCurrency(item.amount || 0)}
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
