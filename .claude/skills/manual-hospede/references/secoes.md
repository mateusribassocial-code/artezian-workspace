# As 13 seções

Ordem fixa. Seção sem dado real é removida, nunca preenchida com texto genérico.

Os blocos abaixo mostram só o HTML do conteúdo. As classes vêm do `assets/base-a4.html`.

---

## Por que essa ordem

O hóspede lê o documento duas vezes:

1. **Quando reserva** — animado, quer ver foto e saber o que tem por perto. Lê inteiro.
2. **No dia da chegada** — carro na portaria, família cansada, sinal ruim. Precisa achar check-in e endereço em dois segundos.

A segunda leitura é a que dá errado se a ordem estiver errada. Por isso chegada vem antes de foto, e mercado vem antes de restaurante: chegando às 15h com criança, a primeira necessidade é água e café da manhã, não jantar.

---

## BLOCO 1 — Chegada

### 1. Capa

Nome e código da unidade, o que é, e a confirmação. Sem foto de fundo: a capa precisa imprimir bem em preto e branco na portaria.

```html
<header class="capa">
  <div class="capa-tag">Manual do hóspede</div>
  <h1 class="capa-titulo">{{NOME_UNIDADE}}</h1>
  <div class="capa-sub">{{TIPO}} · {{BAIRRO}}, {{CIDADE}}</div>
  <div class="capa-codigo">{{CODIGO}}</div>
  <div class="capa-marca">
    <div class="capa-marca-nome">Artezian</div>
    <div class="capa-marca-sub">Real Estate Atelie</div>
  </div>
</header>
```

### 2. Sua reserva

A tabela que ele consulta sob pressão. Fica na primeira página, sempre.

Check-in e check-out em destaque. Endereço completo. WhatsApp de plantão clicável (`https://wa.me/55...`).

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">01</span> Sua reserva</h2>
  <div class="destaque-duplo">
    <div class="destaque"><div class="destaque-l">Check-in</div><div class="destaque-v">a partir das 15h</div></div>
    <div class="destaque"><div class="destaque-l">Check-out</div><div class="destaque-v">até as 12h</div></div>
  </div>
  <table class="tab">
    <tr><th>Endereço</th><td>{{ENDERECO}}</td></tr>
    <tr><th>Unidade</th><td>{{ANDAR_UNIDADE}}</td></tr>
    <tr><th>Capacidade</th><td>{{CAPACIDADE}}</td></tr>
    <tr><th>Vaga de garagem</th><td>{{VAGA}}</td></tr>
    <tr><th>Plantão Artezian</th><td><a href="https://wa.me/55{{WHATSAPP}}">{{WHATSAPP_FMT}}</a></td></tr>
  </table>
</section>
```

### 3. Como chegar

Endereço, ponto de referência que o taxista conhece, e QR code do Google Maps (SVG inline, sem biblioteca — precisa funcionar no papel).

Incluir a vinda do aeroporto: é o trajeto real da maioria.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
  <div class="mapa-linha">
    <div class="mapa-txt">
      <p class="end">{{ENDERECO_COMPLETO}}</p>
      <p class="ref">Referência: {{PONTO_DE_REFERENCIA}}</p>
      <ul class="lista">
        <li><strong>Do aeroporto:</strong> {{TEMPO_AEROPORTO}}</li>
        <li><strong>Do centro histórico:</strong> {{TEMPO_CENTRO}}</li>
      </ul>
    </div>
    <div class="qr">{{QR_SVG}}<div class="qr-cap">Abrir no Maps</div></div>
  </div>
</section>
```

### 4. Check-in passo a passo

Passos numerados, na ordem em que acontecem. Cada passo diz **o que fazer** e **com quem**.

Se houver senha de cofre ou fechadura, ela vai aqui, em `.senha`.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
  <ol class="passos">
    <li><strong>Chegue a partir das 15h.</strong> {{OBS_ANTECIPACAO}}</li>
    <li><strong>Na portaria</strong>, informe o nome {{NOME_PORTARIA}} e apresente um documento com foto.</li>
    <li><strong>Estacione na vaga {{VAGA}}.</strong></li>
    <li><strong>Retirada da chave:</strong> {{PROCEDIMENTO_CHAVE}}</li>
  </ol>
  <div class="senha"><span class="senha-l">Senha da fechadura</span><span class="senha-v">{{SENHA}}</span></div>
  <div class="aviso">Qualquer coisa fora do previsto, chame o plantão: {{WHATSAPP_FMT}}. Respondemos das 8h às 22h, e em emergência a qualquer hora.</div>
</section>
```

---

## BLOCO 2 — A hospedagem

### 5. O imóvel

6 a 10 fotos. A primeira é a que vende a chegada (sala, varanda ou vista), nunca o banheiro. Legenda curta em cada uma dizendo qual ambiente é.

```html
<section class="sec quebra-antes">
  <h2 class="sec-h"><span class="sec-n">04</span> O imóvel</h2>
  <div class="galeria">
    <figure class="foto foto-larga"><img src="{{DATA_URI}}" alt="{{ALT}}"><figcaption>{{LEGENDA}}</figcaption></figure>
    <figure class="foto"><img src="{{DATA_URI}}" alt="{{ALT}}"><figcaption>{{LEGENDA}}</figcaption></figure>
  </div>
