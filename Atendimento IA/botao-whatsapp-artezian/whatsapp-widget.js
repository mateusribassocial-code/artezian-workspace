/**
 * Botão flutuante de WhatsApp com captura de lead — site artezian.com.br
 *
 * Baseado no modelo em `botao-whatsapp/` (Atendimento IA). Coleta Nome e
 * Telefone antes de redirecionar pro WhatsApp da Artezian. Também rastreia
 * a origem do lead (UTMs, fbclid/gclid) e dispara eventos de conversão pro
 * Meta Ads (Pixel + CAPI server-side) e pro Google Ads/GA4 via dataLayer
 * (evento "w4w_lead" — configure o Trigger + Tag no Google Tag Manager,
 * veja o README.md).
 */
(function () {
  "use strict";

  // ======= CONFIGURAÇÃO =======
  var CONFIG = {
    // URL do Web App do Google Apps Script (veja google-apps-script.gs e README.md)
    gasWebAppUrl: "https://script.google.com/macros/s/AKfycbx0aaqXexzQ6RhxKEUiOJ5ta7-rjIqxO3BleYz7wG56cwzAXbfmuEPgMTFEWnAco9Ir/exec",

    // Textos do cabeçalho do painel
    panelTitle: "Fale com o João",
    panelSubtitle: "Finalize a sua reserva pelo Whatsapp",

    // Cores do botão e do cabeçalho do painel (gradiente). Verde padrão do WhatsApp.
    primaryColorStart: "#57d163",
    primaryColorEnd: "#23b33a",

    // Número de WhatsApp da Artezian (DDI+DDD+número, só dígitos)
    whatsappNumber: "5573999373474",

    // Mensagem pré-preenchida ao abrir o WhatsApp
    buildWhatsappMessage: function (nome) {
      return "Olá! Meu nome é " + nome + ", vim pelo site da Artezian e gostaria de mais informações.";
    },

    // Conjunto de dados (Pixel) do Meta — usado pra Advanced Matching no evento Lead.
    // O Access Token da Conversions API fica só no Apps Script (Script Properties), nunca aqui.
    metaPixelId: "2071021410088369"

    // O Conversion ID/Label do Google Ads (AW-17423418092 / FwWjCJLN18EcEOyFkfRA)
    // NÃO fica aqui — é configurado direto na Tag do Google Tag Manager (veja README.md).
    // O widget só empurra o evento "w4w_lead" pro dataLayer; quem decide o que
    // disparar com ele é o próprio GTM.
  };
  // ======= FIM DA CONFIGURAÇÃO =======

  var ATTRIBUTION_STORAGE_KEY = "w4w_attribution";

  var CSS = ""
    + ".w4w-fab{position:fixed!important;right:24px!important;bottom:24px!important;"
    + "width:64px!important;height:64px!important;box-sizing:border-box!important;border-radius:50%!important;"
    + "background:linear-gradient(135deg," + CONFIG.primaryColorStart + "," + CONFIG.primaryColorEnd + ");"
    + "box-shadow:0 10px 25px rgba(37,211,102,.4);"
    + "display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:999998;"
    + "border:none;transition:transform .2s ease,box-shadow .2s ease;}"
    + ".w4w-fab:hover{transform:scale(1.08);box-shadow:0 12px 30px rgba(37,211,102,.5);}"
    + ".w4w-fab svg{width:34px!important;height:34px!important;max-width:none!important;}"
    + ".w4w-panel{position:fixed!important;right:24px!important;bottom:100px!important;"
    + "width:320px!important;max-width:calc(100vw - 32px)!important;box-sizing:border-box!important;"
    + "background:#fff;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.18);z-index:999999;"
    + "overflow:hidden;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;"
    + "transition:opacity .25s ease,transform .25s ease;"
    + "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    + ".w4w-panel.w4w-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}"
    + ".w4w-header{background:linear-gradient(135deg," + CONFIG.primaryColorStart + "," + CONFIG.primaryColorEnd + ");"
    + "color:#fff;padding:18px 20px;display:flex;align-items:center;gap:12px;box-sizing:border-box;}"
    + ".w4w-header-icon{width:36px!important;height:36px!important;box-sizing:border-box!important;"
    + "border-radius:50%!important;background:rgba(255,255,255,.2);"
    + "display:flex;align-items:center;justify-content:center;flex:none;}"
    + ".w4w-header-icon svg{width:22px!important;height:22px!important;max-width:none!important;}"
    + ".w4w-header-text{flex:1;}"
    + ".w4w-header strong{font-size:15px;display:block;}"
    + ".w4w-header span{font-size:12px;opacity:.9;display:block;margin-top:2px;}"
    + ".w4w-close{background:none;border:none;color:#fff;font-size:20px;line-height:1;cursor:pointer;"
    + "padding:6px;border-radius:50%;flex:none;transition:background .15s ease;}"
    + ".w4w-close:hover{background:rgba(255,255,255,.2);}"
    + ".w4w-body{padding:20px;}"
    + ".w4w-field{margin-bottom:14px;}"
    + ".w4w-field label{display:block;font-size:12px;color:#333;margin-bottom:6px;font-weight:600;}"
    + ".w4w-field input,.w4w-field select{width:100%;box-sizing:border-box;padding:12px 14px;"
    + "border:1px solid #e3e5e8;border-radius:12px;font-size:14px;color:#111;background:#f7f8fa;"
    + "transition:border-color .15s ease,box-shadow .15s ease;}"
    + ".w4w-field input:focus,.w4w-field select:focus{outline:none;border-color:" + CONFIG.primaryColorEnd + ";"
    + "box-shadow:0 0 0 3px rgba(37,211,102,.15);background:#fff;}"
    + ".w4w-error{color:#d32f2f;font-size:11px;margin-top:5px;display:none;}"
    + ".w4w-field.w4w-invalid input,.w4w-field.w4w-invalid select{border-color:#d32f2f;}"
    + ".w4w-field.w4w-invalid .w4w-error{display:block;}"
    + ".w4w-submit{width:100%;background:linear-gradient(135deg," + CONFIG.primaryColorStart + "," + CONFIG.primaryColorEnd + ");"
    + "color:#fff;border:none;border-radius:999px;padding:13px;font-size:14px;font-weight:600;cursor:pointer;"
    + "transition:filter .2s ease,transform .1s ease;}"
    + ".w4w-submit:hover{filter:brightness(1.05);}"
    + ".w4w-submit:active{transform:scale(.98);}"
    + ".w4w-submit:disabled{opacity:.6;cursor:default;}"
    + "@media (max-width:400px){.w4w-panel{right:16px;bottom:92px;}.w4w-fab{right:16px;bottom:16px;}}";

  var WHATSAPP_ICON_SVG = ""
    + '<svg viewBox="0 0 175.216 175.552" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><linearGradient id="w4wIconGrad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">'
    + '<stop offset="0" stop-color="#57d163"/><stop offset="1" stop-color="#23b33a"/>'
    + '</linearGradient></defs>'
    + '<path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>'
    + '<path fill="url(#w4wIconGrad)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>'
    + '<path fill="#fff" fill-rule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>'
    + '</svg>';

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) e.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function formatPhone(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10) {
      return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    }
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
  }

  function setInvalid(fieldEl, invalid) {
    fieldEl.classList.toggle("w4w-invalid", invalid);
  }

  function getProductName() {
    var node = document.querySelector("[data-w4w-produto]");
    return node ? node.getAttribute("data-w4w-produto").trim() : "";
  }

  function buildWhatsappUrl(nome) {
    var texto = CONFIG.buildWhatsappMessage(nome);
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(texto);
  }

  // ---- Atribuição (UTMs + click IDs), persistida entre páginas ----

  function readStoredAttribution() {
    try {
      var raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function writeStoredAttribution(data) {
    try {
      window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // localStorage indisponível (modo privado, cookies bloqueados etc.) — segue sem persistir.
    }
  }

  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = readStoredAttribution();

    var fromUrl = {
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmTerm: params.get("utm_term"),
      utmContent: params.get("utm_content"),
      fbclid: params.get("fbclid"),
      gclid: params.get("gclid"),
      gbraid: params.get("gbraid"),
      wbraid: params.get("wbraid")
    };

    var hasNewClick = !!(fromUrl.fbclid || fromUrl.gclid || fromUrl.gbraid || fromUrl.wbraid || fromUrl.utmSource);

    var merged = {
      utmSource: (hasNewClick ? fromUrl.utmSource : stored.utmSource) || "",
      utmMedium: (hasNewClick ? fromUrl.utmMedium : stored.utmMedium) || "",
      utmCampaign: (hasNewClick ? fromUrl.utmCampaign : stored.utmCampaign) || "",
      utmTerm: (hasNewClick ? fromUrl.utmTerm : stored.utmTerm) || "",
      utmContent: (hasNewClick ? fromUrl.utmContent : stored.utmContent) || "",
      fbclid: fromUrl.fbclid || stored.fbclid || "",
      gclid: fromUrl.gclid || stored.gclid || "",
      gbraid: fromUrl.gbraid || stored.gbraid || "",
      wbraid: fromUrl.wbraid || stored.wbraid || "",
      referrer: hasNewClick ? (document.referrer || "") : (stored.referrer || document.referrer || "")
    };

    writeStoredAttribution(merged);
    return merged;
  }

  // ---- Matching de usuário pro Meta (Advanced Matching) e Google (Enhanced Conversions) ----

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getOrBuildFbc(fbclid) {
    var existing = getCookie("_fbc");
    if (existing) return existing;
    if (!fbclid) return "";
    return "fb.1." + Date.now() + "." + fbclid;
  }

  function normalizePhoneE164(digits) {
    return "55" + digits;
  }

  function stripAccents(value) {
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  }

  function firstName(nome) {
    var first = nome.trim().split(/\s+/)[0] || "";
    return stripAccents(first).toLowerCase();
  }

  function sha256Hex(message) {
    if (!window.crypto || !window.crypto.subtle || !message) return Promise.resolve("");
    var data = new TextEncoder().encode(message);
    return window.crypto.subtle.digest("SHA-256", data).then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      var hex = "";
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
      }
      return hex;
    }).catch(function () {
      return "";
    });
  }

  function generateEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "w4w-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  // ---- Disparo de eventos de conversão ----

  function trackConversion(params) {
    if (typeof window.fbq === "function") {
      var advancedMatching = {};
      if (params.hashedPhone) advancedMatching.ph = params.hashedPhone;
      if (params.hashedFirstName) advancedMatching.fn = params.hashedFirstName;
      window.fbq("init", CONFIG.metaPixelId, advancedMatching);
      window.fbq("track", "Lead", { content_name: params.produto }, { eventID: params.eventId });
    } else {
      console.warn("[whatsapp-widget] fbq não encontrado — evento Lead do Meta Pixel não disparado.");
    }

    // Google Ads/GA4 são geridos pelo GTM — o widget só empurra o evento pro
    // dataLayer. O Trigger + Tag de conversão ficam configurados no GTM (README.md).
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "w4w_lead",
      eventId: params.eventId,
      produto: params.produto,
      user_data: {
        phone_number: "+" + params.phoneE164
      }
    });
  }

  function sendToSheet(payload) {
    if (!CONFIG.gasWebAppUrl || CONFIG.gasWebAppUrl.indexOf("COLE_AQUI") === 0) {
      console.warn("[whatsapp-widget] gasWebAppUrl não configurada. Lead não foi salvo na planilha.");
      return Promise.resolve();
    }
    return fetch(CONFIG.gasWebAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).catch(function (err) {
      console.error("[whatsapp-widget] Falha ao enviar lead para a planilha:", err);
    });
  }

  function init() {
    var style = el("style", { id: "w4w-styles" }, CSS);
    document.head.appendChild(style);

    var fab = el("button", { class: "w4w-fab", type: "button", "aria-label": "Fale conosco pelo WhatsApp" }, WHATSAPP_ICON_SVG);

    var panel = el("div", { class: "w4w-panel" }, ""
      + '<div class="w4w-header">'
      + '<div class="w4w-header-icon">' + WHATSAPP_ICON_SVG + "</div>"
      + '<div class="w4w-header-text"><strong>' + CONFIG.panelTitle + "</strong><span>" + CONFIG.panelSubtitle + "</span></div>"
      + '<button type="button" class="w4w-close" aria-label="Fechar">&times;</button>'
      + "</div>"
      + '<div class="w4w-body">'
      + '<form class="w4w-form" novalidate>'
      + '<div class="w4w-field" data-field="nome">'
      + "<label>Nome</label>"
      + '<input type="text" name="nome" autocomplete="name" />'
      + '<div class="w4w-error">Informe seu nome.</div>'
      + "</div>"
      + '<div class="w4w-field" data-field="telefone">'
      + "<label>Telefone</label>"
      + '<input type="tel" name="telefone" autocomplete="tel" placeholder="(11) 99999-9999" />'
      + '<div class="w4w-error">Informe um telefone válido.</div>'
      + "</div>"
      + '<button type="submit" class="w4w-submit">Entrar em contato</button>'
      + "</form>"
      + "</div>");

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var form = panel.querySelector(".w4w-form");
    var nomeField = form.querySelector('[name="nome"]');
    var telefoneField = form.querySelector('[name="telefone"]');
    var submitBtn = form.querySelector(".w4w-submit");

    function togglePanel(open) {
      panel.classList.toggle("w4w-open", open);
    }

    fab.addEventListener("click", function () {
      togglePanel(!panel.classList.contains("w4w-open"));
    });
    panel.querySelector(".w4w-close").addEventListener("click", function () {
      togglePanel(false);
    });

    telefoneField.addEventListener("input", function () {
      telefoneField.value = formatPhone(telefoneField.value);
    });

    document.addEventListener("click", function (e) {
      if (panel.classList.contains("w4w-open") && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        togglePanel(false);
      }
    });

    // Captura fbclid/gclid/UTMs assim que o widget carrega, mesmo antes do envio do formulário.
    getAttribution();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nome = nomeField.value.trim();
      var telefone = telefoneField.value.trim();
      var telefoneDigits = telefone.replace(/\D/g, "");

      var nomeInvalid = nome.length < 2;
      var telefoneInvalid = telefoneDigits.length < 10;

      setInvalid(nomeField.closest(".w4w-field"), nomeInvalid);
      setInvalid(telefoneField.closest(".w4w-field"), telefoneInvalid);

      if (nomeInvalid || telefoneInvalid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      var produto = getProductName();
      var attribution = getAttribution();
      var eventId = generateEventId();
      var phoneE164 = normalizePhoneE164(telefoneDigits);
      var fbc = getOrBuildFbc(attribution.fbclid);
      var fbp = getCookie("_fbp");

      Promise.all([
        sha256Hex(phoneE164),
        sha256Hex(firstName(nome))
      ]).then(function (hashes) {
        var hashedPhone = hashes[0];
        var hashedFirstName = hashes[1];

        trackConversion({
          eventId: eventId,
          produto: produto,
          phoneE164: phoneE164,
          hashedPhone: hashedPhone,
          hashedFirstName: hashedFirstName
        });

        var payload = {
          nome: nome,
          telefone: telefone,
          produto: produto,
          pagePath: window.location.pathname,
          pageUrl: window.location.href,
          pageTitle: document.title,
          referrer: attribution.referrer,
          utmSource: attribution.utmSource,
          utmMedium: attribution.utmMedium,
          utmCampaign: attribution.utmCampaign,
          utmTerm: attribution.utmTerm,
          utmContent: attribution.utmContent,
          fbclid: attribution.fbclid,
          gclid: attribution.gclid,
          gbraid: attribution.gbraid,
          wbraid: attribution.wbraid,
          fbp: fbp,
          fbc: fbc,
          eventId: eventId,
          hashedPhone: hashedPhone,
          hashedFirstName: hashedFirstName,
          userAgent: navigator.userAgent
        };

        return sendToSheet(payload);
      }).finally(function () {
        var url = buildWhatsappUrl(nome);
        window.open(url, "_blank");

        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar em contato";
        togglePanel(false);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
