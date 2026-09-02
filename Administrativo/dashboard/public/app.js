/* ── State ──────────────────────────────────────────────────────── */

const state = {
  currentMonth: todayMonth(),   // "2026-05"
  appData: { parceiros: [], custos: {} },
  stays: [],
  reservas: [],
  staysReservas: [],
  staysReservasCriadas: [],
  unitFilter: 'all',
  editingParceiroId: null,
  editingUnitCode: null,
};

/* ── Helpers ────────────────────────────────────────────────────── */

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(ym) {
  const [y, m] = ym.split('-');
  const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${names[parseInt(m) - 1]} ${y}`;
}

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(ym) {
  const [y, m] = ym.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { from: `${ym}-01`, to: `${ym}-${String(lastDay).padStart(2, '0')}` };
}

function brl(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return 'R$ —';
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/* ── API calls ──────────────────────────────────────────────────── */

async function fetchData() {
  const r = await fetch('/api/data');
  return r.json();
}

async function saveData(data) {
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function fetchStays() {
  try {
    const r = await fetch('/api/stays/listings');
    const d = await r.json();
    if (d.error) { console.warn('Stays error:', d.error, d.detail); return []; }
    // Stays retorna { value: [...] }
    if (Array.isArray(d.value)) return d.value;
    if (Array.isArray(d)) return d;
    return [];
  } catch (e) {
    console.error('Stays fetch failed:', e);
    return [];
  }
}

async function fetchReservas(month) {
  try {
    const r = await fetch(`/api/datacrazy/reservations?month=${month}`);
    const d = await r.json();
    if (d.error) {
      showApiStatus('dc-status', d.error + (d.detail ? ` — ${d.detail.slice(0, 120)}` : ''), true);
      showApiStatus('dc-status-locacao', d.error, true);
      return [];
    }
    hideApiStatus('dc-status');
    hideApiStatus('dc-status-locacao');
    // Datacrazy retorna { count, data: [...] }
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d)) return d;
    return [];
  } catch (e) {
    console.error('Datacrazy fetch failed:', e);
    return [];
  }
}

async function fetchStaysReservas(params) {
  const statusElId = params.statusElId || 'stays-res-status';
  try {
    const qs = new URLSearchParams();
    if (params.from && params.to) { qs.set('from', params.from); qs.set('to', params.to); }
    else qs.set('month', params.month);
    if (params.dateType) qs.set('dateType', params.dateType);

    const r = await fetch(`/api/stays/reservations?${qs.toString()}`);
    const d = await r.json();
    if (d.error) {
      showApiStatus(statusElId, d.error + (d.detail ? ` — ${d.detail.slice(0, 120)}` : ''), true);
      return [];
    }
    hideApiStatus(statusElId);
    return Array.isArray(d.reservas) ? d.reservas : [];
  } catch (e) {
    console.error('Stays reservations fetch failed:', e);
    return [];
  }
}

function showApiStatus(id, msg, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'api-status visible' + (isError ? ' error' : '');
}

function hideApiStatus(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'api-status';
}

/* ── Load everything ────────────────────────────────────────────── */

async function loadAll() {
  const btn = document.getElementById('btnRefresh');
  btn.classList.add('spinning');

  setStaysReservasDateInputs(state.currentMonth);

  const [appData, stays, reservas, staysReservas, staysReservasCriadas] = await Promise.all([
    fetchData(),
    fetchStays(),
    fetchReservas(state.currentMonth),
    fetchStaysReservas({ month: state.currentMonth }),
    fetchStaysReservas({ month: state.currentMonth, dateType: 'creation', statusElId: 'stays-criadas-status' }),
  ]);

  state.appData = appData;
  state.stays   = stays;
  state.reservas = reservas;
  state.staysReservas = staysReservas;
  state.staysReservasCriadas = staysReservasCriadas;

  populateStaysImovelFilter();
  updateStatusBadge(stays, reservas);
  renderAll();
  await saveMonthSnapshot();

  btn.classList.remove('spinning');
}

function updateStatusBadge(stays, reservas) {
  const badge = document.getElementById('statusBadge');
  const hasStays = stays.length > 0;
  const hasDC = reservas.length > 0;

  if (hasStays && hasDC) {
    badge.innerHTML = '<span class="dot dot-ok"></span> APIs conectadas';
  } else if (!hasStays && !hasDC) {
    badge.innerHTML = '<span class="dot dot-err"></span> APIs com erro';
  } else {
    const which = !hasStays ? 'Stays' : 'Datacrazy';
    badge.innerHTML = `<span class="dot dot-warn"></span> ${which} offline`;
  }
}

/* ── Render ─────────────────────────────────────────────────────── */

function renderAll() {
  const ml = monthLabel(state.currentMonth);

  // Update all month labels
  document.getElementById('monthLabel').textContent = ml;
  document.getElementById('custo-period').textContent = ml;
  document.getElementById('receita-period').textContent = ml;
  document.getElementById('reservas-period').textContent = ml;
  document.getElementById('parceiro-mes-label').textContent = `(${ml.split(' ')[0]})`;
  document.querySelectorAll('.pt-mes').forEach(el => (el.textContent = ml.split(' ')[0]));
  document.getElementById('modal-mes-label').textContent = ml;

  renderCustos();
  renderReceitas();
  renderSummary();
  renderChart();
  renderHistorico();
  renderParceiros();
  renderUnidades();
  renderReservas();
  renderStaysReservas();
  renderStaysReservasCriadas();
  initRelatorio();
}

/* ── Bloco 1 — Custos ───────────────────────────────────────────── */

function getCustosFixos() {
  return (state.appData.custosFixos || []).map(c => ({ ...c, natureza: 'Fixo' }));
}

function getCustosVariaveisDoMes() {
  const raw = state.appData.custos?.[state.currentMonth];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(c => ({ ...c, natureza: c.natureza || 'Variável' }));
  // legado: objeto simples
  const legado = [];
  if (raw.ferramentas)    legado.push({ id: uid(), tipo: 'Ferramentas',    titulo: 'Ferramentas',    frequencia: 'Mensal', valor: raw.ferramentas,    natureza: 'Variável' });
  if (raw.administrativo) legado.push({ id: uid(), tipo: 'Administrativo', titulo: 'Administrativo', frequencia: 'Mensal', valor: raw.administrativo, natureza: 'Variável' });
  if (raw.midiaPaga)      legado.push({ id: uid(), tipo: 'Mídia Paga',     titulo: 'Mídia Paga',     frequencia: 'Mensal', valor: raw.midiaPaga,      natureza: 'Variável' });
  return legado;
}

function getCustosDoMes() {
  return [...getCustosFixos(), ...getCustosVariaveisDoMes()];
}

function renderCustos() {
  const custos = getCustosDoMes();
  const tbody  = document.getElementById('custosBody');

  if (!custos.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum custo cadastrado neste mês</td></tr>';
    document.getElementById('custo-total').textContent = brl(0);
    return;
  }

  tbody.innerHTML = custos.map(c => {
    const tipoCls = c.tipo === 'Ferramentas' ? 'ferramentas'
                  : c.tipo === 'Administrativo' ? 'administrativo'
                  : c.tipo === 'Mídia Paga' ? 'midia' : 'outro';
    const nat    = c.natureza || 'Variável';
    const natCls = nat === 'Fixo' ? 'fixo' : 'variavel';
    return `
      <tr>
        <td><span class="tipo-badge ${natCls}">${nat}</span></td>
        <td><span class="tipo-badge ${tipoCls}">${escHtml(c.tipo)}</span></td>
        <td>${escHtml(c.titulo)}</td>
        <td>${escHtml(c.frequencia)}</td>
        <td><strong>${brl(c.valor)}</strong></td>
        <td><button class="edit-btn" onclick="openEditCusto('${c.id}', '${nat}')">✎</button></td>
      </tr>
    `;
  }).join('');

  updateCustoTotal();
}

function updateCustoTotal() {
  const fixos     = getCustosFixos().reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);
  const variaveis = getCustosVariaveisDoMes().reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);
  document.getElementById('custo-total').textContent = brl(fixos + variaveis);
  const sub = document.getElementById('custo-subtotals');
  if (sub) sub.innerHTML = `<span>Fixos: <strong>${brl(fixos)}</strong></span><span>Variáveis: <strong>${brl(variaveis)}</strong></span>`;
}

/* ── Bloco 1 — Receitas ─────────────────────────────────────────── */

function calcReceitas() {
  // Receita de hospedagem sai da Stays: reservas com check-in no mês.
  //
  // Antes vinha dos negócios "won" do Datacrazy. Os dois medem coisas
  // diferentes: o Datacrazy é o CRM, onde mora o funil de vendas; a Stays é o
  // PMS, onde a reserva de fato existe, com valor, pagamento e calendário.
  // Para receita realizada, a Stays é a fonte certa.
  const reservas = state.staysReservas || [];

  const totalReservas = reservas.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
  const totalPago     = reservas.reduce((sum, r) => sum + (parseFloat(r.totalPago) || 0), 0);
  const totalLimpeza  = reservas.reduce((sum, r) => sum + (parseFloat(r.taxaLimpeza) || 0), 0);

  // Mensalidades: soma dos valorFixo de todos os parceiros (a Stays não sabe disso)
  const totalMensalidades = state.appData.parceiros.reduce((sum, p) => {
    return sum + (parseFloat(p.valorFixo) || 0);
  }, 0);

  return {
    totalReservas,
    totalMensalidades,
    totalPago,
    aReceber: Math.max(0, totalReservas - totalPago),
    totalLimpeza,
    qtdReservas: reservas.length,
  };
}

function renderReceitas() {
  const { totalReservas, totalMensalidades, totalPago, aReceber, qtdReservas } = calcReceitas();
  const total = totalReservas + totalMensalidades;

  document.getElementById('receita-reservas').textContent     = brl(totalReservas);
  document.getElementById('receita-recebido').textContent     = brl(totalPago);
  document.getElementById('receita-a-receber').textContent    = brl(aReceber);
  document.getElementById('receita-mensalidades').textContent = brl(totalMensalidades);
  document.getElementById('receita-total').textContent        = brl(total);

  document.getElementById('receita-reservas-fonte').textContent =
    'Stays · ' + qtdReservas + (qtdReservas === 1 ? ' reserva' : ' reservas');

  // Meta de comissão — carrega valor salvo
  const meta = parseFloat(state.appData.metas?.comissao) || 0;
  document.getElementById('meta-comissao-input').value = meta || '';
}

/* ── Bloco 1 — Summary ──────────────────────────────────────────── */

function renderSummary() {
  const { totalReservas, totalMensalidades } = calcReceitas();
  const receita = totalReservas + totalMensalidades;

  const custo = getCustosDoMes().reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);

  const resultado = receita - custo;
  const margem = receita > 0 ? ((resultado / receita) * 100).toFixed(1) : null;

  const elRes = document.getElementById('s-resultado');
  elRes.textContent = brl(resultado);
  elRes.className = 'summary-value ' + (resultado >= 0 ? 'green' : 'red');

  document.getElementById('s-receita').textContent = brl(receita);
  document.getElementById('s-custos').textContent  = brl(custo);
  document.getElementById('s-margem').textContent  = margem !== null ? `${margem}%` : '—%';
}

/* ── Formatação de data ───────────────────────────────────────── */

function formatDateBR(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  if (!y || !m || !d) return str;
  return `${d}/${m}/${y}`;
}

/* ── Bloco 2 — Parceiros ────────────────────────────────────────── */

function renderParceiros() {
  const tbody = document.getElementById('parceirosBody');
  const parceiros = state.appData.parceiros;

  if (!parceiros.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhum parceiro cadastrado ainda</td></tr>';
    updateParceirosTotals();
    return;
  }

  tbody.innerHTML = parceiros.map(p => {
    const comissao   = parseFloat(p.comissoes?.[state.currentMonth]) || 0;
    const fixo       = parseFloat(p.valorFixo) || 0;
    const emAberto   = parseFloat(p.valorEmAberto) || 0;
    const metaReceita = parseFloat(p.metaReceita) || 0;
    const total      = fixo + comissao;
    const abertoHtml = emAberto > 0
      ? `<strong class="emaberto-value">${brl(emAberto)}</strong>`
      : `<span class="emaberto-zero">—</span>`;
    const metaHtml = metaReceita > 0
      ? `<span class="meta-receita-value">${brl(metaReceita)}</span>`
      : `<span class="emaberto-zero">—</span>`;
    return `
      <tr>
        <td><strong>${escHtml(p.nome)}</strong></td>
        <td>${escHtml(p.contato || '—')}</td>
        <td>${escHtml(p.imoveis || '—')}</td>
        <td>${brl(fixo)}</td>
        <td>${brl(comissao)}</td>
        <td><strong>${brl(total)}</strong></td>
        <td>${abertoHtml}</td>
        <td>${metaHtml}</td>
        <td><button class="edit-btn" onclick="openEditParceiro('${p.id}')">✎</button></td>
      </tr>
    `;
  }).join('');

  updateParceirosTotals();
}

function updateParceirosTotals() {
  const parceiros = state.appData.parceiros;
  const totalMensalidades = parceiros.reduce((s, p) => s + (parseFloat(p.valorFixo) || 0), 0);
  const totalComissoes    = parceiros.reduce((s, p) => s + (parseFloat(p.comissoes?.[state.currentMonth]) || 0), 0);
  const totalGeral        = totalMensalidades + totalComissoes;
  const totalEmAberto     = parceiros.reduce((s, p) => s + (parseFloat(p.valorEmAberto) || 0), 0);

  document.getElementById('pt-mensalidades').textContent = brl(totalMensalidades);
  document.getElementById('pt-comissoes').textContent    = brl(totalComissoes);
  document.getElementById('pt-total').textContent        = brl(totalGeral);
  document.getElementById('pt-emaberto').textContent     = brl(totalEmAberto);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Bloco 2 — Unidades (Stays) ─────────────────────────────────── */

const META_LEVELS = [
  { label: 'Mínimo', icon: '',    receita: 16667, comissao: 2500, resultado: 0,    cls: 'min'  },
  { label: 'Meta',   icon: ' ⭐', receita: 33333, comissao: 5000, resultado: 2500, cls: 'meta' },
  { label: 'Ideal',  icon: ' 🏆', receita: 50000, comissao: 7500, resultado: 5000, cls: 'ideal'},
];

function getMeta(code) {
  const stored = (state.appData.metasUnidades || {})[code];
  return META_LEVELS.map(def => ({ ...def, ...(stored?.[def.cls] || {}) }));
}

function renderUnidades() {
  // Stays: filtra somente ativos
  const all    = state.stays.filter(l => l.status === 'active' || !l.status);
  const filter = state.unitFilter;

  const casas = all.filter(l => isHouse(l));
  const apts  = all.filter(l => !isHouse(l));
  const cap   = all.reduce((s, l) => s + (parseInt(l._i_maxGuests || l.capacity || 0)), 0);

  document.getElementById('units-total').textContent      = all.length  || '—';
  document.getElementById('units-casas').textContent      = casas.length || '—';
  document.getElementById('units-apts').textContent       = apts.length  || '—';
  document.getElementById('units-capacidade').textContent = cap           || '—';

  const visible = filter === 'all' ? all
                : filter === 'house' ? casas
                : apts;

  const grid = document.getElementById('unitsGrid');

  if (!all.length) {
    grid.innerHTML = '<div class="loading-state">Stays não retornou dados — verifique a conexão</div>';
    return;
  }

  if (!visible.length) {
    grid.innerHTML = '<div class="loading-state">Nenhuma unidade nessa categoria</div>';
    return;
  }

  grid.innerHTML = visible.map(l => {
    const type   = isHouse(l) ? 'Casa' : 'Apartamento';
    // Stays retorna _mstitle.pt_BR ou internalName
    const name   = l._mstitle?.pt_BR || l.internalName || l.id || 'Sem nome';
    const addr   = l.address || {};
    const region = addr.region || addr.city || '—';
    const guests = l._i_maxGuests || '—';
    const rooms  = l._i_rooms     || null;
    const baths  = l._f_bathrooms || null;
    const code   = l.id || '';

    const levels = getMeta(code);
    const metaHtml = levels.map(m => `
      <div class="unit-meta-level unit-meta-level--${m.cls}">
        <span class="unit-meta-label">${m.label}${m.icon}</span>
        <span class="unit-meta-receita">${brl(m.receita)}</span>
        <span class="unit-meta-comissao">${brl(m.comissao)}</span>
        <span class="unit-meta-resultado">${m.resultado > 0 ? '+' : ''}${brl(m.resultado)}</span>
      </div>
    `).join('');

    const safeName = escHtml(name).replace(/'/g, '&#39;');
    const safeCode = escHtml(code);

    return `
      <div class="unit-card">
        <div class="unit-card-header">
          <span class="unit-card-type">${type}</span>
          <div style="display:flex;align-items:center;gap:6px">
            ${code ? `<span class="unit-code">${safeCode}</span>` : ''}
            ${code ? `<button class="btn-edit-meta" onclick="openMetaModal('${safeCode}','${safeName}')" title="Editar metas">&#9998;</button>` : ''}
          </div>
        </div>
        <div class="unit-card-name">${escHtml(name)}</div>
        <div class="unit-card-meta">
          <span>📍 ${escHtml(region)}</span>
          <span>👥 ${guests} pessoa${guests !== 1 ? 's' : ''}</span>
          ${rooms ? `<span>🛏 ${rooms} quarto${rooms !== 1 ? 's' : ''}</span>` : ''}
          ${baths ? `<span>🚿 ${baths} banheiro${baths !== 1 ? 's' : ''}</span>` : ''}
        </div>
        <div class="unit-meta-divider"></div>
        <div class="unit-meta-header">
          <span>Nível</span>
          <span>Receita</span>
          <span>Comissão</span>
          <span>Resultado</span>
        </div>
        <div class="unit-meta-levels">${metaHtml}</div>
      </div>
    `;
  }).join('');
}

function isHouse(listing) {
  // Stays: tipo vem em _t_typeMeta._mstitle.pt_BR ("Apartamento", "Casa", etc.)
  const typeName = (listing._t_typeMeta?._mstitle?.pt_BR || '').toLowerCase();
  const id = (listing.id || '').toUpperCase();
  return typeName.includes('casa') || typeName.includes('villa') || typeName.includes('house')
      || id.startsWith('GF') || id.startsWith('GG');
}

/* ── Bloco 2 — Reservas (Datacrazy) ─────────────────────────────── */

function renderReservas() {
  const reservas = state.reservas;
  const tbody = document.getElementById('reservasBody');

  // Datacrazy: stats consideram apenas negócios ganhos
  const ganhos      = reservas.filter(r => r.status === 'won');
  const totalValor  = ganhos.reduce((s, r) => s + (parseFloat(r.total || 0)), 0);
  const ticketMedio = ganhos.length > 0 ? totalValor / ganhos.length : 0;

  document.getElementById('res-total-valor').textContent  = brl(totalValor);
  document.getElementById('res-total-qtd').textContent    = `${ganhos.length} / ${reservas.length}`;
  document.getElementById('res-ticket-medio').textContent = brl(ticketMedio);

  if (!reservas.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Sem negócios neste período (Datacrazy)</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.map(r => {
    const nome      = r.lead?.name || r.name || '—';
    const estagio   = r.stage?.name || '—';
    const criado    = formatDate(r.createdAt);
    const valor     = parseFloat(r.total || 0);
    const status    = mapStatus(r.status);
    const code      = getProductCode(r);
    const parceiro  = findParceiroPorImovel(code);

    const imovelHtml = code
      ? `<span class="unit-code" style="font-size:11px">${escHtml(code)}</span>`
      : '<span style="color:var(--light)">—</span>';

    const proprietarioHtml = parceiro
      ? `<span class="prop-match">${escHtml(parceiro.nome)}</span>`
      : '<span style="color:var(--light)">—</span>';

    return `
      <tr>
        <td>${escHtml(nome)}</td>
        <td>${imovelHtml}</td>
        <td>${proprietarioHtml}</td>
        <td>${escHtml(estagio)}</td>
        <td>${criado}</td>
        <td><strong>${brl(valor)}</strong></td>
        <td><span class="status-pill ${status.cls}">${status.label}</span></td>
      </tr>
    `;
  }).join('');
}

/* ── Bloco 2 — Reservas Confirmadas (Stays) ─────────────────────── */

function getListingLabel(idlisting) {
  const l = state.stays.find(x => x._id === idlisting);
  if (!l) return { code: '—', nome: idlisting || '—' };
  const nome = l._mstitle?.pt_BR || l.internalName || l.id || '—';
  return { code: l.id || '—', nome };
}

function setStaysReservasDateInputs(month) {
  const { from, to } = monthRange(month);
  document.getElementById('stays-res-de').value  = from;
  document.getElementById('stays-res-ate').value = to;
  document.getElementById('stays-criadas-de').value  = from;
  document.getElementById('stays-criadas-ate').value = to;
}

function populateImovelSelect(selectId) {
  const sel = document.getElementById(selectId);
  const previousValue = sel.value;

  const options = state.stays
    .map(l => ({ id: l._id, label: `${l.id || ''} — ${l._mstitle?.pt_BR || l.internalName || l.id || ''}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  sel.innerHTML = '<option value="">Todos os imóveis</option>' +
    options.map(o => `<option value="${escHtml(o.id)}">${escHtml(o.label)}</option>`).join('');

  if (options.some(o => o.id === previousValue)) sel.value = previousValue;
}

