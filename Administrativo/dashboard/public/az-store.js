/* ───────────────────────────────────────────────────────────────────────────
   Camada de dados dos painéis Artezian.

   O painel roda local, na máquina do usuário, então a persistência é local:
   localStorage do navegador, sem nuvem e sem login.

   A interface é a mesma que a versão sincronizada usava (iniciar / salvar /
   online), então trocar o armazenamento por um backend não exige mexer em
   quem consome — só neste arquivo.
   ─────────────────────────────────────────────────────────────────────────── */

/* Agrupa edições seguidas numa gravação só. */
const ATRASO_ESCRITA = 400;

/**
 * Mantém um documento no armazenamento local do navegador.
 *
 * @param {string}   chaveLocal    chave usada no localStorage
 * @param {function} aoMudarStatus recebe ('salvo'|'salvando'|'erro', detalhe)
 * @param {function} aoReceber     mantido por compatibilidade; sem uso local
 */
export function documentoSincronizado({ chaveLocal, aoMudarStatus }) {
  let timer = null;
  let ok = true;

  const status = (estado, detalhe) => {
    try { if (aoMudarStatus) aoMudarStatus(estado, detalhe); } catch (_) {}
  };

  function lerLocal() {
    try {
      const bruto = localStorage.getItem(chaveLocal);
      return bruto ? JSON.parse(bruto) : null;
    } catch (_) { return null; }
  }

  function gravarLocal(dados) {
    localStorage.setItem(chaveLocal, JSON.stringify(dados));
  }

  return {
    /** Devolve o que já estava salvo, ou a semente na primeira execução. */
    async iniciar(semente) {
      const local = lerLocal();
      if (local !== null) {
        status('salvo');
        return local;
      }
      try {
        gravarLocal(semente);
        status('salvo');
      } catch (err) {
        ok = false;
        status('erro', (err && err.name) || 'não foi possível salvar');
      }
      return semente;
    },

    /** Grava com um pequeno atraso, agrupando edições seguidas. */
    salvar(dados) {
      status('salvando');
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          gravarLocal(dados);
          ok = true;
          status('salvo');
        } catch (err) {
          // Estouro de cota ou navegador em modo restrito.
          ok = false;
          status('erro', (err && err.name) || 'não foi possível salvar');
        }
      }, ATRASO_ESCRITA);
    },

    get online() { return ok; }
  };
}
