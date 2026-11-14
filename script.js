(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lite = window.matchMedia('(hover: none), (pointer: coarse)').matches; /* celulares e telas de toque */

  var light = document.getElementById('light');
  var glass = document.querySelectorAll('.glass');
  var dock = document.getElementById('dock');
  var icons = dock ? dock.querySelectorAll('a') : [];
  var tx = window.innerWidth / 2, ty = window.innerHeight / 3, x = tx, y = ty;
  var active = false, raf = null;
  var sc = [];
  var i;

  for (i = 0; i < icons.length; i++) sc.push(1);

  function frame() {
    var moving = false;
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    if (light) light.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';

    /* brilho do vidro acompanha a luz */
    for (var g = 0; g < glass.length; g++) {
      var el = glass[g];
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > window.innerHeight) continue;
      el.style.setProperty('--mx', ((x - r.left) / r.width * 100).toFixed(2) + '%');
      el.style.setProperty('--my', ((y - r.top) / r.height * 100).toFixed(2) + '%');
    }

    /* ampliação do dock: só perto do ícone; vizinhos são empurrados para não se chocarem */
    if (dock && icons.length) {
      var dr = dock.getBoundingClientRect();
      var n = icons.length;
      var base = icons[0].offsetWidth || 56;
      var gap = parseFloat(getComputedStyle(dock).columnGap) || 14;
      var dc = dr.left + dr.width / 2;
      var near = active && ty > dr.top - 30 && ty < dr.bottom + 30;
      var tot = gap * (n - 1);

      for (i = 0; i < n; i++) {
        var dx = (tx - (dc + (i - (n - 1) / 2) * (base + gap))) / base;
        var tg = (near && Math.abs(dx) < 1.8) ? 1 + 0.6 * Math.exp(-3 * dx * dx) : 1;
        sc[i] += (tg - sc[i]) * 0.25;
        if (Math.abs(tg - sc[i]) > 0.002) moving = true;
        tot += base * sc[i];
      }

      var pos = dc - tot / 2;
      for (i = 0; i < n; i++) {
        var w = base * sc[i];
        var b0 = dc + (i - (n - 1) / 2) * (base + gap);
        icons[i].style.setProperty('--x', (pos + w / 2 - b0).toFixed(1) + 'px');
        icons[i].style.setProperty('--s', sc[i].toFixed(3));
        pos += w + gap;
      }
    }

    raf = (moving || Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(frame) : null;
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  if (light && !reduceMotion && !lite) {
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      active = true;
      light.classList.add('on');
      kick();
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      active = false;
      light.classList.remove('on');
      kick();
    });

    window.addEventListener('blur', function () {
      active = false;
      light.classList.remove('on');
      kick();
    });
  }

  /* ================= CHAT ================= */
  var chat = document.getElementById('chat');
  var msgs = document.getElementById('msgs');
  var inp = document.getElementById('chat-text');
  var toggle = document.getElementById('chat-toggle');
  var closeBtn = document.getElementById('chat-close');
  var sendBtn = document.getElementById('chat-send');
  var hist = [], busy = false;

  var GREETING = 'Olá! Esta é uma prévia local do assistente do OTIA EC — o chatbot oficial chegará em breve. Por enquanto, respondo com um repertório fixo sobre IA, equidade, cidadania e a cartilha digital. O que você quer saber?';

  function add(text, cls) {
    var d = document.createElement('div');
    d.className = 'm ' + cls;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function setOpen(open) {
    if (!chat) return;
    chat.hidden = !open;
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar chat' : 'Abrir chat');
    }
    if (open) {
      if (!msgs.children.length) add(GREETING, 'bot');
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function () { if (inp) inp.focus(); }, 60);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(chat.hidden);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      setOpen(false);
      if (toggle) toggle.focus();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chat && !chat.hidden) {
      setOpen(false);
      if (toggle) toggle.focus();
    }
  });

  /* Repertório local da prévia. O chatbot oficial será conectado depois. */
  var KB = [
    { re: /^\s*(oi|ol[aá]|hey|bom dia|boa tarde|boa noite)\b/i,
      a: 'Olá! Sou o assistente do OTIA EC. Posso explicar conceitos de IA, falar sobre equidade e cidadania ou indicar a cartilha digital.' },
    { re: /cartilha|guia|material|apostila|pdf/i,
      a: 'A cartilha digital do OTIA EC reúne o conteúdo do observatório em formato acessível. Toque em “Cartilha digital” na página inicial para abrir — o link leva ao Google Sites do projeto.' },
    { re: /otia|observat[oó]rio|tur[ií]bio|quem (é|e) voc|sobre o site/i,
      a: 'O OTIA EC é o Observatório Turíbio de Inteligência Artificial, Equidade e Cidadania: um espaço para discutir como a IA afeta direitos, acesso e participação. A cartilha digital aprofunda o tema.' },
    { re: /equidade|igualdade|justi[çc]a|desigualdade|vi[eé]s|preconceito|discrimina/i,
      a: 'Equidade em IA significa perguntar quem se beneficia e quem é prejudicado por um sistema. Dados históricos podem carregar desigualdades, e decisões automatizadas podem ampliá-las. Transparência e participação são parte da resposta.' },
    { re: /cidadania|direitos|democracia|participa|pol[ií]tica p[uú]blica/i,
      a: 'Cidadania e IA se cruzam quando sistemas automatizados influenciam acesso a serviços, crédito, saúde e informação. O debate público e a prestação de contas são essenciais para que a tecnologia amplie direitos, não os restrinja.' },
    { re: /privacidade|meus dados|lgpd|seguran[çc]a|dados pessoais/i,
      a: 'Evite inserir dados pessoais ou sensíveis em chats de IA. Não compartilhe documentos de terceiros sem autorização e prefira ferramentas que expliquem como os dados são tratados.' },
    { re: /alucina|erro|confi[aá]vel|verdade|fake|desinforma/i,
      a: 'Modelos podem produzir respostas confiantes e erradas — as chamadas alucinações. Trate a saída como rascunho: confirme fatos, números e citações em fontes primárias antes de usar ou compartilhar.' },
    { re: /prompt|perguntar|instru[çc][aã]o/i,
      a: 'Um bom prompt traz contexto, objetivo e formato desejado. Exemplo: “Explique X para alguém sem formação técnica, em 5 tópicos, e indique o que eu deveria verificar.”' },
    { re: /contato|telefone|e-?mail|endere[çc]o|onde fica/i,
      a: 'Não tenho os contatos do projeto por aqui. A cartilha digital no site do OTIA EC é o caminho indicado para mais informações.' },
    { re: /intelig[eê]ncia artificial|como funciona|\bia\b|modelo|algoritmo|machine learning/i,
      a: 'Em resumo: sistemas de IA identificam padrões em dados e usam esses padrões para prever, classificar ou gerar conteúdo. Eles não “entendem” o mundo como uma pessoa — por isso precisam de verificação e contexto.' }
  ];

  function localReply(text) {
    for (var k = 0; k < KB.length; k++) {
      if (KB[k].re.test(text)) return KB[k].a;
    }
    return 'Ainda não tenho essa informação por aqui. Posso falar sobre conceitos de IA, equidade, cidadania, privacidade e sobre a cartilha do OTIA EC. Se quiser, reformule a pergunta ou abra a cartilha digital.';
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /* ============================================================
     INTEGRAÇÃO FUTURA DO CHATBOT
     O chatbot oficial será conectado depois. Quando estiver pronto,
     troque o corpo de answerQuestion() pela chamada da sua API
     (por exemplo, um fetch para o seu próprio backend).
     O histórico da conversa está em `hist`, no formato:
     [{ role: 'user' | 'assistant', content: '...' }]
     ============================================================ */
  async function answerQuestion(text) {
    await delay(450);
    return localReply(text);
  }

  async function send() {
    if (!chat || !inp || busy) return;
    var text = inp.value.trim();
    if (!text) return;

    inp.value = '';
    add(text, 'me');
    hist.push({ role: 'user', content: text });
    var bubble = add('…', 'bot');
    busy = true;

    try {
      var answer = await answerQuestion(text);
      bubble.textContent = answer;
      hist.push({ role: 'assistant', content: answer });
    } catch (err) {
      var fallback = localReply(text);
      bubble.textContent = fallback;
      hist.push({ role: 'assistant', content: fallback });
    } finally {
      busy = false;
      msgs.scrollTop = msgs.scrollHeight;
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', send);

  if (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
  }

  /* Recursos ainda sem link: aviso amigável em vez de recarregar a página */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }

  Array.prototype.forEach.call(document.querySelectorAll('a[data-soon]'), function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showToast(link.getAttribute('data-soon'));
    });
  });

  /* link direto: index.html#chat abre o assistente */
  if (window.location.hash === '#chat') setOpen(true);
})();
