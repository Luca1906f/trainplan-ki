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

export interface TemplateDay {
  name: string;
  exerciseCount: number;
}

export interface TemplateInput {
  planName?: string;
  clientName?: string;
  days: TemplateDay[];
}

const COLORS = {
  text: "1F2430",
  muted: "6B7280",
  border: "D8DCE3",
  cardFill: "F7F8FA",
  accent: "2F6FB0",
  onAccent: "FFFFFF",
};

const HEADER_CELLS = ["Übung", "Sätze", "Wiederholungen", "Gewicht"];
const COLUMN_WIDTHS = [40, 20, 20, 20];
const CELL_MARGINS = { top: 140, bottom: 140, left: 150, right: 150 };

function cellBorder() {
  return {
    top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
  };
}

function headerRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: HEADER_CELLS.map(
      (text, i) =>
        new TableCell({
          width: { size: COLUMN_WIDTHS[i], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLORS.accent },
          margins: CELL_MARGINS,
          borders: cellBorder(),
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, color: COLORS.onAccent })],
            }),
          ],
        }),
    ),
  });
}

function emptyRow(): TableRow {
  return new TableRow({
    height: { value: 460, rule: "atLeast" },
    children: COLUMN_WIDTHS.map(
      (size) =>
        new TableCell({
          width: { size, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLORS.cardFill },
          margins: CELL_MARGINS,
          borders: cellBorder(),
          verticalAlign: "center",
          children: [new Paragraph({ text: "" })],
        }),
    ),
  });
}

function dayTable(exerciseCount: number): Table {
  const rows = [headerRow()];
  for (let i = 0; i < exerciseCount; i++) rows.push(emptyRow());
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function writeLine(): Paragraph {
  return new Paragraph({
    spacing: { before: 260 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
    },
    children: [new TextRun({ text: " " })],
  });
}

function logoLockup(): Paragraph[] {
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: " FG ",
          bold: true,
          color: COLORS.onAccent,
          shading: { type: ShadingType.CLEAR, fill: COLORS.accent },
        }),
        new TextRun({ text: "   " }),
        new TextRun({ text: "Fit", bold: true, size: 32, color: COLORS.text }),
        new TextRun({ text: "Git", bold: true, size: 32, color: COLORS.accent }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "TRAININGSPLAN",
          bold: true,
          size: 20,
          color: COLORS.muted,
          characterSpacing: 30,
        }),
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

export async function generateTemplate(input: TemplateInput): Promise<Buffer> {
  const today = new Date().toLocaleDateString("de-DE");
  const children: (Paragraph | Table)[] = [];

  children.push(...logoLockup());

  const metaParts = [
    input.planName ? input.planName : null,
    `Kunde: ${input.clientName || "_______________"}`,
    `Datum: ${today}`,
  ].filter(Boolean);

  children.push(
    new Paragraph({
      spacing: { after: 320 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border },
      },
      children: [
        new TextRun({ text: metaParts.join("   ·   "), color: COLORS.muted }),
      ],
    }),
  );

  input.days.forEach((day, index) => {
    children.push(
      new Paragraph({
        pageBreakBefore: index > 0 && index % 2 === 0,
        spacing: { before: index === 0 ? 320 : 240, after: 160 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent },
        },
        children: [
          new TextRun({
            text: `TAG ${index + 1}`,
            bold: true,
            size: 20,
            color: COLORS.muted,
            characterSpacing: 20,
          }),
          new TextRun({ text: "   " }),
          new TextRun({
            text: day.name.toUpperCase(),
            bold: true,
            size: 28,
            color: COLORS.text,
          }),
        ],
      }),
    );
    children.push(dayTable(day.exerciseCount));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  });

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "PAUSENZEITEN",
          bold: true,
          size: 18,
          color: COLORS.accent,
          characterSpacing: 20,
        }),
      ],
    }),
  );
  children.push(writeLine());

  children.push(
    new Paragraph({
      spacing: { before: 260, after: 100 },
      children: [
        new TextRun({
          text: "NOTIZEN",
          bold: true,
          size: 18,
          color: COLORS.accent,
          characterSpacing: 20,
        }),
      ],
    }),
  );
  children.push(writeLine());
  children.push(writeLine());
  children.push(writeLine());

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { color: COLORS.text, font: "Calibri" },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        footers: { default: buildFooter() },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
