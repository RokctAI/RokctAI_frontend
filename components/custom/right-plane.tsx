import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import {
  StickyNote, CheckSquare,
  Briefcase, ShieldAlert, List, Calendar as CalendarIcon,
  FileText, Waypoints, LayoutGrid
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCalendarEvents, CalendarEvent } from "@/app/actions/handson/all/workspace/calendar";
import { getPendingApprovals } from "@/app/actions/handson/all/hrms/dashboard";
import { cn } from "@/lib/utils";
import { getActiveQuotations } from "@/app/actions/handson/all/accounting/selling/quotation";
import { Sidebar, SidebarRail, useSidebar, SidebarProvider } from "@/components/ui/sidebar";

interface RightPaneProps extends React.ComponentProps<typeof Sidebar> {
  activeModule: string;
  isDemo?: boolean;
  demoTasks?: any[];
}

function RightPlaneContent({ activeModule, isDemo = false, demoTasks = [], ...props }: RightPaneProps) {
  const { data: session } = useSession();
  const { setOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(!isDemo);

  React.useEffect(() => {
    if (isDemo) {
      // Force closed state immediately (hidden by opacity:0)
      setOpen(false);

      const t1 = setTimeout(() => setIsVisible(true), 1000);
      const t2 = setTimeout(() => setOpen(true), 1400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isDemo, setOpen]);

  const [activeTab, setActiveTab] = useState("context");
  const [attendance, setAttendance] = useState<{ status: string; nextAction: string } | null>(null);

  // Real Data States
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [approvals, setApprovals] = useState<DocumentItem[]>([]);
  const [quotations, setQuotations] = useState<DocumentItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // ... (isHrManager logic similar to before)
  const roles = (session?.user as any)?.roles || [];
  const isHrManager = isDemo ? true : (roles.includes("HR Manager") || roles.includes("System Manager"));

  React.useEffect(() => {
    if (isDemo) {
      setAttendance({ status: "Checked In", nextAction: "Check Out" });
      return;
    }
    async function fetchStatus() {
      try {
        const { getAttendanceStatus } = await import("@/app/actions/ai/hr");
        const res = await getAttendanceStatus();
        if (res.success && res.status) {
          setAttendance({ status: res.status, nextAction: res.nextAction });
        }
      } catch (e) {
        console.error("Failed to fetch status", e);
      }
    }
    fetchStatus();
  }, [isDemo]);

  // Use separate effect for module data
  React.useEffect(() => {
    // Note: removed isOpen check as Sidebar handles visibility mounting usually? 
    // Actually typically context open/closed logic. Data fetching should persist.
    // I removed 'isOpen' prop.

    if (isDemo) {
      if (activeModule === "HR") {
        setApprovals([
          { id: "LR-2024-001", title: "Leave Application", subtitle: "Sick Leave", status: "Pending", date: "Today" },
          { id: "EA-2024-005", title: "Expense Claim", subtitle: "Travel", status: "Review", date: "Yesterday" }
        ]);
      } else if (activeModule === "SCM") {
        setQuotations([
          { id: "QT-2024-101", title: "Server Hardware", subtitle: "Dell Corp", status: "Draft", date: "Today" }
        ]);
      }
      return;
    }

    async function loadModuleData() {
      setLoading(true);
      try {
        if (activeModule === "HR") {
          const data = await getPendingApprovals();
          setApprovals(data);
        } else if (activeModule === "SCM") {
          const data = await getActiveQuotations();
          setQuotations(data);
        }
      } catch (e) {
        console.error("Failed to load module data", e);
      } finally {
        setLoading(false);
      }
    }
    loadModuleData();
  }, [activeModule, isDemo]);

  // Fetch Events when tab is switched to calendar
  React.useEffect(() => {
    if (activeTab === 'calendar') {
      loadEvents();
    }
  }, [activeTab]);

  async function loadEvents() {
    setCalendarLoading(true);
    if (isDemo) {
      setEvents([
        { subject: "Product Demo", starts_on: "2024-01-01 10:00", location: "Online", event_type: "Meeting" },
        { subject: "Team Sync", starts_on: "2024-01-01 14:00", location: "Office", event_type: "Internal" }
      ]);
      setCalendarLoading(false);
      return;
    }
    const res = await getCalendarEvents();
    if (res.success) {
      setEvents(res.events);
    }
    setCalendarLoading(false);
  }

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className={cn("!overflow-visible !absolute right-0 top-0 bottom-0 !flex-row border-l border-border/30 bg-background z-50", isVisible ? "opacity-100" : "opacity-0", props.className)}
      style={{ "--sidebar-width-icon": "3.6rem", "--sidebar-width": "20rem", ...props.style } as React.CSSProperties}
      {...props}
    >
      <Tabs defaultValue="context" value={activeTab} onValueChange={setActiveTab} className="flex flex-row h-full w-full">

        {/* Main Content Area - Hidden when collapsed */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden group-data-[collapsible=icon]:hidden">
          {/* Header with Status */}
          <div className="border-b px-4 py-3 flex items-center justify-between h-14 shrink-0">
            <span className="font-semibold text-sm">
              {activeTab === 'context' && "Data"}
              {activeTab === 'notes' && "Notes"}
              {activeTab === 'tasks' && "Tasks"}
              {activeTab === 'calendar' && "Calendar"}
            </span>
            {attendance && (
              <div title={`You are ${attendance.status}`}>
                <div className={`h-3 w-3 rounded-full ${attendance.status === 'Checked In' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="context" className="m-0 h-full data-[state=inactive]:hidden">
              {activeModule === "HR" && (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b bg-muted/20">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      {isHrManager ? "Pending Approvals" : "My Requests"}
                    </h3>
                  </div>
                  {loading ? <div className="p-4 text-xs text-muted-foreground">Loading...</div> : (
                    <div className="divide-y">
                      {approvals.length === 0 ? <div className="p-4 text-xs text-muted-foreground">No pending approvals</div> : approvals.map((doc) => (
                        <div key={doc.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm text-primary group-hover:underline">{doc.id}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">{doc.status}</Badge>
                          </div>
                          <div className="text-xs font-medium">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">{doc.subtitle}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">{doc.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModule === "SCM" && (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b bg-muted/20">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      Active Quotations
                    </h3>
                  </div>
                  {loading ? <div className="p-4 text-xs text-muted-foreground">Loading...</div> : (
                    <div className="divide-y">
                      {quotations.length === 0 ? <div className="p-4 text-xs text-muted-foreground">No active quotations</div> : quotations.map((doc) => (
                        <div key={doc.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm text-primary group-hover:underline">{doc.id}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">{doc.status}</Badge>
                          </div>
                          <div className="text-xs font-medium">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">{doc.subtitle}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">{doc.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModule === "CRM" && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No active deals.
                </div>
              )}

              {!["HR", "CRM", "SCM"].includes(activeModule) && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Select a module to see relevant data.
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="m-0 h-full p-4 data-[state=inactive]:hidden">
              <h3 className="font-semibold text-lg mb-2">My Notes</h3>
              <div className="text-sm text-muted-foreground">
                No active notes. Click to add.
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="m-0 h-full p-4 data-[state=inactive]:hidden">
              <h3 className="font-semibold text-lg mb-2">My Tasks</h3>
              {demoTasks.length > 0 ? (
                <div className="divide-y border rounded-md">
                  {demoTasks.map((t) => (
                    <div key={t.data.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{t.data.name}</span>
                        <Badge variant={t.data.priority === 'critical' ? 'destructive' : 'default'} className="text-[10px] uppercase">
                          {t.data.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Due: {t.data.end_date.split('T')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active tasks.
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="m-0 h-full data-[state=inactive]:hidden">
              <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-red-500" />
                  Upcoming Events
                </h3>
                <Badge variant="secondary" className="text-[10px]">{events.length}</Badge>
              </div>
              {calendarLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No upcoming events.</div>
              ) : (
                <div className="divide-y">
                  {events.map((evt, i) => (
                    <div key={i} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-primary">{evt.subject}</span>
                        {evt.event_type && <Badge variant="outline" className="text-[10px] px-1 py-0">{evt.event_type}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{evt.starts_on.split(' ')[0]} • {evt.starts_on.split(' ')[1]}</div>
                      {evt.location && <div className="text-[10px] text-muted-foreground">📍 {evt.location}</div>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </div>

        {/* Right Icon Strip - Always visible */}
        <div className="flex flex-col bg-muted/10 backdrop-blur-sm w-full py-6 items-center">
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-6">

            <TabsTrigger value="calendar" className="group relative w-10 h-10 rounded-2xl data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-primary transition-all p-0 hover:bg-muted/20">
              <CalendarIcon className="h-5 w-5 text-muted-foreground group-data-[state=active]:text-primary" />
            </TabsTrigger>

            <TabsTrigger value="notes" className="group relative w-10 h-10 rounded-2xl data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-primary transition-all p-0 hover:bg-muted/20">
              <FileText className="h-5 w-5 text-muted-foreground group-data-[state=active]:text-primary" />
            </TabsTrigger>

            <TabsTrigger value="tasks" className="group relative w-10 h-10 rounded-2xl data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-primary transition-all p-0 hover:bg-muted/20">
              <Waypoints className="h-5 w-5 text-muted-foreground group-data-[state=active]:text-primary" />
            </TabsTrigger>

            <div className="w-8 h-[1px] bg-border/50 my-1" />

            <TabsTrigger value="context" className="group relative w-10 h-10 rounded-2xl data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-primary transition-all p-0 hover:bg-muted/20">
              <LayoutGrid className="h-5 w-5 text-muted-foreground group-data-[state=active]:text-primary" />
            </TabsTrigger>

          </TabsList>
        </div>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

export function RightPlane(props: RightPaneProps) {
  return (
    <SidebarProvider defaultOpen={false} storageKey="right-plane-sidebar" className="!absolute right-0 top-0 bottom-0 w-auto pointer-events-none bg-transparent">
      <RightPlaneContent {...props} className="pointer-events-auto" />
    </SidebarProvider>
  )
}

