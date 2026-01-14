import { NextResponse } from 'next/server';
import { createAiNote } from '@/app/actions/ai/create';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title } = body;

        console.log("Creating AI Note:", { title });

        const result = await createAiNote({
            title: title
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: "Note Created", data: result.message });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
    }
}
