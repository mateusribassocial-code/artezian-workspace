/* ───────────────────────────────────────────────────────────────────────────
   Camada de dados compartilhada dos painéis Artezian.

   Firestore é a fonte da verdade; o localStorage segue como cache local e
   rede de segurança. Se o Firestore não responder, o painel continua
   funcionando offline com o que estiver em cache — só para de sincronizar.

   Usado por: checklist. A migrar: atalhos, tarefas, parceiros/custos.
   ─────────────────────────────────────────────────────────────────────────── */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyJB9Yxvi8H-6WK1xNIVSDpcuU8Vqgn1U",
  authDomain: "artezian-fluxo.firebaseapp.com",
  projectId: "artezian-fluxo",
  storageBucket: "artezian-fluxo.firebasestorage.app",
  messagingSenderId: "477718266482",
  appId: "1:477718266482:web:ead3191890c2d45518b8eb"
};

export const db = getFirestore(initializeApp(firebaseConfig));

/* Agrupa edições seguidas numa escrita só. */
const ATRASO_ESCRITA = 700;

/* Firestore recusa documento acima de 1 MiB. Avisamos antes de chegar lá. */
const LIMITE_ALERTA = 800 * 1024;

/**
 * Mantém um documento único do Firestore em sincronia com um cache local.
 *
 * @param {string}   caminho       ex.: 'paineis/checklist'
 * @param {string}   chaveLocal    chave de localStorage que já guardava o dado
 * @param {function} aoReceber     recebe dados novos vindos de outro dispositivo
 * @param {function} aoMudarStatus recebe ('sincronizado'|'salvando'|'offline'|'migrado', detalhe)
 */
export function documentoSincronizado({ caminho, chaveLocal, aoReceber, aoMudarStatus }) {
  const partes = caminho.split('/');
  const ref = doc(db, partes[0], partes[1]);

  let ultimoJson = null;   // última versão que nós mesmos gravamos (mata o eco)
  let timer = null;
  let online = true;

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
    try { localStorage.setItem(chaveLocal, JSON.stringify(dados)); } catch (_) {}
  }

  return {
    /**
     * Devolve os dados iniciais. Na primeira execução, sobe o que já existia
     * em localStorage para o Firestore — é a migração, e ela acontece uma vez só.
     */
    async iniciar(semente) {
      const local = lerLocal();
      let inicial;

      try {
        const snap = await getDoc(ref);
        const conteudo = snap.exists() ? snap.data() : null;

        if (conteudo && conteudo.dados !== undefined) {
          inicial = conteudo.dados;
          gravarLocal(inicial);
          status('sincronizado');
        } else {
          inicial = local !== null ? local : semente;
          await setDoc(ref, { dados: inicial, atualizadoEm: Date.now() });
          gravarLocal(inicial);
          status('migrado', local !== null ? 'dados locais enviados' : 'iniciado do zero');
        }

        ultimoJson = JSON.stringify(inicial);
        online = true;

        onSnapshot(ref, (s) => {
          if (!s.exists()) return;
          const d = s.data() && s.data().dados;
          if (d === undefined) return;
          const json = JSON.stringify(d);
          if (json === ultimoJson) return;   // eco da nossa própria escrita
          ultimoJson = json;
          gravarLocal(d);
          online = true;
          status('sincronizado');
          try { if (aoReceber) aoReceber(d); } catch (_) {}
        }, (err) => {
          online = false;
          status('offline', (err && err.code) || 'conexão perdida');
        });

      } catch (err) {
        // Sem Firestore o painel não para: cai pro cache local.
        online = false;
        inicial = local !== null ? local : semente;
        ultimoJson = JSON.stringify(inicial);
        status('offline', (err && err.code) || 'falha ao ler');
      }

      return inicial;
    },

    /** Grava local na hora; no Firestore com atraso, agrupando edições seguidas. */
    salvar(dados) {
      gravarLocal(dados);

      const json = JSON.stringify(dados);
      ultimoJson = json;

      if (json.length > LIMITE_ALERTA) {
        status('offline', 'documento grande demais para o Firestore');
        return;
      }

      status('salvando');
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await setDoc(ref, { dados, atualizadoEm: Date.now() });
          online = true;
          status('sincronizado');
        } catch (err) {
          online = false;
          status('offline', (err && err.code) || 'falha ao gravar');
        }
      }, ATRASO_ESCRITA);
    },

    get online() { return online; }
  };
}
