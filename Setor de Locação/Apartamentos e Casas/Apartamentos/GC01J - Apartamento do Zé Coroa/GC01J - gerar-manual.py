# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do GC01J (Apartamento do Ze Coroa).

Fontes:
  GC01J -Descricao_Ze_Coroa.txt              -> caracteristicas, video
  artezian.com.br/pt/apartment/GC01J         -> horarios, regras, enxoval
  Residencial Jerusalem II - Condominio.md   -> portaria, lazer, estrutura
  GC01J - Operacional.md                     -> unidade, camas, vagas
  vizinhanca-imoveis.md                      -> bloco COROA VERMELHA (medido por OSM)
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Apartamentos/GC01J - Apartamento do Zé Coroa"
FOTOS = BASE  # fotos estao soltas na raiz da pasta, sem subpasta Fotos/
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/GC01J - Manual do Hospede.html"

NOME = "Apartamento do Zé Coroa"
CODIGO = "GC01J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://maps.app.goo.gl/mh8b18ua3qmjZP2CA"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("WhatsApp Image 2025-10-02 at 12.03.02 (2).jpeg", "Piscina do condomínio, com deck", True),
    ("GC01J-1.jpeg", "Sala de estar com varanda", False),
    ("GC01J-2.jpeg", "Escada interna para as suítes de cima", False),
    ("WhatsApp Image 2025-10-02 at 12.03.02.jpeg", "Mesa de jantar", False),
    ("GC01J-5.jpeg", "Cozinha completa", False),
    ("GC01J-3.jpeg", "Suíte com cama de casal", False),
    ("WhatsApp Image 2025-10-02 at 12.03.03 (5).jpeg", "Suíte do andar de cima", False),
    ("GC01J-4.jpeg", "Churrasqueira privativa", False),
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


def lugar(nome, dist, desc):
    return ('      <div class="lugar">\n'
            '        <div class="lugar-topo"><span class="lugar-nome">%s</span>'
            '<span class="lugar-dist">%s</span></div>\n'
            '        <div class="lugar-desc">%s</div>\n'
            '      </div>' % (nome, dist, desc))


def grupo(titulo, itens):
    return ('    <div class="grupo-lugares">\n      <h3>%s</h3>\n      <div class="lugares">\n%s\n      </div>\n    </div>'
            % (titulo, "\n".join(itens)))


CAPA = '''<header class="capa">
    <div class="capa-tag">Manual do hóspede</div>
    <h1 class="capa-titulo">%s</h1>
    <div class="capa-sub">Apartamento duplex, 3 suítes · até 11 pessoas · Praia do Mutá, Coroa Vermelha</div>
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
      <tr><th>Endereço</th><td>BR-367, s/n — Praia do Mutá, Coroa Vermelha<br>Santa Cruz Cabrália, BA · CEP 45807-000</td></tr>
      <tr><th>Condomínio</th><td>Residencial Jerusalém II</td></tr>
      <tr><th>Unidade</th><td>Apartamento 13 — duplex</td></tr>
      <tr><th>Capacidade</th><td>Até 11 pessoas — 3 suítes, 3 camas de casal e 5 de solteiro</td></tr>
      <tr><th>Garagem</th><td>2 vagas</td></tr>
      <tr><th>Praia</th><td>Praia do Mutá, 3 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">BR-367, s/n — Praia do Mutá, Coroa Vermelha (BA)</p>
        <p class="ref">Referência: Residencial Jerusalém II. O condomínio fica de frente para o mar, na Ponta de Mutá.</p>
        <ul class="lista">
          <li><strong>Do aeroporto de Porto Seguro:</strong> 13 km, cerca de 25 a 30 minutos de carro</li>
          <li><strong>Do centro de Porto Seguro:</strong> cerca de 25 minutos de carro</li>
          <li><strong>Da Praia do Mutá:</strong> 3 minutos a pé</li>
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
      <li><strong>Apresente um documento com foto.</strong> RG, CNH ou passaporte. Sem documento a portaria não libera a entrada.</li>
      <li><strong>Retire a chave e a senha do Wi-Fi na portaria.</strong> As duas coisas são entregues ali, na chegada.</li>
      <li><strong>Estacione na garagem.</strong> O apartamento tem 2 vagas.</li>
      <li><strong>Siga para o Apartamento 13.</strong> É duplex: a entrada e uma das suítes ficam no térreo, as outras duas no andar de cima.</li>
    </ol>
    <div class="aviso">Qualquer coisa fora do previsto — atraso no voo, portaria sem a sua reserva, chave que não abre — chame o plantão da Artezian no WhatsApp <strong>%s</strong>. Não fique esperando na portaria sem falar com a gente.</div>
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
          <li><strong>Uma suíte no térreo</strong>, no mesmo nível da entrada</li>
          <li>Duas suítes no andar de cima, por escada interna</li>
          <li>3 camas de casal e 5 de solteiro</li>
          <li>Roupa de cama e toalhas de banho já no apartamento</li>
        </ul></div>
        <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">
          <li>Cozinha completa e equipada</li>
        </ul></div>
        <div class="grupo"><h4>Área externa</h4><ul class="lista-check">
          <li>Churrasqueira privativa</li>
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
    <div class="aviso"><strong>A suíte do térreo resolve a vida de quem tem dificuldade com escada.</strong> Se alguém do grupo é idoso, está grávida ou se machucou, é essa que vocês devem ocupar — as outras duas só se chega subindo.</div>
  </section>'''

