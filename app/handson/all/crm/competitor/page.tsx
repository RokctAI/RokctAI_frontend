"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Trash2,
  Plus,
  Pencil,
  ExternalLink,
  MapPin,
  Building2,
  Globe,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

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
  FormDescription,
} from "@/components/ui/form";
import t from "@/app/lib/i18n";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getCompetitors,
  getCompetitor,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  getIndustries,
  createIndustry,
  getLocationTypes,
  getCompetitorRoutes,
  getCompetitorZones,
  getCompetitorProducts, // Ensure this is available if needed for fetching child table, though we get office_locations from fullDoc
} from "@/app/actions/handson/all/crm/competitor";
import { verifyCrmRole } from "@/app/lib/roles";

import CompetitorMap from "@/components/custom/CompetitorMap";

// --- Schemas ---

const competitorSchema = z.object({
  competitor_name: z.string().min(2, "Name is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  competitor_type: z
    .enum(["Direct", "Primary", "Secondary", "Indirect"])
    .optional(),
  industry: z.string().optional(),
  threat_level: z.enum(["High", "Medium", "Low"]).optional(),
  year_founded: z.coerce.number().min(1900).optional(),
  number_of_employees: z.string().optional(),
  headquarters_location: z.string().optional(),
  company_overview: z.string().optional(),

  // Child Tables
  products_services: z
    .array(
      z.object({
        their_product_name: z.string().min(1, "Name required"),
        price_point: z.coerce.number().optional(),
        description: z.string().optional(),
        pricing_model: z.string().optional(),
      }),
    )
    .optional(),

  office_locations: z
    .array(
      z.object({
        location_name: z.string().min(1, "Name required"),
        location_type: z.string().optional(),
        location_geolocation: z.string().optional(), // JSON string or coords
      }),
    )
    .optional(),

  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
});

const industrySchema = z.object({
  industry_name: z.string().min(2, "Name is required"),
});

const PRICING_MODELS = {
  SUBSCRIPTION: "Subscription",
  ONE_TIME: "One-Time",
  FREEMIUM: "Freemium",
} as const;

export default function CompetitorPage() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [locTypes, setLocTypes] = useState<any[]>([]);
  const [mapRoutes, setMapRoutes] = useState<any[]>([]);
  const [mapZones, setMapZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [canEdit, setCanEdit] = useState(false);

  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<any | null>(null);
  const [isIndustryDialogOpen, setIsIndustryDialogOpen] = useState(false);

  // Forms
  const form = useForm<z.infer<typeof competitorSchema>>({
    resolver: zodResolver(competitorSchema),
    defaultValues: {
      competitor_name: "",
      competitor_type: "Direct",
      threat_level: "Medium",
      products_services: [],
      office_locations: [],
    },
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control: form.control,
    name: "products_services",
  });

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    control: form.control,
    name: "office_locations",
  });

  const industryForm = useForm<z.infer<typeof industrySchema>>({
    resolver: zodResolver(industrySchema),
    defaultValues: { industry_name: "" },
  });

  async function fetchData() {
    setLoading(true);
    try {
      const [compData, indData, locData, rData, zData] = await Promise.all([
        getCompetitors(),
        getIndustries(),
        getLocationTypes(),
        getCompetitorRoutes(),
        getCompetitorZones(),
        verifyCrmRole(),
      ]);
      setCompetitors(compData || []);
      setIndustries(indData || []);
      setLocTypes(locData || []);
      setMapRoutes(rData || []);
      setMapZones(zData || []);
      setCanEdit(!!(await verifyCrmRole())); // Re-verify or use the result from Promise.all if index matching
      // Actually, let's just make it separate or index 5 if added
      const roleCheck = await verifyCrmRole();
      setCanEdit(roleCheck);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const openDialog = async (competitor?: any) => {
    if (competitor) {
      setEditingCompetitor(competitor);
      try {
        const fullDoc = await getCompetitor(competitor.name);
        form.reset({
          competitor_name: fullDoc.competitor_name,
          website: fullDoc.website,
          competitor_type: fullDoc.competitor_type,
          industry: fullDoc.industry,
          threat_level: fullDoc.threat_level,
          year_founded: fullDoc.year_founded,
          number_of_employees: fullDoc.number_of_employees,
          headquarters_location: fullDoc.headquarters_location,
          company_overview: fullDoc.company_overview,
          products_services: fullDoc.products_services || [],
          office_locations: fullDoc.office_locations || [],
          strengths: fullDoc.strengths,
          weaknesses: fullDoc.weaknesses,
          notes: fullDoc.notes,
        });
      } catch (e) {
        toast.error("Failed to load details");
      }
    } else {
      setEditingCompetitor(null);
      form.reset({
        competitor_name: "",
        competitor_type: "Direct",
        threat_level: "Medium",
        products_services: [],
        office_locations: [],
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof competitorSchema>) => {
    try {
      if (editingCompetitor) {
        await updateCompetitor(editingCompetitor.name, values);
        toast.success("Competitor updated");
      } else {
        await createCompetitor(values);
        toast.success("Competitor created");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save competitor");
    }
  };

  const onDelete = async (name: string) => {
    if (!confirm("Delete this competitor?")) return;
    try {
      await deleteCompetitor(name);
      toast.success("Deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const onIndustrySubmit = async (values: z.infer<typeof industrySchema>) => {
    try {
      await createIndustry(values);
      toast.success("Industry created");
      setIsIndustryDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create industry");
    }
  };

  // Helper to open Google Maps
  const openMap = (geoString: string) => {
    if (!geoString) return;
    try {
      const geo = JSON.parse(geoString);
      // Assuming GeoJSON Point or simple [lat, lng] or {type: "FeatureCollection"...}
      // Frappe Geolocation field often returns: {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}}]}
      let lat, lng;
      if (geo.features && geo.features[0]?.geometry?.coordinates) {
        [lng, lat] = geo.features[0].geometry.coordinates;
      }
      if (lat && lng) {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          "_blank",
        );
      } else {
        toast.error("Invalid coordinates format");
      }
    } catch (e) {
      toast.error("Could not parse location data");
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
          <h1 className="text-3xl font-bold">{t('app.crm.competitor.title')}</h1>
          <p className="text-muted-foreground">
            {t('app.crm.competitor.desc')}
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => setIsIndustryDialogOpen(true)}
            >
              {t('app.crm.competitor.add_industry')}
            </Button>
          )}
          {canEdit && (
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" /> {t('app.crm.competitor.new_competitor')}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">{t('app.crm.competitor.list_view')}</TabsTrigger>
          <TabsTrigger value="map">{t('app.crm.competitor.map_view')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((comp) => (
              <Card
                key={comp.name}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {comp.competitor_name}
                    </CardTitle>
                     <CardDescription className="flex items-center mt-1">
                       <Building2 className="h-3 w-3 mr-1" />
                       {comp.industry || t('app.crm.competitor.unknown_industry')}
                     </CardDescription>
                  </div>
                   <Badge
                     variant={
                       comp.threat_level === "High"
                         ? "destructive"
                         : comp.threat_level === "Medium"
                           ? "secondary"
                           : "outline"
                     }
                   >
                     {t('app.crm.competitor.threat_label', { level: comp.threat_level })}
                   </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {comp.website && (
                      <div className="flex items-center text-blue-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate max-w-[200px]"
                        >
                          {comp.website}
                        </a>
                      </div>
                    )}
                    {comp.headquarters_location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {comp.headquarters_location}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    {canEdit && (
                      <>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openDialog(comp)}
                         >
                           <Pencil className="h-4 w-4 mr-2" /> {t('app.crm.competitor.edit')}
                         </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete(comp.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
             {competitors.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                 <p>{t('app.crm.competitor.no_competitors')}</p>
                 <Button variant="link" onClick={() => openDialog()}>
                   {t('app.crm.competitor.add_first')}
                 </Button>
               </div>
             )}
          </div>
        </TabsContent>

        <TabsContent
          value="map"
          className="mt-6 h-[700px] w-full border rounded-lg overflow-hidden bg-muted/10 relative"
        >
          {/* We need to aggregate all locations from all competitors for the master map.
                        However, getCompetitors only returns the main doc. We would need to fetch all locations.
                        For now, we will pass master routes and zones.
                        Ideally, we would create a getMapData action that mimics the backend get_map_data.
                    */}
          <CompetitorMap
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            masterRoutes={mapRoutes}
            masterZones={mapZones}
            // To show locations here, we'd need to fetch them all.
            // Since 'getCompetitors' list view is lightweight, we might not have them.
            // We can add a 'Load Locations' button on the map or fetch them separately if needed.
            // For now, let's show routes and zones which are master data.
          />
           <div className="absolute top-4 left-4 bg-white/90 p-4 rounded shadow-md text-sm max-w-xs backdrop-blur">
             <h4 className="font-semibold mb-2">{t('app.crm.competitor.map_legend')}</h4>
             <div className="space-y-1">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500/20 border border-blue-500"></div>{" "}
                 {t('app.crm.competitor.zones')}
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-1 bg-red-500"></div> {t('app.crm.competitor.primary_routes')}
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-1 bg-orange-500"></div> {t('app.crm.competitor.secondary_routes')}
               </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* --- Competitor Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               {editingCompetitor ? t('app.crm.competitor.edit_title') : t('app.crm.competitor.new_title')}
             </DialogTitle>
           </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general">
                 <TabsList className="grid w-full grid-cols-5">
                   <TabsTrigger value="general">{t('app.crm.competitor.tab_general')}</TabsTrigger>
                   <TabsTrigger value="details">{t('app.crm.competitor.tab_details')}</TabsTrigger>
                   <TabsTrigger value="products">{t('app.crm.competitor.tab_products')}</TabsTrigger>
                   <TabsTrigger value="locations">{t('app.crm.competitor.tab_locations')}</TabsTrigger>
                   <TabsTrigger value="analysis">{t('app.crm.competitor.tab_swot')}</TabsTrigger>
                 </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="competitor_name"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_name')}</FormLabel>
                           <FormControl>
                             <Input {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="website"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_website')}</FormLabel>
                           <FormControl>
                             <Input placeholder="https://..." {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="industry"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_industry')}</FormLabel>
                           <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder={t('common.select')} />
                               </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((ind) => (
                                <SelectItem key={ind.name} value={ind.name}>
                                  {ind.industry_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                     <FormField
                       control={form.control}
                       name="competitor_type"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_type')}</FormLabel>
                           <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                               <SelectContent>
                                 <SelectItem value="Direct">{t('app.crm.competitor.type_direct')}</SelectItem>
                                 <SelectItem value="Primary">{t('app.crm.competitor.type_primary')}</SelectItem>
                                 <SelectItem value="Secondary">
                                   {t('app.crm.competitor.type_secondary')}
                                 </SelectItem>
                                 <SelectItem value="Indirect">{t('app.crm.competitor.type_indirect')}</SelectItem>
                               </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="threat_level"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_threat')}</FormLabel>
                           <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                             <SelectContent>
                               <SelectItem value="High">{t('app.crm.competitor.threat_high')}</SelectItem>
                               <SelectItem value="Medium">{t('app.crm.competitor.threat_medium')}</SelectItem>
                               <SelectItem value="Low">{t('app.crm.competitor.threat_low')}</SelectItem>
                             </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="year_founded"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_founded')}</FormLabel>
                           <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                       control={form.control}
                       name="number_of_employees"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_employees')}</FormLabel>
                           <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder={t('common.select')} />
                               </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-1000">201-1000</SelectItem>
                              <SelectItem value="1000+">1000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                     control={form.control}
                     name="headquarters_location"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{t('app.crm.competitor.label_hq')}</FormLabel>
                          <FormControl>
                           <Input placeholder={t('app.crm.competitor.ph_hq')} {...field} />
                         </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                     control={form.control}
                     name="company_overview"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{t('app.crm.competitor.label_overview')}</FormLabel>
                         <FormControl>
                          <Textarea className="h-24" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                 <TabsContent value="products" className="space-y-4 mt-4">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="font-medium">{t('app.crm.competitor.label_products')}</h4>
                     <Button
                       type="button"
                       size="sm"
                       onClick={() => appendProduct({ their_product_name: "" })}
                     >
                       <Plus className="h-4 w-4 mr-1" /> {t('app.crm.competitor.btn_add')}
                     </Button>
                   </div>
                  <div className="space-y-3">
                    {productFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-2 items-start border p-3 rounded bg-muted/20"
                      >
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`products_services.${index}.their_product_name`}
                            render={({ field }) => (
                              <FormItem>
                                   <FormControl>
                                     <Input
                                       placeholder={t('app.crm.competitor.ph_product')}
                                       {...field}
                                     />
                                   </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`products_services.${index}.pricing_model`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                     <SelectTrigger>
                                       <SelectValue placeholder={t('app.crm.competitor.ph_model')} />
                                     </SelectTrigger>
                                  </FormControl>
                                    <SelectContent>
                                      <SelectItem value={PRICING_MODELS.SUBSCRIPTION}>
                                        {t('app.crm.competitor.model_subscription')}
                                      </SelectItem>
                                      <SelectItem value={PRICING_MODELS.ONE_TIME}>
                                        {t('app.crm.competitor.model_one_time')}
                                      </SelectItem>
                                      <SelectItem value={PRICING_MODELS.FREEMIUM}>
                                        {t('app.crm.competitor.model_freemium')}
                                      </SelectItem>
                                    </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`products_services.${index}.price_point`}
                            render={({ field }) => (
                              <FormItem>
                                   <FormControl>
                                     <Input
                                       type="number"
                                       placeholder={t('app.crm.competitor.ph_price')}
                                       {...field}
                                     />
                                   </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`products_services.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                   <FormControl>
                                     <Input placeholder={t('app.crm.competitor.ph_desc')} {...field} />
                                   </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                 <TabsContent value="locations" className="space-y-4 mt-4">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="font-medium">{t('app.crm.competitor.label_offices')}</h4>
                     <Button
                       type="button"
                       size="sm"
                       onClick={() => appendLocation({ location_name: "" })}
                     >
                       <Plus className="h-4 w-4 mr-1" /> {t('app.crm.competitor.btn_add')}
                     </Button>
                   </div>
                  <div className="space-y-3">
                    {locationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-2 items-center border p-3 rounded bg-muted/20"
                      >
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`office_locations.${index}.location_name`}
                            render={({ field }) => (
                              <FormItem>
                                 <FormControl>
                                   <Input
                                     placeholder={t('app.crm.competitor.ph_loc_name')}
                                     {...field}
                                   />
                                 </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`office_locations.${index}.location_type`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                 <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder={t('app.crm.competitor.label_loc_type')} />
                                   </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locTypes.map((t) => (
                                      <SelectItem key={t.name} value={t.name}>
                                        {t.location_type_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {field.location_geolocation && (
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() =>
                                 openMap(field.location_geolocation as string)
                               }
                             >
                               <Map className="h-3 w-3 mr-1" /> {t('app.crm.competitor.btn_view')}
                             </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLocation(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="strengths"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_strengths')}</FormLabel>
                           <FormControl>
                            <Textarea className="h-20" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                       control={form.control}
                       name="weaknesses"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_weaknesses')}</FormLabel>
                           <FormControl>
                            <Textarea className="h-20" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                     <FormField
                       control={form.control}
                       name="notes"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{t('app.crm.competitor.label_notes')}</FormLabel>
                           <FormControl>
                          <Textarea className="h-32" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

               <DialogFooter>
                 <Button type="submit">{t('app.crm.competitor.btn_save')}</Button>
               </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Industry Dialog --- */}
      <Dialog
        open={isIndustryDialogOpen}
        onOpenChange={setIsIndustryDialogOpen}
      >
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{t('app.crm.competitor.add_industry_title')}</DialogTitle>
           </DialogHeader>
          <Form {...industryForm}>
            <form
              onSubmit={industryForm.handleSubmit(onIndustrySubmit)}
              className="space-y-4"
            >
              <FormField
                control={industryForm.control}
                name="industry_name"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('app.crm.competitor.label_ind_name')}</FormLabel>
                     <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                 <Button type="submit">{t('app.crm.competitor.btn_create')}</Button>
               </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
