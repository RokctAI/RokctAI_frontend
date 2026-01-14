import { NextResponse } from 'next/server';
import { createAiProject } from '@/app/actions/ai/create';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, modelId } = body;

        console.log("Creating AI Project:", { name, modelId });

        const result = await createAiProject({
            name,
            description,
            modelId
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: "Project Created", data: result.message });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
    }
}
