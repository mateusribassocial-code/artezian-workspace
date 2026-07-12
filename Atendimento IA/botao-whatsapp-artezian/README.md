# Botão flutuante de WhatsApp — site artezian.com.br

Botão flutuante que abre um painel lateral pra captar Nome e Telefone
antes de redirecionar o lead pro WhatsApp da Artezian (`5573999373474`).
Grava cada envio numa planilha do Google Sheets (com Page Path, Título da
Página, UTMs e click IDs) e dispara o evento de conversão Lead pro Meta Ads
(Pixel + Conversions API server-side, se o site já tiver Meta Pixel
instalado) e empurra um evento `w4w_lead` pro `dataLayer` pro Google Tag
Manager processar (GA4 + Google Ads).

Gerado a partir do modelo em `../botao-whatsapp/`, sem o campo de
unidade/loja (a Artezian tem um único WhatsApp de atendimento).

## Passos pra colocar no ar

### 1. Publicar o Apps Script

1. Crie (ou use) uma planilha do Google Sheets pra guardar os leads do site.
2. Vá em **Extensões > Apps Script**, apague o conteúdo padrão e cole o
   conteúdo de `google-apps-script.gs`.
3. Salve o projeto.
4. Clique em **Implantar > Nova implantação > App da Web**.
5. Configure: **Executar como:** Eu — **Quem pode acessar:** Qualquer pessoa.
6. Implante, autorize as permissões e copie a **URL do app da Web** (termina
   em `/exec`).
7. Cole essa URL em `gasWebAppUrl` no `whatsapp-widget.js`.

### 2. Configurar o Access Token da Conversions API do Meta

Esse token **não fica no código** (evita vazar no histórico do git). Ele fica
guardado só no Apps Script:

1. No editor do Apps Script, clique no ícone de engrenagem **Configurações do
   projeto** (Project Settings).
2. Em **Propriedades do script** (Script Properties), clique **Adicionar
   propriedade do script**.
3. Nome da propriedade: `META_CAPI_ACCESS_TOKEN` — Valor: o token da
   Conversions API gerado no Gerenciador de Eventos do Meta.
4. Salve.

Sem essa propriedade configurada, o envio pro Meta CAPI é simplesmente
ignorado (com um aviso no log) — o resto do fluxo (planilha, WhatsApp,
Pixel client-side) continua funcionando normal.

### 3. Configurar o Trigger + Tag no Google Tag Manager

O widget não chama `gtag()` direto — ele empurra este evento pro
`dataLayer` a cada envio do formulário:

```js
{
  event: "w4w_lead",
  eventId: "<uuid gerado pelo widget>",
  produto: "<valor de data-w4w-produto, se existir>",
  user_data: {
    phone_number: "+55XXXXXXXXXXX"
  }
}
```

Dentro do container do GTM do site:

1. **Trigger** novo → tipo **Evento personalizado** → nome do evento:
   `w4w_lead`.
2. **Variável** nova (opcional, mas recomendada pra Enhanced Conversions) →
   tipo **Variável de camada de dados** → nome da variável de camada de
   dados: `user_data` → chame essa variável de algo como
   `DLV - user_data`.
3. **Tag** de conversão do Google Ads → tipo **Rastreamento de conversão do
   Google Ads** → Conversion ID `AW-17423418092`, Label
   `FwWjCJLN18EcEOyFkfRA` → acionador: o Trigger `w4w_lead` criado no passo 1
   → em **Enhanced Conversions**, marque "Definir variáveis manualmente" e
   selecione a variável `DLV - user_data` criada no passo 2.
4. (Opcional) **Tag** de evento GA4 → tipo **Evento do Google Analytics: GA4**
   → Configuration Tag: a tag de configuração do GA4 já existente no
   container → Nome do evento: `generate_lead` → acionador: o mesmo Trigger
   `w4w_lead`.
5. Publique o container (**Enviar**).

### 4. Instalar no site

```html
<script src="whatsapp-widget.js" defer></script>
```

Antes do `</body>`, em todas as páginas do site onde o botão deve aparecer.