function populateStaysImovelFilter() {
  populateImovelSelect('stays-res-imovel');
  populateImovelSelect('stays-criadas-imovel');
}

document.getElementById('stays-res-imovel').addEventListener('change', () => renderStaysReservas());
document.getElementById('stays-criadas-imovel').addEventListener('change', () => renderStaysReservasCriadas());

document.getElementById('btnFiltrarStaysReservas').addEventListener('click', async () => {
  const from = document.getElementById('stays-res-de').value;
  const to   = document.getElementById('stays-res-ate').value;
  if (!from || !to) { alert('Informe as duas datas do período'); return; }
  if (from > to) { alert('A data "De" não pode ser depois da data "Até"'); return; }

  state.staysReservas = await fetchStaysReservas({ from, to });
  renderStaysReservas();
});

document.getElementById('btnFiltrarStaysReservasCriadas').addEventListener('click', async () => {
  const from = document.getElementById('stays-criadas-de').value;
  const to   = document.getElementById('stays-criadas-ate').value;
  if (!from || !to) { alert('Informe as duas datas do período'); return; }
  if (from > to) { alert('A data "De" não pode ser depois da data "Até"'); return; }

  state.staysReservasCriadas = await fetchStaysReservas({ from, to, dateType: 'creation', statusElId: 'stays-criadas-status' });
  renderStaysReservasCriadas();
});

