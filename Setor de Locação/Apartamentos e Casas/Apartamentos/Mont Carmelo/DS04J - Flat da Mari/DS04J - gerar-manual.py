# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do DS04J (Flat da Mari) — Residencial Mont Carmelo.

Herda do condominio (ver Residencial Mont Carmelo - Condominio.md):
  coordenada -16.3951469,-39.0439872 | distancias medidas por OSM
  regras e area de lazer iguais as do FL10J | chave na portaria | 220V

Fontes:
  DS04J - Base_Conhecimento_Mari.txt       -> capacidade, camas, video
  artezian.com.br/pt/apartment/DS04J       -> horarios, regras, enxoval, equipamentos
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Apartamentos/Mont Carmelo/DS04J - Flat da Mari"
FOTOS = os.path.join(BASE, "Fotos_Mari")
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/DS04J - Manual do Hospede.html"

NOME = "Flat da Mari"
CODIGO = "DS04J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://maps.app.goo.gl/wLqA4YoLh6ZVHu7R6"
WIFI_REDE = "APTO 6"
WIFI_SENHA = "portoseguro"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("IMG_6404.JPG.jpeg", "Sala com TV, bancada e mesa de jantar", True),
    ("IMG_6406.JPG.jpeg", "Escada interna para o andar de cima", False),
    ("IMG_6398.JPG.jpeg", "Cama king size", False),
    ("IMG_6391.JPG.jpeg", "As duas camas de solteiro", False),
    ("IMG_6403.JPG.jpeg", "Cozinha equipada", False),
    ("IMG_6414.JPG.jpeg", "Sofá-cama na sala", False),
    ("IMG_6385.JPG.jpeg", "Área externa privativa", False),
    ("IMG_6395.JPG.jpeg", "Um dos dois banheiros", False),
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
    <div class="capa-sub">Flat · até 5 pessoas · Taperapuã, Porto Seguro</div>
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
      <tr><th>Endereço</th><td>Rua do Telégrafo, 1800 — Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Condomínio</th><td>Residencial Mont Carmelo</td></tr>
      <tr><th>Unidade</th><td>Apto 06</td></tr>
      <tr><th>Capacidade</th><td>Até 5 pessoas — 2 banheiros</td></tr>
      <tr><th>Camas</th><td>1 suíte com 1 king size e 2 de solteiro, mais sofá-cama na sala</td></tr>
      <tr><th>Garagem</th><td>1 vaga</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 6 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">Rua do Telégrafo, 1800 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: Residencial Mont Carmelo. O Axé Moi fica a 6 minutos a pé.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 14 minutos de carro</li>
          <li><strong>Do Centro Histórico:</strong> cerca de 15 minutos de carro</li>
          <li><strong>Da Praia de Taperapuã:</strong> 6 minutos a pé</li>
        </ul>
        <p class="ref">Se vier de táxi ou aplicativo, peça para o motorista ir até a portaria — ela funciona 24 horas.</p>
      </div>
      <a class="qr" href="%s">%s<div class="qr-cap">Toque ou escaneie</div></a>
    </div>
  </section>''' % (MAPS, qr_svg)

S03 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
    <ol class="passos">
      <li><strong>Chegue entre 15h e 22h.</strong> Antes das 15h a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir. Se o voo atrasar e você for chegar depois das 22h, avise o plantão.</li>
      <li><strong>Pare na portaria e informe o nome do responsável pela reserva.</strong> Seu nome já está na lista.</li>
      <li><strong>Apresente um documento com foto.</strong> RG, CNH ou passaporte.</li>
      <li><strong>Retire a chave na portaria.</strong></li>
      <li><strong>Estacione na vaga e siga para o Apto 06.</strong> É uma vaga por unidade. Se vierem dois carros, há estacionamento na rua.</li>
    </ol>
    <div class="aviso">A entrada do flat é <strong>no térreo, sem degraus</strong>. Lá dentro há uma escada interna que leva ao andar de cima. Qualquer coisa fora do previsto, chame o plantão da Artezian no WhatsApp <strong>%s</strong>.</div>
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
        <h3 class="col-h">Está no flat</h3>
        <div class="grupo"><h4>Dormir</h4><ul class="lista-check">
          <li>Uma suíte, com 1 cama king size e 2 de solteiro</li>
          <li>Sofá-cama na sala, para a quinta pessoa</li>
          <li>Ar-condicionado e ventiladores de teto</li>
          <li>Roupa de cama, cobertores, travesseiros e toalhas inclusos</li>
        </ul></div>
        <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">
          <li>Cozinha conjugada e equipada</li>
          <li>Fogão, geladeira e micro-ondas</li>
          <li>Panela de arroz, torradeira e liquidificador</li>
          <li>Utensílios básicos</li>
        </ul></div>
        <div class="grupo"><h4>Banheiros e área externa</h4><ul class="lista-check">
          <li>2 banheiros, com água quente</li>
          <li>Área externa privativa, com espreguiçadeiras</li>
        </ul></div>
      </div>
      <div class="col-levar">
        <h3 class="col-h">Leve você</h3>
        <ul class="lista-levar">
          <li>Toalha de praia</li>
          <li>Itens de higiene pessoal</li>
          <li>Berço, se precisar — o condomínio não tem</li>
        </ul>
      </div>
    </div>
    <div class="aviso"><strong>As quatro camas ficam na mesma suíte</strong> — a king e as duas de solteiro dividem o quarto. Só o sofá-cama fica separado, na sala. Vale saber disso antes de chegar, principalmente se o grupo não for da mesma família.<br><br>O flat também é de dois andares, com escada interna. A entrada é sem degraus, mas parte dos cômodos fica em cima — se alguém tem dificuldade com escada, combinem antes.</div>
  </section>'''

