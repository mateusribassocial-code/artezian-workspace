# Dashboard — Artezian Real Estate

## Visão geral

Dashboard HTML standalone para gestão operacional da Artezian. Sem dependências externas — tudo em um único arquivo HTML com CSS e JS vanilla.

**Arquivo principal:** `artezian.html`

---

## Estrutura de áreas

Ao contrário do modelo de múltiplos clientes, o dashboard opera em torno de uma única empresa (Artezian) com três linhas de negócio como containers principais:

| Área | Cor | Descrição |
|---|---|---|
| Locação | `#4fc3f7` (azul) | Reservas, atendimento e gestão de imóveis por temporada |
| Venda | `#4caf85` (verde) | Leads, propostas e pipeline de venda de studios |
| Infoproduto | `#ce93d8` (lilás) | Conteúdo, lançamentos e produtos digitais |

---

## Status de implementação

### Feito
- [x] Layout base com 3 containers (Locação, Venda, Infoproduto)
- [x] Tema dark com cores por área
- [x] Header com logo e data atual
- [x] Responsivo (mobile: coluna única)

### A implementar
- [ ] Conteúdo interno de cada container (tarefas, métricas, status)
- [ ] Persistência via localStorage
- [ ] Navegação por semana
- [ ] Tarefas por área com checklist
- [ ] Registros/notas por área

---

## Variáveis CSS (tema dark)

```css
--bg: #0f1117
--surface: #1a1d27
--surface2: #21253a
--border: #2e3248
--accent-locacao: #4fc3f7
--accent-venda: #4caf85
--accent-info: #ce93d8
--text: #e8eaf0
--muted: #8891a8
--radius: 10px
```

---

## Decisões de design

- **Empresa única, não clientes** — o eixo principal são as três linhas de negócio, não múltiplos clientes externos
- **Cores distintas por área** — identidade visual consistente: azul (locação), verde (venda), lilás (infoproduto)
- **Grid 3 colunas** — visualização simultânea das três áreas em desktop
