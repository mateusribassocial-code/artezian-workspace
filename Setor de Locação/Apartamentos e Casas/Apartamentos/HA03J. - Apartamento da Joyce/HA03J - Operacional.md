# Operacional — HA03J Apartamento da Joyce

> Rua do Telégrafo, Taperapuã — Porto Seguro (BA).
> Levantado em 06/09/2026.

**Fontes:** `HA03J - Descricao_Joyce.txt`, artezian.com.br/pt/apartment/HA03J, Nominatim/OpenStreetMap.

---

## 🚫 Bloqueio: não dá pra gerar a seção da região ainda

O endereço da descrição é **Rua do Telégrafo, 1833**. O geocoder só resolve o centro da rua (`-16.3891476, -39.0408377`), que fica a **99m do FL10J** — e isso não pode estar certo:

| Referência | Distância do centro da rua | O que o site da Artezian diz |
|---|---|---|
| Cabana Malibu | 1.290m | ~500m |
| Praia de Taperapuã | ~400m | ~400m |

Se a Malibu está a 500m de verdade, a unidade fica **cerca de 800m ao sul** do ponto que o geocoder retornou. Usar as distâncias do FL10J transformaria "16 min a pé" em "6 min a pé" no manual.

**Preciso do link do Google Maps do condomínio**, como nos outros dois. Sem ele, as seções 08 (mercado e farmácia), 09 (onde comer) e 10 (o que fazer) não podem ser escritas com número nenhum.

---

## ⚠️ Divergências entre a descrição e o site

| # | Item | Descrição local | Site da Artezian |
|---|---|---|---|
| 1 | **Quartos** | "2 Suítes + 1 Quarto" e "Sala e 3 Quartos" | "3 suítes (1 no térreo)", **4 banheiros** |
| 2 | **Número na rua** | 1833 | 1800 |
| 3 | **Praia** | "Taperapuã (acesso direto)" | **~400m da praia** |
| 4 | **Camas** | 2 casal + 4 solteiro + sofá-cama | 2 casal + 4 solteiro |

> A frase "acesso direto à praia" é a mesma que apareceu errada no FL10J (lá deu 392m). Aqui o **próprio site da Artezian** já contradiz a descrição. Vale corrigir o `.txt` de origem.

---

## Identificação
| Dado | Valor | Fonte |
|---|---|---|
| Código | HA03J | |
| Nome | Apartamento da Joyce | |
| Título no site | "Flat próximo da praia, 3 Suítes até 8 Pessoas" | site |
| Capacidade | Até 8 pessoas | ambos concordam |
| Banheiros | 4 | site |
| Vídeo | https://www.instagram.com/p/DIllZd2ubXW/ | descrição |
| Endereço | Rua do Telégrafo, 1833 — Taperapuã, Porto Seguro/BA · CEP 45810-000 | descrição |
| Condomínio | ⬜ **PENDENTE — nome desconhecido.** Nenhuma fonte informa. | |

## Já confirmado pelo site (não precisa perguntar)
| Item | Valor |
|---|---|
| Check-in | Das 15h às 22h |
| Check-out | Das 6h às 12h |
| Silêncio | Das 22h às 6h |
| Fumar dentro | Proibido |
| Festas e eventos | Proibidos |
| Crianças | De 2 a 12 anos aceitas; bebês aceitos; **sem berço** |
| **Pets** | **NÃO permitidos** — confirmado pelo Mateus em 06/09/2026. Diferente do GC01J. |
| Vagas de garagem | 2, gratuitas |
| Ar-condicionado | Em todos os quartos |
| Cozinha | Completa — fogão, forno, micro-ondas, geladeira |
| **Máquina de lavar** | Sim, com varal |
| Smart TV | Sim |
| Wi-Fi | Sim |
| Churrasqueira | Privativa |
| Chuveiro externo | Sim |
| Água quente | Sim |
| Ventiladores de teto | Sim |
| Sofá-cama | Sim, na área comum |

## ⬜ Pendente — só a Artezian tem

| Item | Pergunta |
|---|---|
| **Link do Maps** | ⚠️ O link enviado (`share.google/4ymRn0vK1hC5uxdsk`) é uma **busca de endereço**, não um pin de lugar: resolve para `R. do Telégrafo, 1833 - Porto Seguro, BA, 45810-000` e o Google devolve CAPTCHA. Nenhum geocoder (Nominatim, Photon) resolve o número 1833 — a Rua do Telégrafo tem **6,3 km** e o OSM não tem pontos de endereço nela. Preciso de um link `maps.app.goo.gl/...` ou das coordenadas. |
| **Nome do condomínio** | Vai na tabela da reserva e na referência do "Como chegar" |
| **Tem portaria 24h?** | A descrição **não** lista portaria na área de lazer, ao contrário do FL10J e do GC01J. Se não tiver, o check-in não pode dizer "retire a chave na portaria" — muda o passo a passo inteiro |
| Retirada da chave | Mateus disse: *"a chave é liberada mediante campanha digital"*. ⬜ **Não entendi o termo** — ver bloco abaixo. |
| Nome na lista / documento | Se houver portaria |
| Número da unidade e andar | Site diz "1 suíte no térreo" — é duplex como os outros? |
| Wi-Fi | Rede e senha, ou "pegar na portaria" |
| Toalhas de banho e roupa de cama | Inclusas? |
| Voltagem | 220V? |
| Piscina | Horário |
| Churrasqueira coletiva | Existe? Precisa agendar? |
| Check-out | O que fazer com a chave |
| Lixo | Onde deixar |

## Fotos
12 arquivos em `Fotos/`. Selecionadas 8: piscina com área externa (capa), sala com TV e cozinha americana, estar com bancada, cozinha, suíte de casal, quarto com duas camas de solteiro, banheiro e churrasqueira privativa.


---

## ⬜ "Chave liberada mediante campanha digital"

Essa é a instrução mais importante do manual inteiro: se o hóspede não conseguir entrar, é o único erro que não tem contorno às 22h de um domingo. Não vou escrever um passo a passo baseado em palpite.

Leituras possíveis do termo:

| Hipótese | O que iria pro manual |
|---|---|
| **Fechadura digital** | "O apartamento tem fechadura digital. Sua senha é X, enviada no dia da chegada." |
| **Campainha digital / interfone** | "Toque a campainha na entrada e a gente libera remotamente." |
| **Caução digital** | "A chave é liberada após a confirmação da caução, feita por link antes da chegada." |
| **Confirmação de pagamento** | "A chave é liberada depois que o pagamento restante for confirmado no Pix." |

As quatro geram passos completamente diferentes — e a última tem implicação a mais: seria a única das três unidades onde o hóspede precisa resolver algo **antes** de chegar.