S06 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Rede</div><div class="wifi-v">%s</div></div>
      <div class="wifi-item"><div class="wifi-l">Senha</div><div class="wifi-v">%s</div></div>
    </div>
    <ul class="lista">
      <li>Se não achar a rede na lista, confira com a portaria.</li>
    </ul>
    <div class="aviso"><strong>As tomadas são 220V.</strong> Se você vem de Minas Gerais, do Espírito Santo ou de qualquer lugar onde a rede é 127V, confira a voltagem antes de ligar secador de cabelo, chapinha ou qualquer aparelho trazido de casa. Carregador de celular e notebook costumam ser bivolt, mas vale conferir na etiqueta.</div>
  </section>''' % (WIFI_REDE, WIFI_SENHA)

S07 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">07</span> Área de lazer e serviços</h2>
    <table class="tab">
      <tr><th>Piscina</th><td>Das 9h às 22h — piscina adulto e infantil</td></tr>
      <tr><th>Churrasqueira</th><td>Precisa ser agendada. Fale com a portaria com antecedência.</td></tr>
      <tr><th>Sauna</th><td>Disponível no condomínio</td></tr>
      <tr><th>Restaurante</th><td>O condomínio tem restaurante próprio</td></tr>
      <tr><th>Guarda-volumes</th><td>O condomínio guarda a bagagem — útil no dia do check-out, se o voo for à noite</td></tr>
      <tr><th>Aluguel de carro</th><td>Disponível pelo condomínio</td></tr>
      <tr><th>Portaria</th><td>24 horas</td></tr>
    </table>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Mercado e farmácia</h2>
    <p class="ref">Aqui está a vantagem deste endereço: dá para resolver tudo a pé, sem pegar o carro.</p>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Haddasa e Frossad", "4 min a pé", "O supermercado mais perto. Resolve a compra da chegada — água, café, pão."),
    lugar("Farmácia Taperapuan", "5 min a pé", "A farmácia da faixa da praia."),
    lugar("Litoral Supermercado", "13 min a pé", "Maior, para a compra da semana. De carro dá 3 minutos."),
    lugar("Posto Mundaí", "3 min de carro", "Posto de combustível aberto 24h."),
    lugar("BigStop", "4 min de carro", "O maior do entorno. Todo dia, das 8h às 22h."),
])

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> Onde comer e beber</h2>
%s
%s
  </section>''' % (
    grupo("A pé", [
        lugar("Restaurante Estrela do Mar", "6 min a pé", "Na faixa da orla, seguindo a pé."),
        lugar("Axé Moi", "6 min a pé", "Complexo de praia com dois palcos e programação das 10h às 17h30."),
        lugar("Esquina Jones", "6 min a pé", "Pizzaria. Boa saída para a primeira noite, quando ninguém quer cozinhar."),
        lugar("Restaurante Marília", "7 min a pé", "Refeição rápida, sem sair do bairro."),
        lugar("Cabana Malibu", "9 min a pé", "Clima familiar e tranquilo, cardápio de frutos do mar."),
        lugar("Colher de Pau", "9 min a pé", "Comida baiana na areia — moqueca, carne de sol, peixe. Música ao vivo à noite."),
    ]),
    grupo("Noite", [
        lugar("Tôa Tôa", "14 min a pé", "O beach club mais famoso de Porto Seguro. Axé ao vivo e luau nas sextas, das 21h às 3h. De carro são 3 minutos."),
        lugar("Barramares", "5 min de carro", "Estrutura grande de praia, com programação de shows."),
    ]),
)

