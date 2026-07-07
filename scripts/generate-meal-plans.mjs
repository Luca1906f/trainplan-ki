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

function logoLockup(subtitle) {
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
      children: [new TextRun({ text: subtitle, bold: true, size: 20, color: COLORS.muted, characterSpacing: 30 })],
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

function body(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, color: COLORS.text })] });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 260 },
    children: [new TextRun({ text: `•  ${text}`, color: COLORS.muted })],
  });
}

async function buildMealPlan({ planName, calories, macros, meals, outFile }) {
  const children = [...logoLockup("ERNÄHRUNGSPLAN")];

  children.push(
    new Paragraph({
      spacing: { after: 320 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
      children: [new TextRun({ text: planName, color: COLORS.muted })],
    }),
  );

  children.push(heading("Eckdaten"));
  children.push(bullet(`Kalorien: ${calories}`));
  macros.forEach((m) => children.push(bullet(m)));

  children.push(heading("Beispiel-Tagesplan"));
  meals.forEach(([name, desc]) => {
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [new TextRun({ text: name, bold: true, size: 20, color: COLORS.accent })],
      }),
    );
    children.push(body(desc));
  });

  children.push(heading("Hinweis"));
  children.push(body("Werte sind Richtwerte. Passe Portionsgrößen an dein Körpergewicht, Aktivitätslevel und Ziel an — bei Unsicherheit frag mich direkt über FitGit."));

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

await buildMealPlan({
  planName: "Fettabbau-Ernährungsplan",
  outFile: `${OUT_DIR}/fitgit-fettabbau-plan.docx`,
  calories: "1.500-1.800 kcal/Tag (Richtwert, abhängig von Körpergewicht)",
  macros: [
    "Hoher Proteinanteil zum Muskelerhalt",
    "Moderate gesunde Fette",
    "Reduzierte Kohlenhydrate",
    "3 Hauptmahlzeiten + 2 Snacks",
  ],
  meals: [
    ["Frühstück", "Magerquark mit Beeren und einer Handvoll Nüssen"],
    ["Mittagessen", "Hähnchenbrust mit viel Gemüse und einer kleinen Portion Reis"],
    ["Snack", "Apfel + hartgekochtes Ei"],
    ["Abendessen", "Fisch mit Salat und Olivenöl-Dressing"],
  ],
});

await buildMealPlan({
  planName: "Muskelaufbau-Ernährungsplan",
  outFile: `${OUT_DIR}/fitgit-muskelaufbau-plan.docx`,
  calories: "2.500-3.000 kcal/Tag (Kalorienüberschuss)",
  macros: [
    "Protein: 1,6-2,2 g pro kg Körpergewicht",
    "Moderate bis hohe Kohlenhydrate",
    "Moderate gesunde Fette",
    "5-6 Mahlzeiten für konstante Nährstoffversorgung",
  ],
  meals: [
    ["Frühstück", "Haferflocken mit Banane, Whey-Protein und Erdnussbutter"],
    ["Snack", "Griechischer Joghurt mit Honig und Nüssen"],
    ["Mittagessen", "Rindfleisch mit Kartoffeln und Gemüse"],
    ["Snack", "Proteinshake + Reiswaffeln"],
    ["Abendessen", "Lachs mit Vollkornnudeln und Brokkoli"],
  ],
});

await buildMealPlan({
  planName: "Erhaltungs-Ernährungsplan",
  outFile: `${OUT_DIR}/fitgit-erhaltungs-plan.docx`,
  calories: "2.000-2.500 kcal/Tag (Kalorienerhalt)",
  macros: [
    "Ausgewogene Makronährstoff-Verteilung",
    "Fokus auf Vollwertkost und Vielfalt",
    "Regelmäßige Mahlzeitenzeiten",
    "Flexibler Ansatz für den Alltag",
  ],
  meals: [
    ["Frühstück", "Vollkornbrot mit Ei und Avocado"],
    ["Mittagessen", "Buddha Bowl mit Hühnchen, Quinoa und buntem Gemüse"],
    ["Snack", "Studentenfutter + Obst"],
    ["Abendessen", "Gemüse-Curry mit Naturreis"],
  ],
});
