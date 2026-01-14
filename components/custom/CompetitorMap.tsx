"use client";

import React, { useEffect, useRef } from "react";

interface CompetitorMapProps {
    apiKey?: string;
    competitorLocations?: any[];
    masterRoutes?: any[];
    masterZones?: any[];
    center?: { lat: number; lng: number };
    zoom?: number;
}

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

const PRIMARY_ROUTE_COLOR = '#FF0000';
const SECONDARY_ROUTE_COLOR = '#FFA500';
const ZONE_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#800000', '#008080'];

export default function CompetitorMap({
    apiKey,
    competitorLocations = [],
    masterRoutes = [],
    masterZones = [],
    center = { lat: -22.34058, lng: 30.01341 },
    zoom = 10
}: CompetitorMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const zonesRef = useRef<any[]>([]);
    const routesRef = useRef<any[]>([]);

    useEffect(() => {
        if (!apiKey) return;

        const scriptId = "google-maps-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,places`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.body.appendChild(script);
        } else {
            if (window.google && window.google.maps) {
                initMap();
            }
        }

        return () => {
            // Cleanup if needed
        };
    }, [apiKey]);

    // Re-draw when data changes
    useEffect(() => {
        if (googleMapRef.current) {
            clearMap();
            drawData();
        }
    }, [competitorLocations, masterRoutes, masterZones]);

    function initMap() {
        if (!mapRef.current) return;

        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: zoom,
            styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
        });

        drawData();
    }

    function clearMap() {
        markersRef.current.forEach(m => m.setMap(null));
        zonesRef.current.forEach(z => z.setMap(null));
        routesRef.current.forEach(r => r.setMap(null));
        markersRef.current = [];
        zonesRef.current = [];
        routesRef.current = [];
    }

    function drawData() {
        if (!window.google || !googleMapRef.current) return;

        // Draw Zones
        masterZones.forEach((zone, index) => {
            try {
                let path = [];
                if (zone.zone_path) {
                    const parsed = JSON.parse(zone.zone_path);
                    // Handle Frappe Geolocation format or simple array
                    if (Array.isArray(parsed)) {
                        path = parsed.map((p: any) => ({ lat: p.lat, lng: p.lng }));
                    } else if (parsed.features && parsed.features[0].geometry.type === "Polygon") {
                         path = parsed.features[0].geometry.coordinates[0].map((c: any) => ({ lat: c[1], lng: c[0] }));
                    }
                }

                if (path.length > 0) {
                    const polygon = new window.google.maps.Polygon({
                        paths: path,
                        map: googleMapRef.current,
                        editable: false,
                        clickable: true,
                        fillColor: ZONE_COLORS[index % ZONE_COLORS.length],
                        strokeColor: ZONE_COLORS[index % ZONE_COLORS.length],
                        fillOpacity: 0.2
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `<div style="color:black"><strong>${zone.zone_name}</strong></div>`
                    });
                    polygon.addListener("click", (e: any) => {
                        infoWindow.setPosition(e.latLng);
                        infoWindow.open(googleMapRef.current);
                    });

                    zonesRef.current.push(polygon);
                }
            } catch (e) {
                console.error("Error drawing zone:", e);
            }
        });

        // Draw Routes
        masterRoutes.forEach((route) => {
            try {
                let path = [];
                if (route.route_path) {
                    const parsed = JSON.parse(route.route_path);
                    if (Array.isArray(parsed)) {
                        path = parsed.map((p: any) => ({ lat: p.lat, lng: p.lng }));
                    } else if (parsed.features && parsed.features[0].geometry.type === "LineString") {
                         path = parsed.features[0].geometry.coordinates.map((c: any) => ({ lat: c[1], lng: c[0] }));
                    }
                }

                if (path.length > 0) {
                    const polyline = new window.google.maps.Polyline({
                        path: path,
                        map: googleMapRef.current,
                        editable: false,
                        clickable: true,
                        strokeColor: route.route_type === 'Primary' ? PRIMARY_ROUTE_COLOR : SECONDARY_ROUTE_COLOR,
                        strokeOpacity: 0.7,
                        strokeWeight: 4
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `<div style="color:black"><strong>${route.route_name}</strong> (${route.route_type})</div>`
                    });
                    polyline.addListener("click", (e: any) => {
                        infoWindow.setPosition(e.latLng);
                        infoWindow.open(googleMapRef.current);
                    });

                    routesRef.current.push(polyline);
                }
            } catch (e) {
                console.error("Error drawing route:", e);
            }
        });

        // Draw Competitor Locations
        competitorLocations.forEach((loc) => {
            try {
                let position;
                if (loc.location_geolocation) {
                    const geo = JSON.parse(loc.location_geolocation);
                    if (geo.features && geo.features[0].geometry.type === "Point") {
                        const [lng, lat] = geo.features[0].geometry.coordinates;
                        position = { lat, lng };
                    }
                }

                if (position) {
                    const marker = new window.google.maps.Marker({
                        position: position,
                        map: googleMapRef.current,
                        label: { text: loc.location_name, color: "black", fontSize: "10px", fontWeight: "bold" },
                        title: loc.location_name
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `<div style="color:black"><strong>${loc.location_name}</strong><br/>${loc.location_type}</div>`
                    });
                    marker.addListener("click", () => {
                        infoWindow.open(googleMapRef.current, marker);
                    });

                    markersRef.current.push(marker);
                }
            } catch (e) {
                console.error("Error drawing marker:", e);
            }
        });
    }

    if (!apiKey) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/20 border rounded-lg">
                <div className="text-center p-6">
                    <p className="text-lg font-semibold">Map Unavailable</p>
                    <p className="text-sm text-muted-foreground mt-2">Google Maps API Key is missing.</p>
                </div>
            </div>
        );
    }

    return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "500px", borderRadius: "8px" }} />;
}
