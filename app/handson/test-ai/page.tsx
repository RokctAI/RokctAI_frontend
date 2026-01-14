
"use client";

import { useState } from "react";
import { AiTextHelper } from "@/components/handson/ai/AiTextHelper";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AiTestPage() {
    const [text, setText] = useState("");

    const handleAiAccept = (newText: string) => {
        setText(newText);
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        ✨ Universal AI Text Helper
                    </CardTitle>
                    <CardDescription>
                        Test the new "Sparkle" feature. Type something below (e.g., "bad grammer here") and click the Sparkle icon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="bio">Your Text</Label>
                            <AiTextHelper
                                text={text}
                                onAccept={handleAiAccept}
                            />
                        </div>
                        <Textarea
                            id="bio"
                            placeholder="Type something here..."
                            className="min-h-[200px] resize-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {text.length} characters
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 p-4 bg-muted rounded-lg text-sm">
                <h4 className="font-semibold mb-2">How to Verify:</h4>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Type a sentence with errors like "i want to go to store".</li>
                    <li>Click the ✨ icon.</li>
                    <li>Select <strong>Fix Grammar</strong>.</li>
                    <li>Wait for the result and click <strong>Replace</strong>.</li>
                    <li>Try <strong>Make Professional</strong> or <strong>Custom</strong> prompts too.</li>
                </ul>
            </div>
        </div>
    );
}