function renderStaysReservaRow(r) {
  const { code, nome } = getListingLabel(r._idlisting);
  return `
    <tr>
      <td><span class="unit-code" style="font-size:11px">${escHtml(code)}</span> ${escHtml(nome)}</td>
      <td>${escHtml(r.titular || '—')}</td>
      <td>${escHtml(r.id || '—')}</td>
      <td>${formatDate(r.checkin)}</td>
      <td>${formatDate(r.checkout)}</td>
      <td>${r.noites || '—'}</td>
      <td>${r.hospedes || '—'}</td>
      <td><strong>${brl(r.total)}</strong></td>
      <td>${brl(r.totalPago)}</td>
      <td>${formatDateBR(r.criadaEm)}</td>
    </tr>
  `;
}

function renderStaysReservasTable(reservas, ids) {
  const tbody = document.getElementById(ids.tbody);

  const totalValor  = reservas.reduce((s, r) => s + (parseFloat(r.total || 0)), 0);
  const totalPago   = reservas.reduce((s, r) => s + (parseFloat(r.totalPago || 0)), 0);
  const ticketMedio = reservas.length > 0 ? totalValor / reservas.length : 0;

  document.getElementById(ids.statValor).textContent  = brl(totalValor);
  document.getElementById(ids.statQtd).textContent    = String(reservas.length);
  document.getElementById(ids.statTicket).textContent = brl(ticketMedio);
  document.getElementById(ids.statPago).textContent   = brl(totalPago);

  if (!reservas.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">${ids.emptyMsg}</td></tr>`;
    return;
  }

  tbody.innerHTML = reservas.map(renderStaysReservaRow).join('');
}

