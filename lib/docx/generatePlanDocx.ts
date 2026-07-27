import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  Footer,
  PageNumber,
} from "docx";
import type { TrainingPlanDraft, TrainingSet } from "@/lib/training/types";

// Renders a *filled* training plan (unlike the old empty template): every day
// becomes a table with the prescribed exercises, sets, reps and weights. Same
// source of truth as the app and the PDF/print view.

const COLORS = {
  text: "1F2430",
  muted: "6B7280",
  border: "D8DCE3",
  cardFill: "F7F8FA",
  accent: "2F6FB0",
  onAccent: "FFFFFF",
};

const HEADER_CELLS = ["Übung", "Sätze", "Wiederholungen", "Gewicht / Pause"];
const COLUMN_WIDTHS = [38, 14, 24, 24];
const CELL_MARGINS = { top: 120, bottom: 120, left: 140, right: 140 };

function cellBorder() {
  const s = { style: BorderStyle.SINGLE, size: 2, color: COLORS.border };
  return { top: s, bottom: s, left: s, right: s };
}

function headerRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: HEADER_CELLS.map(
      (text, i) =>
        new TableCell({
          width: { size: COLUMN_WIDTHS[i], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLORS.accent, color: "auto" },
          margins: CELL_MARGINS,
          borders: cellBorder(),
          children: [
            new Paragraph({ children: [new TextRun({ text, bold: true, color: COLORS.onAccent })] }),
          ],
        }),
    ),
  });
}

const SET_TYPE_LABEL: Record<string, string> = {
  warmup: "Aufwärmen",
  dropset: "Dropset",
  normal: "",
};

/** "8 Wdh." style, marking warmups/dropsets. */
function repsText(s: TrainingSet): string {
  const reps = s.reps == null ? "AMRAP" : `${s.reps} Wdh.`;
  const tag = SET_TYPE_LABEL[s.setType];
  const rir = s.rir != null ? `, RIR ${s.rir}` : "";
  return tag ? `${reps} (${tag})${rir}` : `${reps}${rir}`;
}

function weightPauseText(s: TrainingSet): string {
  const w = s.weightKg == null ? "—" : `${s.weightKg} kg`;
  const p = s.pauseSeconds != null ? ` · ${s.pauseSeconds}s` : "";
  return `${w}${p}`;
}

function exerciseCell(text: string, opts: { bold?: boolean; muted?: boolean } = {}): TableCell {
  return new TableCell({
    margins: CELL_MARGINS,
    borders: cellBorder(),
    verticalAlign: "center",
    shading: { type: ShadingType.CLEAR, fill: COLORS.cardFill, color: "auto" },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: opts.bold, color: opts.muted ? COLORS.muted : COLORS.text }),
        ],
      }),
    ],
  });
}

function logoLockup(): Paragraph[] {
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Fit", bold: true, size: 32, color: COLORS.text }),
        new TextRun({ text: "Git", bold: true, size: 32, color: COLORS.accent }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "TRAININGSPLAN", bold: true, size: 20, color: COLORS.muted, characterSpacing: 30 }),
      ],
    }),
  ];
}

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "FitGit", bold: true, size: 16, color: COLORS.accent }),
          new TextRun({ text: "   ·   Seite ", size: 16, color: COLORS.muted }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.muted }),
          new TextRun({ text: " von ", size: 16, color: COLORS.muted }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLORS.muted }),
        ],
      }),
    ],
  });
}

export async function generatePlanDocx(
  plan: TrainingPlanDraft,
  clientName?: string,
): Promise<Buffer> {
  const today = new Date().toLocaleDateString("de-DE");
  const children: (Paragraph | Table)[] = [];

  children.push(...logoLockup());
  children.push(
    new Paragraph({
      children: [new TextRun({ text: plan.name, bold: true, size: 26, color: COLORS.text })],
    }),
  );
  if (plan.description) {
    children.push(
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: plan.description, color: COLORS.muted })] }),
    );
  }
  children.push(
    new Paragraph({
      spacing: { after: 260 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
      children: [
        new TextRun({
          text: [clientName ? `Kunde: ${clientName}` : null, `Datum: ${today}`].filter(Boolean).join("   ·   "),
          color: COLORS.muted,
        }),
      ],
    }),
  );

  plan.days.forEach((day, di) => {
    children.push(
      new Paragraph({
        pageBreakBefore: di > 0,
        spacing: { before: di === 0 ? 200 : 0, after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent } },
        children: [
          new TextRun({ text: `TAG ${di + 1}`, bold: true, size: 20, color: COLORS.muted, characterSpacing: 20 }),
          new TextRun({ text: "   " }),
          new TextRun({ text: day.name.toUpperCase(), bold: true, size: 28, color: COLORS.text }),
        ],
      }),
    );
    if (day.notes) {
      children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: day.notes, italics: true, color: COLORS.muted })] }));
    }

    const rows = [headerRow()];
    for (const ex of day.exercises) {
      const sets = ex.sets.length > 0 ? ex.sets : [{ setOrder: 0, setType: "normal", reps: null, weightKg: null, rir: null, pauseSeconds: null } as TrainingSet];
      sets.forEach((s, si) => {
        rows.push(
          new TableRow({
            children: [
              exerciseCell(si === 0 ? ex.name : "", { bold: true }),
              exerciseCell(si === 0 ? `${ex.sets.length || 1}` : "", { muted: true }),
              exerciseCell(repsText(s)),
              exerciseCell(weightPauseText(s), { muted: true }),
            ],
          }),
        );
      });
    }
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
  });

  const doc = new Document({
    styles: { default: { document: { run: { color: COLORS.text, font: "Calibri" } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        footers: { default: buildFooter() },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