S10 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">10</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Praia de Taperapuã", "6 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa."),
    lugar("Reserva Pataxó da Jaqueira", "6 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Centro Histórico", "15 min de carro", "Marco do Descobrimento, museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "15 min de carro", "Vida noturna, artesanato e barracas de drink. Abre no fim da tarde."),
    lugar("Praia do Mutá", "15 min de carro", "Águas rasas e quentes, piscinas naturais na maré baixa. Boa com crianças pequenas."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li>Silêncio das 22h às 6h.</li>
      <li>Não é permitido fumar dentro do flat.</li>
      <li>Festas e eventos não são permitidos — é um condomínio de família.</li>
      <li>Piscina liberada das 9h às 22h.</li>
      <li>Churrasqueira precisa ser agendada antes, na portaria.</li>
      <li><strong>Pets são bem-vindos aqui.</strong></li>
      <li>Crianças de 2 a 12 anos e bebês são bem-vindos — mas não há berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li>Devolva a chave na recepção do condomínio</li>
      <li>Feche as janelas e desligue os ares-condicionados</li>
      <li>Confira gavetas, tomadas e os dois andares — carregador esquecido é o campeão</li>
      <li>Se o voo for só à noite, deixe a bagagem no guarda-volumes do condomínio</li>
      <li>Avise o plantão que você já saiu</li>
    </ul>
  </section>'''

S12 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">12</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Taperapuan — 5 min a pé</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — 15 min de carro</td></tr>
      <tr><th>Policlínica Municipal</th><td>13 min de carro</td></tr>
      <tr><th>Delegacia de Proteção ao Turista</th><td>15 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas, no centro — 13 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 3 min de carro</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — 12 min de carro</td></tr>
    </table>
    <div class="fecho">
      <p class="fecho-t">Boa estadia.</p>
      <p class="fecho-s">Se faltar qualquer coisa, chama a gente antes de resolver por conta.<br>É pra isso que a gente está aqui.</p>
    </div>
  </section>''' % (WPP_LINK, WPP_FMT)

SECOES = "\n\n  ".join([S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12])

html = io.open(SCAFFOLD, encoding="utf-8").read()
html = (html.replace("{{NOME_UNIDADE}}", NOME)
            .replace("{{CODIGO}}", CODIGO)
            .replace("{{WHATSAPP_FMT}}", WPP_FMT))
html = html.replace("  <!-- {{CAPA}} -->\n  <!-- {{SECOES}} -->", "  " + CAPA + "\n\n  " + SECOES)
io.open(SAIDA, "w", encoding="utf-8").write(html)

print("gerado:", SAIDA)
print("fotos: %d | peso das fotos: %.1f MB | arquivo final: %.1f MB"
      % (len(SELECAO), total / 1048576, os.path.getsize(SAIDA) / 1048576))
