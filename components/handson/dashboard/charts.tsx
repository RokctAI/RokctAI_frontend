"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface ChartData {
    name: string;
    value: number;
    color?: string;
}

interface DashboardChartProps {
    title: string;
    description?: string;
    type: "bar" | "area" | "pie" | "metric";
    data: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DashboardChart({ title, description, type, data }: DashboardChartProps) {
    if (type === "metric") {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data[0]?.value || 0}</div>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 min-h-[300px] flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    {type === "bar" ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                    ) : type === "pie" ? (
                        <PieChart>
                            <Tooltip />
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} className="text-primary" />
                                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} className="text-primary" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="currentColor"
                                fillOpacity={1}
                                fill={`url(#colorValue-${title})`}
                                className="text-primary stroke-primary"
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
