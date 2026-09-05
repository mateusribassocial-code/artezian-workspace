# Dados por unidade — checklist de coleta

Divide em três: o que o repo já tem, o que só o usuário tem, e o que dá pra levantar.

Antes de perguntar qualquer coisa, ler o que já existe. Perguntar dado que está no repo queima confiança e faz o usuário digitar à toa.

---

## Bloco A — Já está no repo (ler, não perguntar)

| Dado | Fonte |
|---|---|
| Código, nome, bairro | `[CÓDIGO] - Descricao_*.txt`, primeira linha |
| Capacidade e camas | Seção `# Capacidade` |
| Endereço, CEP, cidade | Tabela `# Localização:` |
| Distância da praia e do centro | Tabela `# Localização:` + `vizinhanca-imoveis.md` |
| Área de lazer do condomínio | Seção `# Area de Lazer` |
| Características do imóvel | Seção `# Caracteristicas` |
| Vídeo da unidade | Linha `# Vídeo:` (link do Instagram) |
| Fotos | Pasta `Fotos/` ao lado |
| Restaurantes, bares, beach clubs, passeios | `vizinhanca-imoveis.md`, bloco da região |
| Check-in 15h / checkout 12h | `### Dúvidas frequentes.txt` |
| Wi-Fi, ar, cozinha, piscina, pet | `### Dúvidas frequentes.txt` |

**Nunca copiar preço da descrição.** O arquivo tem tabela de diária; o manual não leva valor.

---

## Bloco B — Só o usuário tem (perguntar sempre)

Perguntar tudo numa mensagem só, em lista numerada, dizendo que pode responder "não sei" em qualquer item.

### Check-in
1. Como o hóspede pega a chave? (portaria 24h / anfitrião recebe / cofre com senha / outro)
2. Se for cofre ou fechadura eletrônica: onde fica e qual a senha
3. Precisa apresentar documento ou autorização na portaria? Qual nome vai na lista?
4. Número da vaga de garagem
5. Andar e número da unidade
6. WhatsApp de plantão da Artezian pro hóspede acionar

### Dentro do imóvel
7. Nome da rede de Wi-Fi e senha
8. Tem máquina de lavar? Secadora? Ferro e tábua?
9. Roupa de cama e toalha estão inclusas? Quantos jogos?
10. Secador de cabelo?
11. Tem itens de primeira necessidade na chegada (papel higiênico, sabonete, café)? Quantos?
12. **O que o hóspede precisa levar** — a lista do que não tem

### Condomínio
13. Horário da piscina e da sauna
14. A churrasqueira precisa de reserva? Tem carvão?
15. Horário de silêncio
16. Pode receber visitante? Precisa autorizar na portaria?

### Saída
17. O que fazer com a chave no check-out?
18. Lixo: onde deixar?
19. Precisa avisar alguém antes de sair?

---

## Bloco C — Dá pra levantar (oferecer antes de perguntar)

**Mercados e farmácias.** Não existem em `vizinhanca-imoveis.md`. São por região, então uma vez levantados servem pra todas as unidades daquela região.

Levantar e **gravar no `vizinhanca-imoveis.md`**, dentro do bloco da região, no formato:

```markdown
### Mercados e Farmácias

| Nome | Tipo | Distância | Observação |
|------|------|-----------|------------|
| Nome do mercado | Supermercado | 6 min de carro | Aberto até 22h |
| Nome da farmácia | Farmácia | 4 min a pé | 24h |
```

Fazer isso uma vez por região, não uma vez por unidade.

**Link do Google Maps.** Montar a partir do endereço da descrição e gerar QR code inline (SVG, sem biblioteca externa) pra funcionar no PDF impresso.

---

## Onde salvar o que foi coletado

Gravar as respostas do Bloco B em `[CÓDIGO] - Operacional.md`, ao lado da descrição:

```markdown
# Operacional — [CÓDIGO] [Nome da unidade]
> Preenchido em [data]. Atualizar quando mudar senha, vaga ou plantão.

## Check-in
- Retirada da chave:
- Senha do cofre/fechadura:
- Nome na portaria:
- Vaga:
- Unidade:
- WhatsApp de plantão:

## Imóvel
- Wi-Fi (rede / senha):
- Máquina de lavar:
- Roupa de cama e toalha:
- Secador:
- Kit de chegada:
- O hóspede precisa levar:

## Condomínio
- Piscina:
- Sauna:
- Churrasqueira:
- Silêncio:
- Visitantes:

## Check-out
- Chave:
- Lixo:
- Avisar:
```

Na próxima geração da mesma unidade, ler esse arquivo primeiro e perguntar apenas o que continuar vazio.

**Senha de Wi-Fi e de cofre ficam num arquivo do repo.** Se o repo for sincronizado com o GitHub, avisar o usuário disso uma vez e deixar ele decidir — dá pra manter só no `Operacional.md` local e adicionar ao `.gitignore`.
