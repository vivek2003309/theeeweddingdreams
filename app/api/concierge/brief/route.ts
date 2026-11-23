import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { celebrationBriefRequestSchema } from "@/lib/validation/enquiry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = celebrationBriefRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Please share a few more celebration details.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json(
        {
          error:
            "Concierge planning intelligence requires a configured Gemini API key in Settings > Secrets.",
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const { city, guestCount, tier, chapters, visionPrompt } = parsed.data;

    const systemInstruction = [
      "You are the Senior Celebration Architect at The Wedding Dreams, an ultra-luxury Indian wedding concierge.",
      "Respond in an editorial, warm, unhurried tone. Never quote exact rupee prices or expose vendor phone numbers, emails, or direct contacts.",
      "Always refer to budget scales only using tier designations (Classic, Grand, Royal).",
      "Provide a concise, structured 3-part orchestration brief (Venue Archetype & Flow, Multi-Day Ritual Cadence, Concierge Logistics & Seasonal Considerations) in under 240 words.",
    ].join(" ");

    const userPrompt = [
      `City preference: ${city}`,
      `Estimated guests: ${guestCount}`,
      `Tier designation: ${tier}`,
      `Chapters envisioned: ${chapters.join(", ")}`,
      `Couple vision: ${visionPrompt}`,
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-4-carbon",
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const brief = response.text?.trim();
    if (!brief) {
      return NextResponse.json(
        { error: "Unable to compose your celebration brief right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({ brief });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Concierge brief request failed.";
    const status =
      message.includes("RESOURCE_EXHAUSTED") || message.includes("429")
        ? 429
        : message.includes("PERMISSION_DENIED") || message.includes("403")
          ? 403
          : 500;

    return NextResponse.json(
      {
        error:
          status === 429
            ? "Quota exceeded for the deep-reasoning model. Please check your billing-enabled API key in Settings > Secrets."
            : status === 403
              ? "Please verify your API key in Settings > Secrets."
              : "Our concierge brief service is temporarily unavailable.",
      },
      { status }
    );
  }
}
