/* Configuração do projeto Firebase do Painel Artezian.

   Estes valores são públicos por natureza — o SDK do Firebase os expõe no
   navegador de qualquer forma. Eles identificam o projeto, não autorizam nada.
   Quem protege os dados são as regras do Firestore, que exigem usuário
   autenticado (ver firestore.rules na raiz do dashboard). */

export const firebaseConfig = {
  apiKey: "AIzaSyCyJB9Yxvi8H-6WK1xNIVSDpcuU8Vqgn1U",
  authDomain: "artezian-fluxo.firebaseapp.com",
  projectId: "artezian-fluxo",
  storageBucket: "artezian-fluxo.firebasestorage.app",
  messagingSenderId: "477718266482",
  appId: "1:477718266482:web:ead3191890c2d45518b8eb"
};
