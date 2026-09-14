# Planejamento de Diárias — Artezian Real Estate Atelie

**Data:** 14/09/2026
**Objetivo:** definir uma tabela de diárias competitiva para todas as unidades geridas na Stays, com foco especial em manter ocupação nos períodos de baixa temporada, usando os dados reais do PriceLabs como base sempre que disponíveis.

---

## Achados críticos (ler antes da tabela)

1. **Cobertura do PriceLabs é parcial: só 2 das 18 unidades estão mapeadas.** Flat da Mari (Mont Carmelo) e Studio Varandas 03 (Varandas de Porto) têm motor de precificação dinâmica e dados de mercado em tempo real. As outras 16 (2 unidades de Mont Carmelo, 6 de Varandas de Porto, as 5 casas e os 3 apartamentos avulsos) não têm — os valores delas neste planejamento vêm da base de conhecimento interna, calibrados pelos padrões sazonais que o PriceLabs confirmou para o restante da carteira. **Recomendo mapear as 16 restantes no PriceLabs** para ter recomendação dinâmica própria de cada uma, em vez de depender de proxy.

2. **Studio Varandas 03 está vendendo abaixo do próprio piso do algoritmo.** Praticado hoje: R$150/noite em baixa temporada. O piso configurado no PriceLabs é R$170, e o P25 real de mercado (categoria 1 quarto, 145 comparáveis) é R$267. Ou seja, a diária praticada está ~44% abaixo do que o mercado local aceita pagar mesmo no low end. Isso não é "ser competitivo" — é deixar receita na mesa sem ganhar reserva adicional por isso, já que R$150 já está abaixo do algoritmo.

3. **Studio Varandas 03 tem 48 datas bloqueadas entre 30/dez/2026 e 13/jan/2027** — exatamente a janela de Réveillon (mercado sobe 50,4% nesse período) mais o início de Janeiro (alta temporada). Se o bloqueio não for uso do proprietário, é a maior perda de receita identificável no calendário atual. Vale confirmar com o proprietário.

4. **Flat da Mari (Mont Carmelo) está superando o mercado em ocupação** — 47% vs 25% em setembro, 26% vs 19% em outubro. O PriceLabs já sinaliza "outperforming" (flag azul): há espaço para subir preço em fins de semana e datas de pico sem perder reserva, não para baixar mais.

5. **Em baixa temporada ampla (junho/agosto), as duas unidades mapeadas já vendem abaixo do mercado da própria região** — isso é bom para o objetivo de competitividade, mas confirma que dá para manter esse posicionamento nas outras 16 unidades sem inventar desconto adicional.

---

## Metodologia

- **Mont Carmelo e Varandas de Porto:** preços calibrados pelos percentis reais de mercado do PriceLabs (categoria por número de quartos, raio de comparáveis do próprio bairro), usando Flat da Mari e Studio Varandas 03 como referência de cada condomínio.
- **Casas e apartamentos avulsos:** sem comparável direto no PriceLabs (Market Research não está habilitado nesta conta — pedido de liberação enviado seria o próximo passo). Usei os valores-base já praticados pela Artezian e apliquei o mesmo calendário de picos que o PriceLabs confirmou para a região (Réveillon, Carnaval, Semana Santa, semana de Nossa Senhora Aparecida), além de separar a baixa temporada em dia de semana vs. fim de semana — hoje esse segmento só tinha 3 faixas (Baixa/Alta/Feriados).
- **Janelas de pico confirmadas pelo PriceLabs (válidas para toda a região Taperapuã/Coroa Vermelha):**
  - Réveillon (27/28 dez a 1/2 jan): mercado +40% a +50% sobre os dias ao redor
  - Carnaval (5–10 fev): mercado +35% a +39%
  - Semana Santa/final de março (23–27 mar): mercado +18% a +22%
  - Semana de pico de ocupação 10–16 de outubro (provável feriado de Nossa Senhora Aparecida + fim de semana prolongado): ocupação +26% a +28% acima do normal

---

## Calendário de feriados e datas especiais (set/2026 – set/2027)

Datas reais de feriados nacionais e do calendário regional de Porto Seguro, já cruzadas com as janelas de pico que o PriceLabs confirmou. Cada linha aponta qual faixa de preço das tabelas abaixo usar. Datas móveis (Carnaval, Páscoa/Semana Santa, Corpus Christi) mudam todo ano — confirmar de novo na revisão anual.

