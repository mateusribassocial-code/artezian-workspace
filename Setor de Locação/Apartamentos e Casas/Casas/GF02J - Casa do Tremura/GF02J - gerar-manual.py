# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do GF02J (Casa do Tremura) — Taperapua, Porto Seguro.

PRIMEIRA CASA do portfolio. Estrutura diferente dos apartamentos:
  - nao ha portaria nem area de lazer de condominio
  - a piscina e privativa da casa -> ganhou secao propria, com aviso de seguranca
  - a secao 07 deixou de ser "Area de lazer" (condominio) e virou "Area externa e piscina"

Coordenada adotada: -16.383145, -39.035682 (Rua Piratinga, ponto medio).
A rua tem ~350m de extensao e o OSM nao tem o numero 33, entao as distancias
podem variar 2-3 minutos. Ancoras conferidas: o site diz Barraca do Gaucho a 500m
(medido 414m) e praia a 500m (medido 468m).

Fontes:
  GF02J - Descricao_Tremura.txt            -> quartos, camas, endereco, video
  artezian.com.br/pt/apartment/GF02J       -> horarios, regras, enxoval, garagem
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Casas/GF02J - Casa do Tremura"
FOTOS = os.path.join(BASE, "Fotos")
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = "Setor de Locação/PDFS/GF02J - Manual do Hospede.html"

NOME = "Casa do Tremura"
CODIGO = "GF02J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://www.google.com/maps/search/?api=1&query=Rua+Piratinga+33+Taperapua+Porto+Seguro+BA"
WIFI_REDE = "Tremura"
WIFI_SENHA = "act12345"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("c6797d0c-16b3-41fc-81f4-2d2de051ac1e.jpeg", "A casa, a piscina e a área gourmet", True),
    ("GF02J-2.jpeg", "A piscina, com cascata", False),
    ("WhatsApp Image 2026-02-10 at 09.28.56.jpeg", "A mesa da área gourmet", False),
    ("WhatsApp Image 2026-02-10 at 09.28.57 (1).jpeg", "Sala de estar e escada interna", False),
    ("WhatsApp Image 2026-02-10 at 09.28.57.jpeg", "Cozinha", False),
    ("GF02J-4.jpeg", "Um dos quartos, com camas de solteiro", False),
    ("WhatsApp Image 2026-02-10 at 09.28.59 (3).jpeg", "Quarto de casal", False),
    ("WhatsApp Image 2026-02-10 at 09.28.59 (2).jpeg", "Um dos quatro banheiros", False),
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
    <div class="capa-sub">Casa com 6 quartos e piscina privativa · Taperapuã, Porto Seguro</div>
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
      <tr><th>Endereço</th><td>Rua Piratinga, 33 — Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Capacidade</th><td>Até 25 pessoas</td></tr>
      <tr><th>Quartos</th><td>6 quartos, sendo 4 suítes — 4 deles no térreo</td></tr>
      <tr><th>Camas</th><td>6 de casal, 9 de solteiro e 1 auxiliar — a distribuição por quarto está na seção 05</td></tr>
      <tr><th>Banheiros</th><td>4</td></tr>
      <tr><th>Garagem</th><td>Para até 6 carros, sem custo</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 7 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">Rua Piratinga, 33 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: o <strong>supermercado BigStop fica a 2 minutos a pé</strong> — é o melhor ponto para orientar o motorista.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 17 minutos de carro</li>
          <li><strong>Do centro de Porto Seguro:</strong> cerca de 16 minutos de carro</li>
          <li><strong>Da Praia de Taperapuã:</strong> 7 minutos a pé</li>
        </ul>
        <p class="ref">A casa tem garagem para até 6 carros — se o grupo vier em vários veículos, todos cabem.</p>
      </div>
      <a class="qr" href="%s">%s<div class="qr-cap">Toque ou escaneie</div></a>
    </div>
  </section>''' % (MAPS, qr_svg)

S03 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">03</span> Check-in passo a passo</h2>
    <ol class="passos">
      <li><strong>Combine o horário da sua chegada com antecedência.</strong> Quem recebe você é o proprietário, pessoalmente — ele precisa saber a que horas esperar. Mande mensagem para o plantão assim que tiver o horário do voo.</li>
      <li><strong>Chegue entre 15h e 22h.</strong> Antes das 15h a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir.</li>
      <li><strong>O proprietário entrega as chaves na chegada.</strong></li>
      <li><strong>Estacione na garagem da casa.</strong> Cabem até 6 carros.</li>
    </ol>
    <div class="aviso"><strong>Esta é uma casa, não um condomínio — não há portaria 24h.</strong> Por isso o horário combinado importa mais aqui: se o voo atrasar ou o trajeto render, <strong>avise na hora</strong>, para o proprietário não esperar à toa nem você chegar e não encontrar ninguém. O plantão da Artezian é o seu contato para tudo.</div>
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
        <div class="grupo"><h4>Os seis quartos</h4><ul class="lista-check">
          <li><strong>Quarto 1</strong>, no térreo — casal e 1 solteiro</li>
          <li><strong>Quarto 2</strong>, no térreo — casal e 2 solteiros</li>
          <li><strong>Suíte 3</strong>, no térreo — casal e 1 solteiro</li>
          <li><strong>Suíte 4</strong>, no térreo — casal e 1 solteiro</li>
          <li><strong>Suíte 5</strong>, no andar de cima — casal e 2 solteiros</li>
          <li><strong>Suíte 6</strong>, no andar de cima — casal, 2 solteiros e 1 cama auxiliar</li>
        </ul></div>
        <div class="grupo"><h4>Nos quartos</h4><ul class="lista-check">
          <li>Ar-condicionado</li>
          <li>Roupa de cama, travesseiros e toalhas inclusos</li>
        </ul></div>
        <div class="grupo"><h4>Cozinha</h4><ul class="lista-check">
          <li>Cozinha completa — fogão, forno micro-ondas, geladeira e freezer</li>
          <li>Liquidificador e torradeira</li>
          <li>Louça e utensílios básicos</li>
          <li>Mesa grande na área gourmet</li>
        </ul></div>
        <div class="grupo"><h4>Banheiros e mais</h4><ul class="lista-check">
          <li>4 banheiros</li>
          <li><strong>Secador de cabelo</strong></li>
          <li>Itens básicos de banheiro</li>
          <li>Chuveiro externo — para tirar a areia antes de entrar</li>
          <li>Smart TV com TV a cabo</li>
        </ul></div>
      </div>
      <div class="col-levar">
        <h3 class="col-h">Leve você</h3>
        <ul class="lista-levar">
          <li>Toalha de praia</li>
          <li>Itens de higiene pessoal</li>
          <li>Carvão, se for usar a churrasqueira</li>
          <li>Berço, se precisar — não há na casa</li>
        </ul>
      </div>
    </div>
    <div class="aviso"><strong>Quatro dos seis quartos ficam no térreo.</strong> Se alguém do grupo tem dificuldade com escada, dá para acomodar sem subir — vale combinar a divisão dos quartos antes de chegar, que num grupo grande é a primeira discussão da viagem.<br><br>Somando os seis quartos, são <strong>22 lugares em cama</strong>. Se o grupo for maior que isso, avise a gente com antecedência para organizarmos o complemento.</div>
  </section>'''