</section>
```

### 6. O que tem aqui

Duas colunas: **tem** e **precisa levar**.

A coluna da direita é a que evita chamado. Hóspede que descobre na hora que não tem secador ou papel higiênico liga reclamando. Se a lista de ausências estiver vazia porque ninguém levantou, marcar como pendência em vez de omitir.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">05</span> O que tem aqui</h2>
  <div class="col2">
    <div class="col-tem">
      <h3 class="col-h">Está no imóvel</h3>
      <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">{{ITENS}}</ul></div>
      <div class="grupo"><h4>Quartos</h4><ul class="lista-check">{{ITENS}}</ul></div>
      <div class="grupo"><h4>Banheiros</h4><ul class="lista-check">{{ITENS}}</ul></div>
      <div class="grupo"><h4>Área externa</h4><ul class="lista-check">{{ITENS}}</ul></div>
    </div>
    <div class="col-levar">
      <h3 class="col-h">Leve você</h3>
      <ul class="lista-levar">{{ITENS}}</ul>
    </div>
  </div>
</section>
```

### 7. Wi-Fi e eletrônicos

Wi-Fi em destaque grande: é a primeira coisa que perguntam ao entrar.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
  <div class="wifi">
    <div class="wifi-item"><div class="wifi-l">Rede</div><div class="wifi-v">{{REDE}}</div></div>
    <div class="wifi-item"><div class="wifi-l">Senha</div><div class="wifi-v">{{SENHA_WIFI}}</div></div>
  </div>
  <ul class="lista">{{INSTRUCOES_TV_AR}}</ul>
</section>
```

### 8. Área de lazer

O que o condomínio oferece, com **horário**. Piscina sem horário gera hóspede barrado às 22h.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">07</span> Área de lazer</h2>
  <table class="tab">
    <tr><th>Piscina</th><td>{{HORARIO_PISCINA}}</td></tr>
    <tr><th>Sauna</th><td>{{HORARIO_SAUNA}}</td></tr>
    <tr><th>Churrasqueira</th><td>{{REGRA_CHURRASQUEIRA}}</td></tr>
    <tr><th>Portaria</th><td>{{PORTARIA}}</td></tr>
  </table>
</section>
```

---

## BLOCO 3 — A região

Regra das três seções: **distância em tempo, e sempre ancorada na unidade.** "6 min de carro daqui", nunca "em Porto Seguro" nem "320m".

### 9. Mercados e farmácias

Primeira das três. Chegando às 15h com família, é a primeira saída.

Vem do bloco da região em `vizinhanca-imoveis.md`. Se a região ainda não tiver esses dados, levantar e gravar lá (ver `dados-unidade.md`, Bloco C).

### 10. Onde comer e beber

Restaurantes, bares e beach clubs do bloco da região. Máximo 8 — lista longa não é usada.

Agrupar por ocasião, que é como o hóspede decide: **pé na areia**, **jantar em família**, **noite**.

### 11. O que fazer

Praias e passeios da região, com tempo de deslocamento. Máximo 6.

Todas as três usam o mesmo bloco:

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">{{N}}</span> {{TITULO}}</h2>
  <div class="lugares">
    <div class="lugar">
      <div class="lugar-topo"><span class="lugar-nome">{{NOME}}</span><span class="lugar-dist">{{TEMPO}}</span></div>
      <div class="lugar-desc">{{DESCRICAO}}</div>
    </div>
  </div>
</section>
```

---

## BLOCO 4 — Saída

### 12. Regras da casa e check-out

Regras primeiro (curtas, sem tom de aviso de condomínio), depois o checklist de saída.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa</h2>
  <ul class="lista">{{REGRAS}}</ul>
  <h3 class="sub-h">Antes de sair, até as 12h</h3>
  <ul class="lista-check">{{CHECKLIST_SAIDA}}</ul>
</section>
```

### 13. Contatos

Plantão da Artezian, portaria, e emergências (190 polícia, 192 Samu, 193 bombeiros). Fecha com o pedido de avaliação.

```html
<section class="sec">
  <h2 class="sec-h"><span class="sec-n">12</span> Contatos</h2>
  <table class="tab">
    <tr><th>Plantão Artezian</th><td><a href="https://wa.me/55{{WHATSAPP}}">{{WHATSAPP_FMT}}</a></td></tr>
    <tr><th>Portaria</th><td>{{PORTARIA_TEL}}</td></tr>
    <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
  </table>
  <div class="fecho">
    <p class="fecho-t">Boa estadia.</p>
    <p class="fecho-s">Se faltar qualquer coisa, chama a gente antes de resolver por conta.<br>É pra isso que a gente está aqui.</p>
  </div>
</section>
```

---

## Sistema visual

Vem do `Marca/design-guide.md`. Na Artezian:

| Token | Valor | Onde |
|---|---|---|
| `--ouro` | `#c2a14e` | número da seção, destaques, filete |
| `--petroleo` | `#264653` | capa, faixas de destaque, cabeçalho de tabela |
| `--texto` | `#2a2a2a` | corpo |
| `--fundo` | `#ffffff` | base |
| `--creme` | `#f9f8f5` | cards e faixas |

Fundo escuro só na capa e nas faixas de destaque. O corpo é claro: o hóspede imprime, e petróleo em página inteira gasta tinta e fica ilegível em impressora doméstica.

Fallback sem `design-guide.md`: `--ouro: #8a7040`, `--petroleo: #333333`, resto igual.
