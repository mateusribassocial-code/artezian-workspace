// Gerador de Apresentações — Artezian Real Estate
// Gera HTML + PDF para cada parceiro com base nos dados da Stays
// Uso: node gerar-apresentacoes.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = '"C:/Program Files/Google/Chrome/Application/chrome.exe"';
const DIR = __dirname;

// ─────────────────────────────────────────────
// DADOS DOS PARCEIROS (fonte: Stays / base-imoveis.md)
// ─────────────────────────────────────────────
const groups = [
  {
    id: 'mont-carmelo',
    name: 'Condomínio Mont Carmelo',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '400m da praia de Taperapuã',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Condomínio com piscina adulto e infantil, sauna, churrasqueira coletiva, segurança 24h e restaurantes. Beach clubs a 5 min: Axé Moi, Tôa Tôa, Boa Beach, Barraca do Gaúcho.',
    nearbyHighlights: 'Axé Moi · Tôa Tôa · Boa Beach · Colher de Pau · Orla Center',
    units: [
      { name: 'Studio do João', type: 'Studio', id: 'DS03J', capacity: 5, bedrooms: 1, lowRate: 250, holidayRate: 400, highRate: 600, cleaningFee: 150, notes: 'Pet Friendly · Vaga de garagem · 1 suíte' },
      { name: 'Flat da Mari', type: 'Flat 1q', id: 'DS04J', capacity: 5, bedrooms: 1, lowRate: 250, holidayRate: 400, highRate: 600, cleaningFee: 150, notes: 'Térreo · Próximo à piscina e churrasqueira' },
      { name: 'Apto do Emanoel', type: 'Apto 2q', id: 'DS05J', capacity: 8, bedrooms: 2, lowRate: 250, holidayRate: 400, highRate: 600, cleaningFee: 200, notes: 'Churrasqueira individual · Vaga de garagem · 2 suítes' },
    ]
  },
  {
    id: 'apto-isa',
    name: 'Apartamento da Isa',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '400m da praia de Taperapuã',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Apartamento térreo com fácil acesso à piscina e churrasqueiras do condomínio em Taperapuã, a 400m da praia.',
    nearbyHighlights: 'Axé Moi · Tôa Tôa · Boa Beach · Cabana Malibu · Colher de Pau',
    units: [
      { name: 'Apartamento da Isa', type: 'Flat 1q', id: 'DS06J', capacity: 5, bedrooms: 1, lowRate: 250, holidayRate: 400, highRate: 600, cleaningFee: 150, notes: 'Térreo · Próximo à piscina e churrasqueiras · Cozinha equipada' },
    ]
  },
  {
    id: 'reinaldo-taperapua',
    name: 'Apto do Reinaldo',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '180m da praia · Residencial Village do Bosque',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Apartamento de 3 suítes no Residencial Village do Bosque. A 180m da praia de Taperapuã, próximo ao Axé Moi. Um dos apartamentos mais próximos da praia no portfólio.',
    nearbyHighlights: 'Axé Moi (a pé) · Tôa Tôa · Boa Beach · Bartuque Beach · Colher de Pau',
    units: [
      { name: 'Apto do Reinaldo', type: '3 Suítes', id: 'FL10J', capacity: 10, bedrooms: 3, lowRate: 750, holidayRate: 1200, highRate: 1600, cleaningFee: 200, notes: 'Churrasqueira privativa · Vista piscina · Suíte no térreo · 180m da praia' },
    ]
  },
  {
    id: 'flat-joyce',
    name: 'Flat da Joyce',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: 'Taperapuã · Próximo ao Bartuque Beach e Boa Beach',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Flat de 3 quartos em Taperapuã com churrasqueira, ar-condicionado em todos os quartos e vaga de garagem. Próximo ao Bartuque Beach e Boa Beach.',
    nearbyHighlights: 'Bartuque Beach · Boa Beach · Tôa Tôa · Axé Moi · Colher de Pau',
    units: [
      { name: 'Flat da Joyce', type: '3 Quartos', id: 'HA03J', capacity: 8, bedrooms: 3, lowRate: 650, holidayRate: 850, highRate: 1200, cleaningFee: 200, notes: 'Churrasqueira · A/C em todos os quartos · Vaga de garagem · Suíte no térreo' },
    ]
  },
  {
    id: 'reinaldo-coroa-vermelha',
    name: 'Apto do Reinaldo',
    subtitle: 'Coroa Vermelha · Santa Cruz Cabrália',
    location: 'Coroa Vermelha, Santa Cruz Cabrália',
    distance: 'Vista para o mar · Perto dos recifes de coral',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Apartamento de 3 suítes com churrasqueira privativa e vista para o mar em Coroa Vermelha. Próximo ao Caminho de Moisés e recifes de coral.',
    nearbyHighlights: 'Caminho de Moisés · Feirinha Pataxó · Recanto do Sossego · Reserva da Jaqueira',
    units: [
      { name: 'Apto do Reinaldo', type: '3 Suítes', id: 'GC01J', capacity: 12, bedrooms: 3, lowRate: 750, holidayRate: 1200, highRate: 1600, cleaningFee: 200, notes: 'Vista para o mar · Churrasqueira privativa · Todos os ambientes com A/C' },
    ]
  },
  {
    id: 'jessilene',
    name: 'Apto da Jessilene',
    subtitle: "Arraial D'Ajuda · Porto Seguro",
    location: "Arraial D'Ajuda, Porto Seguro",
    distance: "Próximo à Praia do Parracho e Mirante dos Corais",
    commission: 0.15,
    fixed: 2500,
    condoDesc: "Apartamento de 3 suítes em Arraial D'Ajuda com churrasqueira privativa, banheiro social no térreo e vaga de garagem. Próximo ao Mirante das Fitas e Praia do Parracho.",
    nearbyHighlights: "Praia do Mucugê · Parracho · Mirante das Fitas · Rua Mucugê · Recife de Fora",
    units: [
      { name: 'Apto da Jessilene', type: '3 Suítes', id: 'HA02J', capacity: 12, bedrooms: 3, lowRate: 750, holidayRate: 1100, highRate: 1400, cleaningFee: 200, notes: 'Churrasqueira privativa · Banheiro social no térreo · Vaga de garagem' },
    ]
  },
  {
    id: 'casa-tremura',
    name: 'Casa do Tremura',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '300m da praia de Taperapuã',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Casa com 6 quartos (4 suítes, 2 quartos), piscina e área gourmet com churrasqueira. Capacidade até 27 pessoas. Melhor custo-benefício entre as casas do portfólio.',
    nearbyHighlights: 'Tôa Tôa · Axé Moi · Boa Beach · Beat Beach · Colher de Pau · Orla Center',
    units: [
      { name: 'Casa do Tremura', type: '6 Quartos', id: 'GF02J', capacity: 27, bedrooms: 6, lowRate: 1600, holidayRate: 2500, highRate: 3000, cleaningFee: 0, notes: 'Piscina · Área gourmet · Churrasqueira · 4 suítes + 2 quartos' },
    ]
  },
  {
    id: 'casa-laureana',
    name: 'Casa da Laureana',
    subtitle: "Arraial D'Ajuda · Porto Seguro",
    location: "Arraial D'Ajuda, Porto Seguro",
    distance: 'Vista mar completa · Acesso à praia de carro',
    commission: 0.15,
    fixed: 2500,
    condoDesc: "Casa com 4 suítes (1 master com vista pro mar), piscina privativa e área gourmet externa em Arraial D'Ajuda. Limpeza diária inclusa. Caução: R$2.000.",
    nearbyHighlights: "Praia do Mucugê (10min a pé) · Parracho · Pitinga · Rua Mucugê · Mirante das Fitas",
    units: [
      { name: 'Casa da Laureana', type: '4 Suítes', id: 'GF04J', capacity: 13, bedrooms: 4, lowRate: 1800, holidayRate: 2500, highRate: 3000, cleaningFee: 250, notes: 'Vista mar · Piscina privativa · Área gourmet · Suíte master premium · Limpeza diária' },
    ]
  },
  {
    id: 'casa-moana',
    name: 'Casa da Moana',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '5 min da praia · Próximo ao Axé Moi e Beat Beach',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Casa com 5 suítes (3 no térreo), piscina com guarda-sol e espreguiçadeiras, área gourmet. Até 16 pessoas. Próximo ao Axé Moi e Beat Beach.',
    nearbyHighlights: 'Axé Moi · Beat Beach · Tôa Tôa · Boa Beach · Colher de Pau · Orla Center',
    units: [
      { name: 'Casa da Moana', type: '5 Suítes', id: 'GF06J', capacity: 16, bedrooms: 5, lowRate: 1500, holidayRate: 2500, highRate: 3000, cleaningFee: 0, notes: 'Piscina com guarda-sol · Área gourmet · 3 suítes no térreo' },
    ]
  },
  {
    id: 'casa-john',
    name: 'Casa do John',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '600m da praia de Taperapuã',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Casa com 6 quartos, piscina, área de festas com churrasqueira e freezer externo. Capacidade até 31 pessoas — ideal para grupos grandes e festas.',
    nearbyHighlights: 'Tôa Tôa · Axé Moi · Boa Beach · Beat Beach · Orla Center · Dengo Bar',
    units: [
      { name: 'Casa do John', type: '6 Quartos', id: 'GG08J', capacity: 31, bedrooms: 6, lowRate: 1800, holidayRate: 2200, highRate: 2700, cleaningFee: 0, notes: 'Piscina · Área de festas · Churrasqueira · Freezer externo' },
    ]
  },
  {
    id: 'casa-euller',
    name: 'Casa do Euller',
    subtitle: 'Taperapuã · Porto Seguro',
    location: 'Taperapuã, Porto Seguro',
    distance: '500m da praia · Porto Seguro Prime Village',
    commission: 0.15,
    fixed: 2500,
    condoDesc: 'Maior imóvel do portfólio Artezian. 9 quartos, 9 banheiros, piscina grande, área de jogos, cozinha externa com churrasqueira. Até 58 pessoas — eventos, grupos corporativos e família grande.',
    nearbyHighlights: 'Tôa Tôa · Axé Moi · Boa Beach · Beat Beach · Colher de Pau · Orla Center',
    units: [
      { name: 'Casa do Euller', type: '9 Quartos', id: 'GG06J', capacity: 58, bedrooms: 9, lowRate: 2500, holidayRate: 3500, highRate: 3500, cleaningFee: 0, notes: 'Maior casa do portfólio · Piscina grande · Área de jogos · Cozinha externa com churrasqueira' },
    ]
  },
];