| Data(s) | Evento | Mont Carmelo / Varandas de Porto | Casas / Apartamentos avulsos |
|---|---|---|---|
| 10 a 16/out/2026 | Feriado de N. Sra Aparecida (seg 12/out) + fim de semana — pico de ocupação confirmado no PriceLabs (+26% a 28%) | Sem. 10–16 out | Baixa (fds) + 15% |
| 31/out a 02/nov/2026 | Finados (feriado seg 02/nov) — a diária praticada nas duas unidades mapeadas já sobe pra faixa de feriado nesse período | Carnaval/Semana Santa · Feriados/Carnaval | Feriados/Semana Santa · Feriados |
| 20 a 22/nov/2026 | Consciência Negra (feriado sex 20/nov) — ponte curta de 3 dias | Média/Shoulder · Média **+15%** | Baixa (fds) **+15%** |
| 24 a 27/dez/2026 | Véspera e Natal (feriado sex 25/dez) — ponte curta | Média/Shoulder · Média **+15%** | Baixa (fds) **+15%** |
| 28/dez/2026 a 02/jan/2027 | Réveillon — pico do ano (mercado +40% a 50%) | Réveillon | Réveillon |
| 03 a 31/jan/2027 | Alta temporada de Janeiro | Janeiro/Alta | Janeiro/Alta |
| 05 a 09/fev/2027 | Carnaval (feriado seg/ter 8–9/fev; mercado +35% a 39%) | Carnaval/Semana Santa · Feriados/Carnaval | Carnaval |
| 10 a 12/fev/2027 | Carnaporto Axé Moi — carnaval fora de época, evento próprio de Porto Seguro logo após o Carnaval oficial | Carnaporto | Carnaval (mesmo peso — evento atrai público de fora da região) |
| 22 a 27/mar/2027 | Semana Santa (Páscoa 28/mar; mercado +18% a 22%) | Carnaval/Semana Santa · Feriados/Carnaval | Feriados/Semana Santa |
| 21/abr/2027 | Tiradentes (quarta-feira, feriado seco, sem ponte) | Média/Shoulder · Média | Baixa (fds) |
| 01/mai/2027 (sábado) | Dia do Trabalho | Média/Shoulder · Média | Baixa (fds) |
| 27 a 30/mai/2027 | Corpus Christi (feriado qui 27/mai, ponte tradicional pra praia) | Carnaval/Semana Santa · Feriados/Carnaval | Feriados/Semana Santa · Feriados |
| 30/jun/2027 | Aniversário de Porto Seguro (feriado municipal, quarta-feira, em plena baixa temporada) | Sem alteração — impacto é local, não turístico | Sem alteração |

Datas com efeito baixo ou nulo, sem ajuste de preço: Dia do Servidor Público (28/out/2026, ponto facultativo), Proclamação da República (15/nov/2026, cai num domingo — sem ponte) e Independência (07/set/2027, terça isolada, sem ponte natural).

