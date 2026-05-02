import { NextResponse } from "next/server";

type Req = {
  answer?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Req | null;
  const a = (body?.answer ?? "").toLowerCase();

  // Minimal deterministic "decoder" (hackathon MVP).
  // Can be upgraded to LLM classification later.
  let state: "anxious" | "tired" | "overwhelmed" | "distracted" | "unknown" =
    "unknown";

  if (/(tired|sleepy|thak|neend|exhaust)/i.test(a)) state = "tired";
  else if (/(anxious|panic|dar|ghabra|overthink)/i.test(a)) state = "anxious";
  else if (/(overwhelmed|too much|bohot|everything|pressure)/i.test(a))
    state = "overwhelmed";
  else if (/(phone|scroll|instagram|youtube|distract|focus nahi)/i.test(a))
    state = "distracted";

  const actionsByState: Record<typeof state, string[]> = {
    anxious: [
      "2 min grounding: 5-4-3-2-1 (silent).",
      "10 min tiny-start: sirf outline/3 bullets.",
      "Phir 1 pomodoro (25-5).",
    ],
    tired: [
      "20 min power rest (alarm).",
      "Phir 15 min light revision (notes only).",
      "Raat ko sleep window fix: aaj target time choose karo.",
    ],
    overwhelmed: [
      "List everything in 2 minutes (dump).",
      "Pick 1 task only (smallest).",
      "10 min timer: start, perfect nahi.",
    ],
    distracted: [
      "Phone 15 min 'out of reach' + silent.",
      "Environment tweak: desk clear, 1 tab only.",
      "10 min timer: read 1 page / solve 2 questions.",
    ],
    unknown: [
      "Aaj 10 min timer: bas start karo (outline/notes).",
      "Agar tum bolo: anxious/tired/overwhelmed/distracted—main exact steps dunga.",
    ],
  };

  return NextResponse.json({
    state,
    steps: actionsByState[state],
  });
}

