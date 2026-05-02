import { NextResponse } from "next/server";

let settingsState = {
  provider: "gemini",
  apiKey: "",
  model: "",
  updatedAt: new Date().toISOString()
};

export async function GET() {
  return NextResponse.json(settingsState);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    settingsState = { ...settingsState, ...data, updatedAt: new Date().toISOString() };
    return NextResponse.json(settingsState);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
