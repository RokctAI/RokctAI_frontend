import React from "react";

export const StatCard = ({ title, used, limit, icon: Icon, unit = "" }: any) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const color = percentage > 90 ? "bg-red-500" : "bg-blue-600";

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="content">
        <div className="text-2xl font-bold">{used} <span className="text-sm font-normal text-muted-foreground">/ {limit} {unit}</span></div>
        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};
