/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Building,
  LandPlot,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Input } from "@/components/ui/input";
import t from "@/app/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getProvinces,
  createProvince,
  deleteProvince,
  getLocationTypes,
  createLocationType,
  deleteLocationType,
  getOrgans,
  createOrgan,
  deleteOrgan,
} from "@/app/actions/handson/all/settings/lookups";
import { getIndustries } from "@/app/actions/handson/all/crm/competitor";

// --- Schemas ---

const provinceSchema = z.object({
  province_name: z.string().min(2, t("app.settings.lookups.name_required")),
});

const locationTypeSchema = z.object({
  location_type_name: z
    .string()
    .min(2, t("app.settings.lookups.name_required")),
  industry: z.string().min(1, t("app.settings.lookups.industry_required")),
});

const organSchema = z.object({
  organ_name: z.string().min(2, t("app.settings.lookups.name_required")),
  type: z.enum([
    "National Department",
    "Provincial Department",
    "Municipality",
    "State Owned Entity",
  ]),
});

const ORGAN_TYPES = {
  NATIONAL_DEPT: "National Department",
  PROVINCIAL_DEPT: "Provincial Department",
  MUNICIPALITY: "Municipality",
  STATE_OWNED_ENTITY: "State Owned Entity",
} as const;

export default function LookupsPage() {
  const [activeTab, setActiveTab] = useState("provinces");
  const [loading, setLoading] = useState(true);

  // Data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [locationTypes, setLocationTypes] = useState<any[]>([]);
  const [organs, setOrgans] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);

  // Dialogs
  const [isProvinceDialogOpen, setIsProvinceDialogOpen] = useState(false);
  const [isLocTypeDialogOpen, setIsLocTypeDialogOpen] = useState(false);
  const [isOrganDialogOpen, setIsOrganDialogOpen] = useState(false);

  // Forms
  const provForm = useForm<z.infer<typeof provinceSchema>>({
    resolver: zodResolver(provinceSchema),
    defaultValues: { province_name: "" },
  });

  const locForm = useForm<z.infer<typeof locationTypeSchema>>({
    resolver: zodResolver(locationTypeSchema),
    defaultValues: { location_type_name: "", industry: "" },
  });

  const organForm = useForm<z.infer<typeof organSchema>>({
    resolver: zodResolver(organSchema),
    defaultValues: { organ_name: "", type: "National Department" },
  });

  async function fetchData() {
    setLoading(true);
    try {
      const [pData, lData, oData, iData] = await Promise.all([
        getProvinces(),
        getLocationTypes(),
        getOrgans(),
        getIndustries(),
      ]);
      setProvinces(pData || []);
      setLocationTypes(lData || []);
      setOrgans(oData || []);
      setIndustries(iData || []);
    } catch (error) {
      console.error(error);
      toast.error(t("app.settings.lookups.fetch_fail"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const onProvSubmit = async (values: z.infer<typeof provinceSchema>) => {
    try {
      await createProvince(values);
      toast.success(t("app.settings.lookups.province_created"));
      setIsProvinceDialogOpen(false);
      provForm.reset();
      fetchData();
    } catch (error) {
      toast.error(t("app.settings.lookups.province_create_fail"));
    }
  };

  const onLocSubmit = async (values: z.infer<typeof locationTypeSchema>) => {
    try {
      await createLocationType(values);
      toast.success(t("app.settings.lookups.location_created"));
      setIsLocTypeDialogOpen(false);
      locForm.reset();
      fetchData();
    } catch (error) {
      toast.error(t("app.settings.lookups.location_create_fail"));
    }
  };

  const onOrganSubmit = async (values: z.infer<typeof organSchema>) => {
    try {
      await createOrgan(values);
      toast.success(t("app.settings.lookups.organ_created"));
      setIsOrganDialogOpen(false);
      organForm.reset();
      fetchData();
    } catch (error) {
      toast.error(t("app.settings.lookups.organ_create_fail"));
    }
  };

  const onDelete = async (
    type: "province" | "location" | "organ",
    name: string,
  ) => {
    if (!confirm(t("app.settings.lookups.delete_confirm"))) return;
    try {
      if (type === "province") await deleteProvince(name);
      if (type === "location") await deleteLocationType(name);
      if (type === "organ") await deleteOrgan(name);
      toast.success(t("app.settings.lookups.deleted"));
      fetchData();
    } catch (error) {
      toast.error(t("app.settings.lookups.delete_fail"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("app.settings.lookups.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.settings.lookups.desc")}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="provinces"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="provinces">
            {t("app.settings.lookups.tab_provinces")}
          </TabsTrigger>
          <TabsTrigger value="locations">
            {t("app.settings.lookups.tab_locations")}
          </TabsTrigger>
          <TabsTrigger value="organs">
            {t("app.settings.lookups.tab_organs")}
          </TabsTrigger>
        </TabsList>

        {/* --- Provinces --- */}
        <TabsContent value="provinces" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsProvinceDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />{" "}
              {t("app.settings.lookups.btn_new_province")}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("app.settings.lookups.province_title")}</CardTitle>
              <CardDescription>
                {t("app.settings.lookups.province_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("app.settings.lookups.col_name")}</TableHead>
                    <TableHead className="text-right">
                      {t("app.settings.lookups.col_actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinces.map((prov) => (
                    <TableRow key={prov.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        {prov.province_name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete("province", prov.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Location Types --- */}
        <TabsContent value="locations" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsLocTypeDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />{" "}
              {t("app.settings.lookups.btn_new_type")}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("app.settings.lookups.location_title")}</CardTitle>
              <CardDescription>
                {t("app.settings.lookups.location_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("app.settings.lookups.col_name")}</TableHead>
                    <TableHead>
                      {t("app.settings.lookups.col_industry")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("app.settings.lookups.col_actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationTypes.map((loc) => (
                    <TableRow key={loc.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <LandPlot className="h-4 w-4 text-green-500" />
                        {loc.location_type_name}
                      </TableCell>
                      <TableCell>{loc.industry}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete("location", loc.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Organs of State --- */}
        <TabsContent value="organs" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsOrganDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />{" "}
              {t("app.settings.lookups.btn_new_entity")}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("app.settings.lookups.organ_title")}</CardTitle>
              <CardDescription>
                {t("app.settings.lookups.organ_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("app.settings.lookups.col_name")}</TableHead>
                    <TableHead>{t("app.settings.lookups.col_type")}</TableHead>
                    <TableHead className="text-right">
                      {t("app.settings.lookups.col_actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organs.map((org) => (
                    <TableRow key={org.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-orange-500" />
                        {org.organ_name}
                      </TableCell>
                      <TableCell>{org.type}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete("organ", org.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Dialogs --- */}

      <Dialog
        open={isProvinceDialogOpen}
        onOpenChange={setIsProvinceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("app.settings.lookups.dialog_province_title")}
            </DialogTitle>
          </DialogHeader>
          <Form {...provForm}>
            <form
              onSubmit={provForm.handleSubmit(onProvSubmit)}
              className="space-y-4"
            >
              <FormField
                control={provForm.control}
                name="province_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.settings.lookups.col_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {t("app.settings.lookups.btn_create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLocTypeDialogOpen} onOpenChange={setIsLocTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("app.settings.lookups.dialog_location_title")}
            </DialogTitle>
          </DialogHeader>
          <Form {...locForm}>
            <form
              onSubmit={locForm.handleSubmit(onLocSubmit)}
              className="space-y-4"
            >
              <FormField
                control={locForm.control}
                name="location_type_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.settings.lookups.col_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={locForm.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("app.settings.lookups.col_industry")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((i) => (
                          <SelectItem key={i.name} value={i.name}>
                            {i.industry_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {t("app.settings.lookups.btn_create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrganDialogOpen} onOpenChange={setIsOrganDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("app.settings.lookups.dialog_organ_title")}
            </DialogTitle>
          </DialogHeader>
          <Form {...organForm}>
            <form
              onSubmit={organForm.handleSubmit(onOrganSubmit)}
              className="space-y-4"
            >
              <FormField
                control={organForm.control}
                name="organ_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.settings.lookups.col_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={organForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.settings.lookups.col_type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="National Department">
                          {t("app.settings.lookups.national_department")}
                        </SelectItem>
                        <SelectItem value="Provincial Department">
                          {t("app.settings.lookups.provincial_department")}
                        </SelectItem>
                        <SelectItem value="Municipality">
                          {t("app.settings.lookups.municipality")}
                        </SelectItem>
                        <SelectItem value="State Owned Entity">
                          {t("app.settings.lookups.state_owned_entity")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {t("app.settings.lookups.btn_create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
