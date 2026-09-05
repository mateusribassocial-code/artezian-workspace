# Textos Rápidos — Setor de Locação

> Biblioteca de respostas pré-preenchidas do Datacrazy (instância **WhatsApp - Locação - API Oficial**).
> Construída a partir de **1.725 conversas reais** da instância de locação (fev–jul/2026) + amostra de 260 threads completas puxadas via API.

---

## 1. O que os dados mostram

**Onde o atendimento está vazando:**

| Achado | Número |
|---|---|
| Conversas na janela analisada | 1.725 |
| Terminam com **a gente** falando por último (lead sumiu) | **1.468 (85%)** |
| Terminam com o lead falando por último | 201 (13%) |
| Dessas, encerram num "ok / obrigado / blz" morno sem retomada | ~64 (32%) |
| Mediana de mensagens por conversa | 15 |
| Conversas que chegam a um humano (handoff explícito) | 42 de 260 (**16%**) |

**A mensagem que mais encerra conversa não é um atendimento — é um disparo de campanha** ("Promoção de inverno", 383 conversas; "Promoção de março", 82). Ou seja: hoje o que reativa lead é blast em massa, não follow-up individual.

**O que os leads realmente perguntam** — 260 threads completas, 3.501 mensagens, **1.261 delas escritas pelo lead**:

| Tema | Menções |
|---|---|
| **Preço** ("qual o valor?", "quanto fica no total?") | **28** |
| **Localização** ("fica perto do Tôa Tôa?", "quantos metros da praia?") | **15** |
| **Fotos / vídeo / mais detalhes** | **9** |
| **Pagamento** ("como funciona?", "tem juros?", "só Pix?") | **8** |
| Pet | 5 |
| Disponibilidade | 4 |
| Horário de check-in / check-out | 2 |
| Estrutura (piscina, wi-fi, ar, churrasqueira) | 2 |
| Café da manhã | 2 |
| Cancelamento / reembolso | 2 |
| Confiança ("como sei que vocês são de confiança?") | 1 — raro, mas fatal |
| Mínimo de noites | **0** |

> ⚠️ Isso contraria a base atual. O `### Dúvidas frequentes.txt` e o `faq-reservas.md` gastam metade do espaço com wi-fi, ar-condicionado, piscina, café da manhã e mínimo de noites — que somam **6 menções em 1.261**. E não têm nada pronto pra **preço**, **localização** e **fotos**, que somam **52**.
>
> Nota de método: contei por regex estrito sobre as mensagens do lead, depois li os matches pra descartar falso positivo (o primeiro corte inflava "check-in" porque pegava gente informando data, não perguntando horário). Números são de menção, não de conversa única — o mesmo lead pode perguntar preço duas vezes.

**Conclusão que orienta esta biblioteca:** o gargalo não é responder dúvida. É **retomar conversa** e **fechar**. Por isso a categoria Negociação ganhou 3 follow-ups escalonados — que hoje não existem.

---

## 2. Como nomear (pra o humano achar rápido)

O atendente busca digitando. Duas regras:

1. **Prefixo de 2 letras + número** — digita `ng` e vê a Negociação inteira, na ordem do funil.
2. **Nome = o gatilho, não o nosso jargão.** Dúvidas levam a frase do lead entre aspas. O atendente lê "Como funciona o pagamento?" na tela, digita "pagam", acha.

| Prefixo | Categoria |
|---|---|
| `BV` | Boas-vindas |
| `DV` | Dúvidas frequentes |
| `NG` | Negociação |
| `DC` | Descarte |
| `CF` | Confirmação de reserva |
| `PV` | Pós-venda |

**Legenda de esforço** — vem no fim de cada template:
- ✅ **zero edição** — manda como está
- ✏️ **preenche X** — tem campo manual (marcado em `[MAIÚSCULA]`)

Variáveis do Datacrazy usadas: `{Nome do lead}`, `{Primeiro nome do lead}`.

> Regra de ouro: **template que exige digitar muito não é usado.** Se um campo manual aparece 3x na mesma mensagem, ela vira duas mensagens ou vira frame com espaço em branco.

---

## 3. Boas-vindas

### `BV1 Apresentação — Mateus` ✅
```
Olá {Nome do lead}, tudo bem? Me chamo Mateus, sou da equipe do João e vou te ajudar com a sua reserva 🤩
```