function renderStaysReservas() {
  const de  = document.getElementById('stays-res-de').value;
  const ate = document.getElementById('stays-res-ate').value;
  if (de && ate) document.getElementById('stays-res-period').textContent = `${formatDateBR(de)} – ${formatDateBR(ate)}`;

  const imovelFiltro = document.getElementById('stays-res-imovel').value;
  const reservas = imovelFiltro
    ? state.staysReservas.filter(r => r._idlisting === imovelFiltro)
    : state.staysReservas;

  renderStaysReservasTable(reservas, {
    tbody: 'staysReservasBody',
    statValor: 'stays-res-total-valor',
    statQtd: 'stays-res-total-qtd',
    statTicket: 'stays-res-ticket-medio',
    statPago: 'stays-res-total-pago',
    emptyMsg: 'Sem reservas confirmadas na Stays neste período',
  });
}

function renderStaysReservasCriadas() {
  const de  = document.getElementById('stays-criadas-de').value;
  const ate = document.getElementById('stays-criadas-ate').value;
  if (de && ate) document.getElementById('stays-criadas-period').textContent = `${formatDateBR(de)} – ${formatDateBR(ate)}`;

  const imovelFiltro = document.getElementById('stays-criadas-imovel').value;
  const reservas = imovelFiltro
    ? state.staysReservasCriadas.filter(r => r._idlisting === imovelFiltro)
    : state.staysReservasCriadas;

  renderStaysReservasTable(reservas, {
    tbody: 'staysReservasCriadasBody',
    statValor: 'stays-criadas-total-valor',
    statQtd: 'stays-criadas-total-qtd',
    statTicket: 'stays-criadas-ticket-medio',
    statPago: 'stays-criadas-total-pago',
    emptyMsg: 'Nenhuma reserva criada na Stays neste período',
  });
}