S06 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">06</span> Wi-Fi e eletrônicos</h2>
    <div class="wifi">
      <div class="wifi-item"><div class="wifi-l">Rede</div><div class="wifi-v">%s</div></div>
      <div class="wifi-item"><div class="wifi-l">Senha</div><div class="wifi-v">%s</div></div>
    </div>
    <ul class="lista">
      <li>A casa já tem secador de cabelo, então talvez você nem precise levar o seu.</li>
    </ul>
    <div class="aviso"><strong>As tomadas são 220V.</strong> Se você vem de Minas Gerais, do Espírito Santo ou de qualquer lugar onde a rede é 127V, confira a voltagem antes de ligar chapinha ou aparelho trazido de casa.</div>
    <div class="aviso"><strong>A energia elétrica está inclusa até um limite de consumo.</strong> Só o que passar disso é cobrado à parte, no fim da estadia.<br><br>Numa casa com ar-condicionado em seis quartos e até 25 pessoas, o consumo sobe rápido. A dica que resolve: <strong>desligue o ar dos quartos vazios</strong> e não deixe os aparelhos ligados quando o grupo sair para a praia.</div>
  </section>''' % (WIFI_REDE, WIFI_SENHA)

S07 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">07</span> Área externa e piscina</h2>
    <table class="tab">
      <tr><th>Piscina</th><td><strong>Privativa</strong>, só do seu grupo — sem horário de condomínio</td></tr>
      <tr><th>Área gourmet</th><td>Com churrasqueira e mesa grande</td></tr>
      <tr><th>Jardim</th><td>Com mobiliário externo</td></tr>
      <tr><th>Chuveiro externo</th><td>Sim</td></tr>
      <tr><th>Garagem</th><td>Até 6 carros</td></tr>
    </table>
    <div class="aviso"><strong>A piscina é privativa e não tem salva-vidas.</strong> Como a casa recebe grupos grandes, quase sempre com crianças, combinem quem fica de olho — principalmente no fim da tarde, quando todo mundo entra e sai. Ninguém deve nadar sozinho depois de beber.</div>
  </section>'''

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Mercado e farmácia</h2>
    <p class="ref">Para um grupo deste tamanho, a compra da chegada é grande — e o supermercado fica na esquina.</p>
    <div class="lugares">
