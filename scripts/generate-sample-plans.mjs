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
import { writeFileSync } from "fs";

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

function headerRow() {
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

function exerciseRow(name, sets, reps) {
  const values = [name, sets, reps, ""];
  return new TableRow({
    height: { value: 460, rule: "atLeast" },
    children: values.map(
      (value, i) =>
        new TableCell({
          width: { size: COLUMN_WIDTHS[i], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLORS.cardFill },
          margins: CELL_MARGINS,
          borders: cellBorder(),
          verticalAlign: "center",
          children: [
            new Paragraph({
              children: [new TextRun({ text: value, color: COLORS.text })],
            }),
          ],
        }),
    ),
  });
}

function dayTable(exercises) {
  const rows = [headerRow()];
  exercises.forEach(([name, sets, reps]) => rows.push(exerciseRow(name, sets, reps)));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function writeLine() {
  return new Paragraph({
    spacing: { before: 260 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border } },
    children: [new TextRun({ text: " " })],
  });
}

function logoLockup() {
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: " FG ", bold: true, color: COLORS.onAccent, shading: { type: ShadingType.CLEAR, fill: COLORS.accent } }),
        new TextRun({ text: "   " }),
        new TextRun({ text: "Fit", bold: true, size: 32, color: COLORS.text }),
        new TextRun({ text: "Git", bold: true, size: 32, color: COLORS.accent }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({ text: "TRAININGSPLAN", bold: true, size: 20, color: COLORS.muted, characterSpacing: 30 }),
      ],
    }),
  ];
}

function buildFooter() {
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

async function buildPlan({ planName, days, outFile }) {
  const children = [...logoLockup()];

  children.push(
    new Paragraph({
      spacing: { after: 320 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
      children: [new TextRun({ text: planName, color: COLORS.muted })],
    }),
  );

  days.forEach((day, index) => {
    children.push(
      new Paragraph({
        pageBreakBefore: index > 0 && index % 2 === 0,
        spacing: { before: index === 0 ? 320 : 240, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent } },
        children: [
          new TextRun({ text: `TAG ${index + 1}`, bold: true, size: 20, color: COLORS.muted, characterSpacing: 20 }),
          new TextRun({ text: "   " }),
          new TextRun({ text: day.name.toUpperCase(), bold: true, size: 28, color: COLORS.text }),
        ],
      }),
    );
    children.push(dayTable(day.exercises));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  });

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: "HINWEIS", bold: true, size: 18, color: COLORS.accent, characterSpacing: 20 })],
    }),
  );
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Sätze/Wiederholungen sind Richtwerte für den Einstieg. Trag dein Gewicht selbst ein und steigere es, sobald die obere Wiederholungszahl leicht fällt.",
          color: COLORS.muted,
        }),
      ],
    }),
  );
  children.push(writeLine());
  children.push(writeLine());

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

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outFile, buffer);
  console.log("wrote", outFile);
}

const OUT_DIR = "../../Powerbuilt-Website-Loveable/gainz-journey-plans/public/downloads";

await buildPlan({
  planName: "3-Day Full Body · Einsteiger",
  outFile: `${OUT_DIR}/fitgit-3-day-full-body.docx`,
  days: [
    {
      name: "Ganzkörper – Push-Fokus",
      exercises: [
        ["Bankdrücken", "3", "8-10"],
        ["Schulterdrücken Kurzhantel", "3", "10-12"],
        ["Trizepsdrücken am Kabel", "3", "12-15"],
        ["Beinpresse", "3", "10-12"],
        ["Bauchpresse", "3", "15-20"],
      ],
    },
    {
      name: "Ganzkörper – Pull-Fokus",
      exercises: [
        ["Latzug breit", "3", "10-12"],
        ["Rudern vorgebeugt", "3", "8-10"],
        ["Bizepscurls Langhantel", "3", "10-12"],
        ["Kreuzheben (leicht)", "3", "8-10"],
        ["Unterarm-Curls", "3", "15-20"],
      ],
    },
    {
      name: "Ganzkörper – Bein-Fokus",
      exercises: [
        ["Kniebeugen", "4", "8-10"],
        ["Ausfallschritte", "3", "10-12 je Seite"],
        ["Beinbeuger liegend", "3", "10-12"],
        ["Wadenheben stehend", "4", "15-20"],
        ["Plank", "3", "30-45 Sek."],
      ],
    },
  ],
});

await buildPlan({
  planName: "Push / Pull / Legs · Fortgeschritten",
  outFile: `${OUT_DIR}/fitgit-push-pull-legs.docx`,
  days: [
    {
      name: "Push",
      exercises: [
        ["Bankdrücken", "4", "6-8"],
        ["Schrägbankdrücken Kurzhantel", "3", "8-10"],
        ["Seitheben", "3", "12-15"],
        ["Trizeps-Dips", "3", "8-10"],
        ["Trizepsdrücken Kabel", "3", "12-15"],
        ["Face Pulls", "3", "15-20"],
      ],
    },
    {
      name: "Pull",
      exercises: [
        ["Klimmzüge", "4", "6-10"],
        ["Rudern vorgebeugt", "3", "8-10"],
        ["Kabelzug eng", "3", "10-12"],
        ["Bizepscurls Langhantel", "3", "8-10"],
        ["Hammercurls", "3", "10-12"],
        ["Rückenstrecker", "3", "12-15"],
      ],
    },
    {
      name: "Legs",
      exercises: [
        ["Kniebeugen", "4", "6-8"],
        ["Beinpresse", "3", "10-12"],
        ["Rumänisches Kreuzheben", "3", "8-10"],
        ["Beinbeuger liegend", "3", "10-12"],
        ["Wadenheben stehend", "4", "15-20"],
        ["Bauchpresse", "3", "15-20"],
      ],
    },
  ],
});

await buildPlan({
  planName: "Upper / Lower · Fortgeschritten",
  outFile: `${OUT_DIR}/fitgit-upper-lower.docx`,
  days: [
    {
      name: "Upper Body",
      exercises: [
        ["Bankdrücken", "4", "6-8"],
        ["Rudern vorgebeugt", "4", "8-10"],
        ["Schulterdrücken", "3", "8-10"],
        ["Latzug", "3", "10-12"],
        ["Bizepscurls", "3", "10-12"],
        ["Trizepsdrücken", "3", "10-12"],
      ],
    },
    {
      name: "Lower Body",
      exercises: [
        ["Kniebeugen", "4", "6-8"],
        ["Rumänisches Kreuzheben", "3", "8-10"],
        ["Beinpresse", "3", "10-12"],
        ["Beinbeuger liegend", "3", "10-12"],
        ["Wadenheben stehend", "4", "15-20"],
        ["Ausfallschritte", "3", "10-12 je Seite"],
      ],
    },
  ],
});