Sources:
- [CarnaPorto Axé Moi 2027 na Arena Axé Moi](https://www.porto-seguro-bahia.com/E27580-CarnaPorto_Axe_Moi_2027_na_Arena_Axe_Moi)
- [Feriados municipais de Porto Seguro-BA](https://www.feriadosmunicipais.com.br/bahia/porto-seguro)
- [Calendário nacional tem cinco feriados entre outubro e dezembro — Brasil em Folhas](https://www.brasilemfolhas.com.br/2026/09/calendario-nacional-tem-cinco-feriados-entre-outubro-e-dezembro/)
- [Feriados nacionais para o ano de 2027 — Anbima](https://www.anbima.com.br/feriados/fer_nacionais/2027.asp)

---

## Mont Carmelo (3 unidades)

Mercado local (PriceLabs, via Flat da Mari): 1 quarto — P25 R$231 / P50 R$314 / P75 R$387 / P90 R$500 (80 comparáveis). 2 quartos — P25 R$333 / P50 R$418 / P75 R$553 / P90 R$718 (241 comparáveis).

| Unidade | Categoria | Baixa | Média/Shoulder | Sem. 10–16 out | Carnaporto | Carnaval/Semana Santa | Janeiro/Alta | Réveillon |
|---|---|---|---|---|---|---|---|---|
| DS03J — Studio do João (até 5 pax) | Studio | R$220 | R$260 | R$300 | R$340 | R$400 | R$580 | R$720 |
| DS04J — Flat da Mari (até 5 pax) — **já no PriceLabs, praticado R$285, supera mercado** | 1 quarto | R$280 | R$320 | R$370 | R$390 | R$460 | R$620 | R$800 |
| DS05J — Apartamento do Emanoel (até 8 pax) | 2 quartos | R$360 | R$430 | R$480 | R$520 | R$620 | R$900 | R$1.150 |

Nota sobre o Emanoel: o valor de "baixa temporada" hoje na base de conhecimento é R$500 — quase o P50 do mercado (R$418) para uma unidade que precisa competir justamente nos dias de menor procura. Baixando para R$350–380 (perto do P25) tende a preencher mais diárias sem sacrificar as janelas de alta, onde ele já é competitivo.

---

## Varandas de Porto (7 unidades)

Mercado local (PriceLabs, via Studio Varandas 03): 1 quarto — P25 R$267 / P50 R$309 / P75 R$368 / P90 R$447 (145 comparáveis, amostra robusta). 2 quartos — P25 R$350 / P50 R$449 / P75 R$538 / P90 R$689 (172 comparáveis). *A categoria "Studio" do PriceLabs tem só 3 comparáveis nesse bairro — amostra pequena demais pra confiar; usei a categoria 1 quarto com desconto por ser cômodo único.*

| Unidade | Categoria | Baixa | Média | Sem. 10–16 out | Carnaporto | Feriados/Carnaval | Janeiro/Alta | Réveillon |
|---|---|---|---|---|---|---|---|---|
| JR01J / JR04J — Studios (até 4 pax) | Studio | R$200 | R$240 | R$280 | R$400 | R$480 | R$600 | R$980 |
| JR03J — Studio Varandas 03 (até 4 pax) — **já no PriceLabs, praticado R$150 — corrigir para a faixa acima** | Studio | R$200 | R$240 | R$280 | R$400 | R$480 | R$600 | R$980 |
| JR05J / JR08J — Apto 1 quarto (até 5–6 pax) | 1 quarto | R$280 | R$320 | R$350 | R$490 | R$600 | R$660 | R$1.150 |
| JR07J — Apto Varandas 03 (até 5–6 pax) — já no PriceLabs | 1 quarto | R$280 | R$320 | R$350 | R$490 | R$600 | R$660 | R$1.150 |
| JR09J — Apto Duplex Varandas 01 (até 8 pax) | 2 quartos | R$390 | R$460 | R$510 | R$780 | R$1.000 | R$1.200 | R$1.650 |

Ação imediata recomendada: subir o preço praticado do Studio Varandas 03 (JR03J) de R$150 para pelo menos R$200 em dias normais de baixa temporada — ainda abaixo do P25 de mercado, mas acima do piso do próprio algoritmo, e revisar o bloqueio de 30/dez a 13/jan.

---

## Casas (5 unidades — Taperapuã e Arraial d'Ajuda)

Sem comparável direto no PriceLabs. Baseado nos valores já praticados pela Artezian, com a baixa temporada dividida em dia de semana / fim de semana e um patamar de Réveillon acima do "Alta" genérico (casas grandes de grupo/festa têm no Réveillon o pico absoluto do ano).

| Unidade | Capacidade | Localização | Baixa (seg–qui) | Baixa (fds) | Feriados/Semana Santa | Carnaval | Janeiro/Alta | Réveillon |
|---|---|---|---|---|---|---|---|---|
| GF02J — Casa do Tremura | 6 qtos, até 25 pax | Taperapuã, 300m do mar | R$1.400 | R$1.600 | R$2.500 | R$2.900 | R$3.000 | R$3.800 |
| GF04J — Casa da Laureana | 4 dorm., até 13 pax | Arraial d'Ajuda, vista mar, 800m da praia | R$1.600 | R$1.800 | R$2.500 | R$2.900 | R$3.000 | R$3.800 |
| GF06J — Casa da Moana | 5 qtos | Taperapuã | R$1.350 | R$1.500 | R$2.500 | R$2.900 | R$3.000 | R$3.800 |
| GG06J — Casa do Euller | 9 qtos, até 50 pax | Taperapuã, 1,5km do mar (mais privativa) | R$2.200 | R$2.500 | R$3.500 | R$4.000 | R$3.500 | R$4.800 |
| GG08J — Casa do John | 5 qtos, até 25 pax | Taperapuã, 600m do mar | R$1.600 | R$1.800 | R$2.200 | R$2.600 | R$2.700 | R$3.400 |

---

## Apartamentos individuais (3 unidades)

| Unidade | Capacidade | Localização | Baixa (seg–qui) | Baixa (fds) | Feriados | Carnaval | Janeiro/Alta | Réveillon |
|---|---|---|---|---|---|---|---|---|
| FL10J — Apartamento do Reinaldo | 3 suítes, até 11 pax | Taperapuã (condomínio c/ piscina, sauna, portaria 24h) | R$690 | R$790 | R$1.200 | R$1.450 | R$1.700 | R$2.100 |
| GC01J — Apartamento do Zé Coroa | 3 qtos, até 11 pax | Coroa Vermelha, Praia do Mutá | R$690 | R$790 | R$1.100 | R$1.350 | R$1.650 | R$2.050 |
| HA03J — Apartamento da Joyce | 2 suítes + 1 qto, até 8 pax | Taperapuã | R$590 | R$690 | R$900 | R$1.050 | R$1.200 | R$1.500 |

---

## Próximos passos sugeridos

1. Corrigir a diária praticada do Studio Varandas 03 (JR03J) no calendário da Stays — está abaixo do piso do PriceLabs.
2. Confirmar com o proprietário se o bloqueio de 30/dez/2026 a 13/jan/2027 no Studio Varandas 03 é intencional; se não for, liberar — é a janela de maior valorização do ano na região.
3. Mapear as 16 unidades restantes no PriceLabs (as outras de Mont Carmelo e Varandas de Porto, as 5 casas e os 3 apartamentos avulsos) para elas passarem a ter motor de precificação dinâmica e dados de mercado próprios, em vez de depender deste planejamento manual.
4. Pedir liberação do recurso de Market Research do PriceLabs (hoje desabilitado nesta conta) para conseguir comparáveis reais de casas de 4+ quartos e apartamentos fora dos dois condomínios.
5. Revisar esta tabela a cada 4–6 semanas — os percentis de mercado do PriceLabs mudam com a oferta da região.
6. Todo início de ano, reconferir as datas móveis do calendário de feriados (Carnaval, Semana Santa, Corpus Christi e Carnaporto mudam de data a cada ano) antes de aplicar as faixas de preço.
