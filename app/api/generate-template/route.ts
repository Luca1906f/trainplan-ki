import { NextRequest, NextResponse } from "next/server";
import { generateTemplate, TemplateDay, TemplateInput } from "@/lib/docx/generateTemplate";

export const runtime = "nodejs";

interface RawDay {
  name?: unknown;
  exerciseCount?: unknown;
}

interface RawBody {
  planName?: unknown;
  clientName?: unknown;
  days?: unknown;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RawBody | null;

  if (!body || !Array.isArray(body.days) || body.days.length === 0) {
    return NextResponse.json(
      { error: "Mindestens ein Tag mit Übungsanzahl erforderlich." },
      { status: 400 },
    );
  }

  const days: TemplateDay[] = (body.days as RawDay[]).map((day) => ({
    name:
      typeof day.name === "string" && day.name.trim()
        ? day.name.trim()
        : "Trainingstag",
    exerciseCount: Math.max(1, Math.min(20, Number(day.exerciseCount) || 1)),
  }));

  const input: TemplateInput = {
    planName:
      typeof body.planName === "string" && body.planName.trim()
        ? body.planName.trim()
        : undefined,
    clientName:
      typeof body.clientName === "string" && body.clientName.trim()
        ? body.clientName.trim()
        : undefined,
    days,
  };

  const buffer = await generateTemplate(input);
  const filename = `FitGit-Trainingsplan-${new Date().toISOString().slice(0, 10)}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
