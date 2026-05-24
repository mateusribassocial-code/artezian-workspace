/* ── State ──────────────────────────────────────────────────────── */

const state = {
  currentMonth: todayMonth(),   // "2026-05"
  appData: { parceiros: [], custos: {} },
  stays: [],
  reservas: [],
  unitFilter: 'all',
  editingParceiroId: null,
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

  const [appData, stays, reservas] = await Promise.all([
    fetchData(),
    fetchStays(),
    fetchReservas(state.currentMonth),
  ]);

  state.appData = appData;
  state.stays   = stays;
  state.reservas = reservas;

  updateStatusBadge(stays, reservas);
  renderAll();

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
  renderParceiros();
  renderUnidades();
  renderReservas();
}

/* ── Bloco 1 — Custos ───────────────────────────────────────────── */

function getCustosDoMes() {
  const raw = state.appData.custos?.[state.currentMonth];
  if (!raw) return [];
  // suporta formato legado (objeto simples) e novo (array)
  if (Array.isArray(raw)) return raw;
  const legado = [];
  if (raw.ferramentas)   legado.push({ id: uid(), tipo: 'Ferramentas',   titulo: 'Ferramentas',   frequencia: 'Mensal', valor: raw.ferramentas });
  if (raw.administrativo) legado.push({ id: uid(), tipo: 'Administrativo', titulo: 'Administrativo', frequencia: 'Mensal', valor: raw.administrativo });
  if (raw.midiaPaga)     legado.push({ id: uid(), tipo: 'Mídia Paga',    titulo: 'Mídia Paga',    frequencia: 'Mensal', valor: raw.midiaPaga });
  return legado;
}

function renderCustos() {
  const custos = getCustosDoMes();
  const tbody  = document.getElementById('custosBody');

  if (!custos.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum custo cadastrado neste mês</td></tr>';
    document.getElementById('custo-total').textContent = brl(0);
    return;
  }

  tbody.innerHTML = custos.map(c => {
    const tipoCls = c.tipo === 'Ferramentas' ? 'ferramentas'
                  : c.tipo === 'Administrativo' ? 'administrativo'
                  : c.tipo === 'Mídia Paga' ? 'midia' : 'outro';
    return `
      <tr>
        <td><span class="tipo-badge ${tipoCls}">${escHtml(c.tipo)}</span></td>
        <td>${escHtml(c.titulo)}</td>
        <td>${escHtml(c.frequencia)}</td>
        <td><strong>${brl(c.valor)}</strong></td>
        <td><button class="edit-btn" onclick="openEditCusto('${c.id}')">✎</button></td>
      </tr>
    `;
  }).join('');

  updateCustoTotal();
}

function updateCustoTotal() {
  const total = getCustosDoMes().reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);
  document.getElementById('custo-total').textContent = brl(total);
}

/* ── Bloco 1 — Receitas ─────────────────────────────────────────── */

function calcReceitas() {
  // Datacrazy: soma apenas negócios com status "won"
  const totalReservas = state.reservas
    .filter(r => r.status === 'won')
    .reduce((sum, r) => sum + (parseFloat(r.total || 0)), 0);

  // Mensalidades: soma dos valorFixo de todos os parceiros
  const totalMensalidades = state.appData.parceiros.reduce((sum, p) => {
    return sum + (parseFloat(p.valorFixo) || 0);
  }, 0);

  // Comissões: soma das comissões do mês atual
  const totalComissoes = state.appData.parceiros.reduce((sum, p) => {
    const val = p.comissoes?.[state.currentMonth];
    return sum + (parseFloat(val) || 0);
  }, 0);

  return { totalReservas, totalMensalidades, totalComissoes };
}

function renderReceitas() {
  const { totalReservas, totalMensalidades, totalComissoes } = calcReceitas();
  const total = totalReservas + totalMensalidades + totalComissoes;

  document.getElementById('receita-reservas').textContent     = brl(totalReservas);
  document.getElementById('receita-mensalidades').textContent = brl(totalMensalidades);
  document.getElementById('receita-comissoes').textContent    = brl(totalComissoes);
  document.getElementById('receita-total').textContent        = brl(total);
}

/* ── Bloco 1 — Summary ──────────────────────────────────────────── */

