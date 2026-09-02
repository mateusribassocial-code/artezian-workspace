<?php
/**
 * Template Name: Landing — Investidores
 * Template Post Type: page
 */
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>João Mendonça — Invisto antes de indicar | Studios Porto Seguro | Artezian</title>
    <meta name="description" content="Eu moro em Porto Seguro, sou Superhost 4.9 e só indico o studio que eu mesmo compraria. Conheça o grupo fechado de investidores da Artezian.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--gold:#c2a14e;--dark:#2a2a2a;--petrol:#264653;--white:#ffffff;--warm:#f8f6f1;--border:#e8e0d0}
        body{font-family:'Montserrat',sans-serif;color:var(--dark);background:var(--white);line-height:1.6}
        h1,h2,h3{font-family:'Playfair Display',serif}
        a{color:inherit;text-decoration:none}
        section{padding:80px 40px}
        .sec-hdr{text-align:center;margin-bottom:48px;max-width:640px;margin-left:auto;margin-right:auto}
        .sec-tag{font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
        .sec-title{font-size:clamp(26px,4vw,38px);color:var(--dark);font-weight:600;margin-bottom:12px}
        .sec-sub{font-size:15px;color:#666;line-height:1.7}

        /* Header */
        header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:16px 32px;display:flex;align-items:center;justify-content:space-between}
        .logo{display:flex;flex-direction:column;gap:4px;align-items:flex-start}
        .logo img{height:26px;width:auto;display:block}
        .logo small{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:500;letter-spacing:1px;color:var(--dark);opacity:.6;text-transform:none}
        nav{display:flex;gap:26px;align-items:center}
        nav a{font-size:13px;font-weight:500;color:var(--dark);opacity:.75;transition:opacity .2s}
        nav a:hover{opacity:1;color:var(--gold)}
        .header-cta{background:var(--gold);color:var(--white);padding:10px 22px;border-radius:5px;font-size:13px;font-weight:600;letter-spacing:.3px;border:none;cursor:pointer;transition:background .2s;white-space:nowrap}
        .header-cta:hover{background:#a88a3f}
        .nav-toggle{display:none}
        @media(max-width:860px){nav{display:none}}

        /* Hero */
        .hero{margin-top:65px;padding:90px 40px 70px;background:linear-gradient(160deg,var(--warm) 0%,var(--white) 60%);text-align:center}
        .hero-badge{display:inline-block;background:var(--petrol);color:var(--white);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border-radius:20px;margin-bottom:22px}
        .hero h1{font-size:clamp(32px,5.5vw,56px);font-weight:700;line-height:1.12;max-width:780px;margin:0 auto 18px}
        .hero h1 em{color:var(--gold);font-style:normal}
        .hero-sub{font-size:16px;color:#555;max-width:560px;margin:0 auto 32px;line-height:1.7}
        .hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:44px}
        .btn-primary{display:inline-flex;align-items:center;gap:9px;background:var(--gold);color:var(--white);padding:16px 30px;border-radius:6px;font-weight:600;font-size:15px;border:none;cursor:pointer;transition:background .2s,transform .1s}
        .btn-primary:hover{background:#a88a3f;transform:translateY(-1px)}
        .btn-secondary{display:inline-flex;align-items:center;gap:9px;background:transparent;color:var(--dark);padding:16px 30px;border-radius:6px;font-weight:600;font-size:15px;border:1px solid var(--border);cursor:pointer;transition:border-color .2s}
        .btn-secondary:hover{border-color:var(--gold);color:var(--gold)}
        .pillars{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .pillar{display:flex;align-items:center;gap:8px;background:var(--white);border:1px solid var(--border);padding:10px 18px;border-radius:30px;font-size:13px;font-weight:500}
        .pillar span{color:var(--gold)}

        /* Steps (Minha Abordagem) */
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto}
        .step{padding:32px 26px;background:var(--warm);border-radius:8px}
        .step-num{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--gold);opacity:.5;margin-bottom:10px}
        .step h3{font-size:18px;margin-bottom:8px}
        .step p{font-size:14px;color:#666;line-height:1.7}

        /* Diferença */
        .diferenca-sec{background:var(--dark);color:var(--white)}
        .diferenca-sec .sec-tag{color:var(--gold)}
        .diferenca-sec .sec-title{color:var(--white)}
        .diferenca-sec .sec-sub{color:rgba(255,255,255,.65)}
        .comparison{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:900px;margin:0 auto}
        .comp-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:30px}
        .comp-card.hl{background:rgba(194,161,78,.1);border-color:var(--gold)}
        .comp-card h3{font-size:16px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:20px;color:rgba(255,255,255,.9)}
        .comp-card.hl h3{color:var(--gold)}
        .comp-item{display:flex;gap:12px;margin-bottom:16px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.75)}
        .comp-item span{font-family:'Playfair Display',serif;font-weight:700;color:var(--gold);flex-shrink:0}
        .diferenca-close{text-align:center;margin-top:32px;font-size:15px;color:rgba(255,255,255,.7);max-width:600px;margin-left:auto;margin-right:auto}

        /* Vídeo genérico */
        .video-wrap{max-width:760px;margin:0 auto}
        .video-embed{position:relative;width:100%;padding-top:56.25%;background:var(--dark);border-radius:8px;overflow:hidden}
        .video-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
        .video-tags{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px}
        .video-tag{font-size:12px;font-weight:600;color:var(--petrol);background:var(--warm);padding:7px 14px;border-radius:20px}

        /* Grupo de Investidores */
        .grupo-sec{background:var(--petrol);color:var(--white)}
        .grupo-sec .sec-tag{color:var(--gold)}
        .grupo-sec .sec-title{color:var(--white)}
        .grupo-sec .sec-sub{color:rgba(255,255,255,.7)}
        .grupo-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;max-width:1000px;margin:0 auto;align-items:center}
        .grupo-grid .video-embed{background:rgba(0,0,0,.3)}
        .grupo-como-funciona h3{font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:18px}
        .grupo-item{display:flex;gap:14px;margin-bottom:20px}
        .grupo-icon{font-size:20px;flex-shrink:0}
        .grupo-item div p{font-size:14px;line-height:1.6;color:rgba(255,255,255,.75);margin-top:2px}
        .grupo-item div strong{font-size:15px;font-weight:600}
        @media(max-width:860px){.grupo-grid{grid-template-columns:1fr}}

        /* Oportunidades */
        .opp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto}
        .opp-card{padding:30px 26px;border:1px solid var(--border);border-radius:8px;transition:border-color .2s}
        .opp-card:hover{border-color:var(--gold)}
        .opp-num{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--gold);margin-bottom:10px}
        .opp-card h3{font-size:17px;margin-bottom:8px}
        .opp-card p{font-size:14px;color:#666;line-height:1.7}

        /* Form / CTA final */
        .form-sec{background:var(--warm)}
        .form-wrap{max-width:560px;margin:0 auto;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:40px}
        .fg{margin-bottom:16px}
        .fg label{display:block;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;color:#777}
        .fg input,.fg select{width:100%;padding:14px 16px;border:1px solid var(--border);border-radius:6px;background:var(--white);color:var(--dark);font-family:'Montserrat',sans-serif;font-size:15px;outline:none;transition:border-color .2s}
        .fg input:focus,.fg select:focus{border-color:var(--gold)}
        .btn-submit{width:100%;background:var(--gold);color:var(--white);border:none;padding:17px;border-radius:6px;font-family:'Montserrat',sans-serif;font-size:15px;font-weight:600;cursor:pointer;margin-top:6px;transition:background .2s,transform .1s;display:flex;align-items:center;justify-content:center;gap:10px}
        .btn-submit:hover{background:#a88a3f;transform:translateY(-1px)}
        .privacy{text-align:center;font-size:12px;color:#999;margin-top:14px}
        .wa-svg{width:19px;height:19px;fill:currentColor;flex-shrink:0}

        /* Footer */
        footer{background:var(--dark);color:rgba(255,255,255,.55);text-align:center;padding:40px 24px;font-size:13px}
        .foot-brand{margin-bottom:12px}
        .foot-brand img{height:30px;width:auto}
        footer a{color:var(--gold)}
        .disclaimer{max-width:560px;margin:16px auto 0;font-size:11px;opacity:.6;line-height:1.6}

        @media(max-width:900px){.steps,.comparison,.opp-grid{grid-template-columns:1fr}}
        @media(max-width:600px){section{padding:56px 20px}header{padding:14px 18px}.logo small{display:none}.hero{padding:70px 20px 50px}.form-wrap{padding:28px 22px}}
    </style>
</head>
<body>

<header>
    <a href="<?php echo home_url('/'); ?>" class="logo">
        <img src="<?php echo home_url('/wp-content/uploads/investidores/logo-artezian-dourado.png'); ?>" alt="Artezian Real Estate Atelie">
        <small>João Mendonça · Investidor imobiliário</small>
    </a>
    <nav>
        <a href="#abordagem">Minha abordagem</a>
        <a href="#diferenca">A diferença</a>
        <a href="#video">Vídeo</a>
        <a href="#grupo">Grupo de Investidores</a>
        <a href="#oportunidades">Porto Seguro</a>
        <a href="#form" class="header-cta">Falar comigo</a>
    </nav>
</header>

<div class="hero">
    <span class="hero-badge">Porto Seguro · Investidor local</span>
    <h1>Eu não indico o studio. <em>Eu invisto</em> no studio primeiro.</h1>
    <p class="hero-sub">Moro em Porto Seguro, sou Superhost com 4.9 e 95 mil seguidores. Antes de te apresentar qualquer studio, meu dinheiro já tá dentro. Se eu não compraria, eu não te mostro.</p>
    <div class="hero-ctas">
        <button class="btn-primary" onclick="goForm()">Quero conhecer o studio</button>
        <button class="btn-secondary" onclick="document.getElementById('abordagem').scrollIntoView({behavior:'smooth'})">Entenda como eu escolho</button>
    </div>
    <div class="pillars">
        <div class="pillar"><span>●</span> Capital próprio no jogo</div>
        <div class="pillar"><span>●</span> Gestão completa pela Artezian</div>
        <div class="pillar"><span>●</span> Moro aqui, acompanho de perto</div>
    </div>
</div>

<section id="abordagem">
    <div class="sec-hdr">
        <p class="sec-tag">Minha abordagem</p>
        <h2 class="sec-title">Não indico olhando de fora</h2>
        <p class="sec-sub">Três passos, sempre nessa ordem — nenhum studio pula etapa.</p>
    </div>
    <div class="steps">
        <div class="step">
            <div class="step-num">01</div>
            <h3>Eu analiso o ativo</h3>
            <p>Localização, preço por m², diária real de studios parecidos já operando — não promessa de corretor.</p>
        </div>
        <div class="step">
            <div class="step-num">02</div>
            <h3>Eu invisto primeiro</h3>
            <p>Só chega até você depois que eu já coloquei meu dinheiro. Esse aqui é meu, não vendo por nada.</p>
        </div>
        <div class="step">
            <div class="step-num">03</div>
            <h3>Eu cuido da operação</h3>
            <p>A Artezian administra tudo: reserva, hóspede, limpeza, manutenção. Você recebe, eu resolvo o resto.</p>
        </div>
    </div>
</section>

<section id="diferenca" class="diferenca-sec">
    <div class="sec-hdr">
        <p class="sec-tag">A diferença</p>
        <h2 class="sec-title">A diferença tá no lado da mesa</h2>
        <p class="sec-sub">Corretor vende e some. Eu moro do lado do que eu vendo.</p>
    </div>
    <div class="comparison">
        <div class="comp-card">
            <h3>Modelo tradicional</h3>
            <div class="comp-item"><span>01</span> Corretor apresenta e some depois da venda</div>
            <div class="comp-item"><span>02</span> Você administra sozinho ou terceiriza sem controle</div>
            <div class="comp-item"><span>03</span> Retorno prometido sem dado real de operação</div>
        </div>
        <div class="comp-card hl">
            <h3>Meu trabalho</h3>
            <div class="comp-item"><span>01</span> Eu moro aqui e acompanho a obra de perto, sempre</div>
            <div class="comp-item"><span>02</span> A Artezian administra tudo — você não opera nada</div>
            <div class="comp-item"><span>03</span> Retorno com base em diária real de studios já operando</div>
        </div>
    </div>
    <p class="diferenca-close">Eu não indico pra todo mundo. Indico pra quem tá pronto pra entrar — igual eu entrei.</p>
</section>

<section id="video">
    <div class="sec-hdr">
        <p class="sec-tag">Vídeo</p>
        <h2 class="sec-title">Entenda como eu escolho</h2>
        <p class="sec-sub">Gravei explicando os critérios que uso antes de colocar meu dinheiro em qualquer studio.</p>
    </div>
    <div class="video-wrap">
        <div class="video-embed">
            <!-- Substituir SEU_VIDEO_ID_AQUI pelo ID do vídeo do YouTube -->
            <iframe src="https://www.youtube.com/embed/SEU_VIDEO_ID_AQUI" title="Como eu escolho meus studios" allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="video-tags">
            <span class="video-tag">Critérios de compra</span>
            <span class="video-tag">Operação de temporada</span>
            <span class="video-tag">Visão de investidor</span>
        </div>
    </div>
</section>

<section id="grupo" class="grupo-sec">
    <div class="sec-hdr">
        <p class="sec-tag">Grupo de investidores</p>
        <h2 class="sec-title">Você não compra e some. Você entra pro grupo.</h2>
        <p class="sec-sub">O que eu mais tenho comigo são investidores morando fora — e todo mundo acompanha junto 💙</p>
    </div>
    <div class="grupo-grid">
        <div class="video-embed">
            <!-- Substituir SEU_VIDEO_ID_GRUPO pelo ID do vídeo do YouTube sobre o grupo -->
            <iframe src="https://www.youtube.com/embed/SEU_VIDEO_ID_GRUPO" title="Como funciona o grupo de investidores" allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="grupo-como-funciona">
            <h3>Como funciona</h3>
            <div class="grupo-item">
                <span class="grupo-icon">🔒</span>
                <div><strong>Grupo fechado com todos os investidores</strong><p>Só entra quem investiu — direto comigo e com quem já tá dentro.</p></div>
            </div>
            <div class="grupo-item">
                <span class="grupo-icon">🏗️</span>
                <div><strong>Atualização de obra</strong><p>Vídeo e foto de dentro do canteiro, direto pra você — sem esperar relatório trimestral.</p></div>
            </div>
            <div class="grupo-item">
                <span class="grupo-icon">🚀</span>
                <div><strong>Novos lançamentos antecipados</strong><p>Quem já tá no grupo escolhe primeiro, antes de abrir pro público.</p></div>
            </div>
        </div>
    </div>
</section>

<section id="oportunidades">
    <div class="sec-hdr">
        <p class="sec-tag">Porto Seguro no radar</p>
        <h2 class="sec-title">Oportunidades que combinam destino e estratégia</h2>
        <p class="sec-sub">Porto Seguro tem demanda de temporada o ano inteiro. O jogo é escolher o ativo certo pra essa demanda.</p>
    </div>
    <div class="opp-grid">
        <div class="opp-card">
            <div class="opp-num">01</div>
            <h3>Studios e compactos</h3>
            <p>Foco em renda. Menor ticket de entrada, maior liquidez pra locação por temporada.</p>
        </div>
        <div class="opp-card">
            <div class="opp-num">02</div>
            <h3>Lançamentos selecionados</h3>
            <p>Foco em valorização. Preço de lançamento com condição de entrada facilitada.</p>
        </div>
        <div class="opp-card">
            <div class="opp-num">03</div>
            <h3>Imóveis para temporada</h3>
            <p>Foco em operação. Já rodando com histórico real de diária e ocupação.</p>
        </div>
    </div>
</section>

<section class="form-sec" id="form">
    <div class="sec-hdr">
        <p class="sec-tag">Quero fazer parte</p>
        <h2 class="sec-title">Vamos conversar</h2>
        <p class="sec-sub">Deixa teus dados que eu te chamo no WhatsApp com a simulação certa pro teu perfil.</p>
    </div>
    <div class="form-wrap">
        <form onsubmit="enviarLead(event)">
            <div class="fg"><label>Seu nome</label><input type="text" name="nome" placeholder="João Silva" required></div>
            <div class="fg"><label>WhatsApp</label><input type="tel" name="tel" placeholder="(11) 99999-9999" required></div>
            <div class="fg"><label>E-mail</label><input type="email" name="email" placeholder="joao@email.com" required></div>
            <div class="fg">
                <label>Quanto pretende investir</label>
                <select name="faixa">
                    <option value="Até R$ 300 mil">Até R$ 300 mil</option>
                    <option value="R$ 300 mil a R$ 600 mil">R$ 300 mil a R$ 600 mil</option>
                    <option value="R$ 600 mil a R$ 1 milhão">R$ 600 mil a R$ 1 milhão</option>
                    <option value="Acima de R$ 1 milhão">Acima de R$ 1 milhão</option>
                    <option value="Ainda não sei">Ainda não sei</option>
                </select>
            </div>
            <button type="submit" class="btn-submit">
                <svg class="wa-svg" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Falar com o João no WhatsApp
            </button>
            <p class="privacy">Seus dados são privados. Nenhum spam.</p>
        </form>
    </div>
</section>

<footer>
    <p class="foot-brand"><img src="<?php echo home_url('/wp-content/uploads/investidores/logo-artezian-branco.png'); ?>" alt="Artezian Real Estate Atelie"></p>
    <p>Real Estate Atelie · Porto Seguro, Bahia</p>
    <p style="margin-top:8px"><a href="<?php echo home_url('/'); ?>">artezian.com.br</a> · <a href="https://instagram.com/ojoaomendonca">@ojoaomendonca</a></p>
    <p class="disclaimer">Simulações de retorno são estimativas baseadas em dados de operação de imóveis comparáveis e não constituem garantia de rentabilidade futura. Investimento imobiliário envolve riscos.</p>
</footer>

<script>
const WA = '5573999373474';
function goForm(){document.getElementById('form').scrollIntoView({behavior:'smooth'})}
function enviarLead(e){
    e.preventDefault();
    const f=e.target;
    const msg=`Olá João! Vim pela página de investidores. 👋\n\nMeu nome é *${f.nome.value.trim()}*\nWhatsApp: ${f.tel.value.trim()}\nE-mail: ${f.email.value.trim()}\nFaixa de investimento: ${f.faixa.value}\n\nQuero entender melhor os studios e como funciona o grupo de investidores.`;
    window.open(`https://api.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(msg)}`,'_blank');
}
</script>
</body>
</html>
