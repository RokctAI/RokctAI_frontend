"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCard = AnalyticsCard;
var react_1 = require("react");
var recharts_1 = require("recharts");
function AnalyticsCard(_a) {
    var data = _a.data, title = _a.title;
    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-sm">No data available for analytics.</div>;
    }
    var COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return (<div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm">
            <h3 className="font-bold text-white text-sm mb-4">{title}</h3>

            <div className="h-48 w-full">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                    <recharts_1.BarChart data={data}>
                        <recharts_1.XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false}/>
                        <recharts_1.YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false}/>
                        <recharts_1.Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#e4e4e7' }}/>
                        <recharts_1.Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={COLORS[index % COLORS.length]}/>); })}
                        </recharts_1.Bar>
                    </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
            </div>

            <div className="mt-2 text-xs text-zinc-500 text-center">
                Top Departments by Leave Days (YTD)
            </div>
        </div>);
}
