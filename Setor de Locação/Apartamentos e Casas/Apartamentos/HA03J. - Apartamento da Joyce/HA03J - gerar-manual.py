# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do HA03J (Apartamento da Joyce).

Coordenada confirmada pelo Mateus em 06/09/2026: -16.402411, -39.046452
(trecho sul da Rua do Telegrafo, proximo ao Toa Toa). Nenhum geocoder resolve
o numero 1833 — a rua tem 6,3 km — entao a posicao foi triangulada por
referencias locais e confirmada por ele.

Fontes:
  HA03J - Descricao_Joyce.txt            -> caracteristicas, endereco, video
  artezian.com.br/pt/apartment/HA03J     -> horarios, regras, enxoval, equipamentos
  HA03J - Operacional.md                 -> fechadura digital, sem portaria
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Apartamentos/HA03J. - Apartamento da Joyce"
FOTOS = os.path.join(BASE, "Fotos")
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/HA03J - Manual do Hospede.html"

NOME = "Apartamento da Joyce"
CODIGO = "HA03J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://share.google/4ymRn0vK1hC5uxdsk"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("1.png", "Piscina e área externa", True),
    ("HA03J-2.png", "Sala de estar com TV", False),
    ("HA03J-1.png", "Cozinha completa", False),
    ("9.png", "Suíte com cama de casal", False),
    ("10.png", "Quarto com duas camas de solteiro", False),
    ("12.png", "Um dos quatro banheiros", False),
    ("8.png", "Churrasqueira privativa", False),
]

qr_svg = segno.make(MAPS, error="m").svg_inline(scale=4, border=2, dark="#264653")

fotos_html, total = [], 0
for nome, leg, larga in SELECAO:
    uri, tam = datauri(nome)
    total += tam
    cls = "foto foto-larga" if larga else "foto"
    fotos_html.append(
        '<figure class="%s"><img src="%s" alt="%s"><figcaption>%s</figcaption></figure>' % (cls, uri, leg, leg))
GALERIA = "\n      ".join(fotos_html)


NL = chr(10)


def lugar(nome, dist, desc):
    return (NL.join([
        '      <div class="lugar">',
        '        <div class="lugar-topo"><span class="lugar-nome">' + nome + '</span>'
        '<span class="lugar-dist">' + dist + '</span></div>',
        '        <div class="lugar-desc">' + desc + '</div>',
        '      </div>']))


def grupo(titulo, itens):
    return (NL.join([
        '    <div class="grupo-lugares">',
        '      <h3>' + titulo + '</h3>',
        '      <div class="lugares">',
        NL.join(itens),
        '      </div>',
        '    </div>']))


CAPA = '''<header class="capa">
    <div class="capa-tag">Manual do hóspede</div>
    <h1 class="capa-titulo">%s</h1>
    <div class="capa-sub">Flat 3 suítes, 4 banheiros · até 8 pessoas · Taperapuã, Porto Seguro</div>
    <div class="capa-codigo">%s</div>
    <div class="capa-marca">
      <div class="capa-marca-nome">Artezian</div>
      <div class="capa-marca-sub">Real Estate Atelie</div>
    </div>
  </header>''' % (NOME, CODIGO)