function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return str; }
}

function getProductCode(reserva) {
  return reserva.products?.[0]?.product?.id_sku || null;
}

function findParceiroPorImovel(code) {
  if (!code) return null;
  const c = code.toUpperCase();
  return state.appData.parceiros.find(p =>
    (p.imoveis || '').toUpperCase().split(/[\s,;]+/).some(token => token === c)
  ) || null;
}

function mapStatus(s) {
  if (!s) return { cls: '', label: '—' };
  const v = String(s).toLowerCase();
  // Datacrazy status: won, lost, in_process + Stays: confirmed, cancelled
  if (v === 'won' || v.includes('ganho') || v.includes('confirm') || v.includes('active'))
    return { cls: 'confirmed', label: v === 'won' ? 'Ganho' : 'Confirmado' };
  if (v === 'lost' || v.includes('lost') || v.includes('cancel'))
    return { cls: 'cancelled', label: v === 'lost' ? 'Perdido' : 'Cancelado' };
  if (v === 'in_process' || v.includes('process') || v.includes('andamento'))
    return { cls: 'pending', label: 'Em andamento' };
  return { cls: 'pending', label: s };
}

/* ── Month navigation ───────────────────────────────────────────── */

document.getElementById('prevMonth').addEventListener('click', async () => {
  state.currentMonth = prevMonth(state.currentMonth);
  setStaysReservasDateInputs(state.currentMonth);
  [state.reservas, state.staysReservas, state.staysReservasCriadas] = await Promise.all([
    fetchReservas(state.currentMonth),
    fetchStaysReservas({ month: state.currentMonth }),
    fetchStaysReservas({ month: state.currentMonth, dateType: 'creation', statusElId: 'stays-criadas-status' }),
  ]);
  renderAll();
});

document.getElementById('nextMonth').addEventListener('click', async () => {
  state.currentMonth = nextMonth(state.currentMonth);
  setStaysReservasDateInputs(state.currentMonth);
  [state.reservas, state.staysReservas, state.staysReservasCriadas] = await Promise.all([
    fetchReservas(state.currentMonth),
    fetchStaysReservas({ month: state.currentMonth }),
    fetchStaysReservas({ month: state.currentMonth, dateType: 'creation', statusElId: 'stays-criadas-status' }),
  ]);
  renderAll();
});

/* ── Tabs ───────────────────────────────────────────────────────── */

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const painel = document.getElementById(`tab-${btn.dataset.tab}`);
    painel.classList.add('active');
    ativarFrame(painel);
    location.hash = btn.dataset.tab;
  });
});

/* Paineis integrados carregam so quando a aba e aberta */
function ativarFrame(painel) {
  const f = painel.querySelector('iframe.panel-frame[data-src]');
  if (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); }
}

/* Abrir direto numa aba pela URL: /#precificacao */
(function abrirAbaDaUrl() {
  const alvo = location.hash.replace('#', '');
  if (!alvo) return;
  const btn = document.querySelector(`.tab[data-tab="${alvo}"]`);
  if (btn) btn.click();
})();

/* ── Refresh button ─────────────────────────────────────────────── */

document.getElementById('btnRefresh').addEventListener('click', loadAll);

/* ── Cost form — removido (agora usa modal) ─────────────────────── */

/* ── Unit filters ───────────────────────────────────────────────── */

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.unitFilter = btn.dataset.filter;
    renderUnidades();
  });
});

/* ── Modal — Parceiro ───────────────────────────────────────────── */

function openModal(id = null) {
  state.editingParceiroId = id;
  const modal = document.getElementById('parceiroModal');
  const deleteBtn = document.getElementById('btnDeleteParceiro');

  if (id) {
    const p = state.appData.parceiros.find(x => x.id === id);
    document.getElementById('modalTitle').textContent    = 'Editar Parceiro';
    document.getElementById('p-nome').value              = p.nome || '';
    document.getElementById('p-contato').value           = p.contato || '';
    document.getElementById('p-imoveis').value           = p.imoveis || '';
    document.getElementById('p-mensalidade').value       = p.valorFixo || '';
    document.getElementById('p-comissao').value          = p.comissoes?.[state.currentMonth] || '';
    document.getElementById('p-emaberto').value          = p.valorEmAberto || '';
    document.getElementById('p-meta-receita').value      = p.metaReceita || '';
    deleteBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('modalTitle').textContent    = 'Novo Parceiro';
    document.getElementById('p-nome').value              = '';
    document.getElementById('p-contato').value           = '';
    document.getElementById('p-imoveis').value           = '';
    document.getElementById('p-mensalidade').value       = '';
    document.getElementById('p-comissao').value          = '';
    document.getElementById('p-emaberto').value          = '';
    document.getElementById('p-meta-receita').value      = '';
    deleteBtn.style.display = 'none';
  }

  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('parceiroModal').classList.remove('open');
  state.editingParceiroId = null;
}

window.openEditParceiro = function(id) { openModal(id); };