### `BV2 Apresentação — Maira` ✅
```
Olá {Nome do lead}, tudo bem? Me chamo Maira, sou da equipe do João e vou te ajudar com a sua reserva 🤩
```

### `BV3 Retomada — falha no sistema` ✅
*(era "Erro Automação")*
```
Tivemos um problema no nosso sistema aqui, {Primeiro nome do lead} 🙈

Pra eu não te fazer repetir tudo: me confirma só a data de check-in, check-out e quantas pessoas?
```

### `BV4 Lead que já disse o que quer` ✅
> Use quando o lead abre já com datas/grupo (veio do site ou do anúncio). Evita a pergunta que ele já respondeu.
```
Boa, {Primeiro nome do lead}! Já anotei aqui ✅

Deixa eu ver o que temos disponível pra essas datas e já te volto com as opções.
```

### `BV5 Fora do horário` ✅
```
Oi {Primeiro nome do lead}! Chegou fora do nosso horário de atendimento, mas já tá na fila aqui ☀️

Amanhã cedo alguém da equipe te responde. Se quiser adiantar, me manda: data de chegada, data de saída e quantas pessoas.
```

---

## 4. Dúvidas frequentes

> Ordenadas pela frequência real, não pela ordem do documento antigo.

### `DV1 "Qual o valor?" (antes de ter as datas)` ✅
> A dúvida nº 1. Hoje não existe template — e responder preço sem data é o jeito mais rápido de perder o lead.
```
Depende muito das datas e do tamanho do grupo, {Primeiro nome do lead} — a diária muda bastante entre baixa temporada, feriado e alta.

Me passa chegada, saída e quantas pessoas que eu já te monto o valor fechado ✅
```

### `DV2 "Fica perto da praia?"` ✏️ *preenche a distância e o ponto de referência*
> A distância muda por imóvel, então isso é um frame — não dá pra fixar texto.
```
Fica sim! O [IMÓVEL] tá a [DISTÂNCIA] da praia de [PRAIA] 🏖️

[REFERÊNCIA — ex: Bem pertinho do Axé Mói e do Tôa Tôa]
```
> Referências mais pedidas nas conversas: Axé Mói, Tôa Tôa, Boa Beach, Gallo Praia, Passarela do Álcool.

### `DV3 "Manda mais fotos?"` ✏️ *cola o link do imóvel*
> 3ª dúvida mais frequente (9 menções) e hoje não tem nada pronto — o atendente garimpa foto na mão toda vez.
```
Claro, {Primeiro nome do lead}! Aqui tem vídeo e todas as fotos do [IMÓVEL] 👇

[LINK DO REEL / artezian.com.br/pt/apartment/[ID]]

Se quiser ver algum cômodo específico me fala que eu mando ☀️
```
> Sugestão: montar um texto rápido por imóvel com o link do reel já colado. São ~20 imóveis, vira zero edição e mata a dúvida nº 3.

### `DV4 "Como funciona o pagamento?"` ✅
*(mantém o texto que a equipe já usa — está em `[LOC] Formas de Pagamento`)*
```
Aqui estão as principais formas de pagamento:

✅ Pix à vista: *5% de desconto*
✅ Pix parcelado: de 30% a 50% agora pra garantir a reserva e o restante em até 3X (precisa estar quitado antes do check-in)
✅ Cartão: até 12X com o juros da máquina
```

### `DV5 "Tem desconto?"` ✅
> Não existia template pra isso e é a pergunta que abre a porta pro pagamento à vista — o cenário melhor pra Artezian.
```
Tem sim, {Primeiro nome do lead}! Pagando à vista no Pix, *5% de desconto* no valor total ✅

Se preferir parcelar também dá: 30% a 50% agora pra garantir e o restante em até 3x.
```

### `DV6 "No cartão tem juros?"` ✅
```
Tem sim, {Primeiro nome do lead} — no cartão é o juros da máquina, até 12x.

No Pix sai bem melhor: à vista você ganha 5% de desconto, ou parcela sem juros (30% a 50% agora e o resto em até 3x, quitado antes do check-in) ✅
```

### `DV7 "Só aceita Pix?"` ✅
```
Não! Pix ou cartão, os dois 👍

No Pix à vista tem 5% de desconto. Parcelado, você garante com 30% a 50% e paga o resto em até 3x. No cartão vai até 12x com o juros da máquina.
```

