"use client";

import { useEffect, useState } from "react";
import { request } from "http";
import { Loader2, RefreshCw, Trash2, Plus, Pencil, X, LogIn } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
    getCompanySubscriptions,
    getSubscriptionPlans,
    getSubscriptionPlan,
    getSubscriptionSettings,
    getModuleDefs,
    getCustomers, // Added
    createCompanySubscription,
    updateCompanySubscription,
    deleteCompanySubscription,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    loginAsTenant
} from "@/app/actions/handson/control/subscriptions/subscriptions";
import { Badge } from "@/components/ui/badge";

// --- Schema Definitions ---

const subscriptionPlanSchema = z.object({
    plan_name: z.string().min(2, "Name must be at least 2 characters"),
    cost: z.coerce.number().min(0),
    currency: z.string().min(1, "Currency is required"),
    billing_interval: z.enum(["Monthly", "Yearly"]),
    billing_interval_count: z.coerce.number().min(1).default(1),
    trial_period_days: z.coerce.number().min(0).default(0),
    plan_category: z.string().optional(),
    monthly_token_limit: z.coerce.number().min(0).optional().describe("0 = Unlimited"), // Added Field
    is_per_seat_plan: z.boolean().default(false),
    base_user_count: z.coerce.number().min(1).default(1),
    modules: z.array(z.object({
        module: z.string().min(1, "Module is required")
    })).optional()
});

