// ─────────────────────────────────────────────
// CHAVE PIX
// ─────────────────────────────────────────────
const MINHA_CHAVE_PIX = '12428552465'; // 

// Número do WhatsApp (só números com DDI)
const WHATSAPP_NUMERO = '5581993369736';


// ─────────────────────────────────────────────
// BLOCO 1 — FILTRO DE CATEGORIAS
// ─────────────────────────────────────────────
const botoes = document.querySelectorAll('.category-item');
const cardDeProdutos = document.querySelectorAll('.product-card');

function filtrarProdutos(categoria) {
    cardDeProdutos.forEach(card => {
        const cat = card.getAttribute('data-category');
        card.classList.toggle('hidden', categoria !== 'todos' && categoria !== cat);
    });
}

botoes.forEach(botao => {
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.category-item.active').classList.remove('active');
        botao.classList.add('active');
        filtrarProdutos(botao.getAttribute('data-filter'));
    });
});


// ─────────────────────────────────────────────
// BLOCO 2 — CARRINHO
// ─────────────────────────────────────────────
let carrinho = [];
const telaTotal = document.querySelector('.cart-total');
const totalModal = document.getElementById('modal-total');

document.querySelectorAll('.add-btn').forEach(botao => {
    botao.addEventListener('click', () => {
        const card = botao.closest('.product-card');
        const preco = parseFloat(card.querySelector('.product-price').textContent.replace('R$', ''));
        const nome  = card.querySelector('.product-name').textContent.toLowerCase();
        const img   = card.querySelector('.product-image').src;

        const existente = carrinho.find(p => p.nome === nome);
        if (existente) {
            existente.quantidade++;
        } else {
            carrinho.push({ nome, preco, imagem: img, quantidade: 1 });
        }

        const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
        telaTotal.textContent = `R$ ${total.toFixed(2)}`;


        // ==========================================
        // Animação focada apenas no ícone
        // ==========================================
        
        // Seleciona especificamente o ícone dentro do carrinho
        const iconeCarrinho = document.querySelector('.cart-floating-btn .material-symbols-outlined');
        
        if (iconeCarrinho) {
            iconeCarrinho.classList.add('animar-carrinho');
            
            iconeCarrinho.addEventListener('animationend', () => {
                iconeCarrinho.classList.remove('animar-carrinho');
            }, { once: true });
        }
        
        // ==========================================

    });
});


// ─────────────────────────────────────────────
// BLOCO 3 — MODAL DO CARRINHO
// ─────────────────────────────────────────────
document.getElementById('fechar').addEventListener('click', () => {
    document.querySelector('.cart-modal').classList.add('hidden');
});

document.querySelector('.cart-floating-btn').addEventListener('click', () => {
    document.querySelector('.cart-modal').classList.remove('hidden');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    renderizarCarrinho();
});

function renderizarCarrinho() {
    const lista = document.getElementById('lista-itens');

    if (carrinho.length === 0) {
        lista.innerHTML = `<p style="text-align:center;color:#888;margin-top:40px">Seu carrinho está vazio!</p>`;
    } else {
        lista.innerHTML = carrinho.map((item, i) => `
            <div class="item-linha">
                <div class="item-info">
                    <img src="${item.imagem}" alt="${item.nome}"
                         style="width:40px;height:40px;object-fit:contain;margin-right:10px;border-radius:5px">
                    <span><strong>${item.quantidade}x</strong> ${item.nome} — R$${(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
                <button class="remove-item-btn" data-index="${i}">-</button>
            </div>`).join('');
    }

    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    totalModal.textContent = `R$ ${total.toFixed(2)}`;

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (carrinho[idx].quantidade > 1) {
                carrinho[idx].quantidade--;
            } else {
                carrinho.splice(idx, 1);
            }
            const t = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
            telaTotal.textContent = t > 0 ? `R$ ${t.toFixed(2)}` : '';
            renderizarCarrinho();
        });
    });
}


// ─────────────────────────────────────────────
// BLOCO 4 — LIMPAR CARRINHO
// ─────────────────────────────────────────────
document.getElementById('limpar-tudo-btn').addEventListener('click', () => {
    if (carrinho.length === 0) return;
    document.getElementById('confirm-popup').classList.remove('hidden');
});

document.getElementById('confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-popup').classList.add('hidden');
});

document.getElementById('confirm-yes').addEventListener('click', () => {
    carrinho = [];
    telaTotal.textContent = '';
    document.getElementById('confirm-popup').classList.add('hidden');
    document.querySelector('.cart-modal').classList.add('hidden');
});


