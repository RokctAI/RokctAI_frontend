"use client"

import { useState } from "react"
import { toast } from "sonner"
import { toggleBetaMode } from "@/app/actions/handson/control/system/global-settings"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function BetaToggle({ initialState }: { initialState: boolean }) {
    const [isBeta, setIsBeta] = useState(initialState)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const result = await toggleBetaMode()
            if (result.success) {
                setIsBeta(result.isBetaMode!)
                toast.success(`Beta mode ${result.isBetaMode ? "enabled" : "disabled"}`)
            } else {
                toast.error("Failed to toggle beta mode")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id="beta-mode"
                checked={isBeta}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
            <Label htmlFor="beta-mode">Beta Mode</Label>
        </div>
    )
}