document.getElementById('btnAddParceiro').addEventListener('click', () => openModal());
document.getElementById('btnCloseModal').addEventListener('click', closeModal);
document.getElementById('btnCancelModal').addEventListener('click', closeModal);
document.getElementById('parceiroModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('btnSalvarParceiro').addEventListener('click', async () => {
  const nome = document.getElementById('p-nome').value.trim();
  if (!nome) { alert('Informe o nome do parceiro'); return; }

  const valorFixo     = parseFloat(document.getElementById('p-mensalidade').value)   || 0;
  const comissao      = parseFloat(document.getElementById('p-comissao').value)       || 0;
  const valorEmAberto = parseFloat(document.getElementById('p-emaberto').value)       || 0;
  const metaReceita   = parseFloat(document.getElementById('p-meta-receita').value)   || 0;

  if (state.editingParceiroId) {
    const p = state.appData.parceiros.find(x => x.id === state.editingParceiroId);
    p.nome          = nome;
    p.contato       = document.getElementById('p-contato').value.trim();
    p.imoveis       = document.getElementById('p-imoveis').value.trim();
    p.valorFixo     = valorFixo;
    p.valorEmAberto = valorEmAberto;
    p.metaReceita   = metaReceita;
    if (!p.comissoes) p.comissoes = {};
    if (comissao) p.comissoes[state.currentMonth] = comissao;
  } else {
    const newP = {
      id:       uid(),
      nome,
      contato:  document.getElementById('p-contato').value.trim(),
      imoveis:  document.getElementById('p-imoveis').value.trim(),
      valorFixo,
      valorEmAberto,
      metaReceita,
      comissoes: comissao ? { [state.currentMonth]: comissao } : {},
    };
    state.appData.parceiros.push(newP);
  }

  await saveData(state.appData);
  closeModal();
  renderParceiros();
  renderReceitas();
  renderSummary();
});

document.getElementById('btnDeleteParceiro').addEventListener('click', async () => {
  if (!confirm('Excluir este parceiro?')) return;
  state.appData.parceiros = state.appData.parceiros.filter(p => p.id !== state.editingParceiroId);
  await saveData(state.appData);
  closeModal();
  renderParceiros();
  renderReceitas();
  renderSummary();
});

/* ── Modal — Custo ──────────────────────────────────────────────── */

let editingCustoId = null;
let editingCustoNatureza = null;

function openCustoModal(id = null, natureza = null) {
  editingCustoId = id;
  editingCustoNatureza = natureza;
  const deleteBtn = document.getElementById('btnDeleteCusto');

  if (id) {
    const c = natureza === 'Fixo'
      ? getCustosFixos().find(x => x.id === id)
      : getCustosVariaveisDoMes().find(x => x.id === id);
    document.getElementById('custoModalTitle').textContent = 'Editar Custo';
    document.getElementById('c-natureza').value   = c.natureza || 'Variável';
    document.getElementById('c-tipo').value       = c.tipo;
    document.getElementById('c-titulo').value     = c.titulo;
    document.getElementById('c-frequencia').value = c.frequencia;
    document.getElementById('c-valor').value      = c.valor;
    deleteBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('custoModalTitle').textContent = 'Novo Custo';
    document.getElementById('c-natureza').value   = 'Variável';
    document.getElementById('c-tipo').value       = 'Ferramentas';
    document.getElementById('c-titulo').value     = '';
    document.getElementById('c-frequencia').value = 'Mensal';
    document.getElementById('c-valor').value      = '';
    deleteBtn.style.display = 'none';
  }

  document.getElementById('custoModal').classList.add('open');
}

function closeCustoModal() {
  document.getElementById('custoModal').classList.remove('open');
  editingCustoId = null;
  editingCustoNatureza = null;
}

window.openEditCusto = function(id, natureza) { openCustoModal(id, natureza); };

document.getElementById('btnAddCusto').addEventListener('click', () => openCustoModal());
document.getElementById('btnCloseCustoModal').addEventListener('click', closeCustoModal);
document.getElementById('btnCancelCustoModal').addEventListener('click', closeCustoModal);
document.getElementById('custoModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeCustoModal();
});

document.getElementById('btnSalvarCusto').addEventListener('click', async () => {
  const titulo = document.getElementById('c-titulo').value.trim();
  const valor  = parseFloat(document.getElementById('c-valor').value);
  if (!titulo) { alert('Informe o título do custo'); return; }
  if (!valor)  { alert('Informe o valor'); return; }

  const natureza   = document.getElementById('c-natureza').value;
  const tipo       = document.getElementById('c-tipo').value;
  const frequencia = document.getElementById('c-frequencia').value;

  if (!state.appData.custosFixos) state.appData.custosFixos = [];
  if (!state.appData.custos)      state.appData.custos = {};

  if (editingCustoId) {
    const prevNat = editingCustoNatureza;

    if (prevNat === 'Fixo' && natureza === 'Fixo') {
      const idx = state.appData.custosFixos.findIndex(c => c.id === editingCustoId);
      if (idx >= 0) state.appData.custosFixos[idx] = { ...state.appData.custosFixos[idx], tipo, titulo, frequencia, valor };

    } else if (prevNat === 'Variável' && natureza === 'Variável') {
      let lista = getCustosVariaveisDoMes();
      const idx = lista.findIndex(c => c.id === editingCustoId);
      if (idx >= 0) lista[idx] = { ...lista[idx], tipo, titulo, frequencia, valor };
      state.appData.custos[state.currentMonth] = lista;

    } else if (prevNat === 'Variável' && natureza === 'Fixo') {
      // promove para fixo
      state.appData.custos[state.currentMonth] = getCustosVariaveisDoMes().filter(c => c.id !== editingCustoId);
      state.appData.custosFixos.push({ id: uid(), tipo, titulo, frequencia, valor });

    } else if (prevNat === 'Fixo' && natureza === 'Variável') {
      // rebaixa para variável do mês
      state.appData.custosFixos = state.appData.custosFixos.filter(c => c.id !== editingCustoId);
      let lista = getCustosVariaveisDoMes();
      lista.push({ id: uid(), tipo, titulo, frequencia, valor, natureza: 'Variável' });
      state.appData.custos[state.currentMonth] = lista;
    }
  } else {
    if (natureza === 'Fixo') {
      state.appData.custosFixos.push({ id: uid(), tipo, titulo, frequencia, valor });
    } else {
      let lista = getCustosVariaveisDoMes();
      lista.push({ id: uid(), tipo, titulo, frequencia, valor, natureza: 'Variável' });
      state.appData.custos[state.currentMonth] = lista;
    }
  }

  await saveData(state.appData);
  closeCustoModal();
  renderCustos();
  renderSummary();
});

document.getElementById('btnDeleteCusto').addEventListener('click', async () => {
  if (!confirm('Excluir este custo?')) return;

  if (editingCustoNatureza === 'Fixo') {
    state.appData.custosFixos = (state.appData.custosFixos || []).filter(c => c.id !== editingCustoId);
  } else {
    state.appData.custos[state.currentMonth] = getCustosVariaveisDoMes().filter(c => c.id !== editingCustoId);
  }

  await saveData(state.appData);
  closeCustoModal();
  renderCustos();
  renderSummary();
});

