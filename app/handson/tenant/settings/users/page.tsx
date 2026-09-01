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
import { Plus, User, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  getUsers,
  createUser,
  UserRole,
} from "@/app/actions/handson/tenant/settings/users";
import t from "@/app/lib/i18n";

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().optional(),
  role: z.enum(["Employee", "Client", "Accountant", "Viewer"] as const),
});

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "Employee",
    },
  });

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("app.users.toast_load_fail"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDialog = () => {
    form.reset({
      email: "",
      first_name: "",
      last_name: "",
      role: "Employee",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      const res = await createUser(values);
      if (res.success) {
        toast.success(t("app.users.toast_create_success"));
        fetchUsers();
        setIsDialogOpen(false);
      } else {
        toast.error(t("app.users.toast_create_fail", { error: res.error }));
      }
    } catch (error) {
      toast.error(t("app.users.toast_error"));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("app.users.title")}</h1>
          <p className="text-muted-foreground">{t("app.users.desc")}</p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="mr-2 h-4 w-4" /> {t("app.users.btn_add")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("app.users.card_title")}</CardTitle>
          <CardDescription>{t("app.users.card_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("app.users.col_name")}</TableHead>
                <TableHead>{t("app.users.col_email")}</TableHead>
                <TableHead>{t("app.users.col_status")}</TableHead>
                <TableHead>{t("app.users.col_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("app.users.no_users")}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {user.first_name} {user.last_name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.enabled ? "default" : "secondary"}>
                        {user.enabled
                          ? t("app.users.status_active")
                          : t("app.users.status_disabled")}
                      </Badge>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("app.users.dialog_title")}</DialogTitle>
            <DialogDescription>{t("app.users.dialog_desc")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("app.users.label_first_name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("app.users.label_last_name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.users.label_email")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("app.users.ph_email")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.users.label_role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("app.users.ph_role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Employee">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {t("app.users.role_employee")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("app.users.role_employee_desc")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Accountant">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {t("app.users.role_accountant")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("app.users.role_accountant_desc")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Client">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {t("app.users.role_client")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("app.users.role_client_desc")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Viewer">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {t("app.users.role_viewer")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("app.users.role_viewer_desc")}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{t("app.users.btn_create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