// ─────────────────────────────────────────────
// HELPERS DE CÁLCULO
// ─────────────────────────────────────────────
function calcGroup(group) {
  const n = group.units.length;
  const avgLow = group.units.reduce((s, u) => s + u.lowRate, 0) / n;
  const avgHoliday = group.units.reduce((s, u) => s + u.holidayRate, 0) / n;
  const avgHigh = group.units.reduce((s, u) => s + u.highRate, 0) / n;
  const totalUnits = n;
  const breakEven = group.fixed / group.commission;
  const maxLow = avgLow * totalUnits * 30;
  const maxHoliday = avgHoliday * totalUnits * 30;
  const maxHigh = avgHigh * totalUnits * 30;
  const beLow = (breakEven / maxLow) * 100;
  const beHoliday = (breakEven / maxHoliday) * 100;
  const beHigh = (breakEven / maxHigh) * 100;
  const nightsLow = Math.ceil(breakEven / avgLow);
  const nightsHoliday = Math.ceil(breakEven / avgHoliday);
  const nightsHigh = Math.ceil(breakEven / avgHigh);

  // Monthly projection
  const months = [
    { name: 'Janeiro',   rate: avgHigh,    occ: 0.80 },
    { name: 'Fevereiro', rate: avgHigh,    occ: 0.85 },
    { name: 'Março',     rate: avgHoliday, occ: 0.45 },
    { name: 'Abril',     rate: avgHoliday, occ: 0.40 },
    { name: 'Maio',      rate: avgLow,     occ: 0.35 },
    { name: 'Junho',     rate: avgLow,     occ: 0.35 },
    { name: 'Julho',     rate: avgHoliday, occ: 0.75 },
    { name: 'Agosto',    rate: avgLow,     occ: 0.35 },
    { name: 'Setembro',  rate: avgLow,     occ: 0.35 },
    { name: 'Outubro',   rate: avgLow,     occ: 0.38 },
    { name: 'Novembro',  rate: avgHoliday, occ: 0.50 },
    { name: 'Dezembro',  rate: avgHigh,    occ: 0.75 },
  ];

  let annualRevenue = 0, annualCommission = 0;
  const monthData = months.map(m => {
    const nights = Math.round(totalUnits * 30 * m.occ);
    const rev = nights * m.rate;
    const comm = rev * group.commission;
    const result = comm - group.fixed;
    annualRevenue += rev;
    annualCommission += comm;
    return { ...m, nights, rev, comm, result };
  });

  const annualFixed = group.fixed * 12;
  const annualResult = annualCommission - annualFixed;
  const avgOccupancy = months.reduce((s, m) => s + m.occ, 0) / 12;

  return {
    avgLow, avgHoliday, avgHigh, totalUnits,
    breakEven, maxLow, maxHoliday, maxHigh,
    beLow, beHoliday, beHigh,
    nightsLow, nightsHoliday, nightsHigh,
    monthData, annualRevenue, annualCommission, annualFixed, annualResult, avgOccupancy
  };
}

