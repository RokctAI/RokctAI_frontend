"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function VisitorTracker() {
  const { data: session } = useSession();
  const lastReported = useRef<{ uuid: string | null; email: string | null }>({ uuid: null, email: null });

  useEffect(() => {
    // Generate or retrieve persistent visitor UUID
    let visitorUuid = localStorage.getItem("visitor_uuid");
    if (!visitorUuid) {
      // Fallback simple UUID generator if crypto.randomUUID is not available
      if (typeof crypto.randomUUID === "function") {
        visitorUuid = crypto.randomUUID();
      } else {
        visitorUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem("visitor_uuid", visitorUuid);
    }

    const currentEmail = session?.user?.email || "";

    // Only report if UUID or user email state changed (e.g., transition from guest to logged-in)
    if (lastReported.current.uuid !== visitorUuid || lastReported.current.email !== currentEmail) {
      lastReported.current = { uuid: visitorUuid, email: currentEmail };

      fetch("/api/visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitor_id: visitorUuid }),
      }).catch((err) => {
        console.error("Failed to report unique visit:", err);
      });
    }
  }, [session]);

  return null;
}
