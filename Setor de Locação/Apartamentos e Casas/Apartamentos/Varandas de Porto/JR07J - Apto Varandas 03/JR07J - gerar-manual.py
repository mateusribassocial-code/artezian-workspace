# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do JR07J (Apto Varandas 03) — Varandas de Porto.

Coordenada do condominio: -16.383751, -39.035304 (Rua Araray, 79m do BigStop).
Ver "Varandas de Porto - Condominio.md" para como ela foi obtida.

Fontes:
  Apartamentos_Varandas_ate 6 pessoas.txt  -> tipo B: quarto e sala, beliche, minimo de noites
  Descrição Varandas de Porto.txt          -> estrutura do condominio
  Varandas de Porto - Condominio.md        -> operacional das sete unidades
  fotos da unidade                         -> numero 07 na porta, fogao de piso 4 bocas (o unico
                                              tipo B com fogao visivel), beliche com cama auxiliar,
                                              ar-condicionado split no quarto, tanque na area de
                                              servico, box sem barra de apoio
  Mateus, 07/09/2026                       -> tem guarda-roupa (nao aparece nas fotos) e tem tanquinho

Divergencia ainda registrada no manual com .ph:
  capacidade (o material diz "ate 6"/"ate 5"; as camas vistas somam 5, sem sofa-cama)
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Apartamentos/Varandas de Porto/JR07J - Apto Varandas 03"
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/JR07J - Manual do Hospede.html"

