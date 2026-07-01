import { NextRequest, NextResponse } from "next/server";
import { intentClassifierService } from "@/app/services/server/intent-classifier";

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();

    if (!text) {
      return NextResponse.json({ status: "error", message: "Text is required" }, { status: 400 });
    }

    const result = await intentClassifierService.classify(
      text, 
      context?.entity
    );

    return NextResponse.json({
      status: "success",
      ...result
    });
  } catch (error: any) {
    console.error("Intent Classification Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
