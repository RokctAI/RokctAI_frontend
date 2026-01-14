import { notFound } from "next/navigation";
import { TermsService } from "@/app/services/control/terms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default async function LegalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let term;

    try {
        term = await TermsService.getSystemTerm(id);
    } catch (e) {
        console.error("Failed to fetch term", e);
    }

    if (!term || term.disabled) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <Card>
                <CardHeader className="border-b space-y-4 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ScrollText className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{term.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {term.terms}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
