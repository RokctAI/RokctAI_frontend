"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import t from "@/app/lib/i18n";

import { getNotifications } from "@/app/actions/paas/admin/content";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t('paas.admin.notifications.title')}</h1>
 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('paas.admin.notifications.col_title')}</TableHead>
              <TableHead>{t('paas.admin.notifications.col_message')}</TableHead>
              <TableHead>{t('paas.admin.notifications.col_sent_at')}</TableHead>
              <TableHead>{t('paas.admin.notifications.col_target')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('paas.admin.notifications.no_notifications')}
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notif) => (
                <TableRow key={notif.name}>
                  <TableCell className="font-medium">{notif.title}</TableCell>
                  <TableCell>{notif.message}</TableCell>
                  <TableCell>
                    {format(new Date(notif.creation), "PPP p")}
                  </TableCell>
                  <TableCell>{notif.target_audience || t('paas.admin.notifications.all_users')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