/* ── Histórico — snapshot automático ────────────────────────────── */

const HISTORICO_INICIO = '2026-05'; // não registrar meses anteriores

function deveRegistrarMes(ym) {
  return ym >= HISTORICO_INICIO;
}

async function saveMonthSnapshot() {
  if (!deveRegistrarMes(state.currentMonth)) return;

  const { totalReservas, totalMensalidades } = calcReceitas();
  const receita = totalReservas + totalMensalidades;
  const custo   = getCustosDoMes().reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);
  const resultado = receita - custo;
  const margem    = receita > 0 ? +((resultado / receita) * 100).toFixed(1) : 0;

  if (!state.appData.historico) state.appData.historico = {};
  state.appData.historico[state.currentMonth] = {
    savedAt:    new Date().toISOString(),
    // A partir de setembro/2026 a receita de reservas vem da Stays; antes disso
    // vinha dos negocios "won" do Datacrazy. O carimbo evita comparar definicoes
    // diferentes sem perceber ao olhar o grafico historico.
    fonteReceita: 'stays',
    receita:    { reservas: totalReservas, mensalidades: totalMensalidades, total: receita },
    custo,
    resultado,
    margem,
  };

  await saveData(state.appData);
}

/* ── Histórico — renderização ───────────────────────────────────── */

function renderHistorico() {
  const hist  = state.appData.historico || {};
  const tbody = document.getElementById('historicoBody');

  const meses = Object.keys(hist)
    .filter(m => m >= HISTORICO_INICIO)
    .sort((a, b) => b.localeCompare(a)); // mais recente primeiro

  if (!meses.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Nenhum mês registrado ainda</td></tr>';
    return;
  }

  tbody.innerHTML = meses.map(m => {
    const d   = hist[m];
    const res = d.resultado >= 0
      ? `<span class="result-positive">${brl(d.resultado)}</span>`
      : `<span class="result-negative">${brl(d.resultado)}</span>`;
    const margem = d.margem >= 0
      ? `<span class="result-positive">${d.margem}%</span>`
      : `<span class="result-negative">${d.margem}%</span>`;
    return `
      <tr>
        <td><strong>${monthLabel(m)}</strong></td>
        <td>${brl(d.receita.reservas)}</td>
        <td>${brl(d.receita.mensalidades)}</td>
        <td><strong>${brl(d.receita.total)}</strong></td>
        <td>${brl(d.custo)}</td>
        <td>${res}</td>
        <td>${margem}</td>
      </tr>
    `;
  }).join('');
}

/* ── Gráfico receita × custo ────────────────────────────────────── */

let chartInstance = null;

function renderChart() {
  const hist  = state.appData.historico || {};
  const meses = Object.keys(hist)
    .filter(m => m >= HISTORICO_INICIO)
    .sort();

  const labels   = meses.map(m => monthLabel(m));
  const receitas = meses.map(m => hist[m].receita.total);
  const custos   = meses.map(m => hist[m].custo);

  const ctx = document.getElementById('receitaCustoChart');
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Receita',
          data: receitas,
          backgroundColor: 'rgba(45,122,79,0.75)',
          borderColor: '#2d7a4f',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Custos',
          data: custos,
          backgroundColor: 'rgba(192,57,43,0.65)',
          borderColor: '#c0392b',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'Montserrat', size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${brl(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 12 } } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { family: 'Montserrat', size: 11 },
            callback: v => `R$ ${(v / 1000).toFixed(0)}k`,
          },
        },
      },
    },
  });
}

/* ── Modal de Metas por Unidade ─────────────────────────────────── */

function openMetaModal(code, name) {
  state.editingUnitCode = code;
  document.getElementById('metaModalUnitName').textContent = name;

  const levels = getMeta(code);
  ['min', 'meta', 'ideal'].forEach((cls, i) => {
    const m = levels[i];
    document.getElementById(`meta-${cls}-receita`).value   = m.receita;
    document.getElementById(`meta-${cls}-comissao`).value  = m.comissao;
    document.getElementById(`meta-${cls}-resultado`).value = m.resultado;
  });

  document.getElementById('metaModal').classList.add('open');
}

function closeMetaModal() {
  state.editingUnitCode = null;
  document.getElementById('metaModal').classList.remove('open');
}

document.getElementById('btnCloseMetaModal').addEventListener('click', closeMetaModal);
document.getElementById('btnCancelMetaModal').addEventListener('click', closeMetaModal);
document.getElementById('metaModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeMetaModal();
});

document.getElementById('btnResetMeta').addEventListener('click', async () => {
  const code = state.editingUnitCode;
  if (!code || !state.appData.metasUnidades) return;
  delete state.appData.metasUnidades[code];
  await saveData(state.appData);
  renderUnidades();
  closeMetaModal();
});

document.getElementById('btnSalvarMeta').addEventListener('click', async () => {
  const code = state.editingUnitCode;
  if (!code) return;

  if (!state.appData.metasUnidades) state.appData.metasUnidades = {};

  state.appData.metasUnidades[code] = {};
  ['min', 'meta', 'ideal'].forEach(cls => {
    state.appData.metasUnidades[code][cls] = {
      receita:   Number(document.getElementById(`meta-${cls}-receita`).value),
      comissao:  Number(document.getElementById(`meta-${cls}-comissao`).value),
      resultado: Number(document.getElementById(`meta-${cls}-resultado`).value),
    };
  });

  await saveData(state.appData);
  renderUnidades();
  closeMetaModal();
});

/* ── Relatório do Parceiro ──────────────────────────────────────── */

let editingReservaId = null;

function initRelatorio() {
  const sel = document.getElementById('relatorio-parceiro');
  const parceiros = state.appData.parceiros;

  sel.innerHTML = parceiros.length
    ? parceiros.map(p => `<option value="${p.id}">${escHtml(p.nome)}</option>`).join('')
    : '<option value="">Nenhum parceiro cadastrado</option>';

  document.getElementById('relatorio-period').textContent = monthLabel(state.currentMonth);
  renderRelatorio();
}

function getRelatorioKey() {
  const parceiroId = document.getElementById('relatorio-parceiro')?.value;
  return parceiroId ? `${parceiroId}__${state.currentMonth}` : null;
}

