import { NextResponse } from "next/server";
import { generatePlanDocx } from "@/lib/docx/generatePlanDocx";
import { trainingPlanDraftSchema } from "@/lib/training/validate";

export const runtime = "nodejs";

// Pure formatting of a plan the caller already holds — no DB write, no AI call,
// so no separate auth beyond the (middleware-gated) page it's triggered from.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = trainingPlanDraftSchema.safeParse(body?.plan);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Plan." }, { status: 400 });
  }

  const clientName =
    typeof body?.clientName === "string" && body.clientName.trim()
      ? body.clientName.trim()
      : undefined;

  const buffer = await generatePlanDocx(parsed.data, clientName);
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