### `DV8 "Tem café da manhã?"` ✅
*(mantém o atual, com uma linha a mais)*
```
Todas as unidades são individuais e sem café da manhã. Como são airbnbs eles funcionam um pouco diferente de hotel.

Mas a cozinha é completa e tem mercado bem perto ☀️
```

### `DV9 "Qual o mínimo de noites?" — data normal` ✅
```
O mínimo é de 3 diárias, {Primeiro nome do lead} ✅

Me passa as datas que eu confiro a disponibilidade.
```

### `DV10 "Qual o mínimo de noites?" — feriado` ✅
> Em feriado o mínimo sobe pra 5. São dois textos separados de propósito: se for um só, o atendente tem que editar toda vez e acaba não usando.
```
Pra esse período o mínimo é de 5 diárias, {Primeiro nome do lead} — é feriado, e os proprietários só fecham a partir disso.

Se você tiver flexibilidade pra pegar dias fora do feriado, o mínimo cai pra 3 e a diária fica bem mais em conta ☀️
```
> Os períodos de feriado estão no calendário do `prompt-unico-reservas.md` (seção CALENDÁRIO). Na dúvida, confere lá antes de responder.

### `DV11 "Aceita pet?"` ✅
```
Aceita em alguns, {Primeiro nome do lead}! 🐶

Studio do João (porte pequeno) e todos os apartamentos do Condomínio do Max, em Mundaí — sem taxa extra. Nos outros é sob consulta.

Qual deles vc curtiu? Eu confirmo pra você.
```

### `DV12 "Que horas é o check-in?"` ✅
```
Check-in a partir das 15h e check-out até as 12h ✅

Entrar mais cedo ou sair mais tarde a gente tenta, mas depende da reserva anterior — não dá pra garantir antes.
```

### `DV13 "Como sei que vocês são de confiança?"` ✅
> ⚠️ O template atual (`Não é Golpe`) tem só um vídeo e o corpo em branco — literalmente "Crie sua nova mensagem". Está quebrado. Aqui vai o texto pra acompanhar o vídeo.
```
Pergunta justa, {Primeiro nome do lead} — e boa que você perguntou 👊

Somos a Artezian, gestora de temporada aqui de Porto Seguro. Superhost com nota 4.9, o João tem 95 mil seguidores no @ojoaomendonca e a gente faz contrato de locação por temporada em todas as reservas — assinado antes de qualquer pagamento.

Site: artezian.com.br

Qualquer coisa, dá uma olhada no perfil e nos vídeos dos imóveis 💙
```

### `DV14 "Vocês são do Airbnb?"` ✅
```
Não, o atendimento é direto com a Artezian 💙

Por isso é mais ágil e você não paga taxa de plataforma. A gente faz a gestão completa dos imóveis.
```

### `DV15 "Posso cancelar?"` ✅
```
Pode sim, {Primeiro nome do lead}. As regras são as do contrato:

• Até 72h depois de assinar: reembolso integral
• De 72h até 30 dias antes do check-in: retenção de 15% (taxa administrativa), o resto volta em até 5 dias úteis
• Menos de 30 dias antes do check-in: sem reembolso

Mudança de data a gente tenta conforme disponibilidade — quanto antes avisar, melhor.
```

---

## 5. Negociação

### `NG1 Orçamento enviado` ✏️ *preenche valor total e datas*
> Substitui o `Sondagem_Enviada`, que hoje é um esqueleto vazio ("Aqui está o Preço: R$ / 30% no Pix (Contrato): / Restante no Check-in:") e obriga o atendente a montar tudo na mão.
```
Fechei o orçamento aqui, {Primeiro nome do lead} ✅

[IMÓVEL] — [CHECK-IN] a [CHECK-OUT]
[N] noites · [N] pessoas

💰 Total: R$ [VALOR]
• 30% no Pix pra garantir (contrato): R$ [ENTRADA]
• Restante no check-in: R$ [SALDO]

Posso segurar essas datas pra você?
```

### `NG2 Vaga confirmada + valor` ✏️ *preenche total*
> Formato que a equipe já usa e funciona. Só padronizado.
```
Confirmado, temos vaga! ✅

O valor da reserva fica:
Preço total: R$ [VALOR]

30% — Pix no contrato
70% — no check-in
```

