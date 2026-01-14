import React from "react";
import { Lock, Unlock, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string | boolean | number | null | undefined;
  type?: "default" | "ssl" | "bool";
  compact?: boolean;
  iconOnly?: boolean;
}

export const StatusBadge = ({ status, type = "default", compact = false, iconOnly = false }: StatusBadgeProps) => {
  let displayValue = "None";
  let variant = "default";

  if (typeof status === 'boolean') {
      displayValue = status ? "Yes" : "No";
  } else if (status === 1 || status === "1") {
      displayValue = "Yes";
  } else if (status === 0 || status === "0") {
      displayValue = "No";
  } else if (status) {
      displayValue = String(status);
  }

  // Determine variant/color/icon
  // FastPanelish styles:
  // SSL: Lock (Green), Unlock (Red/Gray)
  // Status: Play/Pause/Stop metaphors or colors

  const getIcon = () => {
      // SSL Context
      if (displayValue === 'Issued' || displayValue === "Let's Encrypt") return <Lock className="h-4 w-4" />;
      if (displayValue === 'None' || displayValue === 'Expired') return <Unlock className="h-4 w-4" />;

      // General Status
      if (displayValue === 'Active') return <CheckCircle className="h-4 w-4" />;
      if (displayValue === 'Suspended' || displayValue === 'Error') return <AlertCircle className="h-4 w-4" />;

      return <HelpCircle className="h-4 w-4" />;
  };

  const getColorClass = () => {
      switch (displayValue) {
          case 'Issued':
          case "Let's Encrypt":
          case 'Active':
          case 'Yes':
              return "bg-teal-500 text-white"; // FastPanel Greenish Teal
          case 'Suspended':
          case 'Error':
          case 'Expired':
              return "bg-red-500 text-white";
          case 'Pending':
              return "bg-yellow-500 text-white";
          case 'None':
          case 'No':
          case 'Inactive':
          default:
              return "bg-gray-500 text-white";
      }
  };

  const className = `inline-flex items-center justify-center rounded-md ${getColorClass()} ${iconOnly ? 'p-1.5' : 'px-2.5 py-0.5 text-xs font-semibold'}`;

  if (iconOnly) {
      return (
          <span className={className} title={displayValue}>
              {getIcon()}
          </span>
      );
  }

  return (
    <span className={className}>
      {!compact && displayValue}
    </span>
  );
};
