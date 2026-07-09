export interface Source {
  claim: string;
  title: string;
  ref: string;
  url: string;
}

export const NUTRITION_SOURCES: Source[] = [
  {
    claim: 'Grundumsatz: Mifflin-St Jeor ist die treffsicherste Formel.',
    title: 'Comparison of Predictive Equations for Resting Metabolic Rate: A Systematic Review',
    ref: 'Frankenfield et al., J Am Diet Assoc, 2005',
    url: 'https://www.jandonline.org/article/S0002-8223(05)00149-5/abstract',
  },
  {
    claim: 'Protein ~1,6–2,2 g/kg maximiert Muskelaufbau.',
    title: 'Protein supplementation and resistance training gains: systematic review & meta-analysis',
    ref: 'Morton et al., Br J Sports Med, 2018',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/',
  },
  {
    claim: 'Im Defizit mehr Protein + langsames Abnehmen erhalten Muskelmasse.',
    title: 'Evidence-based recommendations for natural bodybuilding contest preparation',
    ref: 'Helms, Aragon & Fitschen, JISSN, 2014',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4033492/',
  },
  {
    claim: 'Protein über 3–4 Mahlzeiten verteilen (~0,4 g/kg pro Mahlzeit).',
    title: 'How much protein can the body use in a single meal for muscle-building?',
    ref: 'Schoenfeld & Aragon, JISSN, 2018',
    url: 'https://www.tandfonline.com/doi/full/10.1186/s12970-018-0215-1',
  },
  {
    claim: 'Abnehm-Tempo 0,5–1 %/Woche erhält am meisten fettfreie Masse.',
    title: 'Achieving an Optimal Fat Loss Phase in Resistance-Trained Athletes: A Narrative Review',
    ref: 'Nutrients, 2021',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8471721/',
  },
];
