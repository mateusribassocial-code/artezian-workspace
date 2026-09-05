---
name: manual-hospede
description: Gera o manual do hóspede pós-reserva em HTML que imprime como PDF A4 — fotos do imóvel, como chegar, passo a passo do check-in, equipamentos, Wi-Fi, mercados, restaurantes e bares próximos, regras da casa e check-out. Use quando o usuário pedir "manual do hóspede", "PDF pós-reserva", "guia da hospedagem", "boas-vindas do hóspede", "manual da casa", "welcome book", "o que mandar depois que o hóspede reserva", ou citar uma unidade e pedir o material de recepção. Diferente da apresentacao-comercial, que vende o imóvel pro proprietário — esta recebe o hóspede depois que a reserva já foi paga.
---

# Manual do Hóspede

Gera um documento único, auto-contido, que o hóspede lê no celular e a Artezian manda no WhatsApp como PDF. Ele resolve as dúvidas de chegada sem ninguém precisar responder no atendimento.

**Não é peça de venda.** A reserva já foi paga. Aqui não entra preço, argumento de venda, nem prova social. Entra informação operacional que o hóspede precisa entre reservar e fazer check-out.

## Quando usar

- "monta o manual do hóspede do [imóvel]"
- "faz o PDF pós-reserva do FL10J"
- "guia da hospedagem pro apartamento do Reinaldo"
- "o que a gente manda depois que o hóspede fecha?"

## Quando NÃO usar

- Vender o imóvel pro proprietário → `apresentacao-comercial`
- Anúncio ou copy pra atrair hóspede → skill de conteúdo
- Contrato de locação → não é skill, é jurídico

---

## Formato

**A4 retrato, fluido na tela e paginado na impressão.** Na tela do celular o documento rola normalmente e o texto reflui. No `Ctrl+P → Salvar como PDF` ele vira A4 retrato com quebras controladas.

Isso resolve os dois usos ao mesmo tempo: o hóspede abre o link e lê rolando, ou recebe o PDF no WhatsApp e lê offline. Nunca gerar 16:9 aqui — paisagem no celular obriga zoom e é o oposto do que um manual precisa.

Detalhes do scaffold em `assets/base-a4.html`.

---

## Fase 0 — Carregar contexto

**Sistema visual:** `Marca/design-guide.md`. Se não existir, cair no neutro descrito em `references/secoes.md`.

**Dados da região:** `Setor de Locação/vizinhanca-imoveis.md` — restaurantes, beach clubs, passeios e distâncias por região. A unidade é mapeada pra uma região (Taperapuã, Arraial d'Ajuda, Coroa Vermelha) e herda o bloco daquela região.

**Regras gerais da operação:** `Setor de Locação/### Dúvidas frequentes.txt` — check-in 15h, checkout 12h, Wi-Fi e ar em todos, política de pet, mínimo de noites.

**Dados da unidade:** `Setor de Locação/Apartamentos e Casas/**/[CÓDIGO] - Descricao_*.txt` e a pasta `Fotos/` ao lado.

Não anunciar o que foi lido. Usar.

---

## Fase 1 — Completar os dados da unidade

O repo cobre o imóvel e a região. Ele **não** cobre o operacional, e sem isso o manual não serve.

Antes de gerar, rodar o checklist de `references/dados-unidade.md` e pedir ao usuário **só o que estiver faltando**, numa mensagem só. Nunca inventar: senha de Wi-Fi, número de vaga, procedimento de chave, telefone de suporte e regra de condomínio errados geram chamado no plantão e hóspede irritado na portaria.

Se o usuário responder "deixa em branco por enquanto", marcar com a classe `.ph` (campo tracejado dourado) pra ninguém enviar o PDF sem perceber que falta preencher.

Salvar o que ele responder em `Setor de Locação/Apartamentos e Casas/**/[CÓDIGO] - Operacional.md`, pra próxima geração dessa unidade já vir completa.

---

## Fase 2 — Montar o documento

Seguir a ordem das 13 seções de `references/secoes.md`. A ordem existe por um motivo: o hóspede lê o documento duas vezes, e as duas leituras precisam funcionar.

- **Na reserva** ele lê inteiro, animado, querendo ver foto e saber o que tem por perto.
- **No dia da chegada**, com o carro parado na portaria e a família cansada, ele abre e precisa achar check-in e endereço em dois segundos.

Por isso chegada vem antes de fotos, e mercado vem antes de restaurante.

Seções sem dado real são **removidas**, nunca preenchidas com texto genérico. Um manual com 9 seções verdadeiras vale mais que um com 13 e quatro inventadas.

Salvar em `Setor de Locação/Apartamentos e Casas/**/[CÓDIGO] - Manual do Hospede.html`, ao lado das fotos da unidade.

---

## Fotos

As fotos ficam em `Fotos/` dentro da pasta da unidade. Embutir como `data:` URI em base64 pra manter o arquivo único e funcionando offline.

- Redimensionar para no máximo 1200px de largura antes de embutir
- 6 a 10 fotos é o suficiente; galeria de 14 vira peso morto
- Primeira foto = a que vende a chegada (sala, varanda ou vista), não o banheiro
- Se o total passar de 8 MB, reduzir a qualidade antes de cortar fotos

---

## Tom

Linha 1 do `_contexto/preferencias.md`, calibrada pra recepção: direta e acolhedora, sem venda. O hóspede já comprou.

- Frases curtas. Ele está lendo no celular, muitas vezes dirigindo ou com criança no colo.
- Instrução na ordem em que acontece, com o horário junto
- Sem superlativo ("incrível", "paradisíaco", "inesquecível") — descrever o que tem
- Emoji só como marcador de seção, nunca no meio da frase
- Tratar por "você"

Vale a mesma lista de antipadrões da `apresentacao-comercial` (nada de "não é X, é Y", regra de três oca, chavão de palco, pergunta retórica).

---

## Regras

1. **Nunca inventar dado operacional.** Wi-Fi, chave, vaga, telefone e horário de piscina ou vêm do usuário ou ficam marcados como pendência.
2. **Check-in e endereço na primeira página.** É o que ele procura sob pressão.
3. **O que NÃO tem é tão importante quanto o que tem.** Hóspede que descobre na hora que não tem secador ou papel higiênico abre chamado. Listar as ausências.
4. **Distância em minutos a pé ou de carro**, não em metros. "4 min a pé" é útil, "320m" não.
5. **Toda seção da região precisa de âncora na unidade.** "A 8 min de carro daqui", não "em Porto Seguro".
6. **Quebra de página controlada.** Nenhum card, tabela ou passo de check-in pode partir ao meio no PDF. Usar `break-inside: avoid`.
7. **Contato de emergência no rodapé de toda página** na versão impressa.
8. **Sem preço em lugar nenhum.** A reserva já foi paga; valor no manual gera dúvida e reabre negociação.

---

## Referências

- `references/secoes.md` — as 13 seções, o que entra em cada uma e o HTML de cada bloco
- `references/dados-unidade.md` — checklist do que coletar por unidade + template pra salvar
- `assets/base-a4.html` — scaffold do documento, com as regras de impressão A4
