"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap, CheckCircle, AlertCircle, Info } from "lucide-react";
import React, { useEffect, useState, ReactNode } from "react";
import { aiStore } from "@/lib/ai-notification-store";
import { AI_MODELS } from "@/ai/models";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";

interface AiStatusPillProps {
    className?: string;
    defaultText?: string;
    defaultIcon?: ReactNode;
}

export function AiStatusPill({
    className,
    defaultText = `${AI_MODELS.PAID.id.replace(/-/g, " ")} is live on ${PLATFORM_NAME}`,
    defaultIcon = <Zap className="size-4 text-yellow-500 fill-yellow-500" />
}: AiStatusPillProps) {

    const [isExpanded, setIsExpanded] = useState(true);
    const [currentNotification, setCurrentNotification] = useState<{ text: string; icon: ReactNode; type?: string } | null>(null);
    const [queue, setQueue] = useState(aiStore.getQueue());

    // Subscribe to store
    useEffect(() => {
        return aiStore.subscribe((newQueue) => {
            setQueue(newQueue);
        });
    }, []);

    // Logic to swap content when collapsed
    useEffect(() => {
        if (!isExpanded) {
            // When collapsing, check if we have something new to show next expansion
            if (queue.length > 0) {
                // Pick next item
                const item = queue[0];

                // Determine Icon based on Type if not provided
                let icon = item.icon;
                if (!icon) {
                    if (item.type === "success") icon = <CheckCircle className="size-4 text-green-500" />;
                    else if (item.type === "alert") icon = <AlertCircle className="size-4 text-red-500" />;
                    else icon = <Info className="size-4 text-blue-500" />;
                }

                setCurrentNotification({ text: item.text, icon: icon, type: item.type });

                // Consume
                aiStore.consume();
            } else {
                // Reset to default if empty
                setCurrentNotification(null);
            }
        }
    }, [isExpanded, queue, defaultIcon]);

    // Animation Loop - PAUSE if showing an ALERT
    useEffect(() => {
        const interval = setInterval(() => {
            // If current notification is ALERT, do not collapse.
            if (currentNotification?.type === 'alert') {
                setIsExpanded(true); // Ensure expanded
                return;
            }
            setIsExpanded((prev) => !prev);
        }, 4000); // 4 Seconds cycle
        return () => clearInterval(interval);
    }, [currentNotification]);

    // Dismiss Handler
    const handleDismiss = () => {
        if (currentNotification?.type === 'alert') {
            // Clear current notification manually so the loop can resume
            setCurrentNotification(null);
            setIsExpanded(false); // Collapse to trigger next cycle
        }
    };

    // Determine what to show
    const iconToShow = currentNotification ? currentNotification.icon : defaultIcon;
    const textToShow = currentNotification ? currentNotification.text : defaultText;

    // Dynamic Gradient/Background
    let bgClass = "bg-gradient-to-r from-yellow-400 to-orange-500";
    if (currentNotification?.type === "success") bgClass = "bg-gradient-to-r from-green-400 to-emerald-500";
    if (currentNotification?.type === "alert") bgClass = "bg-gradient-to-r from-red-400 to-rose-500";

    return (
        <div
            className={`relative group cursor-default ${className || ""}`}
            onClick={handleDismiss} // Add click handler
            role={currentNotification?.type === 'alert' ? "button" : undefined}
        >
            <div className={`absolute -inset-0.5 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${bgClass}`}></div>

            <motion.div
                layout
                className="relative bg-white dark:bg-black rounded-full flex items-center justify-center overflow-hidden"
                style={{ height: '32px' }}
                initial={{ width: "auto" }}
                animate={{ width: isExpanded ? "auto" : "32px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            >
                {/* Icon - Always Visible */}
                <div className="flex items-center justify-center h-full px-2 shrink-0">
                    {iconToShow}
                </div>

                {/* Text - Animates width/opacity */}
                <motion.div
                    className="whitespace-nowrap overflow-hidden flex items-center"
                    initial={{ width: "auto", opacity: 1 }}
                    animate={{
                        width: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0,
                        paddingRight: isExpanded ? "12px" : 0
                    }}
                >
                    <span className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-medium capitalize">
                        {currentNotification ? currentNotification.text : defaultText}
                    </span>
                    {currentNotification?.type === 'alert' && (
                        <span className="ml-2 text-[10px] text-muted-foreground border border-red-200 rounded px-1">Dismiss</span>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