S01 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">01</span> Sua reserva</h2>
    <div class="destaque-duplo">
      <div class="destaque"><div class="destaque-l">Check-in</div><div class="destaque-v">das 15h às 22h</div></div>
      <div class="destaque"><div class="destaque-l">Check-out</div><div class="destaque-v">até as 12h</div></div>
    </div>
    <table class="tab">
      <tr><th>Endereço</th><td>Rua do Telégrafo, 1833 — Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Unidade</th><td><span class="ph">confirmar número</span></td></tr>
      <tr><th>Capacidade</th><td>Até 8 pessoas — 3 suítes e 4 banheiros, mais sofá-cama na sala</td></tr>
      <tr><th>Camas</th><td>2 de casal e 4 de solteiro</td></tr>
      <tr><th>Garagem</th><td>2 vagas</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 5 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
    <div class="aviso"><strong>Este imóvel não tem portaria.</strong> A entrada é por fechadura digital e o plantão da Artezian é o seu contato para tudo — chegada, dúvida, problema. Salve o número antes de viajar.</div>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">Rua do Telégrafo, 1833 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: o Tôa Tôa fica a 4 minutos a pé. A Praia de Taperapuã, a 5 minutos.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 12 minutos de carro</li>
          <li><strong>Do centro de Porto Seguro:</strong> cerca de 12 minutos de carro</li>
          <li><strong>Da Praia de Taperapuã:</strong> 5 minutos a pé</li>
          <li>Como não há portaria, vá direto ao apartamento — ninguém precisa liberar sua entrada.</li>
          <li>Se vier de táxi ou aplicativo, confira o número na fachada antes de dispensar o carro.</li>
        </ul>
      </div>
      <a class="qr" href="%s">%s<div class="qr-cap">Toque ou escaneie</div></a>
    </div>
  </section>''' % (MAPS, qr_svg)

S03 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
    <ol class="passos">
      <li><strong>Chegue entre 15h e 22h.</strong> Antes das 15h a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir. Se o voo atrasar e você for chegar depois das 22h, avise o plantão.</li>
      <li><strong>Estacione na garagem.</strong> O apartamento tem 2 vagas.</li>
      <li><strong>Abra a porta na fechadura digital.</strong> Digite a senha abaixo e confirme. Não há chave física nem portaria — você entra sozinho, na hora que chegar.</li>
      <li><strong>Confira se a porta trancou</strong> ao sair pela primeira vez. A fechadura tranca sozinha, mas vale a conferida na primeira vez.</li>
    </ol>
    <div class="senha"><span class="senha-l">Senha da fechadura</span><span class="senha-v"><span class="ph">preencher</span></span></div>
    <div class="aviso">Se a fechadura não abrir, não force e não fique tentando no escuro — chame o plantão da Artezian no WhatsApp <strong>%s</strong>. Como não há porteiro no local, somos nós que resolvemos, e resolvemos rápido.</div>
  </section>''' % WPP_FMT

S04 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">04</span> O imóvel</h2>
    <div class="galeria">
      %s
    </div>
  </section>''' % GALERIA

S05 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">05</span> O que tem aqui</h2>
    <div class="col2">
      <div class="col-tem">
        <h3 class="col-h">Está no imóvel</h3>
        <div class="grupo"><h4>Quartos</h4><ul class="lista-check">
          <li>3 suítes, todas com ar-condicionado</li>
          <li>Uma delas no térreo, no nível da entrada</li>
          <li>2 camas de casal e 4 de solteiro</li>
          <li>Sofá-cama na sala</li>
          <li>Ventiladores de teto</li>
          <li>Roupa de cama e toalhas <span class="ph">confirmar</span></li>
        </ul></div>
        <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">
          <li>Cozinha completa — fogão, forno, micro-ondas e geladeira</li>
          <li>Mesa de jantar</li>
        </ul></div>
        <div class="grupo"><h4>Banheiros e lavanderia</h4><ul class="lista-check">
          <li>4 banheiros</li>
          <li>Água quente</li>
          <li>Máquina de lavar, com varal</li>
        </ul></div>
        <div class="grupo"><h4>Área externa</h4><ul class="lista-check">
          <li>Piscina</li>
          <li>Churrasqueira privativa</li>
          <li>Chuveiro externo — bom para tirar a areia antes de entrar</li>
        </ul></div>
      </div>
      <div class="col-levar">
        <h3 class="col-h">Leve você</h3>
        <ul class="lista-levar">
          <li>Toalha de praia</li>
          <li>Itens de higiene pessoal</li>
          <li>Berço, se precisar — não há no imóvel</li>
        </ul>
      </div>
    </div>
  </section>'''

