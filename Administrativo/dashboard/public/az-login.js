/* ───────────────────────────────────────────────────────────────────────────
   Tela de login do Painel Artezian.

   Cobre a página inteira enquanto não houver usuário autenticado e some
   sozinha quando houver. Como a sessão do Firebase vale para toda a origem,
   entrar aqui autentica também os painéis carregados em iframe.
   ─────────────────────────────────────────────────────────────────────────── */

import { aoMudarUsuario, entrar, sair, explicarErro } from './az-auth.js';

const CSS = `
.az-login-fundo {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: #14161b;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  padding: 24px;
}
.az-login-caixa {
  width: 100%; max-width: 340px;
  background: #1c1f26;
  border: 1px solid #2b2f38;
  border-radius: 10px;
  padding: 30px 28px;
  box-shadow: 0 18px 50px rgba(0,0,0,.45);
}
.az-login-marca {
  font-size: 17px; font-weight: 700; letter-spacing: .16em;
  color: #c2a14e; text-align: center;
}
.az-login-sub {
  font-size: 12px; color: #7d8493; text-align: center;
  margin-top: 4px; margin-bottom: 24px;
}
.az-login-campo { display: block; margin-bottom: 13px; }
.az-login-campo span {
  display: block; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
  color: #7d8493; margin-bottom: 5px; font-weight: 600;
}
.az-login-campo input {
  width: 100%; box-sizing: border-box;
  background: #14161b; border: 1px solid #2b2f38; border-radius: 6px;
  padding: 10px 12px; color: #e8eaee; font-size: 14px; font-family: inherit;
}
.az-login-campo input:focus { outline: none; border-color: #c2a14e; }
.az-login-btn {
  width: 100%; margin-top: 9px; padding: 11px;
  background: #c2a14e; color: #14161b;
  border: none; border-radius: 6px;
  font-family: inherit; font-size: 14px; font-weight: 700; letter-spacing: .03em;
  cursor: pointer; transition: background .15s;
}
.az-login-btn:hover:not(:disabled) { background: #d4b56a; }
.az-login-btn:disabled { opacity: .55; cursor: default; }
.az-login-erro {
  margin-top: 13px; font-size: 12.5px; color: #e0705f;
  text-align: center; line-height: 1.45; min-height: 1em;
}
.az-sessao {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 11.5px; color: #7d8493;
}
.az-sessao button {
  background: none; border: 1px solid #2b2f38; border-radius: 4px;
  color: #9aa1ae; font-family: inherit; font-size: 11px;
  padding: 3px 9px; cursor: pointer;
}
.az-sessao button:hover { color: #c2a14e; border-color: #c2a14e; }
`;

/**
 * Exige login antes de liberar a página.
 * @param {function} aoEntrar  chamado com o usuário assim que houver sessão
 * @param {string}   alvoSessao seletor onde mostrar "quem sou / sair" (opcional)
 */
export function exigirLogin({ aoEntrar, alvoSessao } = {}) {
  const estilo = document.createElement('style');
  estilo.textContent = CSS;
  document.head.appendChild(estilo);

  const fundo = document.createElement('div');
  fundo.className = 'az-login-fundo';
  fundo.innerHTML = `
    <form class="az-login-caixa" autocomplete="on">
      <div class="az-login-marca">ARTEZIAN</div>
      <div class="az-login-sub">Painel interno</div>
      <label class="az-login-campo">
        <span>E-mail</span>
        <input type="email" name="email" autocomplete="username" required />
      </label>
      <label class="az-login-campo">
        <span>Senha</span>
        <input type="password" name="senha" autocomplete="current-password" required />
      </label>
      <button class="az-login-btn" type="submit">Entrar</button>
      <div class="az-login-erro" role="alert"></div>
    </form>`;

  const form  = fundo.querySelector('form');
  const btn   = fundo.querySelector('.az-login-btn');
  const erro  = fundo.querySelector('.az-login-erro');
  let montado = false;

  function mostrar() {
    if (!montado) { document.body.appendChild(fundo); montado = true; }
    fundo.style.display = 'flex';
    const campo = fundo.querySelector('input[name=email]');
    if (campo) campo.focus();
  }

  function esconder() {
    if (montado) fundo.style.display = 'none';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erro.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    try {
      await entrar(form.email.value, form.senha.value);
      form.senha.value = '';
    } catch (err) {
      erro.textContent = explicarErro(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });

  aoMudarUsuario((usuario) => {
    if (usuario) {
      esconder();
      pintarSessao(usuario, alvoSessao);
      try { if (aoEntrar) aoEntrar(usuario); } catch (_) {}
    } else {
      pintarSessao(null, alvoSessao);
      mostrar();
    }
  });
}

function pintarSessao(usuario, seletor) {
  if (!seletor) return;
  const alvo = document.querySelector(seletor);
  if (!alvo) return;
  if (!usuario) { alvo.innerHTML = ''; return; }
  alvo.innerHTML = `<span class="az-sessao">${escapar(usuario.email || '')}<button type="button">sair</button></span>`;
  const botao = alvo.querySelector('button');
  if (botao) botao.addEventListener('click', () => sair());
}

function escapar(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
