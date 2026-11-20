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
import { toast } from "sonner";
import { RiLoader4Line, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getSellerInvites,
  updateInviteStatus,
} from "@/app/actions/merchants/invites";
import { getCurrentSession } from "@/app/(auth)/actions";

import t from "@/app/lib/i18n";
interface Invite {
  name: string;
  user: string;
  role: string;
  status: string;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    try {
      const data = await getSellerInvites();
      setInvites(data);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (
    inviteId: string,
    status: "Accepted" | "Rejected",
  ) => {
    setProcessingId(inviteId);
    try {
      const session = await getCurrentSession();
      if (!session?.user) return;

      await updateInviteStatus(inviteId, status);

      toast.success(`Invite ${status.toLowerCase()} successfully`);
      fetchInvites();
    } catch (error) {
      console.error("Error updating invite:", error);
      toast.error("Failed to update invite");
    } finally {
      setProcessingId(null);
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
      <div>
        <h1 className="text-3xl font-bold">{t("merchants.invites")}</h1>
        <p className="text-muted-foreground">{t("merchants.manage_your_invitations")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("merchants.received_invitations")}</CardTitle>
          <CardDescription>
            {t("merchants.accept_or_reject_invitations_to_join_shops")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("merchants.user")}</TableHead>
                <TableHead>{t("merchants.role")}</TableHead>
                <TableHead>{t("merchants.status")}</TableHead>
                <TableHead className="text-right">{t("merchants.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("merchants.no_invites_found")}
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => (
                  <TableRow key={invite.name}>
                    <TableCell>{invite.user}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invite.status === "Accepted"
                            ? "default"
                            : invite.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {invite.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {invite.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleAction(invite.name, "Accepted")
                            }
                            disabled={!!processingId}
                          >
                            {processingId === invite.name ? (
                              <RiLoader4Line className="size-4 animate-spin" />
                            ) : (
                              <RiCheckLine className="size-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleAction(invite.name, "Rejected")
                            }
                            disabled={!!processingId}
                          >
                            {processingId === invite.name ? (
                              <RiLoader4Line className="size-4 animate-spin" />
                            ) : (
                              <RiCloseLine className="size-4" />
                            )}
                          </Button>
                        </>
                      )}
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