### `NG3 Formas de pagamento` ✅
> Mesmo texto do `DV4`. Mantém nas duas categorias — o atendente procura em lugares diferentes dependendo do momento.

### `NG4 Follow-up 1 — 24h sem resposta` ✅
> **O buraco maior da operação.** 85% das conversas morrem exatamente aqui e não existe nada pronto.
```
{Primeiro nome do lead}, e aí — o que achou das opções? ☀️

Se ficou alguma dúvida ou se você quer que eu procure outra coisa, me fala que eu ajusto.
```

### `NG5 Follow-up 2 — 3 dias` ✅
```
Oi {Primeiro nome do lead}! Ainda tô com essas datas separadas aqui pra você 👀

Mas nessa época elas costumam sair rápido. Segue de pé ou prefere que eu libere?
```

### `NG6 Follow-up 3 — última tentativa` ✅
> Dá saída digna e limpa o funil. Muita conversa hoje fica pendurada pra sempre.
```
{Primeiro nome do lead}, vou parar de te encher 😄

Se mudar de ideia ou quiser pra outra data, é só me chamar aqui que eu monto tudo de novo. Fica à vontade 💙
```

### `NG7 "Vou falar com o grupo / meu esposo"` ✅
> Padrão constante nos encerramentos ("vou passar para o grupo", "vou ver com a esposa", "estamos confirmando com os familiares"). O erro hoje é responder "ok" e sumir.
```
Perfeito, {Primeiro nome do lead}! Vou te mandar tudo resumido pra facilitar de mostrar pra eles 👇

[COLE AQUI O RESUMO DO ORÇAMENTO]

Qualquer dúvida que surgir do grupo, me chama que eu respondo na hora ✅
```

### `NG8 Objeção de preço → alternativa` ✅
> Nunca dar desconto de cara. Dar opção.
```
Entendi, {Primeiro nome do lead} — ficou acima do que vocês tinham pensado.

Deixa eu tentar de outro jeito: consigo te mostrar opção mais em conta, ou ajustar reduzindo uma noite ou mudando a data pra um período mais barato.

Qual desses caminhos faz mais sentido pra vocês?
```

### `NG9 "Alguma novidade?" — lead cobrando retorno` ✅
```
Tô aqui sim, {Primeiro nome do lead}! Desculpa a demora 🙏

Já tô confirmando isso e te volto ainda hoje ✅
```

---

## 6. Descarte

### `DC1 Sem disponibilidade → alternativa` ✅
> ⚠️ O atual (`Sem Disponibilidade`) é "Para essa data não temos mais nada disponível 😱" e acaba a conversa ali. É um beco sem saída — descarta lead que ainda tem data flexível.
```
Pra essa data específica já lotou, {Primeiro nome do lead} 😱

Mas antes de você desistir: vocês têm alguma flexibilidade de data? Se der pra mudar uns dias eu consigo encaixar — e nessas datas alternativas costuma sair até mais em conta ☀️
```

### `DC2 Fora do orçamento` ✅
> Melhora o `Fora do Orçamento` atual, que também encerra sem saída.
```
Entendi que o preço ficou acima da sua expectativa, {Primeiro nome do lead}.

Nessa faixa a gente realmente não tem hospedagem — mas se um dia der pra esticar um pouco o orçamento, ou se vocês vierem em época de baixa temporada, me chama que os valores mudam bastante 💙
```

### `DC3 "Já fechei em outro lugar"` ✅
```
Tranquilo, {Primeiro nome do lead}! Boa viagem e aproveita Porto Seguro ☀️

Se um dia quiser voltar, me chama aqui direto que eu resolvo rapidinho 💙
```

### `DC4 Fora da nossa região / tipo` ✅
> Aparece com frequência: gente procurando Coroa Vermelha, Arraial Eco Park, hotel, ou locação mensal.
```
Ah, {Primeiro nome do lead}, aí eu não consigo te ajudar — a gente trabalha com temporada em Taperapuã, Mundaí, Arraial D'Ajuda e Coroa Vermelha, e só com apartamento e casa (hotel não é com a gente).

Se mudar a ideia e quiser uma casa ou apê por lá, me chama 💙
```

