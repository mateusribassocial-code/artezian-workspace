# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do GG08J (Casa do John) — Taperapua, Porto Seguro.

SEGUNDA CASA. Mesma estrutura do GF02J, com uma diferenca importante:
  - EVENTOS SAO PERMITIDOS aqui (unica do portfolio) e ha "ampla area de festas"
  - mas o site diz silencio a partir das 21h -> contradicao marcada no manual

Estrutura de casa:
  - nao ha portaria nem area de lazer de condominio
  - a piscina e privativa da casa -> ganhou secao propria, com aviso de seguranca
  - a secao 07 deixou de ser "Area de lazer" (condominio) e virou "Area externa e piscina"

Coordenada adotada: -16.389796, -39.042673 (centroide da Rua Lambari, via Nominatim).
O OSM nao tem "Travessa Lambari" nem o numero 80. Ancora conferida: o site diz
praia a 650m e a medicao deu 605m. Fica a 249m do FL10J.

Fontes:
  GG08J -Descricao_Casa_John.txt           -> capacidade, camas, endereco, video
  artezian.com.br/pt/apartment/GG08J       -> quartos, regras, enxoval, acessibilidade
  fotos                                    -> banheira de hidromassagem, area de servico
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Casas/GG08J - Casa do John"
FOTOS = os.path.join(BASE, "Fotos")
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/GG08J - Manual do Hospede.html"

NOME = "Casa do John"
CODIGO = "GG08J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://www.google.com/maps/search/?api=1&query=Travessa+Lambari+80+Taperapua+Porto+Seguro+BA"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("GG08J-2.jpg", "A casa e a piscina", True),
    ("IMG_3386.jpg", "A área gourmet, com churrasqueira equipada", False),
    ("IMG_3416.jpg", "Cozinha", False),
    ("IMG_3410.jpg", "Sala de estar", False),
    ("IMG_3446.jpg", "Um dos quartos de beliche", False),
    ("IMG_3429.jpg", "Um dos quartos com camas", False),
    ("IMG_3437.jpg", "Banheira de hidromassagem", False),
    ("IMG_3458.jpg", "Área de serviço, com máquina de lavar", False),
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
    <div class="capa-sub">Casa com piscina e área de festas · Taperapuã, Porto Seguro</div>
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
      <tr><th>Endereço</th><td>Travessa Lambari, 80 — Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Capacidade</th><td>Até 25 pessoas</td></tr>
      <tr><th>Quartos</th><td>4 suítes e 2 quartos — a distribuição das camas está na seção 05</td></tr>
      <tr><th>Banheiros</th><td>4</td></tr>
      <tr><th>Estacionamento</th><td>5 vagas mais garagem, sem custo</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 9 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">Travessa Lambari, 80 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: o <strong>Axé Moi fica a 8 minutos a pé</strong>, e a pizzaria Esquina Jones a 2.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 15 minutos de carro</li>
          <li><strong>Do centro de Porto Seguro:</strong> cerca de 15 minutos de carro</li>
          <li><strong>Da Praia de Taperapuã:</strong> 9 minutos a pé</li>
        </ul>
        <p class="ref">A casa tem 5 vagas mais garagem — se o grupo vier em vários carros, todos cabem.</p>
      </div>
      <a class="qr" href="%s">%s<div class="qr-cap">Toque ou escaneie</div></a>
    </div>
  </section>''' % (MAPS, qr_svg)

S03 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
    <ol class="passos">
      <li><strong>Combine o horário da sua chegada com antecedência.</strong> Mande mensagem para o plantão assim que tiver o horário do voo.</li>
      <li><strong>Chegue entre 15h e 22h.</strong> Antes das 15h a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir.</li>
      <li><strong>O caseiro recebe você e entrega as chaves.</strong> Ele mora na casa e cuida dela — é com ele que você resolve o dia a dia.</li>
      <li><strong>Peça a senha do Wi-Fi na chegada.</strong> Ela é entregue no check-in.</li>
      <li><strong>Estacione na casa.</strong> São 5 vagas mais a garagem.</li>
    </ol>
    <div class="aviso"><strong>A casa tem caseiro.</strong> Ele recebe vocês na chegada, entrega as chaves e é quem resolve o dia a dia da casa. Ainda assim, combine o horário da chegada com antecedência — e se o voo atrasar, avise na hora. Para qualquer coisa fora do previsto, o plantão da Artezian continua sendo o seu contato.</div>
  </section>'''