function renderSummary() {
  const { totalReservas, totalMensalidades, totalComissoes } = calcReceitas();
  const receita = totalReservas + totalMensalidades + totalComissoes;

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
    const comissao  = parseFloat(p.comissoes?.[state.currentMonth]) || 0;
    const fixo      = parseFloat(p.valorFixo) || 0;
    const emAberto  = parseFloat(p.valorEmAberto) || 0;
    const total     = fixo + comissao;
    const abertoHtml = emAberto > 0
      ? `<strong class="emaberto-value">${brl(emAberto)}</strong>`
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

    return `
      <div class="unit-card">
        <div class="unit-card-type">${type}</div>
        <div class="unit-card-name">${escHtml(name)}</div>
        <div class="unit-card-meta">
          <span>📍 ${escHtml(region)}</span>
          <span>👥 ${guests} pessoa${guests !== 1 ? 's' : ''}</span>
          ${rooms ? `<span>🛏 ${rooms} quarto${rooms !== 1 ? 's' : ''}</span>` : ''}
          ${baths ? `<span>🚿 ${baths} banheiro${baths !== 1 ? 's' : ''}</span>` : ''}
        </div>
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
    // Datacrazy: lead contém o contato, stage contém o funil
    const nome   = r.lead?.name || r.name || '—';
    const estagio = r.stage?.name || '—';
    const criado  = formatDate(r.createdAt);
    const movido  = formatDate(r.lastMovedAt);
    const valor   = parseFloat(r.total || 0);
    const status  = mapStatus(r.status);

    return `
      <tr>
        <td>${escHtml(nome)}</td>
        <td>${escHtml(estagio)}</td>
        <td>${criado}</td>
        <td>${movido}</td>
        <td><strong>${brl(valor)}</strong></td>
        <td><span class="status-pill ${status.cls}">${status.label}</span></td>
      </tr>
    `;
  }).join('');
}

function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return str; }
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
  state.reservas = await fetchReservas(state.currentMonth);
  renderAll();
});

document.getElementById('nextMonth').addEventListener('click', async () => {
  state.currentMonth = nextMonth(state.currentMonth);
  state.reservas = await fetchReservas(state.currentMonth);
  renderAll();
});

/* ── Tabs ───────────────────────────────────────────────────────── */

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

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
    deleteBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('modalTitle').textContent    = 'Novo Parceiro';
    document.getElementById('p-nome').value              = '';
    document.getElementById('p-contato').value           = '';
    document.getElementById('p-imoveis').value           = '';
    document.getElementById('p-mensalidade').value       = '';
    document.getElementById('p-comissao').value          = '';
    document.getElementById('p-emaberto').value          = '';
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

  const valorFixo    = parseFloat(document.getElementById('p-mensalidade').value) || 0;
  const comissao     = parseFloat(document.getElementById('p-comissao').value)    || 0;
  const valorEmAberto = parseFloat(document.getElementById('p-emaberto').value)   || 0;

  if (state.editingParceiroId) {
    const p = state.appData.parceiros.find(x => x.id === state.editingParceiroId);
    p.nome          = nome;
    p.contato       = document.getElementById('p-contato').value.trim();
    p.imoveis       = document.getElementById('p-imoveis').value.trim();
    p.valorFixo     = valorFixo;
    p.valorEmAberto = valorEmAberto;
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

function openCustoModal(id = null) {
  editingCustoId = id;
  const deleteBtn = document.getElementById('btnDeleteCusto');

  if (id) {
    const c = getCustosDoMes().find(x => x.id === id);
    document.getElementById('custoModalTitle').textContent = 'Editar Custo';
    document.getElementById('c-tipo').value       = c.tipo;
    document.getElementById('c-titulo').value     = c.titulo;
    document.getElementById('c-frequencia').value = c.frequencia;
    document.getElementById('c-valor').value      = c.valor;
    deleteBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('custoModalTitle').textContent = 'Novo Custo';
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
}

window.openEditCusto = function(id) { openCustoModal(id); };

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

  const tipo       = document.getElementById('c-tipo').value;
  const frequencia = document.getElementById('c-frequencia').value;

  if (!state.appData.custos) state.appData.custos = {};
  let lista = getCustosDoMes();

  if (editingCustoId) {
    const idx = lista.findIndex(c => c.id === editingCustoId);
    if (idx >= 0) lista[idx] = { ...lista[idx], tipo, titulo, frequencia, valor };
  } else {
    lista.push({ id: uid(), tipo, titulo, frequencia, valor });
  }

  state.appData.custos[state.currentMonth] = lista;
  await saveData(state.appData);
  closeCustoModal();
  renderCustos();
  renderSummary();
});

document.getElementById('btnDeleteCusto').addEventListener('click', async () => {
  if (!confirm('Excluir este custo?')) return;
  let lista = getCustosDoMes().filter(c => c.id !== editingCustoId);
  state.appData.custos[state.currentMonth] = lista;
  await saveData(state.appData);
  closeCustoModal();
  renderCustos();
  renderSummary();
});

/* ── Init ───────────────────────────────────────────────────────── */

loadAll();