### `DC5 Proprietário querendo anunciar` ✅
> Não é lead de hospedagem — mas é lead de gestão. Hoje cai no mesmo balde e se perde.
```
Boa, {Primeiro nome do lead}! Isso a gente faz sim — gestão completa de imóvel pra temporada.

Vou te passar pra pessoa certa aqui da equipe, que te explica como funciona ✅
```

---

## 7. Confirmação de reserva

### `CF1 Vaga confirmada — próximos passos` ✅
*(mantém, com pequeno ajuste de clareza)*
```
Vaga confirmada! 🤩

Vou mandar os próximos passos:
• Documento com foto
• Comprovante de endereço (com CEP)
• E-mail
• Lista de hóspedes (só o nome, e avisa se tem criança)

Assim que você mandar, eu já gero o contrato ✅
```

### `CF2 Dados recebidos → contrato a caminho` ✅
```
Recebi tudo, {Primeiro nome do lead} ✅

Tô gerando o contrato aqui e te mando por e-mail. Assim que você assinar, eu te passo a chave Pix da entrada.
```

### `CF3 Chave Pix + prazo` ✏️ *preenche valor e chave*
```
Contrato assinado ✅ Agora é só a entrada pra fechar tudo.

💰 Entrada: R$ [VALOR]
🔑 Chave Pix: [CHAVE]
📄 Titular: [NOME DO TITULAR]

Me manda o comprovante aqui quando fizer. As datas ficam garantidas assim que cair ☀️
```

### `CF4 Pagamento confirmado` ✅
```
Caiu aqui! Reserva garantida, {Primeiro nome do lead} 🤩☀️

Pode comprar a passagem tranquilo que as datas são de vocês.
```

### `CF5 Lembrete do saldo (pré-check-in)` ✏️ *preenche valor e data*
```
Oi {Primeiro nome do lead}! Já tá chegando 🏖️

Só lembrando do saldo da reserva: R$ [VALOR], pago no check-in do dia [DATA].

Qualquer coisa até lá, me chama ✅
```

---

## 8. Pós-venda

> Categoria praticamente vazia hoje (um único template, `Pós - João`, com um PDF). É onde nasce recompra e indicação — e Porto Seguro é destino de gente que volta.

### `PV1 Transferência pro suporte` ✅
*(hoje está em Negociação como `Reserva Concluída` — pertence aqui)*
```
Prontinho {Primeiro nome do lead}, agora todo o nosso contato vai ficar no *WhatsApp de Suporte* 📲

Pode me mandar um "oi" lá? https://wa.me/5573999883075
```

### `PV2 D-3 — instruções de chegada` ✏️ *anexa o PDF da reserva*
```
{Primeiro nome do lead}, faltam 3 dias! ☀️

Tô te mandando o PDF com tudo da sua reserva: endereço, como funciona o check-in e os contatos daqui.

Dá uma olhada e me fala se ficou alguma dúvida 💙
```

### `PV3 Dia do check-in` ✅
```
Hoje é o dia! 🤩

Check-in a partir das 15h. Quando estiverem chegando em Porto Seguro me avisa aqui que eu já deixo tudo pronto ☀️
```

### `PV4 Meio da estadia` ✅
> Uma mensagem. Pega problema antes de virar avaliação ruim.
```
Oi {Primeiro nome do lead}! Tudo certo por aí? 🏖️

Tá faltando alguma coisa no apê ou precisando de alguma indicação de praia/restaurante? Me chama que eu resolvo.
```

### `PV5 Check-out + avaliação` ✏️ *preenche onde deixar a chave*
```
{Primeiro nome do lead}, foi muito bom receber vocês 💙

Check-out até as 12h — é só deixar as chaves [ONDE COMBINADO].

E me faz um favor? Manda aqui em uma frase o que achou da hospedagem. Ajuda demais a gente ☀️
```

### `PV6 Recompra` ✅
> Dispara meses depois. É a mensagem mais barata de mandar e a que ninguém manda.
```
{Primeiro nome do lead}! Lembrei de vocês aqui ☀️

Tá chegando a época que vocês vieram ano passado. Se estiverem pensando em voltar, me chama antes de todo mundo que eu seguro as melhores datas pra você 💙
```

---

## 9. Regras oficiais — decididas em 05/09/2026

