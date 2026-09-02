/* ───────────────────────────────────────────────────────────────────────────
   Autenticação do Painel Artezian (Firebase Auth, e-mail e senha).

   Uma conta por pessoa, em vez de uma senha compartilhada. É o que permite
   as regras do Firestore exigirem `request.auth != null` e, com isso, guardar
   receita, custo e dados de parceiro no banco com segurança.

   A sessão persiste em IndexedDB e vale para toda a origem — como os painéis
   em iframe são da mesma origem, entrar uma vez autentica todos eles.
   ─────────────────────────────────────────────────────────────────────────── */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { firebaseConfig } from './az-config.js';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/** Resolve com o usuário atual (ou null) assim que o Firebase decide o estado. */
export function usuarioResolvido() {
  return new Promise((resolve) => {
    const parar = onAuthStateChanged(auth, (u) => { parar(); resolve(u); });
  });
}

export function aoMudarUsuario(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function entrar(email, senha) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
  return cred.user;
}

export function sair() {
  return signOut(auth);
}

/** Token de identidade para autenticar chamadas ao backend do painel. */
export async function tokenAtual() {
  const u = auth.currentUser;
  return u ? u.getIdToken() : null;
}

const MENSAGENS = {
  'auth/invalid-email':        'E-mail inválido.',
  'auth/user-disabled':        'Esta conta está desativada.',
  'auth/user-not-found':       'E-mail ou senha incorretos.',
  'auth/wrong-password':       'E-mail ou senha incorretos.',
  'auth/invalid-credential':   'E-mail ou senha incorretos.',
  'auth/too-many-requests':    'Tentativas demais. Espere alguns minutos.',
  'auth/network-request-failed':'Sem conexão para autenticar.',
  'auth/operation-not-allowed':'Login por e-mail e senha ainda não está ativado no Firebase.',
  'auth/configuration-not-found':'Firebase Authentication ainda não foi ativado neste projeto.',
};

export function explicarErro(err) {
  const codigo = err && err.code;
  return MENSAGENS[codigo] || ('Não foi possível entrar' + (codigo ? ' (' + codigo + ')' : '') + '.');
}