// ─────────────────────────────────────────────
// BLOCO 5 — FINALIZAR PEDIDO (tela de resumo)
// ─────────────────────────────────────────────
document.getElementById('finalizar-btn').addEventListener('click', () => {
    if (carrinho.length === 0) return;

    document.querySelector('.cart-modal').classList.add('hidden');

    const numeroPedido = Math.floor(Math.random() * 9000) + 1000;
    document.getElementById('numero-pedido').textContent = numeroPedido;

    const lista = document.getElementById('resumo-itens-lista');
    lista.innerHTML = '';
    carrinho.forEach(item => {
        lista.innerHTML += `<li><strong>${item.quantidade}x</strong> ${item.nome} — R$ ${item.preco.toFixed(2)}${item.quantidade > 1 ? ' (unidade)' : ''}</li>`;
    });

    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(2)}`;

    document.querySelector('.cart-confirm').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
});

document.getElementById('fecharr').addEventListener('click', () => {
    document.querySelector('.cart-confirm').classList.add('hidden');
});







// ═══════════════════════════════════════════════════════
// BLOCO 6 — FLUXO DE PAGAMENTO PIX
// Clique em "CONTINUAR PARA PAGAMENTO" → abre modal PIX
// Checkbox marcado após 30s → libera botão do WhatsApp
// ═══════════════════════════════════════════════════════

let whatsappUrl = ''; // Guardada aqui, só aberta após confirmar pagamento
let cronometro; // Guardará o intervalo do contador

document.getElementById('confirmar-pedido-btn').addEventListener('click', () => {
    const nomeCliente = document.getElementById('nome-cliente').value;

    if (!nomeCliente.trim() || nomeCliente.length === 1) {
        return alert('Por favor, digite seu nome antes de confirmar o pedido!');
    }

    const numeroPedido = document.getElementById('numero-pedido').textContent;
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    // Monta a mensagem do WhatsApp antecipadamente
    let textoItens = '';
    carrinho.forEach(item => {
        textoItens += `\n${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`;
    });

    const mensagem =
`CANTINA IDB — PEDIDO #${numeroPedido}
------------------------------
Cliente: ${nomeCliente}

ITENS:
${textoItens}
------------------------------
TOTAL: R$ ${total.toFixed(2)}
------------------------------`;

    whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

    // Preenche o modal PIX com os dados certos
    document.getElementById('pix-valor-display').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('pix-chave').textContent = MINHA_CHAVE_PIX;

    // ─────────────────────────────────────────────────────────
    // SISTEMA DE VALIDAÇÃO DE TEMPO (30 SEGUNDOS)
    // ─────────────────────────────────────────────────────────
    const check = document.getElementById('pix-confirmado-check');
    const btnLiberar = document.getElementById('pix-liberar-btn');
    const labelCheck = check.parentElement; // Pega o elemento pai (geralmente o <label>)

    // Reseta o estado dos elementos
    check.checked = false;
    check.disabled = true;       // Trava o checkbox de início
    btnLiberar.disabled = true;

    // Limpa qualquer cronômetro ativo anteriormente (evita bugs se fechar/abrir rápido)
    clearInterval(cronometro);

    let tempoRestante = 20; // Tempo em segundos
    
    // Altera o texto inicial do label para orientar o usuário
    labelCheck.style.opacity = '0.5'; // Deixa meio apagadinho enquanto bloqueado

    cronometro = setInterval(() => {
        tempoRestante--;
        
        // Atualiza o texto do contador se houver uma tag de texto interna
        if (tempoRestante <= 0) {
            clearInterval(cronometro);
            check.disabled = false;     // Libera o checkbox
            labelCheck.style.opacity = '1'; // Volta à cor normal
            
        }
    }, 1000);
    // ─────────────────────────────────────────────────────────

    // Abre o modal PIX e trava o scroll do body
    document.getElementById('pix-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';



    const content_pix = document.querySelector('.pix-body');
    // ATENÇÃO: Removemos o travamento rígido do body aqui para PERMITIR o scroll em celulares
    document.body.style.overflow = 'auto'; 

    // ─────────────────────────────────────────────────────────
    // NOVO: ROLAR ATÉ O FINAL DO MODAL PARA MOSTRAR A CAIXINHA
    // ─────────────────────────────────────────────────────────
    // Usamos um leve timeout de 50ms apenas para dar tempo do navegador renderizar a remoção do 'hidden'
    setTimeout(() => {
        content_pix.scrollTo({
            top: content_pix.scrollHeight,
            behavior: 'smooth' // Faz a rolagem ser macia e visível
        });
    }, 3000);


});

// Fecha o modal PIX com o botão voltar, destrava o scroll e para o cronômetro
document.getElementById('fechar-pix').addEventListener('click', () => {
    clearInterval(cronometro); // Para o contador se o usuário desistir/fechar
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
});

// Botão "Copiar chave"
document.getElementById('pix-copiar-btn').addEventListener('click', () => {
    const chave = document.getElementById('pix-chave').textContent;
    navigator.clipboard.writeText(chave).then(() => {
        const btn  = document.getElementById('pix-copiar-btn');
        const txt  = document.getElementById('pix-copiar-texto');
        btn.classList.add('copiado');
        txt.textContent = 'Copiado!';
        setTimeout(() => {
            btn.classList.remove('copiado');
            txt.textContent = 'Copiar chave';
        }, 2500);
    });
});

// Checkbox "Já realizei o pagamento" → libera o botão
document.getElementById('pix-confirmado-check').addEventListener('change', (e) => {
    document.getElementById('pix-liberar-btn').disabled = !e.target.checked;
});

// Botão "Enviar pedido no WhatsApp" (só ativo após checkbox)
document.getElementById('pix-liberar-btn').addEventListener('click', () => {
    if (document.getElementById('pix-liberar-btn').disabled) return;

    window.open(whatsappUrl, '_blank');

    // Fecha tudo, destrava scroll e limpa o estado
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.querySelector('.cart-confirm').classList.add('hidden');
    carrinho = [];
    telaTotal.textContent = '';

    // Mostra o popup de confirmação final
    const popup = document.getElementById('popup-sucesso');
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 5000);
});









/*
// ═══════════════════════════════════════════════════════
// BLOCO 6 — FLUXO DE PAGAMENTO PIX
// Clique em "PAGAR AGORA" → abre modal PIX
// Checkbox marcado → libera botão do WhatsApp
// ═══════════════════════════════════════════════════════

let whatsappUrl = ''; // Guardada aqui, só aberta após confirmar pagamento

document.getElementById('confirmar-pedido-btn').addEventListener('click', () => {
    const nomeCliente = document.getElementById('nome-cliente').value;

    if (!nomeCliente.trim() || nomeCliente.length === 1) {
        return alert('Por favor, digite seu nome antes de confirmar o pedido!');
    }

    const numeroPedido = document.getElementById('numero-pedido').textContent;
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    // Monta a mensagem do WhatsApp antecipadamente
    let textoItens = '';
    carrinho.forEach(item => {
        textoItens += `\n${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`;
    });

    const mensagem =
`CANTINA IDB — PEDIDO #${numeroPedido}
------------------------------
Cliente: ${nomeCliente}

ITENS:
${textoItens}
------------------------------
TOTAL: R$ ${total.toFixed(2)}
------------------------------
Pedido recebido pelo site.`;

    whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

    // Preenche o modal PIX com os dados certos
    document.getElementById('pix-valor-display').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('pix-chave').textContent = MINHA_CHAVE_PIX;

    // Reseta o checkbox e o botão sempre que abre
    const check = document.getElementById('pix-confirmado-check');
    const btnLiberar = document.getElementById('pix-liberar-btn');
    check.checked = false;
    btnLiberar.disabled = true;

    // Abre o modal PIX e trava o scroll do body
    document.getElementById('pix-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
});

// Fecha o modal PIX com o botão voltar e destrava o scroll
document.getElementById('fechar-pix').addEventListener('click', () => {
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
});

// Botão "Copiar chave"
document.getElementById('pix-copiar-btn').addEventListener('click', () => {
    const chave = document.getElementById('pix-chave').textContent;
    navigator.clipboard.writeText(chave).then(() => {
        const btn  = document.getElementById('pix-copiar-btn');
        const txt  = document.getElementById('pix-copiar-texto');
        btn.classList.add('copiado');
        txt.textContent = 'Copiado!';
        setTimeout(() => {
            btn.classList.remove('copiado');
            txt.textContent = 'Copiar chave';
        }, 2500);
    });
});

// Checkbox "Já realizei o pagamento" → libera o botão
document.getElementById('pix-confirmado-check').addEventListener('change', (e) => {
    document.getElementById('pix-liberar-btn').disabled = !e.target.checked;
});

// Botão "Enviar pedido no WhatsApp" (só ativo após checkbox)
document.getElementById('pix-liberar-btn').addEventListener('click', () => {
    if (document.getElementById('pix-liberar-btn').disabled) return;

    window.open(whatsappUrl, '_blank');

    // Fecha tudo, destrava scroll e limpa o estado
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.querySelector('.cart-confirm').classList.add('hidden');
    carrinho = [];
    telaTotal.textContent = '';

    // Mostra o popup de confirmação final
    const popup = document.getElementById('popup-sucesso');
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 5000);
});*/


// ─────────────────────────────────────────────
// BLOCO 7 — DARK THEME
// ─────────────────────────────────────────────
const themeBtn = document.querySelector('.theme-toggle-btn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');


// ─────────────────────────────────────────────
// BLOCO 8 — BARRA DE BUSCA
// ─────────────────────────────────────────────
const searchBtn   = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const productCards = document.querySelectorAll('.product-card');

searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.classList.toggle('open');
    if (searchInput.classList.contains('open')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        productCards.forEach(c => c.classList.remove('hidden'));
    }
});

searchInput.addEventListener('click', (e) => e.stopPropagation());

document.addEventListener('click', () => {
    if (searchInput.classList.contains('open')) {
        searchInput.classList.remove('open');
        searchInput.value = '';
        productCards.forEach(c => c.classList.remove('hidden'));
    }
});

searchInput.addEventListener('input', () => {
    const t = searchInput.value.toLowerCase();
    productCards.forEach(card => {
        card.classList.toggle('hidden', !card.querySelector('.product-name').textContent.toLowerCase().includes(t));
    });
});