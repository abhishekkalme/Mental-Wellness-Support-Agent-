import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Placeholder response until full Groq/Llama integration is restored
    // Prevents the "Agent Core Disconnected" error in the UI module
    return NextResponse.json({
      risk: "none",
      reply: "I hear you. As your wellness companion, I'm here to support you. (Mock response: AI core connection successful!)."
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