function getRelatorioReservas() {
  const key = getRelatorioKey();
  if (!key) return [];
  return state.appData.relatorios?.[key] || [];
}

function saveRelatorioReservas(lista) {
  const key = getRelatorioKey();
  if (!key) return;
  if (!state.appData.relatorios) state.appData.relatorios = {};
  state.appData.relatorios[key] = lista;
}

function renderRelatorio() {
  const reservas = getRelatorioReservas();
  const tbody = document.getElementById('relatorioBody');

  const totalValor    = reservas.reduce((s, r) => s + (parseFloat(r.valor) || 0), 0);
  const totalComissao = reservas.reduce((s, r) => s + (parseFloat(r.comissao) || 0), 0);

  document.getElementById('rel-qtd').textContent           = reservas.length;
  document.getElementById('rel-total-valor').textContent   = brl(totalValor);
  document.getElementById('rel-total-comissao').textContent = brl(totalComissao);

  if (!reservas.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma reserva adicionada</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.nome)}</td>
      <td>${brl(r.valor)}</td>
      <td>${brl(r.comissao)}</td>
      <td><button class="edit-btn" onclick="openEditReservaRelatorio('${r.id}')">✎</button></td>
    </tr>
  `).join('');
}

// Modal de reserva do relatório
function openReservaRelatorioModal(id = null) {
  editingReservaId = id;
  const deleteBtn = document.getElementById('btnDeleteReserva');

  if (id) {
    const r = getRelatorioReservas().find(x => x.id === id);
    document.getElementById('reservaModalTitle').textContent = 'Editar Reserva';
    document.getElementById('rr-nome').value     = r.nome;
    document.getElementById('rr-valor').value    = r.valor;
    document.getElementById('rr-comissao').value = r.comissao;
    deleteBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('reservaModalTitle').textContent = 'Nova Reserva';
    document.getElementById('rr-nome').value     = '';
    document.getElementById('rr-valor').value    = '';
    document.getElementById('rr-comissao').value = '';
    deleteBtn.style.display = 'none';
  }

  document.getElementById('reservaRelatorioModal').classList.add('open');
}

function closeReservaModal() {
  document.getElementById('reservaRelatorioModal').classList.remove('open');
  editingReservaId = null;
}

window.openEditReservaRelatorio = (id) => openReservaRelatorioModal(id);

document.getElementById('btnAddReservaRelatorio').addEventListener('click', () => openReservaRelatorioModal());
document.getElementById('btnCloseReservaModal').addEventListener('click', closeReservaModal);
document.getElementById('btnCancelReservaModal').addEventListener('click', closeReservaModal);
document.getElementById('reservaRelatorioModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeReservaModal();
});

document.getElementById('btnSalvarReserva').addEventListener('click', async () => {
  const nome     = document.getElementById('rr-nome').value.trim();
  const valor    = parseFloat(document.getElementById('rr-valor').value) || 0;
  const comissao = parseFloat(document.getElementById('rr-comissao').value) || 0;
  if (!nome) { alert('Informe o nome da reserva'); return; }

  let lista = getRelatorioReservas();

  if (editingReservaId) {
    const idx = lista.findIndex(x => x.id === editingReservaId);
    if (idx >= 0) lista[idx] = { ...lista[idx], nome, valor, comissao };
  } else {
    lista.push({ id: uid(), nome, valor, comissao });
  }

  saveRelatorioReservas(lista);
  await saveData(state.appData);
  closeReservaModal();
  renderRelatorio();
});

document.getElementById('btnDeleteReserva').addEventListener('click', async () => {
  if (!confirm('Excluir esta reserva?')) return;
  const lista = getRelatorioReservas().filter(x => x.id !== editingReservaId);
  saveRelatorioReservas(lista);
  await saveData(state.appData);
  closeReservaModal();
  renderRelatorio();
});

document.getElementById('relatorio-parceiro').addEventListener('change', renderRelatorio);

// Exportar PDF
document.getElementById('btnExportarPDF').addEventListener('click', () => {
  const parceiroId = document.getElementById('relatorio-parceiro').value;
  const parceiro   = state.appData.parceiros.find(p => p.id === parceiroId);
  const reservas   = getRelatorioReservas();
  const totalValor    = reservas.reduce((s, r) => s + (parseFloat(r.valor) || 0), 0);
  const totalComissao = reservas.reduce((s, r) => s + (parseFloat(r.comissao) || 0), 0);
  const hoje = new Date().toLocaleDateString('pt-BR');

  const rows = reservas.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.nome)}</td>
      <td>${brl(r.valor)}</td>
      <td>${brl(r.comissao)}</td>
    </tr>
  `).join('');

  document.getElementById('printArea').innerHTML = `
    <div class="print-header">
      <div class="print-title">Relatório do Parceiro — ${escHtml(parceiro?.nome || '—')}</div>
      <div class="print-sub">Período: ${monthLabel(state.currentMonth)} &nbsp;|&nbsp; Gerado em: ${hoje} &nbsp;|&nbsp; Artezian Real Estate</div>
    </div>
    <table>
      <thead>
        <tr><th>#</th><th>Nome da Reserva</th><th>Valor Total</th><th>Comissão</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="4">Nenhuma reserva</td></tr>'}</tbody>
    </table>
    <div class="print-totals">
      <div class="print-total-row"><span>Total de Reservas</span><span>${reservas.length}</span></div>
      <div class="print-total-row"><span>Valor Total das Reservas</span><span>${brl(totalValor)}</span></div>
      <div class="print-total-row main"><span>Total de Comissão</span><span>${brl(totalComissao)}</span></div>
    </div>
    <div class="print-footer">Artezian Real Estate Atelie &nbsp;·&nbsp; artezian.com.br</div>
  `;

  window.print();
});

/* ── Meta de Comissão (Empresa) ─────────────────────────────────── */

document.getElementById('btnSalvarMetaComissao').addEventListener('click', async () => {
  const val = parseFloat(document.getElementById('meta-comissao-input').value) || 0;
  if (!state.appData.metas) state.appData.metas = {};
  state.appData.metas.comissao = val;
  await saveData(state.appData);
  const btn = document.getElementById('btnSalvarMetaComissao');
  btn.textContent = '✓';
  btn.style.background = 'var(--green)';
  setTimeout(() => { btn.textContent = '✓'; btn.style.background = ''; }, 1500);
});

/* ── Init ───────────────────────────────────────────────────────── */

loadAll();
