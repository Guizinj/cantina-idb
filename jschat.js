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
// BLOCO 2 — CARRINHO (Com LocalStorage)
// ─────────────────────────────────────────────
// NOVO: Inicializa o carrinho com o que estiver salvo ou com uma lista vazia
let carrinho = JSON.parse(localStorage.getItem('carrinho_cantina')) || [];

const telaTotal = document.querySelector('.cart-total');
const totalModal = document.getElementById('modal-total');

// NOVO: Função auxiliar para salvar o estado atual do carrinho
function salvarCarrinho() {
    localStorage.setItem('carrinho_cantina', JSON.stringify(carrinho));
}

// NOVO: Atualiza o total flutuante da tela logo ao carregar a página se houver itens
function atualizarTotalFlutuante() {
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    telaTotal.textContent = total > 0 ? `R$ ${total.toFixed(2)}` : '';
}
atualizarTotalFlutuante(); // Executa ao iniciar a página

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

        salvarCarrinho(); // NOVO: Salva no localStorage
        atualizarTotalFlutuante();

        // ==========================================
        // Animação focada apenas no ícone
        // ==========================================
        const iconeCarrinho = document.querySelector('.cart-floating-btn .material-symbols-outlined');
        if (iconeCarrinho) {
            iconeCarrinho.classList.add('animar-carrinho');
            iconeCarrinho.addEventListener('animationend', () => {
                iconeCarrinho.classList.remove('animar-carrinho');
            }, { once: true });
        }
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
            
            salvarCarrinho(); // NOVO: Salva a remoção no localStorage
            atualizarTotalFlutuante();
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
    salvarCarrinho(); // NOVO: Limpa o localStorage também
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
// ═══════════════════════════════════════════════════════

let whatsappUrl = ''; 
let cronometro; 

document.getElementById('confirmar-pedido-btn').addEventListener('click', () => {
    const nomeCliente = document.getElementById('nome-cliente').value;

    if (!nomeCliente.trim() || nomeCliente.length === 1) {
        return alert('Por favor, digite seu nome antes de confirmar o pedido!');
    }

    const numeroPedido = document.getElementById('numero-pedido').textContent;
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

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

    document.getElementById('pix-valor-display').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('pix-chave').textContent = MINHA_CHAVE_PIX;

    const check = document.getElementById('pix-confirmado-check');
    const btnLiberar = document.getElementById('pix-liberar-btn');
    const labelCheck = check.parentElement; 

    check.checked = false;
    check.disabled = true;       
    btnLiberar.disabled = true;

    clearInterval(cronometro);
    let tempoRestante = 10; 
    labelCheck.style.opacity = '0.5'; 

    cronometro = setInterval(() => {
        tempoRestante--;
        if (tempoRestante <= 0) {
            clearInterval(cronometro);
            check.disabled = false;     
            labelCheck.style.opacity = '1'; 
        }
    }, 1000);

    document.getElementById('pix-modal').classList.remove('hidden');
    const content_pix = document.querySelector('.pix-body');
    document.body.style.overflow = 'auto'; 

    setTimeout(() => {
        content_pix.scrollTo({
            top: content_pix.scrollHeight,
            behavior: 'smooth' 
        });
    }, 3000);
});

document.getElementById('fechar-pix').addEventListener('click', () => {
    clearInterval(cronometro); 
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
});

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

document.getElementById('pix-confirmado-check').addEventListener('change', (e) => {
    document.getElementById('pix-liberar-btn').disabled = !e.target.checked;
});

// Botão "Enviar pedido no WhatsApp"
document.getElementById('pix-liberar-btn').addEventListener('click', () => {
    if (document.getElementById('pix-liberar-btn').disabled) return;

    // ─────────────────────────────────────────────────────────
    // NOVO: SALVAR NO HISTÓRICO DE PEDIDOS ANTES DE LIMPAR
    // ─────────────────────────────────────────────────────────
    const numeroPedido = document.getElementById('numero-pedido').textContent;
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    
    // Pega o histórico existente ou cria um array vazio
    let historico = JSON.parse(localStorage.getItem('historico_pedidos')) || [];
    
    // Cria o objeto do novo pedido com a data atual
    const novoPedido = {
        numero: numeroPedido,
        data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        total: total,
        itens: [...carrinho] // Faz uma cópia dos itens atuais do carrinho
    };
    
    historico.unshift(novoPedido); // Adiciona no início da lista (mais recente primeiro)
    localStorage.setItem('historico_pedidos', JSON.stringify(historico)); // Salva no banco
    // ─────────────────────────────────────────────────────────

    window.open(whatsappUrl, '_blank');

    // Fecha tudo e limpa o carrinho
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.querySelector('.cart-confirm').classList.add('hidden');
    
    carrinho = [];
    salvarCarrinho(); // Zera o carrinho salvo no localStorage
    telaTotal.textContent = '';

    const popup = document.getElementById('popup-sucesso');
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 5000);
});


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