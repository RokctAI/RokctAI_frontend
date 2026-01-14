"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsData {
    name: string;
    value: number;
}

export function AnalyticsCard({ data, title }: { data: AnalyticsData[], title: string }) {
    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-sm">No data available for analytics.</div>;
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm">
            <h3 className="font-bold text-white text-sm mb-4">{title}</h3>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#e4e4e7' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 text-xs text-zinc-500 text-center">
                Top Departments by Leave Days (YTD)
            </div>
        </div>
    );
}
