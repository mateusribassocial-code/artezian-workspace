const fs = require('fs');

const logoB64 = fs.readFileSync('.scratch_max/logo_b64.txt', 'utf8').trim();

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderBody(raw) {
  const escaped = esc(raw);
  const bolded = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  const paras = bolded.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  return paras;
}

// Curated real examples pulled from scan_final.json (verified against the raw scan)
const examples = [
  {
    stage: 'Descoberta · match por atributo',
    name: 'Maira Pott',
    date: '21 jun',
    body: `Boa Maira. Pra levar o pet, tenho duas opções que aceitam: o Studio do João em Taperapuã (pra pet de pequeno porte) e o Condomínio do Max na Praia do Mundaí.

Sobre os valores, qual dessas faixas de diária vcs estão planejando?

1. Menos de R$ 500
2. Entre R$ 500 e R$ 1.000
3. Acima de R$ 1.000`,
  },
  {
    stage: 'Reengajamento automático',
    name: 'Weberton',
    date: '1 jul',
    body: `Oi Weberton! Aqui é o Max ☀️

Vi que vc demonstrou interesse no Condomínio do Max. Como posso te ajudar hoje?`,
  },
  {
    stage: 'Reengajamento · segunda tentativa',
    name: 'Adriana Cardoso',
    date: '6 jul',
    body: `Adriana, aqui é o Max.

Eu sei que você tá ocupada, por isso ainda não desisti de você 🤣 Me avisa se ainda quiser ver as opções pro Condomínio do Max.`,
  },
  {
    stage: 'Cartão padrão do catálogo',
    name: 'Gleison',
    date: '15 jul',
    body: `🏡 Max T1
Mundaí · até 5 pessoas · 1 quarto
https://youtu.be/cz7X9SftIis`,
  },
  {
    stage: 'Cotação de valor',
    name: 'Ivyne Rocha',
    date: '15 jul',
    body: `🏡 Max T1
Mundaí · até 5 pessoas · 1 quarto
💵 Diária estimada: R$ 250 a R$ 1.100`,
  },
  {
    stage: 'Grupo grande',
    name: 'Adão Reis',
    date: '6 jul',
    body: `Com certeza, Adão! Que legal esse grupo de viagem de vocês. Com 140 pessoas a gente faz a festa aqui em Porto Seguro! ☀️

Vou te passar as opções.`,
  },
];

const exampleCards = examples.map(ex => `
        <article class="msg-card">
          <div class="msg-meta">
            <span class="msg-stage">${esc(ex.stage)}</span>
            <span class="msg-sep">·</span>
            <span class="msg-date">${esc(ex.date)}</span>
            <span class="msg-sep">·</span>
            <span class="msg-to">para ${esc(ex.name)}</span>
          </div>
          <div class="bubble">
            <div class="bubble-avatar" aria-hidden="true">M</div>
            <div class="bubble-content">${renderBody(ex.body)}</div>
          </div>
        </article>`).join('\n');

const template = fs.readFileSync('.scratch_max/presentation_template.html', 'utf8');
const out = template
  .replace('{{LOGO_B64}}', logoB64)
  .replace('{{EXAMPLE_CARDS}}', exampleCards);

fs.writeFileSync('.scratch_max/max-ofertas-presentation.html', out);
console.log('written, length:', out.length);