| Assunto | Regra oficial |
|---|---|
| **Desconto** | **5% no pagamento à vista** (Pix) |
| **Mínimo de noites** | **3 diárias** em datas normais · **5 diárias** em feriados |
| **Cancelamento** | As 4 regras do contrato: 72h integral · até 30 dias, retenção de 15% · abaixo de 30 dias, sem reembolso · no-show, sem reembolso |

Já aplicado em `DV4`, `DV5`, `DV6`, `DV7`, `DV9`, `DV10` e `DV15`, e propagado pra base de conhecimento (ver seção 10).

Nota: o `Pacote Mínimo` que estava lá ("no mínimo 5 dias") não estava errado — era a regra de feriado sem o contexto. Por isso separei em dois textos: `DV9` pra data normal e `DV10` pra feriado.

### ⚠️ Ainda em aberto: cartão de crédito

Essa eu não mexi, porque é mudança de política comercial e você não confirmou:

| Onde | O que diz |
|---|---|
| Base de conhecimento e prompts do bot | até **6x com 13%** de acréscimo |
| Template no Datacrazy (`[LOC] Formas de Pagamento`) | até **12x com o juros da máquina** |
| O que a equipe fala nas conversas reais | **12x com o juros da máquina** |

Escrevi os templates com **12x/juros da máquina**, que é o que a equipe pratica e o que já está publicado no Datacrazy. Mas **não alterei os prompts do bot** — hoje o Art responde "6x com 13%" e o humano responde "12x com juros da máquina", pro mesmo lead. Me confirma qual vale que eu alinho os dois.

---

## 10. Arrumar no que já existe

### No Datacrazy

| Ação | Item | Motivo |
|---|---|---|
| 🔴 **Corrigir** | `Não é Golpe` | Corpo está com o placeholder "Crie sua nova mensagem" — vai pro lead assim |
| 🟡 **Mover** | `Reserva Concluída` | Está em Negociação, é Pós-venda |
| 🟡 **Renomear** | `Sondagem_Enviada`, `Pós - João`, `Café da manhã`, `Pacote Mínimo`, `Não é Golpe` | Sem prefixo, quebram a busca |
| 🟡 **Reescrever** | `Sem Disponibilidade`, `Fora do Orçamento` | Encerram a conversa sem oferecer saída |
| 🟡 **Reescrever** | `Sondagem_Enviada` | Esqueleto vazio, obriga o atendente a montar tudo na mão |

### Na base de conhecimento — ✅ já feito em 05/09/2026

As regras oficiais da seção 9 foram propagadas pra **27 arquivos, 104 linhas**:

| Correção | Volume | Onde |
|---|---|---|
| Desconto **10% → 5%** | **21 linhas / 14 arquivos** | `base-conhecimento-art.md`, `faq-reservas.md`, `prompt-unico-reservas.md`, `base-imoveis.md` (3 cópias), `agente-01/03/04/05` (2 cópias cada) |
| Mínimo **3 noites → 3 noites (5 em feriados)** | **83 linhas / 25 arquivos** | os acima + `system-prompt-apresentacao.md` (2 cópias), `catalogo-imoveis.md`, `agente-02`, `### Dúvidas frequentes.txt`, os 3 prompts do ART e as 4 descrições do Varandas de Porto |

Os prompts em `Setor de Locação/` (`PROMPT — ART V2`, `PROMPT_ART_GEMINI`, `prompt_ART_BASE NÃO DEPENADO`) já traziam os 5% corretos — só receberam a regra de feriado.

### 🔴 Achado: pasta duplicada

`CRM/agentes/` e os `agente-0X.md` dentro de `CRM/Atendimento IA/` são **cópias byte a byte** (conferido com `diff`). São 5 arquivos mantidos em dois lugares — toda correção precisa ser feita duas vezes, e é assim que a base desanda.

Fiz a correção nas duas cópias pra não deixar divergência agora, mas vale apagar uma das pastas e deixar só uma fonte. Me fala qual você quer manter que eu faço.

---

## 11. Se for pra fazer só uma coisa

Publique a **Negociação** primeiro — `NG4`, `NG5`, `NG6` e `NG7`.

São 4 mensagens e atacam os 85% de conversas que morrem com a gente falando por último. O resto da biblioteca melhora a experiência; essas quatro mexem em receita.