S06 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Wi-Fi</div><div class="wifi-v">Senha na portaria</div></div>
    </div>
    <ul class="lista">
      <li>A senha do Wi-Fi é entregue na portaria, junto com a chave. Se esquecer de pegar na chegada, é só descer e pedir.</li>
    </ul>
    <div class="aviso"><strong>As tomadas do apartamento são 220V.</strong> Se você vem de Minas Gerais, do Espírito Santo ou de qualquer lugar onde a rede é 127V, confira a voltagem antes de ligar secador de cabelo, chapinha ou qualquer aparelho trazido de casa. Carregador de celular e notebook costumam ser bivolt, mas vale conferir na etiqueta.</div>
  </section>'''

S07 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">07</span> Área de lazer</h2>
    <table class="tab">
      <tr><th>Piscina</th><td>Das 9h às 22h — piscina adulto e infantil</td></tr>
      <tr><th>Churrasqueira coletiva</th><td>Precisa ser agendada. Fale com a portaria com antecedência.</td></tr>
      <tr><th>Sauna</th><td>Disponível no condomínio</td></tr>
      <tr><th>Restaurante</th><td>O condomínio tem restaurante próprio</td></tr>
      <tr><th>Portaria</th><td>24 horas</td></tr>
    </table>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Mercado e farmácia</h2>
    <p class="ref">Chegando às 15h, essa costuma ser a primeira saída. O comércio de Coroa Vermelha fica na BR-367, a mesma via do condomínio.</p>
    <div class="lugares">
%s
    </div>
    <div class="aviso">As farmácias ficam no comércio de Coroa Vermelha, na BR-367 — <strong>Farmácia Brasil</strong> (73 3672-1108) e <strong>Pague Menos</strong>, ambas no km 82. Na dúvida, o plantão indica a mais próxima aberta.</div>
  </section>''' % "\n".join([
    lugar("Cambui Coroa", "3 min de carro", "Supermercado no comércio de Coroa Vermelha. Dá para ir a pé em 15 minutos."),
    lugar("Bali Rio Bahia", "3 min de carro", "Loja de conveniência — resolve o esquecido sem fazer compra grande."),
    lugar("Aldeia Sups", "4 min de carro", "Supermercado, para a compra da semana."),
    lugar("Posto Costa do Descobrimento", "4 min de carro", "Posto de combustível na BR-367."),
])

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> Onde comer e beber</h2>
    <p class="ref">Essa é a vantagem de morar na Ponta de Mutá: são onze restaurantes em menos de setecentos metros, quase todos pé na areia.</p>
%s
%s
  </section>''' % (
    grupo("Pé na areia, tudo a pé", [
        lugar("Recanto do Sossego", "3 min a pé", "O mais perto do condomínio. Culinária baiana e italiana — risotto, pizza em forno de lenha, frutos do mar e carnes."),
        lugar("Colher de Pau", "4 min a pé", "Unidade da rede baiana mais conhecida da região, na faixa da praia."),
        lugar("Sun Beach", "5 min a pé", "Barraca de praia com cardápio de frutos do mar."),
        lugar("Cabana Auê", "6 min a pé", "Cabana pé na areia."),
        lugar("Oxente Praia", "7 min a pé", "Barraca com estrutura de praia."),
        lugar("Cabral Beach", "8 min a pé", "Na mesma faixa, seguindo a orla."),
    ]),
    grupo("Sem sair do condomínio ou de carro", [
        lugar("Restaurante do Jerusalém II", "no condomínio", "O condomínio tem restaurante próprio — útil no dia de chegada, quando ninguém quer sair."),
        lugar("Cabana A Praia Branca", "4 min de carro", "Todo dia, das 8h às 17h."),
    ]),
)

S10 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">10</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % "\n".join([
    lugar("Praia do Mutá", "3 min a pé", "Águas mornas e transparentes, areia branca e arrecifes de coral. Na maré baixa formam-se piscinas naturais — é a melhor hora para snorkel. Há caiaque na praia em frente ao condomínio."),
    lugar("Caminho de Moisés", "3 min de carro", "Trilha de areia e corais que aparece no meio do mar na maré baixa, em Coroa Vermelha. Confira a tábua de marés antes de ir — sem maré baixa não há caminho."),
    lugar("Feirinha de Coroa Vermelha", "3 min de carro", "Artesanato indígena pataxó e souvenirs, ao lado do Marco do Descobrimento, onde foi celebrada a primeira missa do Brasil."),
    lugar("Passeio de escuna à Coroa Alta", "dia inteiro", "Banco de corais com piscinas naturais em mar aberto. As escunas saem do cais de Santa Cruz Cabrália."),
    lugar("Reserva Pataxó da Jaqueira", "10 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li>Silêncio das 22h às 7h.</li>
      <li>Não é permitido fumar dentro do imóvel.</li>
      <li>Festas e eventos não são permitidos.</li>
      <li>Piscina liberada das 9h às 22h.</li>
      <li>Churrasqueira coletiva precisa ser agendada antes, na portaria.</li>
      <li>Pets são bem-vindos. Crianças também — mas o condomínio não tem berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li>Devolva a chave na recepção do condomínio</li>
      <li>Feche as janelas e desligue os ares-condicionados</li>
      <li>Confira gavetas, tomadas e os dois andares — carregador esquecido é o campeão</li>
      <li>Avise o plantão que você já saiu</li>
    </ul>
  </section>'''

S12 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">12</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Hospital mais próximo</th><td>Hospital Professor José Maria Guimarães, em Santa Cruz Cabrália — cerca de 7 min de carro</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Brasil, BR-367 km 82 — (73) 3672-1108</td></tr>
      <tr><th>Delegacia</th><td>Polícia Civil de Santa Cruz Cabrália — cerca de 8 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>No centro de Porto Seguro — cerca de 25 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Costa do Descobrimento, na BR-367 — 4 min de carro</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — cerca de 25 min de carro</td></tr>
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
