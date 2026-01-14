"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function AttendanceCard({ log_type }: { log_type?: "IN" | "OUT" }) {
    const [status, setStatus] = useState<"IDLE" | "LOCATING" | "MARKING" | "DONE">("IDLE");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        setStatus("LOCATING");
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setStatus("IDLE");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setStatus("IDLE");
            },
            (err) => {
                setError(`Unable to retrieve location: ${err.message}`);
                setStatus("IDLE");
            }
        );
    };

    const handleConfirm = async () => {
        if (!coords) return;
        setStatus("MARKING");

        try {
            const { markAiAttendance } = await import("@/app/actions/ai/hr");
            const result = await markAiAttendance({
                log_type: log_type, // Optional: let backend toggle if undefined
                latitude: coords.lat,
                longitude: coords.lng
            });

            if (result.success) {
                setStatus("DONE");
                toast.success(result.message);
            } else {
                setError(result.error);
                setStatus("IDLE");
            }
        } catch (e: any) {
            setError("Failed to mark attendance");
            setStatus("IDLE");
        }
    };

    if (status === "DONE") {
        return (
            <div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-4 w-full max-w-sm text-sm text-white">
                <h3 className="font-bold text-emerald-500 mb-2">Check-in Successful</h3>
                <p className="text-zinc-400">Marked at {new Date().toLocaleTimeString()} with location.</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-blue-400">📍 Attendance</h3>
                {coords && <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">GPS Locked</span>}
            </div>

            <p className="text-zinc-400 text-xs">
                {log_type ? `Confirm ${log_type} check-in` : "Confirm check-in"} with your current location.
            </p>

            {error && (
                <div className="text-red-400 text-xs bg-red-900/10 p-2 rounded">
                    {error}
                </div>
            )}

            {!coords ? (
                <button
                    onClick={getLocation}
                    disabled={status === "LOCATING"}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded py-2 font-medium flex items-center justify-center gap-2"
                >
                    {status === "LOCATING" ? (
                        <>📡 Acquiring Satellite Lock...</>
                    ) : (
                        <>📍 Get Current Location</>
                    )}
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="text-xs text-zinc-500 font-mono bg-black/20 p-2 rounded">
                        Lat: {coords.lat.toFixed(4)}, Long: {coords.lng.toFixed(4)}
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={status === "MARKING"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-medium"
                    >
                        {status === "MARKING" ? "Marking..." : "Confirm & Mark"}
                    </button>
                </div>
            )}
        </div>
    );
}
