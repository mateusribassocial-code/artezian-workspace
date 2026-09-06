# -*- coding: utf-8 -*-
"""Gera o Manual do Hospede do FL10J (Apartamento do Reinaldo).

Fontes:
  FL10J - Descricao_Reinaldo.txt      -> capacidade, endereco, caracteristicas
  Moradas de Israel - Condominio.md   -> portaria, chave, plantao
  FL10J - Operacional.md              -> unidade, vagas
  vizinhanca-imoveis.md               -> regiao + conveniencia medida por OSM
Rodar da raiz do workspace.
"""
import io, os, base64
from PIL import Image
import segno

BASE = "Setor de Locação/Apartamentos e Casas/Apartamentos/FL10J. - Apartamento do Reinaldo"
FOTOS = os.path.join(BASE, "Fotos")
SCAFFOLD = ".claude/skills/manual-hospede/assets/base-a4.html"
SAIDA = os.path.join(BASE, "FL10J - Manual do Hospede.html")

NOME = "Apartamento do Reinaldo"
CODIGO = "FL10J"
WPP_FMT = "(73) 9937-3474"
WPP_LINK = "557399373474"
MAPS = "https://maps.app.goo.gl/JUioonaZvquy4N9QA"


def datauri(nome, larg=1200, q=78):
    im = Image.open(os.path.join(FOTOS, nome)).convert("RGB")
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