S04 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">04</span> A casa</h2>
    <div class="galeria">
      %s
    </div>
  </section>''' % GALERIA

S05 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">05</span> O que tem aqui</h2>
    <div class="col2">
      <div class="col-tem">
        <h3 class="col-h">Está na casa</h3>
        <div class="grupo"><h4>Onde cada um dorme</h4><ul class="lista-check">
          <li><strong>Suíte master</strong> — 1 cama de casal e 4 de solteiro</li>
          <li><strong>Suíte 2</strong>, no andar de cima — 1 de casal e 2 de solteiro</li>
          <li><strong>Suíte 3</strong>, no andar de cima — 1 de casal e 2 de solteiro</li>
          <li><strong>Suíte 4</strong>, no térreo — 1 de casal e 2 de solteiro</li>
          <li><strong>Quarto embaixo da escada</strong> — 2 beliches e 2 camas auxiliares</li>
          <li><strong>Quarto dos fundos</strong> — 1 beliche</li>
        </ul></div>
        <div class="grupo"><h4>Nos quartos</h4><ul class="lista-check">
          <li><strong>Ar-condicionado em todos</strong>, com controle individual</li>
          <li>Ventiladores de teto</li>
          <li>Guarda-roupas</li>
          <li>Roupa de cama, travesseiros e toalhas inclusos</li>
          <li>Sofá-cama na sala</li>
        </ul></div>
        <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">
          <li>Cozinha americana completa</li>
          <li>Forno, micro-ondas, freezer e cafeteira</li>
          <li>Torradeira e utensílios de churrasco</li>
          <li>Mesa de jantar</li>
        </ul></div>
        <div class="grupo"><h4>Banheiros e lavanderia</h4><ul class="lista-check">
          <li>4 banheiros, com água quente</li>
          <li><strong>Banheira de hidromassagem</strong></li>
          <li>Papel higiênico e itens básicos inclusos</li>
          <li><strong>Toalhas de piscina</strong>, além das de banho</li>
          <li>Área de serviço com máquina de lavar</li>
        </ul></div>
      </div>
      <div class="col-levar">
        <h3 class="col-h">Leve você</h3>
        <ul class="lista-levar">
          <li>Itens de higiene pessoal</li>
          <li>Carvão, se for usar a churrasqueira</li>
          <li>Berço, se precisar — não há na casa</li>
        </ul>
      </div>
    </div>
    <div class="aviso"><strong>As toalhas de piscina já estão na casa</strong> — não precisa levar as suas nem usar as de banho na área externa.<br><br>
    A casa tem <strong>recursos para hóspedes com mobilidade reduzida</strong>, incluindo vaga de estacionamento acessível. Se alguém do grupo precisar, avise a gente com antecedência para orientar a divisão dos quartos.</div>
  </section>'''

