import { NextResponse } from 'next/server';
import { createAiTask } from '@/app/actions/ai/create';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, priority, end_date, project, modelId } = body;

        console.log("Creating AI Task:", { name, project, modelId });

        const result = await createAiTask({
            name,
            priority,
            end_date,
            project,
            modelId
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: "Task Created", data: result.message });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
    }
}
