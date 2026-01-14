"use client";

import { useState, useEffect } from "react";
import { createAiCompetitor } from "@/app/actions/ai/competitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, CheckCircle, AlertCircle } from "lucide-react";

interface CompetitorFormProps {
    name?: string;
    onCallback?: (result: any) => void;
}

export function CompetitorForm({ name, onCallback }: CompetitorFormProps) {
    const [formData, setFormData] = useState({
        name: name || "",
        industry: "",
        website: "",
        threat_level: "Low"
    });
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Auto-fetch location on mount
        if ("geolocation" in navigator) {
            setLocStatus("loading");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocStatus("success");
                },
                (error) => {
                    console.error("Location Error", error);
                    setLocStatus("error");
                }
            );
        } else {
            setLocStatus("error");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        const payload = {
            ...formData,
            latitude: location?.lat,
            longitude: location?.lng
        };

        const result = await createAiCompetitor(payload);

        if (result.success) {
            setStatus("success");
            setMessage(result.message || "Competitor added.");
            if (onCallback) onCallback(result);
        } else {
            setStatus("error");
            setMessage(result.error || "Failed to add competitor.");
        }
    };

    if (status === "success") {
        return (
            <Card className="w-full max-w-md bg-green-50 border-green-200">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <h3 className="font-semibold text-green-800">Competitor Added</h3>
                    <p className="text-sm text-green-700">{message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadown-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Add Competitor
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Location Status Badge */}
                    <div className="flex items-center gap-2 text-sm p-2 rounded bg-slate-100">
                        {locStatus === "loading" && <><Loader2 className="h-3 w-3 animate-spin" /> Locating you...</>}
                        {locStatus === "success" && <><CheckCircle className="h-3 w-3 text-green-500" /> Location Locked ({location?.lat.toFixed(4)}, {location?.lng.toFixed(4)})</>}
                        {locStatus === "error" && <><AlertCircle className="h-3 w-3 text-red-500" /> Location Access Denied</>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comp-name">Competitor Name</Label>
                        <Input
                            id="comp-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Woolworths"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                placeholder="Retail"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="threat">Threat Level</Label>
                            <select
                                id="threat"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.threat_level}
                                onChange={(e) => setFormData({ ...formData, threat_level: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    {status === "error" && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {message}
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={status === "submitting"}>
                        {status === "submitting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Competitor
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