### 5. Marcar o produto/imóvel da página (opcional)

Em páginas de produto/imóvel (ex: as landing pages em
`../../locacao/Landing Pages/casas/`), adicione o atributo
`data-w4w-produto` em qualquer elemento da página — o widget lê o primeiro
que encontrar e manda como campo "Produto", separado do Título da Página
(que continua pegando o `<title>` da aba, com todos os sufixos de SEO):

```html
<body data-w4w-produto="Casa do Euller">
```

ou, se preferir marcar só o wrapper principal do conteúdo:

```html
<main data-w4w-produto="Casa do Euller">
```

Se a página não tiver esse atributo, o campo "Produto" fica em branco na
planilha (o "Título da Página" continua sendo gravado normalmente).

### 6. Testar

1. Clique no botão flutuante, preencha Nome e Telefone, e envie.
2. Confirme que o WhatsApp abre no número certo (`5573999373474`), com a
   mensagem certa.
3. Confirme que a linha aparece na aba "Leads" da planilha, com a coluna
   "Produto" preenchida (se a página tiver o atributo `data-w4w-produto`) e as
   colunas de fbclid/gclid preenchidas quando o teste for feito a partir de um
   link de anúncio (ex: `?fbclid=teste123` ou `?gclid=teste123` na URL).
4. Use o **Preview** do GTM (Tag Assistant) e confirme que o evento
   `w4w_lead` aparece no dataLayer e que a Tag do Google Ads disparou nele.
5. Se o site já tiver Meta Pixel, confira com o Meta Pixel Helper se o
   evento `Lead` dispara.
6. No Gerenciador de Eventos do Meta, aba **Testar eventos**, confirme que o
   evento Lead chega tanto pelo **Navegador** (Pixel) quanto pelo **Servidor**
   (CAPI) com o mesmo Event ID, e que aparece como deduplicado.

## O que já vem pronto (não precisa mexer)

- Validação de Nome e Telefone no formulário.
- Formatação automática do telefone enquanto digita.
- Captura de UTMs e click IDs (`fbclid`, `gclid`, `gbraid`, `wbraid`) da URL,
  persistidos em localStorage — sobrevivem mesmo se o visitante navegar pra
  outra página do site antes de enviar o formulário.
- Evento `Lead` disparado pro Meta Pixel com Advanced Matching (telefone e
  primeiro nome hasheados em SHA-256).
- Evento `w4w_lead` empurrado pro `dataLayer` a cada envio, com Event ID,
  produto e telefone (em E.164) pronto pra Enhanced Conversions — quem decide
  o que disparar com ele é a configuração do GTM (passo 3 acima).
- Envio do mesmo evento Lead pra Conversions API do Meta (server-side, via
  Apps Script), com o mesmo Event ID do Pixel pra deduplicar automaticamente.
  Isso mantém o tracking funcionando mesmo com ad blocker ou Safari/iOS
  bloqueando o Pixel no navegador.
- O evento Meta só dispara se `fbq` já existir na página — sem ele, aparece
  um aviso no console, mas o resto do fluxo (planilha, WhatsApp, dataLayer)
  continua normal.

## O que ainda falta preencher

- `gasWebAppUrl` em `whatsapp-widget.js` (passo 1 acima).
- `META_CAPI_ACCESS_TOKEN` em Script Properties do Apps Script (passo 2 acima).
- Trigger + Tag do `w4w_lead` no container do GTM (passo 3 acima).

## Se o número de WhatsApp mudar

Edite `whatsappNumber` no objeto `CONFIG` de `whatsapp-widget.js`.

## Se o Pixel do Meta ou a conversão do Google Ads mudarem

- Pixel do Meta: edite `metaPixelId` tanto no `CONFIG` de `whatsapp-widget.js`
  quanto em `google-apps-script.gs`, e gere um novo Access Token de CAPI pro
  Script Properties (passo 2 acima).
- Conversion ID/Label do Google Ads: não fica no código — edite direto na Tag
  de conversão dentro do GTM (passo 3 acima).
