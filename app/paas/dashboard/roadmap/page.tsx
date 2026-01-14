import { getRoadmaps, getRoadmapFeatures } from "@/app/actions/paas/roadmap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RoadmapPage() {
    const roadmaps = await getRoadmaps();

    // Fetch features for all roadmaps in parallel
    const roadmapsWithFeatures = await Promise.all(
        roadmaps.map(async (roadmap: any) => {
            const features = await getRoadmapFeatures(roadmap.name);
            return { ...roadmap, features };
        })
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Roadmap</h1>
                <p className="text-muted-foreground">See what we are working on and what's coming next.</p>
            </div>

            <div className="grid gap-6">
                {roadmapsWithFeatures.map((roadmap: any) => (
                    <Card key={roadmap.name}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{roadmap.title}</CardTitle>
                                <Badge variant={roadmap.status === "Active" ? "default" : "secondary"}>
                                    {roadmap.status}
                                </Badge>
                            </div>
                            <CardDescription>{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {roadmap.features.length > 0 ? (
                                    roadmap.features.map((feature: any) => (
                                        <div key={feature.name} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <h4 className="font-semibold">{feature.feature}</h4>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                            <Badge variant="outline">{feature.status}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No features listed yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
