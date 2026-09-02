# Modelo: Botão flutuante de WhatsApp com captura de lead

Widget reutilizável pra qualquer cliente: botão flutuante que abre um painel
lateral pra captar Nome, Telefone e (opcionalmente) uma unidade/loja/serviço
antes de redirecionar o lead pro WhatsApp certo. Grava cada envio numa
planilha do Google Sheets (com Page Path, Título da Página e UTMs) e dispara
`fbq('track', 'Lead')` + `gtag('event', 'generate_lead')` se o site já tiver
Meta Pixel e GA4 instalados.

Baseado no que foi construído pra 4 Way Travel (ver
`clientes/4 Way Travel/Site - Botao WhatsApp/`).

## Arquivos deste modelo

- `whatsapp-widget.template.js` — widget completo, com um objeto `CONFIG` no
  topo pra customizar por cliente.
- `google-apps-script.template.gs` — código que recebe os dados e grava na
  planilha, também com `CONFIG` no topo.

## Como usar pra um cliente novo

### 1. Copiar a pasta

Copie esta pasta inteira pra dentro do cliente, por exemplo:

```
clientes/<nome-do-cliente>/Site - Botao WhatsApp/
```

Renomeie os arquivos, tirando `.template`:
- `whatsapp-widget.template.js` → `whatsapp-widget.js`
- `google-apps-script.template.gs` → `google-apps-script.gs`

### 2. Preencher o CONFIG do widget (`whatsapp-widget.js`)

```js
var CONFIG = {
  gasWebAppUrl: "...",       // preenche depois de publicar o Apps Script (passo 4)
  panelTitle: "Fale com a gente",
  panelSubtitle: "Responderemos pelo WhatsApp",
  primaryColorStart: "#57d163",   // pode trocar pela cor da marca do cliente
  primaryColorEnd: "#23b33a",

  unitField: {
    enabled: true,   // false se o cliente só tem um WhatsApp/local
    label: "Unidade mais próxima",
    options: {
      "Nome da unidade": "5511999999999"
      // um por linha, número no formato DDI+DDD+número, só dígitos
    }
  },

  defaultWhatsappNumber: "5511999999999", // usado só quando unitField.enabled = false

  buildWhatsappMessage: function (nome, unidade) {
    // customize a mensagem pré-preenchida do WhatsApp aqui
    return "Olá! Meu nome é " + nome + " e tenho interesse em " + unidade + ".";
  }
};
```

**Se o cliente tem só uma unidade/loja/WhatsApp:** deixe
`unitField.enabled: false`. O campo de seleção some do formulário
automaticamente e todo mundo é redirecionado pra `defaultWhatsappNumber`.

**Se o campo de seleção não é "unidade"** (pode ser "tipo de serviço",
"especialidade", "produto de interesse" etc.), só trocar o `label` — o nome
interno da variável (`unidade`) continua sendo usado no código e na planilha,
mas o texto visível pro usuário é o que estiver em `label`.

### 3. Preencher o CONFIG do Apps Script (`google-apps-script.gs`)

```js
var CONFIG = {
  sheetName: "Leads",
  unitColumnName: "Unidade"   // ajuste pro nome que fizer sentido (ex: "Loja", "Serviço")
};
```

### 4. Publicar o Apps Script

1. Crie (ou use) uma planilha do Google Sheets do cliente.
2. Vá em **Extensões > Apps Script**, apague o conteúdo padrão e cole o
   conteúdo de `google-apps-script.gs`.
3. Salve o projeto.
4. Clique em **Implantar > Nova implantação > App da Web**.
5. Configure: **Executar como:** Eu — **Quem pode acessar:** Qualquer pessoa.
6. Implante, autorize as permissões e copie a **URL do app da Web** (termina
   em `/exec`).
7. Cole essa URL em `gasWebAppUrl` no `whatsapp-widget.js`.

### 5. Instalar no site do cliente

```html
<script src="whatsapp-widget.js" defer></script>
```

Antes do `</body>`, em todas as páginas onde o botão deve aparecer.

### 6. Testar

1. Clique no botão flutuante, preencha o formulário e envie.
2. Confirme que o WhatsApp abre no número certo, com a mensagem certa.
3. Confirme que a linha aparece na aba "Leads" da planilha.
4. Se o site já tiver Meta Pixel/GA4, confira com o Meta Pixel Helper e o Tag
   Assistant se os eventos `Lead` e `generate_lead` disparam.

## Tracking (já embutido, não precisa mexer)

O widget já dispara, no envio bem-sucedido:
- `fbq('track', 'Lead')` (Meta Pixel)
- `gtag('event', 'generate_lead', { unidade: '<valor selecionado>' })` (GA4)

Só funciona se `fbq`/`gtag` já estiverem carregados no site do cliente — o
widget não instala esses scripts, só dispara os eventos se eles já existirem
na página. Sem eles, aparece um aviso no console, mas o resto do fluxo
continua normal.

## Coisas que quase sempre mudam de cliente pra cliente

- `gasWebAppUrl` (sempre)
- `unitField.options` (sempre, se `enabled: true`)
- `unitField.enabled` (false se for negócio de local único)
- `primaryColorStart` / `primaryColorEnd` (se quiser bater com a marca do cliente)
- `unitColumnName` no Apps Script (se o campo não for "unidade")