const companySubscriptionSchema = z.object({
    company: z.string().min(1, "Company is required"),
    plan: z.string().min(1, "Plan is required"),
    status: z.enum(["Active", "Trialing", "Past Due", "Canceled", "Unpaid"]),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export default function SubscriptionsPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);

    const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<any | null>(null);

    // --- Forms ---
    const planForm = useForm<z.infer<typeof subscriptionPlanSchema>>({
        resolver: zodResolver(subscriptionPlanSchema),
        defaultValues: {
            plan_name: "",
            cost: 0,
            currency: "ZAR",
            billing_interval: "Monthly",
            billing_interval_count: 1,
            trial_period_days: 0,
            monthly_token_limit: 0, // Default
            is_per_seat_plan: false,
            base_user_count: 1,
            modules: []
        }
    });

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: planForm.control,
        name: "modules"
    });

    const subForm = useForm<z.infer<typeof companySubscriptionSchema>>({
        resolver: zodResolver(companySubscriptionSchema),
        defaultValues: {
            status: "Active"
        }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [customersData, subscriptionsData, plansData, settingsData, modulesData] = await Promise.all([
                getCustomers(),
                getCompanySubscriptions(),
                getSubscriptionPlans(),
                getSubscriptionSettings(),
                getModuleDefs()
            ]);
            setCustomers(customersData || []);
            setSubscriptions(subscriptionsData || []);
            setPlans(plansData || []);
            setSettings(settingsData || []);
            setModules(modulesData || []);
        } catch (error) {
            console.error("Error fetching subscription data:", error);
            toast.error("Failed to fetch subscription data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // --- Plan Handlers ---

    const openPlanDialog = async (plan?: any) => {
        if (plan) {
            setEditingPlan(plan);
            // Fetch full details including child table
            try {
                const fullPlan = await getSubscriptionPlan(plan.name);
                planForm.reset({
                    plan_name: fullPlan.plan_name,
                    cost: fullPlan.cost,
                    currency: fullPlan.currency,
                    billing_interval: fullPlan.billing_interval,
                    billing_interval_count: fullPlan.billing_interval_count,
                    trial_period_days: fullPlan.trial_period_days,
                    plan_category: fullPlan.plan_category,
                    monthly_token_limit: fullPlan.monthly_token_limit || 0, // Populate
                    is_per_seat_plan: !!fullPlan.is_per_seat_plan,
                    base_user_count: fullPlan.base_user_count,
                    modules: fullPlan.modules || []
                });
            } catch (e) {
                toast.error("Failed to load plan details");
                return;
            }
        } else {
            setEditingPlan(null);
            planForm.reset({
                plan_name: "",
                cost: 0,
                currency: "ZAR",
                billing_interval: "Monthly",
                billing_interval_count: 1,
                trial_period_days: 0,
                monthly_token_limit: 0,
                is_per_seat_plan: false,
                base_user_count: 1,
                modules: []
            });
        }
        setIsPlanDialogOpen(true);
    };

    const onPlanSubmit = async (values: z.infer<typeof subscriptionPlanSchema>) => {
        try {
            if (editingPlan) {
                await updateSubscriptionPlan(editingPlan.name, values);
                toast.success("Plan updated");
            } else {
                await createSubscriptionPlan(values);
                toast.success("Plan created");
            }
            setIsPlanDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save plan");
        }
    };

    const onDeletePlan = async (name: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await deleteSubscriptionPlan(name);
            toast.success("Plan deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete plan");
        }
    };

    // --- Subscription Handlers ---

    const openSubDialog = (customerName?: string, sub?: any) => {
        if (sub) {
            setEditingSub(sub);
            subForm.reset({
                company: sub.company,
                plan: sub.plan,
                status: sub.status,
                start_date: sub.start_date,
                end_date: sub.end_date
            });
        } else {
            setEditingSub(null);
            subForm.reset({
                company: customerName || "",
                status: "Active"
            });
        }
        setIsSubDialogOpen(true);
    };

    const onSubSubmit = async (values: z.infer<typeof companySubscriptionSchema>) => {
        try {
            if (editingSub) {
                await updateCompanySubscription(editingSub.name, values);
                toast.success("Subscription updated");
            } else {
                await createCompanySubscription(values);
                toast.success("Subscription created");
            }
            setIsSubDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save subscription");
        }
    };

    const onDeleteSub = async (name: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await deleteCompanySubscription(name);
            toast.success("Subscription deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete subscription");
        }
    };


    const handleLoginAs = async (companyName: string) => {
        try {
            const res = await loginAsTenant(companyName);
            if (res.success && res.url) {
                window.open(res.url, "_blank");
                toast.success(`Logged in as ${companyName}`);
            }
        } catch (error) {
            toast.error("Failed to login as tenant");
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
        <div className="space-y-8">
            <Tabs defaultValue="customers">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Subscription Control</h1>
                    <TabsList>
                        <TabsTrigger value="customers">Customers</TabsTrigger>
                        <TabsTrigger value="plans">Plans</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Subscriptions</CardTitle>
                            <CardDescription>Manage subscriptions for all active customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Renewal</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No customers found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map((customer) => {
                                            const sub = subscriptions.find(s => s.company === customer.name);
                                            return (
                                                <TableRow key={customer.name}>
                                                    <TableCell className="font-medium">
                                                        <div>{customer.customer_name}</div>
                                                        <div className="text-xs text-muted-foreground">{customer.name}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub ? <Badge variant="outline">{sub.plan}</Badge> : <span className="text-muted-foreground">-</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub ? (
                                                            <Badge className={
                                                                sub.status === 'Active' ? 'bg-green-600' :
                                                                    sub.status === 'Past Due' ? 'bg-red-600' :
                                                                        'bg-gray-500'
                                                            }>{sub.status}</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">No Active Plan</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub?.end_date ? format(new Date(sub.end_date), 'MMM dd, yyyy') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" title="Login as Tenant" onClick={() => handleLoginAs(customer.name)}>
                                                            <LogIn className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openSubDialog(customer.name, sub)}>
                                                            {sub ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                        </Button>
                                                        {sub && (
                                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDeleteSub(sub.name)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}

                                </TableBody >
                            </Table >
                        </CardContent >
                    </Card >
                </TabsContent >

                {/* --- Plans Tab --- */}
                <TabsContent value="plans" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => openPlanDialog()}><Plus className="mr-2 h-4 w-4" /> New Plan</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Plans</CardTitle>
                            <CardDescription>Available subscription packages and their included modules.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Billing</TableHead>
                                        <TableHead>Trial</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No plans found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        plans.map((plan) => (
                                            <TableRow key={plan.name}>
                                                <TableCell className="font-medium">{plan.plan_name || plan.name}</TableCell>
                                                <TableCell>{plan.currency} {plan.cost}</TableCell>
                                                <TableCell>{plan.billing_interval}</TableCell>
                                                <TableCell>{plan.trial_period_days > 0 ? `${plan.trial_period_days} Days` : "None"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => openPlanDialog(plan)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDeletePlan(plan.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent >

                {/* --- Settings Tab --- */}
                <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Settings</CardTitle>
                            <CardDescription>Global subscription configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Default Currency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {settings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        settings.map((setting) => (
                                            <TableRow key={setting.name}>
                                                <TableCell className="font-medium">{setting.name}</TableCell>
                                                <TableCell>{setting.default_currency}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent >
            </Tabs >

            {/* --- Plan Dialog --- */}
            < Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen} >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                        <DialogDescription>Define the subscription plan details and included modules.</DialogDescription>
                    </DialogHeader>
                    <Form {...planForm}>
                        <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={planForm.control} name="plan_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. Gold Tier" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={planForm.control} name="plan_category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl><Input placeholder="e.g. Standard" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={planForm.control} name="cost" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={planForm.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl><Input placeholder="ZAR" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={planForm.control} name="billing_interval" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Interval</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select interval" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={planForm.control} name="trial_period_days" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trial Days</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="p-4 border rounded-md bg-muted/20">
                                <FormField control={planForm.control} name="monthly_token_limit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Token Limit (AI/Flash)</FormLabel>
                                        <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl>
                                        <FormDescription>Limit for AI Flash/Standard Usage (0 = Unlimited). Set this for PaaS credit limits.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <FormField control={planForm.control} name="is_per_seat_plan" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between w-full space-y-0">
                                        <div className="space-y-0.5">
                                            <FormLabel>Per-Seat Pricing</FormLabel>
                                            <FormDescription>Charge based on number of users?</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            {planForm.watch("is_per_seat_plan") && (
                                <FormField control={planForm.control} name="base_user_count" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base User Count (Included)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            {/* --- Modules Child Table --- */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium">Included Modules</h4>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendModule({ module: "" })}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Module
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {moduleFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField control={planForm.control} name={`modules.${index}.module`} render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select module" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {modules.map((m) => (
                                                                <SelectItem key={m.name} value={m.name}>{m.app_name} ({m.name})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(index)}>
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                    {moduleFields.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-md">
                                            No modules added.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Save Plan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog >

            {/* --- Subscription Dialog --- */}
            < Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSub ? "Edit Subscription" : "New Subscription"}</DialogTitle>
                    </DialogHeader>
                    <Form {...subForm}>
                        <form onSubmit={subForm.handleSubmit(onSubSubmit)} className="space-y-4">
                            <FormField control={subForm.control} name="company" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl><Input placeholder="Company Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={subForm.control} name="plan" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {plans.map((p) => (
                                                <SelectItem key={p.name} value={p.name}>{p.plan_name || p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={subForm.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Trialing">Trialing</SelectItem>
                                            <SelectItem value="Past Due">Past Due</SelectItem>
                                            <SelectItem value="Canceled">Canceled</SelectItem>
                                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <DialogFooter>
                                <Button type="submit">Save Subscription</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog >
        </div >
    );
}
