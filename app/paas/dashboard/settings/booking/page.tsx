"use client";

import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getShopSections,
  createShopSection,
  updateShopSection,
  deleteShopSection,
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from "@/app/actions/paas/booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import t from "@/app/lib/i18n";

export default function BookingSettingsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Dialog States
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState(4);

  async function fetchSections() {
    try {
      const data = await getShopSections();
      setSections(data || []);
      if (data && data.length > 0 && !selectedSection) {
        setSelectedSection(data[0].name);
      }
    } catch (error) {
      toast.error("Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchTables(selectedSection);
    }
  }, [selectedSection]);

  async function fetchTables(sectionId: string) {
    setLoadingTables(true);
    try {
      const data = await getTables(sectionId);
      setTables(data || []);
    } catch (error) {
      toast.error("Failed to fetch tables");
    } finally {
      setLoadingTables(false);
    }
  }

  async function handleCreateSection() {
    try {
      await createShopSection({ section_name: sectionName });
      toast.success("Section created");
      setIsSectionDialogOpen(false);
      setSectionName("");
      fetchSections();
    } catch (error) {
      toast.error("Failed to create section");
    }
  }

  async function handleDeleteSection(name: string) {
    if (!confirm("Are you sure? This will delete all tables in this section."))
      return;
    try {
      await deleteShopSection(name);
      toast.success("Section deleted");
      fetchSections();
      if (selectedSection === name) setSelectedSection(null);
    } catch (error) {
      toast.error("Failed to delete section");
    }
  }

  async function handleCreateTable() {
    if (!selectedSection) return;
    try {
      await createTable({
        table_name: tableName,
        seating_capacity: tableSeats,
        shop_section: selectedSection,
      });
      toast.success("Table created");
      setIsTableDialogOpen(false);
      setTableName("");
      setTableSeats(4);
      fetchTables(selectedSection);
    } catch (error) {
      toast.error("Failed to create table");
    }
  }

  async function handleDeleteTable(name: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTable(name);
      toast.success("Table deleted");
      if (selectedSection) fetchTables(selectedSection);
    } catch (error) {
      toast.error("Failed to delete table");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">{t('app.paas.dashboard.settings.booking.title')}</h1>
           <p className="text-muted-foreground">
             {t('app.paas.dashboard.settings.booking.desc')}
           </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sections List */}
        <Card className="md:col-span-1">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-lg font-medium">{t('app.paas.dashboard.settings.booking.zones_title')}</CardTitle>
             <Dialog
               open={isSectionDialogOpen}
               onOpenChange={setIsSectionDialogOpen}
             >
               <DialogTrigger asChild>
                 <Button size="sm" variant="outline">
                   <Plus className="size-4" />
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>{t('app.paas.dashboard.settings.booking.dialog_zone_title')}</DialogTitle>
                   <DialogDescription>
                     {t('app.paas.dashboard.settings.booking.dialog_zone_desc')}
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label>{t('app.paas.dashboard.settings.booking.label_zone_name')}</Label>
                     <Input
                       value={sectionName}
                       onChange={(e) => setSectionName(e.target.value)}
                       placeholder={t('app.paas.dashboard.settings.booking.ph_zone_name')}
                     />
                   </div>
                 </div>
                 <DialogFooter>
                   <Button onClick={handleCreateSection}>{t('app.paas.dashboard.settings.booking.btn_create_zone')}</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.name}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    selectedSection === section.name
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedSection(section.name)}
                >
                  <span className="font-medium">{section.section_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.name);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
               {sections.length === 0 && (
                 <p className="text-sm text-muted-foreground text-center py-4">
                   {t('app.paas.dashboard.settings.booking.no_zones')}
                 </p>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Tables List */}
        <Card className="md:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-lg font-medium">
               {t('app.paas.dashboard.settings.booking.tables_title')}{" "}
               {selectedSection &&
               sections.find((s) => s.name === selectedSection)
                 ? `- ${sections.find((s) => s.name === selectedSection).section_name}`
                 : ""}
             </CardTitle>
             <Dialog
               open={isTableDialogOpen}
               onOpenChange={setIsTableDialogOpen}
             >
               <DialogTrigger asChild>
                 <Button size="sm" disabled={!selectedSection}>
                   <Plus className="mr-2 size-4" />
                   {t('app.paas.dashboard.settings.booking.btn_add_table')}
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>{t('app.paas.dashboard.settings.booking.dialog_table_title')}</DialogTitle>
                   <DialogDescription>
                     {t('app.paas.dashboard.settings.booking.dialog_table_desc')}
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label>{t('app.paas.dashboard.settings.booking.label_table_name')}</Label>
                     <Input
                       value={tableName}
                       onChange={(e) => setTableName(e.target.value)}
                       placeholder={t('app.paas.dashboard.settings.booking.ph_table_name')}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>{t('app.paas.dashboard.settings.booking.label_seats')}</Label>
                     <Input
                       type="number"
                       value={tableSeats}
                       onChange={(e) => setTableSeats(parseInt(e.target.value))}
                       min={1}
                     />
                   </div>
                 </div>
                 <DialogFooter>
                   <Button onClick={handleCreateTable}>{t('app.paas.dashboard.settings.booking.btn_create_table')}</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           </CardHeader>
          <CardContent className="pt-4">
            {loadingTables ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="border rounded-lg p-4 flex flex-col items-center justify-center gap-2 relative group hover:border-primary transition-colors"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteTable(table.name)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-full">
                      <span className="text-lg font-bold">
                        {table.table_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {table.seating_capacity} Seats
                    </p>
                  </div>
                ))}
                 {tables.length === 0 && (
                   <div className="col-span-full text-center py-8 text-muted-foreground">
                     {t('app.paas.dashboard.settings.booking.no_tables')}
                   </div>
                 )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