NOME = "Apto Varandas 03"
CODIGO = "JR07J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://share.google/BFndo5AKzwBT2JUxF"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(BASE, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("JR07J-1.png", "A sala e a cozinha, com o número 07 na porta", True),
    ("JR07J-2.png", "Cozinha com fogão, geladeira e micro-ondas", False),
    ("JR07J-3.png", "O quarto, com cama de casal, beliche e ar-condicionado", False),
    ("JR07J-4.png", "O beliche tem uma cama auxiliar embaixo", False),
    ("6.png", "Banheiro com box e bancada de granito", False),
    ("7.png", "Tanque para lavar roupa", False),
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
    <div class="capa-sub">Apartamento · Varandas de Porto · Taperapuã, Porto Seguro</div>
    <div class="capa-codigo">%s</div>
    <div class="capa-marca">
      <div class="capa-marca-nome">Artezian</div>
      <div class="capa-marca-sub">Real Estate Atelie</div>
    </div>
  </header>''' % (NOME, CODIGO)

S01 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">01</span> Sua reserva</h2>
    <div class="destaque-duplo">
      <div class="destaque"><div class="destaque-l">Check-in</div><div class="destaque-v">das 14h às 22h</div></div>
      <div class="destaque"><div class="destaque-l">Check-out</div><div class="destaque-v">até as 12h</div></div>
    </div>
    <table class="tab">
      <tr><th>Endereço</th><td>Rua Araray, 55 — Paraíso dos Pataxós, Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Condomínio</th><td>Varandas de Porto</td></tr>
      <tr><th>Unidade</th><td><strong>Apartamento 07</strong> — é esse o número na porta</td></tr>
      <tr><th>Capacidade</th><td>Até 5 pessoas <span class="ph">confirmar</span> — 1 cama de casal, 1 beliche e 1 cama auxiliar</td></tr>
      <tr><th>Estacionamento</th><td>Gratuito no condomínio — 3 vagas internas e 4 externas</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 6 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">Rua Araray, 55 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: o <strong>supermercado BigStop fica a 1 minuto a pé</strong> — é o melhor ponto para orientar o motorista.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 17 minutos de carro</li>
          <li><strong>Do centro de Porto Seguro:</strong> cerca de 16 minutos de carro</li>
          <li><strong>Da Praia de Taperapuã:</strong> 6 minutos a pé</li>
        </ul>
      </div>
      <a class="qr" href="%s">%s<div class="qr-cap">Toque ou escaneie</div></a>
    </div>
  </section>''' % (MAPS, qr_svg)

S03 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
    <ol class="passos">
      <li><strong>Chegue entre 14h e 22h.</strong> Antes das 14h a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir. Se o voo atrasar e você for chegar depois das 22h, avise o plantão.</li>
      <li><strong>Estacione no condomínio.</strong> São 3 vagas internas e 4 externas, sem custo, por ordem de chegada.</li>
      <li><strong>Retire a chave na portaria.</strong></li>
      <li><strong>Procure o número 07 na porta.</strong> Você reservou como <em>Apto Varandas 03</em>, mas no condomínio a unidade é a <strong>07</strong> — é esse número que está na porta.</li>
    </ol>
    <div class="aviso">Qualquer coisa fora do previsto, chame o plantão da Artezian no WhatsApp <strong>%s</strong>.</div>
  </section>''' % WPP_FMT

# quebra-antes: com 6 fotos (1 larga + 5) a grade nao cabe no resto da pagina 3 e as
# legendas da ultima linha invadem o rodape fixo. Comecando em pagina limpa, tudo cabe.
S04 = '''<section class="sec quebra-antes">
    <h2 class="sec-h"><span class="sec-n">04</span> O imóvel</h2>
    <div class="galeria">
      %s
    </div>
  </section>''' % GALERIA

S05 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">05</span> O que tem aqui</h2>
    <div class="col2">
      <div class="col-tem">
        <h3 class="col-h">Está no apartamento</h3>
        <div class="grupo"><h4>Quarto</h4><ul class="lista-check">
          <li>Quarto separado, com porta</li>
          <li>Cama de casal e beliche</li>
          <li><strong>Cama auxiliar embaixo do beliche</strong>, com rodinhas</li>
          <li>Ar-condicionado split</li>
          <li>Guarda-roupa</li>
          <li>Janela com veneziana</li>
          <li>Roupa de cama, cobertores, travesseiros e toalhas inclusos</li>
        </ul></div>
        <div class="grupo"><h4>Sala e cozinha</h4><ul class="lista-check">
          <li>Sala e cozinha integradas</li>
          <li>Mesa redonda com quatro lugares e três banquetas no balcão</li>
          <li>TV</li>
          <li>Ventilador de pé</li>
        </ul></div>
        <div class="grupo"><h4>Cozinha e serviço</h4><ul class="lista-check">
          <li><strong>Fogão de quatro bocas com forno</strong></li>
          <li>Geladeira e micro-ondas</li>
          <li>Liquidificador e sanduicheira</li>
          <li>Panelas, louça, copos e utensílios</li>
          <li>Tanquinho e tanque para lavar roupa</li>
        </ul></div>
        <div class="grupo"><h4>Banheiro</h4><ul class="lista-check">
          <li>Banheiro com água quente e janela</li>
          <li>Box de vidro</li>
          <li>Armário com bancada de granito e espelho</li>
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
    <div class="aviso"><strong>O ar-condicionado é do quarto.</strong> Na sala o que tem é ventilador de pé. <strong>A quinta cama sai de baixo do beliche</strong> — é só puxar, ela tem rodinhas, e cabe gente adulta. <strong>O box não tem barra de apoio</strong>; se você precisa dela, avise o plantão antes da chegada.</div>
  </section>'''

S06 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Rede</div><div class="wifi-v">Varandas de Porto</div></div>
      <div class="wifi-item"><div class="wifi-l">Senha</div><div class="wifi-v">Bemvindo2026</div></div>
    </div>
    <ul class="lista">
      <li>A rede é a mesma em todo o condomínio, então funciona também na piscina e na área de churrasco. Se não achar na lista, confira com a portaria.</li>
    </ul>
    <div class="aviso"><strong>As tomadas são 220V.</strong> Se você vem de Minas Gerais, do Espírito Santo ou de qualquer lugar onde a rede é 127V, confira a voltagem antes de ligar secador de cabelo, chapinha ou qualquer aparelho trazido de casa. Carregador de celular e notebook costumam ser bivolt, mas vale conferir na etiqueta.</div>
  </section>'''

S07 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">07</span> Área de lazer</h2>
    <table class="tab">
      <tr><th>Piscina</th><td>Piscina com cascata</td></tr>
      <tr><th>Espreguiçadeiras</th><td>Guarda-sóis e espreguiçadeiras na área da piscina</td></tr>
      <tr><th>Churrasqueira</th><td>Área de churrasco com churrasqueira, de uso comum</td></tr>
      <tr><th>Ducha externa</th><td>Sim — para tirar a areia antes de entrar</td></tr>
      <tr><th>Acessibilidade</th><td>O condomínio tem rampa para cadeirante</td></tr>
    </table>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Mercado e farmácia</h2>
    <p class="ref">O supermercado é praticamente vizinho — é a maior comodidade deste endereço.</p>
    <div class="lugares">
%s
    </div>
    <div class="aviso"><strong>Farmácia, aqui, só de carro.</strong> A mais próxima fica a 3 minutos dirigindo. Se você usa medicamento de uso contínuo, traga o suficiente para a viagem.</div>
  </section>''' % NL.join([
    lugar("BigStop", "1 min a pé", "O supermercado do lado do condomínio. Todo dia, das 8h às 22h."),
    lugar("J de C Rodrigues", "1 min a pé", "Mercearia na mesma esquina, para o que faltar."),
    lugar("Litoral Supermercado", "9 min a pé", "Alternativa, um pouco maior."),
    lugar("Farmácia Taperapuan", "3 min de carro", "A farmácia mais próxima."),
    lugar("Posto Mundaí", "6 min de carro", "Posto de combustível aberto 24h."),
])

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> Onde comer e beber</h2>
%s
%s
  </section>''' % (
    grupo("A pé", [
        lugar("Barraca do Gaúcho", "5 min a pé", "Tradicional na beira do mar, famosa pelo churrasco rodízio na praia."),
        lugar("Restaurante Junã", "6 min a pé", "Opção simples e próxima."),
        lugar("Cabana Jubarte", "6 min a pé", "Barraca tradicional da orla."),
        lugar("Barramares", "13 min a pé", "Estrutura grande de praia, com programação de shows. De carro são 3 minutos."),
    ]),
    grupo("Vale pegar o carro", [
        lugar("Colher de Pau", "3 min de carro", "Comida baiana na areia — moqueca, carne de sol, peixe. Música ao vivo à noite."),
        lugar("Axé Moi", "3 min de carro", "Complexo de praia com dois palcos e programação das 10h às 17h30."),
        lugar("Cabana Malibu", "4 min de carro", "Clima familiar e tranquilo, cardápio de frutos do mar."),
        lugar("Tôa Tôa", "6 min de carro", "O beach club mais famoso de Porto Seguro. Luau nas sextas, das 21h às 3h."),
    ]),
)

S10 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">10</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Praia de Taperapuã", "6 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa."),
    lugar("Reserva Pataxó da Jaqueira", "8 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Coroa Vermelha", "15 min de carro", "Marco do Descobrimento, Feirinha Pataxó e o Caminho de Moisés na maré baixa."),
    lugar("Centro Histórico", "16 min de carro", "Museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "16 min de carro", "Vida noturna, artesanato e barracas de drink."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li>Não é permitido fumar dentro do apartamento.</li>
      <li>Festas e eventos não são permitidos — é um condomínio familiar e tranquilo.</li>
      <li><strong>Pets não são aceitos neste condomínio.</strong></li>
      <li>Crianças de 2 a 12 anos e bebês são bem-vindos — mas não há berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li>Devolva a chave na portaria</li>
      <li>Feche as janelas e desligue o ar-condicionado</li>
      <li>Confira o quarto, a área de serviço e as tomadas</li>
      <li>Avise o plantão que você já saiu</li>
    </ul>
  </section>'''

S12 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">12</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Taperapuan — 3 min de carro</td></tr>
      <tr><th>Hospital mais próximo</th><td>Hospital Professor José Maria Guimarães, em Santa Cruz Cabrália — 16 min de carro</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — 18 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas, no centro — 16 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 6 min de carro</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — 16 min de carro</td></tr>
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