SELECAO = [
    ("8b246d8a-aa78-4ea6-820c-7d02ea6383e7.jpeg", "Vista da varanda para a piscina do condomínio", True),
    ("FL10J-2.jpeg", "Sala de estar e mesa de jantar", False),
    ("FL10J-1.jpeg", "Sala com TV e escada para o segundo andar", False),
    ("d1924202-ccef-4af3-b56c-d331e719009e.jpeg", "Bancada da cozinha", False),
    ("02992ff9-1362-485f-bfdb-3ce3d4682ba5.jpeg", "Cozinha completa, com geladeira e fogão", False),
    ("FL10J-3.jpeg", "Suíte com cama de casal", False),
    ("2d8df5b3-ba01-4f29-a7c3-54f57d4b2e95.jpeg", "Suíte com camas de solteiro", False),
    ("FL10J-5.jpeg", "Churrasqueira privativa", False),
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
    <div class="capa-sub">Apartamento 3 suítes · até 11 pessoas · Taperapuã, Porto Seguro</div>
    <div class="capa-codigo">%s</div>
    <div class="capa-marca">
      <div class="capa-marca-nome">Artezian</div>
      <div class="capa-marca-sub">Real Estate Atelie</div>
    </div>
  </header>''' % (NOME, CODIGO)

S01 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">01</span> Sua reserva</h2>
    <div class="destaque-duplo">
      <div class="destaque"><div class="destaque-l">Check-in</div><div class="destaque-v">a partir das 15h</div></div>
      <div class="destaque"><div class="destaque-l">Check-out</div><div class="destaque-v">até as 12h</div></div>
    </div>
    <table class="tab">
      <tr><th>Endereço</th><td>R. dos Ipês, 85 — Taperapuã<br>Porto Seguro, BA · CEP 45810-000</td></tr>
      <tr><th>Condomínio</th><td>Residencial Moradas de Israel — Tonziro</td></tr>
      <tr><th>Unidade</th><td>Apto 04</td></tr>
      <tr><th>Capacidade</th><td>Até 11 pessoas — 3 suítes e sofá-cama na sala</td></tr>
      <tr><th>Garagem</th><td>2 vagas</td></tr>
      <tr><th>Praia</th><td>Taperapuã, 6 minutos a pé</td></tr>
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a> <span class="ph">conferir número</span></td></tr>
    </table>
  </section>''' % (WPP_LINK, WPP_FMT)

S02 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">02</span> Como chegar</h2>
    <div class="mapa-linha">
      <div class="mapa-txt">
        <p class="end">R. dos Ipês, 85 — Taperapuã, Porto Seguro (BA)</p>
        <p class="ref">Referência: Residencial Moradas de Israel — Tonziro. O Axé Moi fica a 7 minutos a pé.</p>
        <ul class="lista">
          <li><strong>Do aeroporto:</strong> 10 minutos de carro</li>
          <li><strong>Do Centro Histórico:</strong> cerca de 20 minutos de carro</li>
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
      <li><strong>Chegue a partir das 15h.</strong> Antes disso a gente tenta liberar, mas depende da saída do hóspede anterior — não dá para garantir. Avise o plantão se for chegar depois das 22h.</li>
      <li><strong>Pare na portaria e informe o nome do responsável pela reserva.</strong> Seu nome já está na lista.</li>
      <li><strong>Apresente um documento com foto.</strong> RG, CNH ou passaporte. Sem documento a portaria não libera a entrada.</li>
      <li><strong>Retire a chave na própria portaria.</strong> Não há cofre nem fechadura com senha — a chave é entregue na mão.</li>
      <li><strong>Estacione nas vagas do apartamento.</strong> São 2 vagas. <span class="ph">confirmar numeração</span></li>
      <li><strong>Suba para o Apto 04.</strong> <span class="ph">confirmar andar</span></li>
    </ol>
    <div class="aviso">Qualquer coisa fora do previsto — atraso no voo, portaria sem a sua reserva, chave que não abre — chame o plantão da Artezian no WhatsApp <strong>%s</strong> <span class="ph">conferir número</span>. Não fique esperando na portaria sem falar com a gente.</div>
  </section>''' % WPP_FMT

S04 = '''<section class="sec quebra-antes">
    <h2 class="sec-h"><span class="sec-n">04</span> O imóvel</h2>
    <div class="galeria">
      %s
    </div>
  </section>''' % GALERIA

S05 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">05</span> Mercado e farmácia</h2>
    <p class="ref">Chegando às 15h, essa costuma ser a primeira saída. Tudo abaixo dá para fazer a pé.</p>
    <div class="lugares">
%s
    </div>
    <div class="aviso"><strong>Não há farmácia 24h em Taperapuã.</strong> A mais próxima com plantão fica no centro, a cerca de 20 minutos de carro. Se você usa medicamento de uso contínuo, traga o suficiente para a viagem.</div>
  </section>''' % "\n".join([
    lugar("Litoral Supermercado", "5 min a pé", "O mais perto do condomínio. Resolve a compra da chegada — água, café, pão."),
    lugar("O Sampa", "5 min a pé", "Na mesma direção do Litoral. Alternativa se um estiver fechado."),
    lugar("BigStop", "3 min de carro", "O maior do entorno, para a compra da semana. Todo dia, das 8h às 22h."),
    lugar("Farmácia Taperapuan", "8 min a pé", "A farmácia da faixa da praia."),
])

S06 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">06</span> Onde comer e beber</h2>
%s
%s
%s
  </section>''' % (
    grupo("Pé na areia", [
        lugar("Colher de Pau", "6 min a pé", "Av. Beira Mar, 9500. Comida baiana na areia — moqueca, carne de sol, peixe. Mesas dentro e na praia, música ao vivo à noite. O mais perto e o mais conhecido da faixa."),
        lugar("Axé Moi", "7 min a pé", "Complexo de praia com dois palcos e programação das 10h às 17h30. É o vizinho do condomínio."),
        lugar("Barraca do Gaúcho", "14 min a pé", "Conhecida pelo churrasco rodízio na praia."),
        lugar("Cabana Malibu", "4 min de carro", "Clima mais familiar e tranquilo, cardápio de frutos do mar."),
    ]),
    grupo("Jantar sem pegar o carro", [
        lugar("Restaurante Marília", "3 min a pé", "O mais próximo do condomínio. Refeição rápida na esquina."),
        lugar("Esquina Jones", "4 min a pé", "Pizzaria. Boa saída para a primeira noite, quando ninguém quer cozinhar."),
    ]),
    grupo("Noite", [
        lugar("Tôa Tôa", "5 min de carro", "O beach club mais famoso de Porto Seguro. Axé ao vivo e luau nas sextas, das 21h às 3h."),
        lugar("Barramares", "5 min de carro", "Estrutura grande de praia, com programação de shows."),
    ]),
)

S07 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">07</span> O que fazer</h2>
    <div class="lugares">
%s
    </div>
  </section>''' % "\n".join([
    lugar("Praia de Taperapuã", "6 min a pé", "Mar calmo e 3 km de orla. Vôlei, frescobol, aulas de dança e barracas ao longo de toda a faixa."),
    lugar("Reserva da Jaqueira", "5 min de carro", "Aldeia pataxó na Mata Atlântica. Danças, cultura indígena e trilha. Bom programa de manhã."),
    lugar("Praia do Mutá", "10 min de carro", "Águas quentes e rasas, bem mais silenciosa que Taperapuã. Boa com crianças pequenas."),
    lugar("Centro Histórico", "20 min de carro", "Marco do Descobrimento, museus e vista da cidade alta. Vá no fim da tarde."),
    lugar("Passarela do Álcool", "20 min de carro", "Vida noturna, artesanato e barracas de drink. Abre no fim da tarde."),
    lugar("Praia do Espelho e Trancoso", "dia inteiro", "Saída pela manhã, volta à noite. Falésias, vilarejo histórico e o Quadrado de Trancoso."),
])

S08 = '''<section class="sec">
    <h2 class="sec-h"><span class="sec-n">08</span> Se precisar</h2>
    <table class="tab">
      <tr><th>Plantão Artezian</th><td><a href="https://wa.me/%s">%s</a> <span class="ph">conferir número</span></td></tr>
      <tr><th>Emergências</th><td>190 polícia · 192 Samu · 193 bombeiros</td></tr>
      <tr><th>Hospital Regional</th><td>Deputado Luís Eduardo Magalhães — cerca de 18 min de carro</td></tr>
      <tr><th>Policlínica Municipal</th><td>Cerca de 15 min de carro</td></tr>
      <tr><th>Delegacia de Proteção ao Turista</th><td>Cerca de 18 min de carro</td></tr>
      <tr><th>Banco e caixa 24h</th><td>Banco do Brasil e Banco24Horas, no centro — cerca de 15 min de carro</td></tr>
      <tr><th>Posto de combustível</th><td>Posto Mundaí, aberto 24h — 5 min de carro</td></tr>
      <tr><th>Shopping</th><td>Porto Plaza Shopping — cerca de 15 min de carro</td></tr>
    </table>
    <div class="fecho">
      <p class="fecho-t">Boa estadia.</p>
      <p class="fecho-s">Se faltar qualquer coisa, chama a gente antes de resolver por conta.<br>É pra isso que a gente está aqui.</p>
    </div>
  </section>''' % (WPP_LINK, WPP_FMT)

SECOES = "\n\n  ".join([S01, S02, S03, S04, S05, S06, S07, S08])

html = io.open(SCAFFOLD, encoding="utf-8").read()
html = (html.replace("{{NOME_UNIDADE}}", NOME)
            .replace("{{CODIGO}}", CODIGO)
            .replace("{{WHATSAPP_FMT}}", WPP_FMT))
html = html.replace("  <!-- {{CAPA}} -->\n  <!-- {{SECOES}} -->", "  " + CAPA + "\n\n  " + SECOES)
io.open(SAIDA, "w", encoding="utf-8").write(html)

print("gerado:", SAIDA)
print("fotos: %d | peso das fotos: %.1f MB | arquivo final: %.1f MB"
      % (len(SELECAO), total / 1048576, os.path.getsize(SAIDA) / 1048576))
