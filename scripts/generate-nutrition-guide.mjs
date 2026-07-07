import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  Footer,
  PageNumber,
  ShadingType,
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
        new TextRun({ text: "ERNÄHRUNGSGUIDE", bold: true, size: 20, color: COLORS.muted, characterSpacing: 30 }),
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

function heading(text) {
  return new Paragraph({
    spacing: { before: 320, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: COLORS.text })],
  });
}

function sub(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, bold: true, size: 20, color: COLORS.accent })],
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, color: COLORS.text })],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 260 },
    children: [new TextRun({ text: `•  ${text}`, color: COLORS.muted })],
  });
}

const children = [...logoLockup()];

children.push(
  new Paragraph({
    spacing: { after: 320 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
    children: [new TextRun({ text: "Grundlagen der Sporternährung", color: COLORS.muted })],
  }),
);

children.push(heading("Proteine"));
children.push(body("Proteine (Eiweiße) sind biologische Makromoleküle aus Aminosäuren und einer der drei Hauptnährstoffe."));
children.push(sub("Bedarf pro Tag"));
children.push(bullet("Erwachsene: ca. 1-1,4 g pro kg Körpergewicht"));
children.push(bullet("Sportler: ca. 1,5-2,5 g pro kg Körpergewicht"));
children.push(sub("Gute Quellen"));
children.push(body("Fleisch, Fisch, Eier, Milchprodukte, Hülsenfrüchte, Tofu, Nüsse."));

children.push(heading("Kohlenhydrate"));
children.push(body("Energieliefernde Makronährstoffe, wichtig für Trainingsleistung und Glykogenspeicher."));
children.push(sub("Bedarf pro Tag"));
children.push(bullet("Durchschnittlich aktiv: ca. 3-5 g pro kg Körpergewicht"));
children.push(bullet("Sportlich aktiv: ca. 5-7 g pro kg Körpergewicht"));
children.push(sub("Gute Quellen"));
children.push(body("Vollkornprodukte, Kartoffeln, Obst, Gemüse, Hülsenfrüchte."));

children.push(heading("Pre- & Post-Workout"));
children.push(sub("Vor dem Training (2-3 Std. vorher)"));
children.push(bullet("Komplexe Kohlenhydrate: Haferflocken, Vollkornbrot"));
children.push(bullet("Leicht verdauliches Protein: Joghurt, Whey"));
children.push(sub("Nach dem Training"));
children.push(bullet("20-30 g hochwertiges Protein für die Muskelreparatur"));
children.push(bullet("Schnelle Kohlenhydrate zur Glykogenauffüllung: Obst, Reis"));

children.push(heading("Hinweis"));
children.push(body("Dieser Guide ersetzt keine individuelle Ernährungsberatung. Bei Vorerkrankungen oder besonderen Zielen sprich mit mir direkt über FitGit."));

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
const outFile = "../../Powerbuilt-Website-Loveable/gainz-journey-plans/public/downloads/fitgit-ernaehrungsguide.docx";
writeFileSync(outFile, buffer);
console.log("wrote", outFile);
