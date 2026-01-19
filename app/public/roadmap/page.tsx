import { RoadmapPublicService } from "@/app/services/public/roadmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60; // Revalidate every minute

export default async function PublicRoadmapPage() {
    let data = null;
    let error = null;

    try {
        const res = await RoadmapPublicService.getPublicRoadmap();
        if (res && res.message) {
            data = res.message;
        } else {
            data = res;
        }
    } catch (e) {
        console.error("Failed to load public roadmap", e);
        error = "Failed to load roadmap.";
    }

    if (!data) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Map className="h-12 w-12 text-muted-foreground opacity-50" />
                    <h1 className="text-2xl font-bold">No Public Roadmap Available</h1>
                    <p className="text-muted-foreground">The team hasn't published a roadmap yet.</p>
                    <Link href="/">
                        <Button variant="outline">Back Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Done": return "bg-green-500 hover:bg-green-600";
            case "Doing": return "bg-blue-500 hover:bg-blue-600";
            case "Todo": return "bg-orange-500 hover:bg-orange-600";
            default: return "bg-secondary hover:bg-secondary/80";
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="outline" className="mb-2">Public Roadmap</Badge>
                <h1 className="text-4xl font-bold tracking-tight">{data.title}</h1>
                <p className="text-xl text-muted-foreground">{data.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.features && data.features.length > 0 ? (
                    data.features.map((feature: any, idx: number) => (
                        <Card key={idx} className="flex flex-col border-none shadow-md bg-card/50 hover:bg-card transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <Badge className={getStatusColor(feature.status)}>{feature.status}</Badge>
                                    <Badge variant="outline" className="text-xs font-normal">{feature.priority}</Badge>
                                </div>
                                <CardTitle className="mt-4 text-lg">{feature.feature}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No features listed yet.
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                    Updated automatically from our internal development board.
                </p>
            </div>
        </div>
    );
}