%s
    </div>
    <div class="aviso"><strong>Farmácia, aqui, só de carro.</strong> A mais próxima fica a 3 minutos dirigindo. Num grupo grande vale conferir antes se alguém precisa de medicamento de uso contínuo.</div>
  </section>''' % NL.join([
    lugar("J de C Rodrigues", "1 min a pé", "Mercearia praticamente na porta, para o que faltar."),
    lugar("BigStop", "2 min a pé", "O supermercado do bairro. Todo dia, das 8h às 22h — dá conta da compra da chegada."),
    lugar("Litoral Supermercado", "9 min a pé", "Alternativa, um pouco maior."),
    lugar("Farmácia Taperapuan", "3 min de carro", "A farmácia mais próxima."),
    lugar("Posto Mundaí", "7 min de carro", "Posto de combustível aberto 24h."),
])

S09 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">09</span> Onde comer e beber</h2>
%s
%s
  </section>''' % (
    grupo("A pé", [
        lugar("Barraca do Gaúcho", "6 min a pé", "Tradicional na beira do mar, famosa pelo churrasco rodízio. Boa para grupo grande."),
        lugar("Restaurante Junã", "7 min a pé", "Opção simples e próxima."),
        lugar("Cabana Jubarte", "7 min a pé", "Barraca tradicional da orla."),
        lugar("Barramares", "13 min a pé", "Estrutura grande de praia, com programação de shows. De carro são 3 minutos."),
    ]),
    grupo("Vale pegar o carro", [
        lugar("Colher de Pau", "3 min de carro", "Comida baiana na areia — moqueca, carne de sol, peixe. Música ao vivo à noite."),
        lugar("Axé Moi", "3 min de carro", "Complexo de praia com dois palcos e programação das 10h às 17h30."),
        lugar("Cabana Malibu", "5 min de carro", "Clima familiar e tranquilo, cardápio de frutos do mar."),
        lugar("Tôa Tôa", "6 min de carro", "O beach club mais famoso de Porto Seguro. Luau nas sextas, das 21h às 3h."),
    ]),
)

S10 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">10</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % NL.join([
    lugar("Praia de Taperapuã", "7 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa. Na maré baixa formam-se piscinas naturais."),
    lugar("Reserva Pataxó da Jaqueira", "8 min de carro", "Aldeia na Mata Atlântica — danças, ritos e cultura indígena. Bom programa de manhã."),
    lugar("Coroa Vermelha", "15 min de carro", "Marco do Descobrimento, Feirinha Pataxó e o Caminho de Moisés na maré baixa."),
    lugar("Centro Histórico", "16 min de carro", "Museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "16 min de carro", "Vida noturna, artesanato e barracas de drink."),
    lugar("Trancoso e Praia do Espelho", "dia inteiro", "Saída pela manhã, volta à noite. O Quadrado de Trancoso e as falésias do Espelho."),
])

S11 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">11</span> Regras da casa e check-out</h2>
    <ul class="lista">
      <li>Silêncio das 23h às 6h. A casa fica em rua residencial — os vizinhos moram ali.</li>
      <li>Não é permitido fumar dentro dos quartos.</li>
      <li><strong>Pets são bem-vindos.</strong></li>
      <li>Crianças de 2 a 12 anos e bebês são bem-vindos — mas não há berço.</li>
    </ul>
    <h3 class="sub-h">Antes de sair, até as 12h</h3>
    <ul class="lista-check">
      <li>Devolva as chaves ao proprietário <span class="ph">confirmar</span></li>
      <li>Feche as janelas e desligue os ares-condicionados</li>
      <li>Apague bem a churrasqueira, se tiver usado</li>
      <li>Confira os seis quartos e os quatro banheiros — num grupo grande, sempre fica alguma coisa</li>
      <li>Avise o plantão que vocês já saíram</li>
    </ul>
  </section>'''

S12 = '''<section class="sec junto">
    <h2 class="sec-h"><span class="sec-n">12</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a> — seu único contato no local</td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Farmácia</th><td>Farmácia Taperapuan — 3 min de carro</td></tr>
      <tr><th>Hospital mais próximo</th><td>Hospital Professor José Maria Guimarães, em Santa Cruz Cabrália — 15 min de carro</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — 18 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas, no centro — 16 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 7 min de carro</td></tr>
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