function fmt(n) {
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}
function pct(n) {
  return Math.round(n) + '%';
}

// ─────────────────────────────────────────────
// CSS COMPARTILHADO
// ─────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  :root { --gold:#c2a14e;--dark:#2a2a2a;--teal:#264653;--white:#ffffff;--light:#f8f6f1;--gray:#888;--border:#e8e0d0; }
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Lato',sans-serif;color:var(--dark);background:#e5e5e5; }
  .page { width:210mm;min-height:297mm;background:var(--white);margin:12px auto;position:relative;overflow:hidden;page-break-after:always; }
  .pi { padding:13mm 15mm;height:100%;display:flex;flex-direction:column; }
  .ph { display:flex;justify-content:space-between;align-items:center;padding-bottom:5mm;border-bottom:1px solid var(--border);margin-bottom:7mm; }
  .ph .brand { font-family:'Playfair Display',serif;font-size:11pt;color:var(--gold);letter-spacing:1px; }
  .ph .plabel { font-size:7.5pt;color:var(--gray);letter-spacing:1.5px;text-transform:uppercase; }
  h1,h2 { font-family:'Playfair Display',serif; }
  .stitle { font-family:'Playfair Display',serif;font-size:19pt;color:var(--teal);margin-bottom:2mm; }
  .ssub { font-size:8.5pt;color:var(--gray);margin-bottom:6mm;line-height:1.5; }
  .gbar { width:28px;height:2px;background:var(--gold);margin-bottom:4mm; }
  .pf { margin-top:auto;padding-top:4mm;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center; }
  .pf .fbrand { font-size:7.5pt;color:var(--gold);font-family:'Playfair Display',serif; }
  .pf .fnote { font-size:7pt;color:var(--gray); }
  hr.div { border:none;border-top:1px solid var(--border);margin:3.5mm 0; }
  .tsm { font-size:8pt;color:var(--gray);line-height:1.6; }

  /* COVER */
  .cover { background:var(--teal);min-height:297mm;display:flex;flex-direction:column;justify-content:space-between;padding:17mm 15mm; }
  .clogo { font-family:'Playfair Display',serif;font-size:12pt;color:var(--gold);letter-spacing:2px;text-transform:uppercase; }
  .clogo span { display:block;font-size:7.5pt;color:rgba(255,255,255,0.5);letter-spacing:3px;font-family:'Lato',sans-serif;font-weight:300;margin-top:3px; }
  .cmain { flex:1;display:flex;flex-direction:column;justify-content:center; }
  .ceyebrow { font-size:7.5pt;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:5mm; }
  .ctitle { font-family:'Playfair Display',serif;font-size:30pt;color:var(--white);line-height:1.15;margin-bottom:4mm; }
  .csub { font-size:11pt;color:rgba(255,255,255,0.6);font-weight:300;line-height:1.6; }
  .cline { width:36px;height:2px;background:var(--gold);margin:5mm 0; }
  .cmeta { display:flex;gap:8mm;border-top:1px solid rgba(255,255,255,0.15);padding-top:5mm;flex-wrap:wrap; }
  .cmitem .lbl { font-size:6.5pt;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px; }
  .cmitem .val { font-size:8.5pt;color:rgba(255,255,255,0.85); }

  /* TABLES */
  table.t { width:100%;border-collapse:collapse;margin-bottom:4mm; }
  table.t th { background:var(--teal);color:var(--white);font-size:7.5pt;text-transform:uppercase;letter-spacing:.5px;padding:2.5mm 3mm;text-align:left;font-weight:400; }
  table.t td { padding:2.5mm 3mm;font-size:8.5pt;border-bottom:1px solid var(--border); }
  table.t tr:last-child td { border-bottom:none; }
  table.t tr:nth-child(even) td { background:var(--light); }
  table.t .hl td { background:#fdf8ee!important;font-weight:700; }
  table.t .tr td { background:var(--teal)!important;color:var(--white);font-weight:700;border:none; }
  table.t .tr td.gc { color:var(--gold); }
  .gt { color:var(--gold);font-weight:700; }
  .tt { color:var(--teal);font-weight:700; }
  .rt { color:#c24a4a;font-weight:700; }

  /* METRIC ROW */
  .mr { display:grid;grid-template-columns:repeat(3,1fr);gap:3.5mm;margin-bottom:4mm; }
  .mr2 { display:grid;grid-template-columns:repeat(2,1fr);gap:3.5mm;margin-bottom:4mm; }
  .mc { background:var(--light);border-radius:5px;padding:3.5mm;text-align:center; }
  .mc.dk { background:var(--teal); }
  .mc.gk { background:var(--gold); }
  .mc .ml { font-size:7pt;text-transform:uppercase;letter-spacing:1px;color:var(--gray);margin-bottom:1.5mm; }
  .mc.dk .ml,.mc.gk .ml { color:rgba(255,255,255,.65); }
  .mc .mv { font-family:'Playfair Display',serif;font-size:18pt;color:var(--teal);line-height:1; }
  .mc.dk .mv { color:var(--white); }
  .mc.gk .mv { color:var(--white); }
  .mc .ms { font-size:7pt;color:var(--gray);margin-top:1mm; }
  .mc.dk .ms,.mc.gk .ms { color:rgba(255,255,255,.6); }

  /* LEVEL CARDS */
  .lg { display:grid;grid-template-columns:repeat(3,1fr);gap:3.5mm;margin-bottom:4mm; }
  .lc { border-radius:5px;overflow:hidden; }
  .lc .lh { padding:2.5mm 3.5mm;font-size:7.5pt;text-transform:uppercase;letter-spacing:1px;font-weight:700; }
  .lc.lmin .lh { background:#e8e0d0;color:var(--gray); }
  .lc.lmet .lh { background:var(--gold);color:var(--white); }
  .lc.lidl .lh { background:var(--teal);color:var(--white); }
  .lc .lb { background:var(--light);padding:3.5mm; }
  .lc .lrev { font-family:'Playfair Display',serif;font-size:15pt;color:var(--teal);margin-bottom:1mm; }
  .lc.lmet .lrev { color:var(--gold); }
  .lc.lidl .lrev { color:var(--teal); }
  .lc .lcomm { font-size:8.5pt;color:var(--dark);margin-bottom:2.5mm; }
  .lc .lres { font-size:7.5pt;font-weight:700;padding:1.5mm 2.5mm;border-radius:3px;display:inline-block; }
  .lc.lmin .lres { background:#ddd;color:#666; }
  .lc.lmet .lres { background:#fdf8ee;color:var(--gold); }
  .lc.lidl .lres { background:#264653;color:var(--white); }
  .lc .locc { font-size:7.5pt;color:var(--gray);margin-top:2.5mm;line-height:1.6; }

  /* CARDS */
  .card { background:var(--light);border-radius:5px;padding:4mm;margin-bottom:3.5mm;border-left:3px solid var(--gold); }
  .card .ctit { font-size:7.5pt;text-transform:uppercase;letter-spacing:1px;color:var(--gold);font-weight:700;margin-bottom:2mm; }
  .card p { font-size:8.5pt;color:var(--dark);line-height:1.6; }
  .callout { border-left:3px solid var(--gold);background:#fdf8ee;padding:3mm 4.5mm;border-radius:0 5px 5px 0;margin-bottom:3.5mm; }
  .callout p { font-size:8.5pt;color:var(--dark);line-height:1.6; }
  .callout strong { color:var(--teal); }

  /* STRATEGY GRID */
  .sg { display:grid;grid-template-columns:1fr 1fr;gap:3.5mm;margin-bottom:4mm; }
  .sc { border:1px solid var(--border);border-radius:5px;overflow:hidden; }
  .sc .sh { background:var(--teal);color:var(--white);padding:2.5mm 3.5mm;font-size:8pt;font-weight:700; }
  .sc .sb { padding:3.5mm; }
  .sc .sb ul { list-style:none;padding:0; }
  .sc .sb li { font-size:8pt;color:var(--dark);padding:1.5mm 0 1.5mm 3mm;border-bottom:1px solid var(--border);position:relative;line-height:1.4; }
  .sc .sb li:last-child { border-bottom:none; }
  .sc .sb li::before { content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:3px;background:var(--gold);border-radius:50%; }

  /* UNIT CARDS GRID */
  .ug { display:grid;gap:4mm;margin-bottom:4mm; }
  .ug.u1 { grid-template-columns:1fr; }
  .ug.u2 { grid-template-columns:1fr 1fr; }
  .ug.u3 { grid-template-columns:1fr 1fr 1fr; }
  .uc { background:var(--light);border-radius:5px;padding:4mm;border-left:3px solid var(--gold); }
  .uc .utype { font-size:7pt;color:var(--gray);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2mm; }
  .uc .uname { font-family:'Playfair Display',serif;font-size:12pt;color:var(--teal);margin-bottom:2mm; }
  .uc .uid { font-size:7pt;color:var(--gray); }
  .uc .urates { display:flex;gap:3mm;margin:3mm 0; }
  .uc .urate { text-align:center;flex:1;background:var(--white);padding:2mm;border-radius:4px; }
  .uc .urate .rl { font-size:6.5pt;color:var(--gray);text-transform:uppercase;letter-spacing:.5px;margin-bottom:1mm; }
  .uc .urate .rv { font-size:10pt;font-weight:700;color:var(--teal); }
  .uc .unotes { font-size:7.5pt;color:var(--gray); }

  /* KPI */
  .kg { display:grid;grid-template-columns:1fr 1fr;gap:3.5mm;margin-bottom:4mm; }
  .kc { background:var(--light);border-radius:5px;padding:3.5mm;border-top:2px solid var(--gold); }
  .kc .kt { font-size:7.5pt;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:1px;margin-bottom:3mm; }
  .kc ul { list-style:none; }
  .kc li { font-size:7.5pt;padding:1.5mm 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center; }
  .kc li:last-child { border-bottom:none; }
  .kc .ktg { font-weight:700;color:var(--gold);font-size:8pt; }

  /* STEPS */
  .step { display:flex;gap:3.5mm;align-items:flex-start;margin-bottom:3.5mm;padding:3.5mm;background:var(--light);border-radius:5px; }
  .snum { background:var(--gold);color:var(--white);width:6mm;height:6mm;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8.5pt;font-weight:700;flex-shrink:0; }
  .scont .stit { font-size:8.5pt;font-weight:700;color:var(--teal);margin-bottom:1mm; }
  .scont .sdesc { font-size:7.5pt;color:var(--dark);line-height:1.5; }
  .scont .stag { display:inline-block;font-size:6.5pt;padding:.5mm 2mm;border-radius:3px;background:var(--teal);color:var(--white);margin-top:1.5mm;text-transform:uppercase;letter-spacing:1px; }

  @media print {
    body { background:white; }
    .page { margin:0;box-shadow:none;page-break-after:always; }
    @page { size:A4;margin:0; }
  }
`;

// ─────────────────────────────────────────────
// GERADOR DE HTML
// ─────────────────────────────────────────────
function generateHTML(group) {
  const c = calcGroup(group);
  const isMulti = group.units.length > 1;
  const mainUnit = group.units[0];
  const unitClass = group.units.length === 1 ? 'u1' : group.units.length === 2 ? 'u2' : 'u3';

  // Goals
  const g1Rev = c.breakEven; const g1Comm = group.fixed; const g1Res = 0;
  const g2Rev = g1Rev * 2;  const g2Comm = g2Rev * group.commission; const g2Res = g2Comm - group.fixed;
  const g3Rev = g1Rev * 3;  const g3Comm = g3Rev * group.commission; const g3Res = g3Comm - group.fixed;

  const occ1Low = pct(c.beLow); const occ1Hol = pct(c.beHoliday); const occ1High = pct(c.beHigh);
  const occ2Low = pct(c.beLow * 2); const occ2Hol = pct(c.beHoliday * 2); const occ2High = pct(c.beHigh * 2);
  const occ3Low = pct(c.beLow * 3); const occ3Hol = pct(c.beHoliday * 3); const occ3High = pct(c.beHigh * 3);

  // Month season badges
  const seaBadge = (m) => {
    if ([0,1,11].includes(m)) return '<span style="font-size:6.5pt;font-weight:700;padding:1px 4px;border-radius:3px;background:#fde8e8;color:#c24a4a;">Alta</span>';
    if ([2,3,6,10].includes(m)) return '<span style="font-size:6.5pt;font-weight:700;padding:1px 4px;border-radius:3px;background:#fef3e2;color:#c27c00;">Feriado/Mista</span>';
    return '<span style="font-size:6.5pt;font-weight:700;padding:1px 4px;border-radius:3px;background:#e8f4e8;color:#4a7c4a;">Baixa</span>';
  };

  const unitCards = group.units.map(u => `
    <div class="uc">
      <div class="utype">${u.type}</div>
      <div class="uname">${u.name}</div>
      <div class="uid">ID: ${u.id} · Capacidade: ${u.capacity} pessoas · ${u.bedrooms > 1 ? u.bedrooms + ' quartos' : '1 quarto'}</div>
      <div class="urates">
        <div class="urate"><div class="rl">Baixa</div><div class="rv">${fmt(u.lowRate)}</div></div>
        <div class="urate"><div class="rl">Feriados</div><div class="rv">${fmt(u.holidayRate)}</div></div>
        <div class="urate" style="background:#fdf8ee;"><div class="rl">Alta</div><div class="rv" style="color:var(--gold);">${fmt(u.highRate)}</div></div>
      </div>
      <div class="unotes">${u.notes}${u.cleaningFee > 0 ? ' · Taxa de limpeza: R$ ' + u.cleaningFee : ''}</div>
    </div>
  `).join('');

  const monthRows = c.monthData.map((m, i) => {
    const resColor = m.result >= 0 ? 'class="gt"' : 'class="rt"';
    const sign = m.result >= 0 ? '+' : '';
    return `<tr>
      <td>${m.name}</td>
      <td>${seaBadge(i)}</td>
      <td>${pct(m.occ * 100)}</td>
      <td>${m.nights}</td>
      <td>${fmt(m.rev)}</td>
      <td ${resColor}>${fmt(m.comm)}</td>
      <td>${fmt(group.fixed)}</td>
      <td ${resColor}>${sign}${fmt(m.result)}</td>
    </tr>`;
  }).join('');

  const footer = `<div class="pf"><div class="fbrand">Artezian Real Estate Atelie</div><div class="fnote">${group.name} · Estratégia de Operação · 2026</div></div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${group.name} — Estratégia | Artezian</title>
<style>${CSS}</style>
</head>
<body>

<!-- CAPA -->
<div class="page">
  <div class="cover">
    <div class="clogo">Artezian<span>Real Estate Atelie</span></div>
    <div class="cmain">
      <div class="ceyebrow">Estratégia de Operação · Parceiro</div>
      <h1 class="ctitle">${group.name.replace(' ', '<br>')}</h1>
      <div class="cline"></div>
      <p class="csub">${group.subtitle}<br>Modelo comercial, metas de receita e estratégia de distribuição por temporada</p>
    </div>
    <div class="cmeta">
      <div class="cmitem"><div class="lbl">Elaborado por</div><div class="val">Artezian Real Estate Atelie</div></div>
      <div class="cmitem"><div class="lbl">Data</div><div class="val">Junho de 2026</div></div>
      <div class="cmitem"><div class="lbl">Unidades</div><div class="val">${group.units.length} unidade${group.units.length > 1 ? 's' : ''} · ${group.location}</div></div>
      <div class="cmitem"><div class="lbl">Modelo</div><div class="val">Comissão ${Math.round(group.commission * 100)}% + Fixo ${fmt(group.fixed)}/mês</div></div>
    </div>
  </div>
</div>

<!-- PORTFÓLIO -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">Portfólio</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">${isMulti ? 'As ' + group.units.length + ' Unidades' : 'A Unidade'}</h2>
    <p class="ssub">${group.distance} · ${group.location}</p>

    <div class="ug ${unitClass}">${unitCards}</div>

    <div class="callout">
      <p><strong>Sobre o imóvel:</strong> ${group.condoDesc}</p>
    </div>

    <div class="card">
      <div class="ctit">O que tem por perto</div>
      <p>${group.nearbyHighlights}</p>
    </div>

    <div class="mr" style="margin-top:3mm;">
      <div class="mc dk">
        <div class="ml">Capacidade total</div>
        <div class="mv">${group.units.reduce((s,u)=>s+u.capacity,0)}</div>
        <div class="ms">pessoas</div>
      </div>
      <div class="mc gk">
        <div class="ml">Diária alta temporada</div>
        <div class="mv">${fmt(c.avgHigh)}</div>
        <div class="ms">média do portfólio</div>
      </div>
      <div class="mc">
        <div class="ml">Diária baixa temporada</div>
        <div class="mv" style="color:var(--teal);">${fmt(c.avgLow)}</div>
        <div class="ms">média do portfólio</div>
      </div>
    </div>
    ${footer}
  </div>
</div>

<!-- MODELO DE PARCERIA + BREAK-EVEN -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">Modelo de Parceria</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">Modelo Comercial & Break-even</h2>
    <p class="ssub">Estrutura financeira da parceria e ponto de equilíbrio por temporada</p>

    <div class="mr">
      <div class="mc dk">
        <div class="ml">Comissão Artezian</div>
        <div class="mv">${Math.round(group.commission * 100)}%</div>
        <div class="ms">sobre receita bruta</div>
      </div>
      <div class="mc gk">
        <div class="ml">Fixo Mensal</div>
        <div class="mv">${fmt(group.fixed)}</div>
        <div class="ms">independente da ocupação</div>
      </div>
      <div class="mc">
        <div class="ml">Receita mín. necessária</div>
        <div class="mv" style="color:var(--teal);">${fmt(c.breakEven)}</div>
        <div class="ms">${fmt(group.fixed)} ÷ ${Math.round(group.commission * 100)}%</div>
      </div>
    </div>

    <table class="t" style="margin-bottom:4mm;">
      <thead><tr><th>Temporada</th><th>Diária média</th><th>Receita máx. (${c.totalUnits} un × 30d)</th><th>Ocupação mínima</th><th>Noites p/ break-even</th></tr></thead>
      <tbody>
        <tr><td><b>Baixa</b></td><td>${fmt(c.avgLow)}</td><td>${fmt(c.maxLow)}</td><td class="gt">${occ1Low}</td><td>${c.nightsLow} noites</td></tr>
        <tr><td><b>Feriados</b></td><td>${fmt(c.avgHoliday)}</td><td>${fmt(c.maxHoliday)}</td><td class="gt">${occ1Hol}</td><td>${c.nightsHoliday} noites</td></tr>
        <tr class="hl"><td><b>Alta</b></td><td>${fmt(c.avgHigh)}</td><td>${fmt(c.maxHigh)}</td><td class="gt">${occ1High}</td><td>${c.nightsHigh} noites</td></tr>
      </tbody>
    </table>

    <div class="sg">
      <div class="sc">
        <div class="sh">✦ Artezian é responsável por</div>
        <div class="sb"><ul>
          <li>Gestão dos anúncios — Airbnb, site, Booking.com</li>
          <li>Atendimento de hóspedes via WhatsApp e Instagram</li>
          <li>Precificação dinâmica por temporada e feriados</li>
          <li>Coordenação de check-in, check-out e limpeza</li>
          <li>Relatórios mensais de performance e ocupação</li>
          <li>Estratégia de marketing e distribuição de demanda</li>
        </ul></div>
      </div>
      <div class="sc">
        <div class="sh" style="background:var(--gold);">✦ Parceiro é responsável por</div>
        <div class="sb"><ul>
          <li>Disponibilidade e manutenção do imóvel</li>
          <li>Enxoval, equipamentos e estrutura</li>
          <li>Aprovação do calendário de disponibilidade</li>
          <li>Bloqueios para uso próprio (com antecedência)</li>
          <li>Custos de reparo e manutenção corretiva</li>
          <li>IPTU, condomínio e despesas do imóvel</li>
        </ul></div>
      </div>
    </div>

    <div class="callout">
      <p><strong>Simulação alta temporada — 1 semana com 100% de ocupação:</strong>
      ${group.units.length} un × 7 noites × ${fmt(c.avgHigh)}/n = <strong>${fmt(group.units.length * 7 * c.avgHigh)}</strong> de receita → comissão de <strong>${fmt(group.units.length * 7 * c.avgHigh * group.commission)}</strong>
      ${group.units.length * 7 * c.avgHigh * group.commission >= group.fixed ? `(cobre o fixo${group.units.length * 7 * c.avgHigh * group.commission > group.fixed ? ' com margem de ' + fmt(group.units.length * 7 * c.avgHigh * group.commission - group.fixed) : ''})` : '(ainda não cobre o fixo — precisa de mais noites)'}.</p>
    </div>
    ${footer}
  </div>
</div>

<!-- METAS -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">Metas de Performance</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">Metas por Nível</h2>
    <p class="ssub">Três patamares de performance para acompanhamento mensal</p>

    <div class="lg">
      <div class="lc lmin">
        <div class="lh">Nível Mínimo</div>
        <div class="lb">
          <div class="lrev">${fmt(g1Rev)}</div>
          <div class="lcomm">Comissão: <strong>${fmt(g1Comm)}</strong></div>
          <span class="lres">Resultado: R$ 0</span>
          <div class="locc"><strong>Baixa:</strong> ${occ1Low} · ${c.nightsLow} n<br><strong>Feriados:</strong> ${occ1Hol} · ${c.nightsHoliday} n<br><strong>Alta:</strong> ${occ1High} · ${c.nightsHigh} n</div>
        </div>
      </div>
      <div class="lc lmet">
        <div class="lh">⭐ Nível Meta</div>
        <div class="lb">
          <div class="lrev">${fmt(g2Rev)}</div>
          <div class="lcomm">Comissão: <strong>${fmt(g2Comm)}</strong></div>
          <span class="lres">Resultado: +${fmt(g2Res)}</span>
          <div class="locc"><strong>Baixa:</strong> ${occ2Low}<br><strong>Feriados:</strong> ${occ2Hol}<br><strong>Alta:</strong> ${occ2High}</div>
        </div>
      </div>
      <div class="lc lidl">
        <div class="lh">🏆 Nível Ideal</div>
        <div class="lb">
          <div class="lrev" style="color:var(--white);">${fmt(g3Rev)}</div>
          <div class="lcomm" style="color:rgba(255,255,255,.8);">Comissão: <strong style="color:var(--gold);">${fmt(g3Comm)}</strong></div>
          <span class="lres">Resultado: +${fmt(g3Res)}</span>
          <div class="locc" style="color:rgba(255,255,255,.7);"><strong style="color:rgba(255,255,255,.9);">Baixa:</strong> ${occ3Low}<br><strong style="color:rgba(255,255,255,.9);">Feriados:</strong> ${occ3Hol}<br><strong style="color:rgba(255,255,255,.9);">Alta:</strong> ${occ3High}</div>
        </div>
      </div>
    </div>

    <table class="t">
      <thead><tr><th>Nível</th><th>Receita alvo</th><th>Comissão</th><th>Fixo</th><th>Resultado líquido</th><th>Ocp. mín. (baixa)</th><th>Ocp. mín. (alta)</th></tr></thead>
      <tbody>
        <tr><td><b>Mínimo</b></td><td>${fmt(g1Rev)}</td><td>${fmt(g1Comm)}</td><td>${fmt(group.fixed)}</td><td>R$ 0</td><td class="gt">${occ1Low}</td><td class="gt">${occ1High}</td></tr>
        <tr class="hl"><td><b>Meta</b></td><td>${fmt(g2Rev)}</td><td>${fmt(g2Comm)}</td><td>${fmt(group.fixed)}</td><td class="gt">+${fmt(g2Res)}</td><td class="gt">${occ2Low}</td><td class="gt">${occ2High}</td></tr>
        <tr><td><b>Ideal</b></td><td>${fmt(g3Rev)}</td><td>${fmt(g3Comm)}</td><td>${fmt(group.fixed)}</td><td class="tt">+${fmt(g3Res)}</td><td class="gt">${occ3Low}</td><td class="gt">${occ3High}</td></tr>
      </tbody>
    </table>

    <div class="callout">
      <p><strong>Benchmark:</strong> Propriedades bem geridas em Porto Seguro atingem 55–75% de ocupação anual. Com gestão ativa da Artezian, atingir o Nível Meta é realista dentro de 3 a 6 meses de operação estruturada.</p>
    </div>
    ${footer}
  </div>
</div>

<!-- PROJEÇÃO ANUAL -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">Projeção Anual</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">Projeção 12 Meses</h2>
    <p class="ssub">Cenário Meta — receita bruta, comissão e resultado por mês (${group.units.length} unidade${group.units.length > 1 ? 's' : ''})</p>

    <table class="t" style="font-size:8pt;">
      <thead><tr><th>Mês</th><th>Temporada</th><th>Ocupação</th><th>Noites</th><th>Receita bruta</th><th>Comissão</th><th>Fixo</th><th>Resultado</th></tr></thead>
      <tbody>
        ${monthRows}
        <tr class="tr">
          <td><b>TOTAL ANO</b></td>
          <td>—</td>
          <td><b>${pct(Math.round(c.avgOccupancy * 100))} média</b></td>
          <td><b>${c.monthData.reduce((s,m)=>s+m.nights,0)}</b></td>
          <td><b>${fmt(c.annualRevenue)}</b></td>
          <td class="gc"><b>${fmt(c.annualCommission)}</b></td>
          <td><b>${fmt(c.annualFixed)}</b></td>
          <td class="gc"><b>+${fmt(c.annualResult)}</b></td>
        </tr>
      </tbody>
    </table>

    <div class="callout">
      <p><strong>Resultado líquido projetado (Cenário Meta):</strong> ${fmt(c.annualResult)} no ano, com média de ${fmt(c.annualResult / 12)}/mês acima do fixo. Receita bruta estimada em ${fmt(c.annualRevenue)} com ocupação média anual de ${pct(Math.round(c.avgOccupancy * 100))}.</p>
    </div>
    ${footer}
  </div>
</div>

<!-- DISTRIBUIÇÃO + OPERAÇÃO -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">Distribuição & Operação</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">Estratégia de Distribuição</h2>
    <p class="ssub">Como a Artezian distribui o imóvel para maximizar ocupação e receita</p>

    <div class="sg" style="margin-bottom:4mm;">
      <div class="sc">
        <div class="sh">Airbnb — Canal Principal</div>
        <div class="sb"><ul>
          <li>Listagem otimizada com fotos profissionais</li>
          <li>Resposta em menos de 1h (melhora ranking)</li>
          <li>Superhost João @ojoaomendonca (4.9 ⭐ · 95k)</li>
          <li>Precificação dinâmica via Stays</li>
          <li>Calendário aberto com 90 dias de antecedência</li>
        </ul></div>
      </div>
      <div class="sc">
        <div class="sh" style="background:var(--gold);">Direto — Canal Estratégico</div>
        <div class="sb"><ul>
          <li>Site artezian.com.br com reserva direta</li>
          <li>WhatsApp API Oficial com atendimento automático</li>
          <li>Leads orgânicos via @ojoaomendonca (95k)</li>
          <li>5–10% de desconto para reservas diretas</li>
          <li>CRM Datacrazy para hóspedes recorrentes</li>
        </ul></div>
      </div>
      <div class="sc">
        <div class="sh">Booking / OTAs Secundárias</div>
        <div class="sb"><ul>
          <li>Booking.com para baixa temporada</li>
          <li>Sincronização de calendário via Stays</li>
          <li>Preço ligeiramente superior para cobrir comissão</li>
        </ul></div>
      </div>
      <div class="sc">
        <div class="sh" style="background:var(--dark);">Marketing & Conteúdo</div>
        <div class="sb"><ul>
          <li>Reels de Porto Seguro via @ojoaomendonca</li>
          <li>Meta Ads em alta temporada e feriados</li>
          <li>Google Ads para buscas diretas de aluguel</li>
        </ul></div>
      </div>
    </div>

    <table class="t">
      <thead><tr><th>Temporada</th><th>Airbnb</th><th>Direto/WhatsApp</th><th>Booking/OTAs</th><th>Prioridade</th></tr></thead>
      <tbody>
        <tr><td><b>Alta</b></td><td>50%</td><td>40%</td><td>10%</td><td>Direto (sem taxa) + Airbnb</td></tr>
        <tr><td><b>Feriados</b></td><td>55%</td><td>35%</td><td>10%</td><td>Airbnb (visibilidade) + Direto</td></tr>
        <tr><td><b>Baixa</b></td><td>45%</td><td>25%</td><td>30%</td><td>Abrir mais canais p/ ocupação</td></tr>
      </tbody>
    </table>

    <div class="card">
      <div class="ctit">Estratégia operacional por temporada</div>
      <p><strong>Alta temporada:</strong> Mínimo 5 noites. Anúncios abertos com 90 dias de antecedência. Preço máximo aplicado.<br>
      <strong>Feriados:</strong> Mínimo 3 noites. Bloquear datas de baixa rotatividade ao redor do feriado.<br>
      <strong>Baixa temporada:</strong> Mínimo 2 noites. Desconto progressivo para reservas com 30+ dias. Focar em ocupação contínua.</p>
    </div>
    ${footer}
  </div>
</div>

<!-- KPIs + PRÓXIMOS PASSOS -->
<div class="page">
  <div class="pi">
    <div class="ph"><div class="brand">Artezian</div><div class="plabel">KPIs & Próximos Passos</div></div>
    <div class="gbar"></div>
    <h2 class="stitle">Indicadores & Implantação</h2>
    <p class="ssub">Métricas mensais e plano de implantação da operação</p>

    <div class="kg" style="margin-bottom:4mm;">
      <div class="kc">
        <div class="kt">Ocupação & Receita</div>
        <ul>
          <li>Taxa de ocupação mensal <span class="ktg">Meta: ≥ ${occ2Low}</span></li>
          <li>Receita bruta mensal <span class="ktg">Meta: ${fmt(g2Rev)}</span></li>
          <li>Diária média realizada (ADR) <span class="ktg">Vs. tabela base</span></li>
          <li>Comissão gerada <span class="ktg">Meta: ${fmt(g2Comm)}</span></li>
        </ul>
      </div>
      <div class="kc">
        <div class="kt">Qualidade & Canal</div>
        <ul>
          <li>Avaliação média Airbnb <span class="ktg">Meta: ≥ 4.8 ⭐</span></li>
          <li>Taxa de resposta <span class="ktg">Meta: ≥ 95%</span></li>
          <li>Reservas diretas <span class="ktg">Meta: ≥ 30%</span></li>
          <li>Cancelamentos <span class="ktg">Meta: &lt; 5%</span></li>
        </ul>
      </div>
    </div>

    <div class="step">
      <div class="snum">1</div>
      <div class="scont">
        <div class="stit">Onboarding e cadastro no Stays</div>
        <div class="sdesc">Cadastrar ${group.units.length > 1 ? 'as ' + group.units.length + ' unidades' : 'a unidade'} no Stays e conectar ao Airbnb, artezian.com.br e Booking. Configurar calendário, políticas de cancelamento e mínimos por temporada.</div>
        <span class="stag">Semana 1–2</span>
      </div>
    </div>
    <div class="step">
      <div class="snum">2</div>
      <div class="scont">
        <div class="stit">Fotos profissionais e otimização dos anúncios</div>
        <div class="sdesc">Sessão fotográfica do imóvel. Criar título e descrição otimizados para o perfil do hóspede ideal. Configurar preços dinâmicos por temporada.</div>
        <span class="stag">Semana 2–3</span>
      </div>
    </div>
    <div class="step">
      <div class="snum">3</div>
      <div class="scont">
        <div class="stit">Configurar atendimento e WhatsApp API</div>
        <div class="sdesc">Ativar fluxo de atendimento automático para consultas. Integrar ao CRM Datacrazy para registro de leads e hóspedes recorrentes.</div>
        <span class="stag">Semana 3</span>
      </div>
    </div>
    <div class="step">
      <div class="snum">4</div>
      <div class="scont">
        <div class="stit">Primeira revisão de performance</div>
        <div class="sdesc">Reunião de 30 dias para apresentar os primeiros KPIs, ajustar precificação e alinhar expectativas para o próximo trimestre.</div>
        <span class="stag">Mês 1</span>
      </div>
    </div>

    <div style="background:var(--teal);border-radius:5px;padding:5mm;text-align:center;margin-top:auto;">
      <p style="font-family:'Playfair Display',serif;font-size:12pt;color:var(--white);margin-bottom:1.5mm;">Artezian Real Estate Atelie</p>
      <p style="font-size:8pt;color:rgba(255,255,255,.6);margin-bottom:2mm;">Porto Seguro · Coroa Vermelha · Arraial D'Ajuda · Taperapuã</p>
      <p style="font-size:8.5pt;color:var(--gold);">artezian.com.br · @ojoaomendonca</p>
    </div>
    ${footer}
  </div>
</div>

</body>
</html>`;
}

// ─────────────────────────────────────────────
// LOOP PRINCIPAL — GERAR E EXPORTAR
// ─────────────────────────────────────────────
console.log(`\n📋 Artezian — Gerador de Apresentações`);
console.log(`   ${groups.length} parceiros encontrados\n`);

let ok = 0, err = 0;

for (const group of groups) {
  const htmlFile = path.join(DIR, `${group.id}-estrategia.html`);
  const pdfFile  = path.join(DIR, `${group.id}-estrategia.pdf`);

  try {
    // 1. Gerar HTML
    fs.writeFileSync(htmlFile, generateHTML(group), 'utf8');

    // 2. Exportar PDF com Chrome headless
    const cmd = `${CHROME} --headless=new --disable-gpu --no-sandbox --print-to-pdf="${pdfFile}" --print-to-pdf-no-header --no-pdf-header-footer --run-all-compositor-stages-before-draw --virtual-time-budget=5000 "file:///${htmlFile.replace(/\\/g, '/')}"`;
    execSync(cmd, { stdio: 'pipe' });

    const size = (fs.statSync(pdfFile).size / 1024).toFixed(0);
    console.log(`  ✓  ${group.name.padEnd(32)} → ${group.id}-estrategia.pdf  (${size} KB)`);
    ok++;
  } catch (e) {
    console.error(`  ✗  ${group.name}:`, e.message);
    err++;
  }
}

console.log(`\n  Concluído — ${ok} PDFs gerados, ${err} erros.\n`);
