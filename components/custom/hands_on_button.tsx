"use client";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "../ui/button";

export const HandsOnButton = ({ canUseAI = true }: { canUseAI?: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isHandsOnPage = pathname === "/handson";

  const handleClick = () => {
    if (isHandsOnPage) {
      if (canUseAI) {
        router.push("/");
      } else {
        // Logic for upgrade (placeholder)
        toast.info("Upgrade Required", {
          description: "You need to upgrade your plan or add seats/quota to enable AI."
        });
      }
    } else {
      router.push("/handson");
    }
  };

  let label = "Hands-On";
  if (isHandsOnPage) {
    label = canUseAI ? "Auto" : "Upgrade";
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      <div className="w-full text-left px-1 py-0.5">
        {label}
      </div>
    </Button>
  );
};