S06 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Rede</div><div class="wifi-v"><span class="ph">preencher</span></div></div>
      <div class="wifi-item"><div class="wifi-l">Senha</div><div class="wifi-v"><span class="ph">preencher</span></div></div>
    </div>
    <ul class="lista">
      <li>A TV é smart — dá para entrar nas suas contas de streaming. Lembre de sair delas antes do check-out.</li>
    </ul>
    <div class="aviso"><strong>Confira a voltagem antes de ligar aparelhos trazidos de casa</strong> <span class="ph">confirmar se é 220V</span>. Secador de cabelo e chapinha são os que queimam. Carregador de celular e notebook costumam ser bivolt, mas vale conferir na etiqueta.</div>
  </section>'''

S10 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">10</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li>Silêncio das 22h às 6h.</li>
      <li>Não é permitido fumar dentro do imóvel.</li>
      <li>Festas e eventos não são permitidos.</li>
      <li><strong>Pets não são aceitos neste imóvel.</strong></li>
      <li>Crianças de 2 a 12 anos e bebês são bem-vindos — mas não há berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li>Não há chave para devolver — só feche a porta e confira que a fechadura trancou</li>
      <li>Feche as janelas e desligue os ares-condicionados</li>
      <li>Saia das suas contas de streaming na TV</li>
      <li>Confira gavetas, tomadas e o varal — roupa esquecida no varal é o campeão aqui</li>
      <li>Avise o plantão que você já saiu</li>
    </ul>
  </section>'''

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a> — seu único contato no local</td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Taperapuan — 3 min de carro</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — 14 min de carro</td></tr>
      <tr><th>Policlínica Municipal</th><td>11 min de carro</td></tr>
      <tr><th>Delegacia de Proteção ao Turista</th><td>13 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas — 11 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 7 min a pé</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — 11 min de carro</td></tr>
    </table>
    <div class="fecho">
      <p class="fecho-t">Boa estadia.</p>
      <p class="fecho-s">Se faltar qualquer coisa, chama a gente antes de resolver por conta.<br>É pra isso que a gente está aqui.</p>
    </div>
  </section>''' % (WPP_LINK, WPP_FMT)

S07 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">07</span> Mercado e farmácia</h2>
    <div class="aviso"><strong>Aqui não há mercado nem farmácia que dê para ir a pé.</strong> O mais próximo fica a 3 minutos de carro. Se você não alugou carro, vale fazer a compra da chegada no caminho do aeroporto — ou pedir por aplicativo de entrega, que atende a região.</div>
    <div class="lugares">
%s
    </div>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Onde comer e beber</h2>
%s
%s
  </section>'''

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>'''

S07 = S07 % "\n".join([
    lugar("Posto Mundaí", "7 min a pé", "Posto de combustível aberto 24h. A loja de conveniência resolve o esquecido de madrugada — água, gelo, café."),
    lugar("Haddasa e Frossad", "3 min de carro", "O supermercado mais próximo. A pé dá uns 15 minutos."),
    lugar("Farmácia Taperapuan", "3 min de carro", "A farmácia da faixa da praia."),
    lugar("Litoral Supermercado", "4 min de carro", "Alternativa, um pouco maior."),
    lugar("BigStop", "5 min de carro", "O maior do entorno, para a compra da semana. Todo dia, das 8h às 22h."),
])

S08 = S08 % (
    grupo("Pé na areia", [
        lugar("Tôa Tôa", "4 min a pé", "O beach club mais famoso de Porto Seguro fica logo ali. Axé ao vivo durante o dia e luau nas sextas, das 21h às 3h. É o vizinho deste apartamento."),
        lugar("Cabana Malibu", "6 min a pé", "Clima mais familiar e tranquilo, cardápio de frutos do mar."),
        lugar("Restaurante Estrela do Mar", "8 min a pé", "Na mesma faixa da orla, seguindo a pé."),
    ]),
    grupo("Vale pegar o carro", [
        lugar("Axé Moi", "3 min de carro", "Complexo de praia com dois palcos e programação das 10h às 17h30."),
        lugar("Colher de Pau", "3 min de carro", "Comida baiana na areia — moqueca, carne de sol, peixe. Música ao vivo à noite."),
        lugar("Cabana Jubarte", "6 min de carro", "Barraca tradicional, mais adiante na orla."),
        lugar("Barramares", "7 min de carro", "Estrutura grande de praia, com programação de shows."),
    ]),
)

S09 = S09 % "\n".join([
    lugar("Praia de Taperapuã", "5 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa."),
    lugar("Reserva Pataxó da Jaqueira", "8 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Centro Histórico", "12 min de carro", "Marco do Descobrimento, museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "12 min de carro", "Vida noturna, artesanato e barracas de drink. Abre no fim da tarde."),
    lugar("Praia do Mutá", "20 min de carro", "Águas rasas e quentes, piscinas naturais na maré baixa. Boa com crianças pequenas."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

SECOES = "\n\n  ".join([S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11])

html = io.open(SCAFFOLD, encoding="utf-8").read()
html = (html.replace("{{NOME_UNIDADE}}", NOME)
            .replace("{{CODIGO}}", CODIGO)
            .replace("{{WHATSAPP_FMT}}", WPP_FMT))
html = html.replace("  <!-- {{CAPA}} -->\n  <!-- {{SECOES}} -->", "  " + CAPA + "\n\n  " + SECOES)
io.open(SAIDA, "w", encoding="utf-8").write(html)

print("gerado:", SAIDA)
print("fotos: %d | peso das fotos: %.1f MB | arquivo final: %.1f MB"
      % (len(SELECAO), total / 1048576, os.path.getsize(SAIDA) / 1048576))
print("11 secoes — regiao incluida (coordenada confirmada em 06/09/2026)")