S06 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Wi-Fi</div><div class="wifi-v">Senha entregue no check-in</div></div>
    </div>
    <ul class="lista">
      <li>A TV é smart — dá para entrar nas suas contas de streaming. Lembre de sair delas antes do check-out.</li>
      <li>Cada quarto tem ar-condicionado próprio, então dá para ajustar sem discussão.</li>
    </ul>
    <div class="aviso"><strong>As tomadas são 220V.</strong> Se você vem de Minas Gerais, do Espírito Santo ou de qualquer lugar onde a rede é 127V, confira a voltagem antes de ligar secador de cabelo, chapinha ou qualquer aparelho trazido de casa. Carregador de celular e notebook costumam ser bivolt, mas vale conferir na etiqueta.</div>
  </section>'''

S07 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">07</span> Área externa e piscina</h2>
    <table class="tab">
      <tr><th>Piscina</th><td><strong>Privativa</strong>, só do seu grupo — sem horário de condomínio</td></tr>
      <tr><th>Área de festas</th><td>Ampla, integrada à piscina</td></tr>
      <tr><th>Área gourmet</th><td>Churrasqueira totalmente equipada, com bancada e pia</td></tr>
      <tr><th>Mobiliário externo</th><td>Mesas, cadeiras e guarda-sóis</td></tr>
      <tr><th>Toalhas de piscina</th><td>Inclusas</td></tr>
      <tr><th>Estacionamento</th><td>5 vagas mais garagem, com vaga acessível</td></tr>
    </table>
    <div class="aviso"><strong>A piscina é privativa e não tem salva-vidas.</strong> Como a casa recebe grupos grandes, quase sempre com crianças, combinem quem fica de olho — principalmente no fim da tarde, quando todo mundo entra e sai. Ninguém deve nadar sozinho depois de beber.</div>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Mercado e farmácia</h2>
    <p class="ref">Para um grupo deste tamanho a compra da chegada é grande — e aqui dá para resolver tudo a pé, farmácia inclusive.</p>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Litoral Supermercado", "5 min a pé", "O mais perto. Resolve a compra da chegada."),
    lugar("O Sampa", "5 min a pé", "Na mesma direção, alternativa se um estiver cheio."),
    lugar("Haddasa e Frossad", "6 min a pé", "Terceira opção, também a pé."),
    lugar("Farmácia Taperapuan", "8 min a pé", "A farmácia da faixa da praia — dá para ir andando."),
    lugar("Posto Mundaí", "4 min de carro", "Posto de combustível aberto 24h."),
])

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> Onde comer e beber</h2>
%s
%s
  </section>''' % (
    grupo("A pé", [
        lugar("Esquina Jones", "2 min a pé", "Pizzaria na esquina. Boa saída para a primeira noite, quando ninguém quer cozinhar."),
        lugar("Restaurante Marília", "3 min a pé", "Refeição rápida, sem sair do bairro."),
        lugar("Colher de Pau", "7 min a pé", "Comida baiana na areia — moqueca, carne de sol, peixe. Música ao vivo à noite."),
        lugar("Axé Moi", "8 min a pé", "Complexo de praia com dois palcos e programação das 10h às 17h30."),
    ]),
    grupo("Vale pegar o carro", [
        lugar("Cabana Malibu", "3 min de carro", "Clima familiar e tranquilo, cardápio de frutos do mar."),
        lugar("Tôa Tôa", "4 min de carro", "O beach club mais famoso de Porto Seguro. Luau nas sextas, das 21h às 3h."),
        lugar("Barramares", "4 min de carro", "Estrutura grande de praia, com programação de shows."),
        lugar("Barraca do Gaúcho", "5 min de carro", "Churrasco rodízio na praia. Boa para grupo grande."),
    ]),
)

S10 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">10</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Praia de Taperapuã", "9 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa. Na maré baixa formam-se piscinas naturais."),
    lugar("Reserva Pataxó da Jaqueira", "5 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Coroa Vermelha", "18 min de carro", "Marco do Descobrimento, Feirinha Pataxó e o Caminho de Moisés na maré baixa."),
    lugar("Centro Histórico", "15 min de carro", "Museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "15 min de carro", "Vida noturna, artesanato e barracas de drink."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li><strong>Eventos são permitidos nesta casa.</strong> Ela tem área de festas integrada à piscina — é para isso que existe.</li>
      <li>Silêncio a partir das 21h <span class="ph">confirmar</span>. A casa fica em rua residencial e os vizinhos moram ali.</li>
      <li>Não é permitido fumar dentro dos quartos.</li>
      <li><strong>Pets são bem-vindos.</strong></li>
      <li>Crianças de 2 a 12 anos e bebês são bem-vindos — mas não há berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li><strong>Combine o horário da saída com o caseiro.</strong> Ele recebe as chaves e confere a casa antes de vocês irem</li>
      <li>Feche as janelas e desligue os ares-condicionados</li>
      <li>Apague bem a churrasqueira, se tiver usado</li>
      <li>Saia das suas contas de streaming na TV</li>
      <li>Confira todos os quartos e os quatro banheiros — num grupo grande, sempre fica alguma coisa</li>
    </ul>
  </section>'''

S12 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">12</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a> — seu único contato no local</td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Taperapuan — 8 min a pé</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — 16 min de carro</td></tr>
      <tr><th>Policlínica Municipal</th><td>14 min de carro</td></tr>
      <tr><th>Delegacia de Proteção ao Turista</th><td>16 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas, no centro — 14 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 4 min de carro</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — 14 min de carro</td></tr>
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
