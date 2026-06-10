// ═══════════════════════════════════════════════════════════════════════════════
// ARQUIVO: jschat.js
// PROJETO: Cantina IDB
// DESCRIÇÃO: Toda a lógica do app — carrinho, filtros, pagamento PIX e WhatsApp.
// ═══════════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────
// ⚙️ CONFIGURAÇÕES GLOBAIS
// Aqui ficam os dados que você vai mudar com frequência.
// É boa prática deixar tudo no topo, separado da lógica.
// ─────────────────────────────────────────────

const MINHA_CHAVE_PIX = '12428552465'; // Sua chave PIX (CPF, e-mail, telefone, etc.)
const WHATSAPP_NUMERO = '5581993369736'; // Número do WhatsApp que vai receber os pedidos
                                          // Formato: DDI + DDD + número (sem espaços ou traços)


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 1 — FILTRO DE CATEGORIAS
// Quando o usuário clica em "SALGADOS", "DOCES", etc., só os cards
// daquela categoria aparecem. Os outros ficam escondidos.
// ═══════════════════════════════════════════════════════════════════════════════

// Pega todos os botões de categoria que estão no menu de navegação
const botoes = document.querySelectorAll('.category-item');

// Pega todos os cards de produto da tela
const cardDeProdutos = document.querySelectorAll('.product-card');

// Função que recebe o nome de uma categoria e mostra/esconde os cards
function filtrarProdutos(categoria) {
    // Percorre CADA card de produto um por um
    cardDeProdutos.forEach(card => {
        // Lê o atributo 'data-category' do card (ex: "salgados", "doces")
        const cat = card.getAttribute('data-category');

        // classList.toggle('hidden', condição):
        //   → Se a condição for VERDADEIRA, ADICIONA a classe 'hidden' (esconde o card)
        //   → Se a condição for FALSA, REMOVE a classe 'hidden' (mostra o card)
        //
        // A condição aqui é:
        //   categoria !== 'todos'  → se não clicou em "PARA VOCÊ" (todos)
        //   E
        //   categoria !== cat      → se a categoria do botão não bate com a do card
        card.classList.toggle('hidden', categoria !== 'todos' && categoria !== cat);
    });
}

// Para cada botão de categoria, adiciona um "ouvinte de clique"
botoes.forEach(botao => {
    botao.addEventListener('click', (e) => {
        e.preventDefault(); // Impede que o link (<a href="#">) recarregue a página

        // Remove a marcação visual de "ativo" do botão que estava selecionado antes
        document.querySelector('.category-item.active').classList.remove('active');

        // Coloca a marcação de "ativo" no botão que acabou de ser clicado
        botao.classList.add('active');

        // Chama a função de filtro com o valor do atributo 'data-filter' do botão clicado
        // Ex: data-filter="salgados" → filtrarProdutos('salgados')
        filtrarProdutos(botao.getAttribute('data-filter'));
    });
});


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 2 — CARRINHO (com LocalStorage)
// O carrinho guarda os produtos que o usuário quer comprar.
// Usamos o localStorage para que, se o usuário fechar o app e voltar,
// os itens ainda estejam lá.
// ═══════════════════════════════════════════════════════════════════════════════

// Tenta carregar o carrinho salvo no navegador.
// JSON.parse transforma o texto salvo de volta em um array JavaScript.
// Se não existir nada salvo ainda, começa com um array vazio [].
let carrinho = JSON.parse(localStorage.getItem('carrinho_cantina')) || [];

// Pega o elemento que mostra o total flutuante (o bolão do carrinho na tela)
const telaTotal = document.querySelector('.cart-total');

// Pega o elemento que mostra o total DENTRO do modal do carrinho
const totalModal = document.getElementById('modal-total');

// Função auxiliar para salvar o estado atual do carrinho no navegador.
// Toda vez que o carrinho mudar, chamamos isso para não perder os dados.
// JSON.stringify transforma o array JavaScript em texto (formato JSON) para salvar.
function salvarCarrinho() {
    localStorage.setItem('carrinho_cantina', JSON.stringify(carrinho));
}

// Atualiza o número de total que aparece no botão flutuante do carrinho.
// Usamos .reduce() para somar tudo: percorre cada item e vai acumulando
// (preco × quantidade) em uma variável chamada 'acc' (acumulador).
function atualizarTotalFlutuante() {
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    // Se o total for maior que zero, mostra o valor. Se não, mostra vazio.
    telaTotal.textContent = total > 0 ? `R$ ${total.toFixed(2)}` : '';
    //                                   ↑ toFixed(2) = formata com 2 casas decimais
}

// Chama a função logo quando a página carrega, para exibir o total salvo
atualizarTotalFlutuante();

// Para cada botão "+" de adicionar produto nos cards
document.querySelectorAll('.add-btn').forEach(botao => {
    botao.addEventListener('click', () => {
        // .closest() sobe na árvore HTML até achar o elemento com a classe 'product-card'
        const card = botao.closest('.product-card');

        // Pega o preço do card e converte para número com parseFloat
        // .replace('R$', '') remove o "R$" do texto antes de converter
        const preco = parseFloat(card.querySelector('.product-price').textContent.replace('R$', ''));

        // Pega o nome do produto e converte para letras minúsculas (para comparar igualmente)
        const nome = card.querySelector('.product-name').textContent.toLowerCase();

        // Pega o endereço (src) da imagem do produto
        const img  = card.querySelector('.product-image').src;

        // Verifica se esse produto JÁ existe no carrinho
        // .find() percorre o array e retorna o item que tiver o mesmo nome, ou 'undefined'
        const existente = carrinho.find(p => p.nome === nome);

        if (existente) {
            // Se já existe, só aumenta a quantidade em 1
            existente.quantidade++;
        } else {
            // Se não existe, adiciona um novo objeto no array do carrinho
            carrinho.push({ nome, preco, imagem: img, quantidade: 1 });
        }

        salvarCarrinho();         // Salva o carrinho atualizado no localStorage
        atualizarTotalFlutuante(); // Atualiza o valor visível no botão flutuante

        // ── Animação do ícone do carrinho ──
        // Pega o ícone de carrinho (o símbolo de sacola)
        const iconeCarrinho = document.querySelector('.cart-floating-btn .material-symbols-outlined');
        if (iconeCarrinho) {
            // Adiciona a classe que dispara a animação CSS de "pulo"
            iconeCarrinho.classList.add('animar-carrinho');

            // Quando a animação terminar, remove a classe para poder reutilizá-la depois
            // { once: true } significa: ouve o evento só uma vez, depois se auto-remove
            iconeCarrinho.addEventListener('animationend', () => {
                iconeCarrinho.classList.remove('animar-carrinho');
            }, { once: true });
        }
    });
});


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 3 — MODAL DO CARRINHO
// A janela que aparece quando o usuário clica no botão flutuante do carrinho.
// ═══════════════════════════════════════════════════════════════════════════════

// Botão "X" para fechar o modal — adiciona a classe 'hidden' que some com o modal
document.getElementById('fechar').addEventListener('click', () => {
    document.querySelector('.cart-modal').classList.add('hidden');
});

// Botão flutuante do carrinho — abre o modal e rola a página para baixo
document.querySelector('.cart-floating-btn').addEventListener('click', () => {
    document.querySelector('.cart-modal').classList.remove('hidden'); // Mostra o modal
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Rola pra baixo
    renderizarCarrinho(); // Monta a lista de itens dentro do modal
});

// Função que "desenha" os itens do carrinho dentro do modal
function renderizarCarrinho() {
    // Pega o elemento <div> onde os itens serão inseridos
    const lista = document.getElementById('lista-itens');

    if (carrinho.length === 0) {
        // Se o carrinho estiver vazio, mostra uma mensagem
        lista.innerHTML = `<p style="text-align:center;color:#888;margin-top:40px">Seu carrinho está vazio!</p>`;
    } else {
        // Se tiver itens, gera o HTML de cada um usando .map() e .join()
        // .map() transforma cada item do array em uma string HTML
        // .join('') junta todas as strings em uma só, sem separador
        lista.innerHTML = carrinho.map((item, i) => `
            <div class="item-linha">
                <div class="item-info">
                    <img src="${item.imagem}" alt="${item.nome}"
                         style="width:40px;height:40px;object-fit:contain;margin-right:10px;border-radius:5px">
                    <span style="text-transform:uppercase; font-size: 0.85rem;"><strong>${item.quantidade}x</strong> ${item.nome} — R$${(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
                <button class="remove-item-btn" data-index="${i}">-</button>
                <!--  ↑ data-index guarda a posição do item no array, para saber qual remover -->
            </div>`).join('');
    }

    // Calcula o total e exibe no rodapé do modal
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    totalModal.textContent = `R$ ${total.toFixed(2)}`;

    // Adiciona o evento de clique em cada botão "-" (remover item)
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Lê o índice do item a partir do atributo data-index
            const idx = parseInt(btn.getAttribute('data-index'));

            if (carrinho[idx].quantidade > 1) {
                // Se tem mais de 1 unidade, só diminui a quantidade
                carrinho[idx].quantidade--;
            } else {
                // Se tem só 1, remove o item completamente do array
                // .splice(posição, quantidade_a_remover)
                carrinho.splice(idx, 1);
            }

            salvarCarrinho();          // Salva o carrinho atualizado
            atualizarTotalFlutuante(); // Atualiza o total no botão flutuante
            renderizarCarrinho();      // Re-desenha a lista para refletir a mudança
        });
    });
}


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 4 — LIMPAR CARRINHO
// Quando o usuário clica em "Limpar Carrinho", um popup de confirmação aparece
// para evitar que limpem o carrinho sem querer.
// ═══════════════════════════════════════════════════════════════════════════════

// Clique em "Limpar Carrinho"
document.getElementById('limpar-tudo-btn').addEventListener('click', () => {
    if (carrinho.length === 0) return; // Se já está vazio, não faz nada
    document.getElementById('confirm-popup').classList.remove('hidden'); // Mostra o popup
});

// Clique em "Cancelar" dentro do popup
document.getElementById('confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-popup').classList.add('hidden'); // Fecha o popup sem fazer nada
});

// Clique em "Sim, limpar" dentro do popup
document.getElementById('confirm-yes').addEventListener('click', () => {
    carrinho = [];         // Esvazia o array do carrinho
    salvarCarrinho();      // Salva o array vazio no localStorage (apaga os dados salvos)
    telaTotal.textContent = ''; // Limpa o texto do total no botão flutuante
    document.getElementById('confirm-popup').classList.add('hidden');    // Fecha o popup
    document.querySelector('.cart-modal').classList.add('hidden');       // Fecha o modal do carrinho
});


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 5 — FINALIZAR PEDIDO (Tela de Resumo)
// Quando o usuário clica em "Finalizar Pedido", vai para uma tela
// que mostra um resumo dos itens antes de pagar.
// ═══════════════════════════════════════════════════════════════════════════════

// Clique no botão "Finalizar Pedido" dentro do modal do carrinho
document.getElementById('finalizar-btn').addEventListener('click', () => {
    if (carrinho.length === 0) return; // Se o carrinho estiver vazio, não faz nada

    // Fecha o modal do carrinho
    document.querySelector('.cart-modal').classList.add('hidden');

    // Gera um número de pedido aleatório entre 1000 e 9999
    // Math.random() → número entre 0 e 1
    // × 9000 → número entre 0 e 9000
    // Math.floor() → arredonda para baixo (tira os decimais)
    // + 1000 → garante que começa em 1000
    const numeroPedido = Math.floor(Math.random() * 9000) + 1000;
    document.getElementById('numero-pedido').textContent = numeroPedido;

    // Monta a lista de itens no resumo
    const lista = document.getElementById('resumo-itens-lista');
    lista.innerHTML = ''; // Limpa antes de adicionar
    carrinho.forEach(item => {
        // Para cada item, cria um <li> com as informações
        lista.innerHTML += `<li><strong>${item.quantidade}x </strong> 
        ${item.nome} — R$ ${item.preco.toFixed(2)}${item.quantidade > 1 ? ' (unidade)' : ''}</li>`;
        //                                                                                    ↑ Operador ternário: se quantidade > 1, mostra "(unidade)", senão, nada
    });

    // Calcula e mostra o total na tela de resumo
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(2)}`;

    // Mostra a tela de resumo/confirmação
    document.querySelector('.cart-confirm').classList.remove('hidden');

    // Rola a página para o topo automaticamente
    window.scrollTo({ top: 0, behavior: 'auto' });
});

// Botão de voltar (seta) na tela de resumo
document.getElementById('fecharr').addEventListener('click', () => {
    document.querySelector('.cart-confirm').classList.add('hidden'); // Esconde a tela de resumo
});


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 6 — FLUXO DE PAGAMENTO PIX
// Depois que o usuário confirma o pedido e digita o nome,
// abre o modal do PIX com a chave e as instruções.
// ═══════════════════════════════════════════════════════════════════════════════

let whatsappUrl = ''; // Variável global que vai guardar o link do WhatsApp montado
let cronometro;       // Variável global que vai guardar o ID do setInterval (para poder cancelá-lo)

// Clique em "CONTINUAR PARA PAGAMENTO" na tela de resumo
document.getElementById('confirmar-pedido-btn').addEventListener('click', () => {
    // Pega o nome que o usuário digitou no campo de texto
    const inputCliente = document.getElementById('nome-cliente');
    const nomeCliente = document.getElementById('nome-cliente').value;

    // Validação: o nome não pode estar vazio ou ter só 1 caractere
    if (!nomeCliente.trim() || nomeCliente.length === 1) {
        // .trim() remove espaços do início e fim (evita que " " passe na validação)
        inputCliente.focus();
        return
        // 'return' aqui interrompe a função — o código abaixo não executa
    }

    // Pega o número do pedido da tela
    const numeroPedido = document.getElementById('numero-pedido').textContent;

    // Calcula o total do pedido
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    // Monta o texto da mensagem que vai ser enviada no WhatsApp
    // Começa com uma string vazia e vai adicionando cada item
    let textoItens = '';
    carrinho.forEach(item => {
        textoItens += `\n${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`;
        // \n = quebra de linha no texto
    });

    // Monta a mensagem completa usando um "template literal" (texto entre crases ` `)
    const mensagem =
`CANTINA IDB — PEDIDO #${numeroPedido}
------------------------------
Cliente: ${nomeCliente}

ITENS:
${textoItens}
------------------------------
TOTAL: R$ ${total.toFixed(2)}
------------------------------`;

    // Monta a URL do WhatsApp com o número e a mensagem
    // encodeURIComponent() converte caracteres especiais (espaços, quebras de linha, etc.)
    // para o formato aceito em URLs
    whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

    // Preenche os dados na tela do PIX
    document.getElementById('pix-valor-display').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('pix-chave').textContent = MINHA_CHAVE_PIX;

    // Pega os elementos do checkbox e do botão de liberar
    const check      = document.getElementById('pix-confirmado-check');
    const btnLiberar = document.getElementById('pix-liberar-btn');
    const labelCheck = check.parentElement; // O elemento <label> que envolve o checkbox

    // Reseta o estado: desmarca o checkbox e desabilita tudo
    check.checked    = false;
    check.disabled   = true;      // Bloqueia o checkbox inicialmente
    btnLiberar.disabled = true;   // Bloqueia o botão de enviar

    // Cancela qualquer cronômetro anterior que possa estar rodando
    clearInterval(cronometro);

    let tempoRestante = 10; // O usuário precisa esperar 10 segundos antes de poder marcar o checkbox
    labelCheck.style.opacity = '0.5'; // Deixa o label mais transparente para indicar que está bloqueado

    // setInterval executa uma função repetidamente a cada X milissegundos
    // Aqui executa a cada 1000ms (1 segundo)
    cronometro = setInterval(() => {
        tempoRestante--; // Diminui 1 segundo
        if (tempoRestante <= 0) {
            clearInterval(cronometro);          // Para o cronômetro quando chegar a zero
            check.disabled = false;             // Libera o checkbox
            labelCheck.style.opacity = '1';    // Restaura a opacidade normal
        }
    }, 1000);

    // Mostra o modal do PIX
    document.getElementById('pix-modal').classList.remove('hidden');

    // Pega o corpo do modal PIX (área com scroll)
    const content_pix = document.querySelector('.pix-body');
    document.body.style.overflow = 'auto'; // Garante que a página possa rolar

    // Após 3 segundos, rola o conteúdo do modal para baixo automaticamente
    // (para o usuário ver a área do checkbox sem precisar rolar manualmente)
    setTimeout(() => {
        content_pix.scrollTo({
            top: content_pix.scrollHeight, // Rola até o final
            behavior: 'smooth'             // Com animação suave
        });
    }, 3000); // 3000ms = 3 segundos de delay
});

// Botão de fechar o modal PIX (seta de voltar)
document.getElementById('fechar-pix').addEventListener('click', () => {
    clearInterval(cronometro); // Para o cronômetro caso esteja rodando
    document.getElementById('pix-modal').classList.add('hidden'); // Esconde o modal
    // Restaura o scroll e posicionamento normais da página
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
});

// Botão "Copiar chave" do PIX
document.getElementById('pix-copiar-btn').addEventListener('click', () => {
    const chave = document.getElementById('pix-chave').textContent; // Pega o texto da chave

    // navigator.clipboard.writeText() copia o texto para a área de transferência do celular/pc
    // É uma Promise: .then() executa quando a cópia for bem-sucedida
    navigator.clipboard.writeText(chave).then(() => {
        const btn = document.getElementById('pix-copiar-btn');
        const txt = document.getElementById('pix-copiar-texto');
        btn.classList.add('copiado');      // Muda a cor do botão (CSS cuida disso)
        txt.textContent = 'Copiado!';      // Muda o texto do botão

        // Após 2,5 segundos, volta ao estado original
        setTimeout(() => {
            btn.classList.remove('copiado');
            txt.textContent = 'Copiar chave';
        }, 2500);
    });
});

// Evento no checkbox "Já realizei o pagamento"
document.getElementById('pix-confirmado-check').addEventListener('change', (e) => {
    // e.target.checked = true se o checkbox está marcado, false se desmarcado
    // O botão de liberar fica habilitado SOMENTE se o checkbox estiver marcado
    document.getElementById('pix-liberar-btn').disabled = !e.target.checked;
});

// Botão "Enviar pedido no WhatsApp"
document.getElementById('pix-liberar-btn').addEventListener('click', () => {
    // Verificação de segurança extra: não faz nada se o botão ainda estiver desabilitado
    if (document.getElementById('pix-liberar-btn').disabled) return;

    // ── Salva o pedido no histórico ──
    const numeroPedido = document.getElementById('numero-pedido').textContent;
    const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    // Carrega o histórico existente do localStorage, ou começa com array vazio
    let historico = JSON.parse(localStorage.getItem('historico_pedidos')) || [];

    // Cria o objeto com os dados do pedido atual
    const novoPedido = {
        numero: numeroPedido,
        // new Date() = data/hora atual
        // toLocaleDateString('pt-BR') = formata como "DD/MM/AAAA"
        // toLocaleTimeString = formata como "HH:MM"
        data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        total: total,
        itens: [...carrinho] // Cópia do array do carrinho (spread operator [...] evita referência ao original)
    };

    historico.unshift(novoPedido); // .unshift() adiciona no INÍCIO do array (mais recente primeiro)
    localStorage.setItem('historico_pedidos', JSON.stringify(historico)); // Salva o histórico atualizado
    // ────────────────────────────────

    // Abre o WhatsApp em uma nova aba com a mensagem do pedido já preenchida
    window.open(whatsappUrl, '_blank');

    // Fecha todos os modais e telas abertas
    document.getElementById('pix-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.querySelector('.cart-confirm').classList.add('hidden');

    // Limpa o carrinho completamente
    carrinho = [];
    salvarCarrinho();           // Salva o carrinho vazio no localStorage
    telaTotal.textContent = ''; // Limpa o total do botão flutuante

    // Mostra o popup de sucesso ("Estamos separando seu pedido!")
    const popup = document.getElementById('popup-sucesso');
    popup.classList.remove('hidden'); // Mostra o popup

    // Após 5 segundos, esconde o popup automaticamente
    setTimeout(() => popup.classList.add('hidden'), 5000);
});


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 7 — DARK THEME (Modo Escuro)
// Alterna entre o tema claro e escuro ao clicar no botão de contraste.
// A preferência é salva no localStorage para ser lembrada na próxima visita.
// ═══════════════════════════════════════════════════════════════════════════════

// Pega o botão de alternar tema (o ícone de contraste no topo)
const themeBtn = document.querySelector('.theme-toggle-btn');

// Ao clicar, alterna a classe 'dark-theme' no <body>
// classList.toggle() adiciona a classe se não existe, ou remove se já existe
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    // Salva a preferência: 'dark' se o tema escuro está ativo, 'light' se não está
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Quando a página carrega, verifica se o usuário tinha escolhido o tema escuro antes
// Se sim, aplica o tema escuro imediatamente
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');


// ═══════════════════════════════════════════════════════════════════════════════
// BLOCO 8 — BARRA DE BUSCA
// Um campo de texto que aparece/desaparece ao clicar na lupa.
// Filtra os produtos conforme o usuário digita.
// ═══════════════════════════════════════════════════════════════════════════════

const searchBtn    = document.getElementById('search-btn');    // Botão da lupa
const searchInput  = document.getElementById('search-input');  // Campo de texto da busca
const productCards = document.querySelectorAll('.product-card'); // Todos os cards de produto

// Clique no botão da lupa
searchBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Impede que o clique "suba" para o document e feche a barra imediatamente

    // Alterna a classe 'open' no input (o CSS cuida de animar a abertura/fechamento)
    searchInput.classList.toggle('open');

    if (searchInput.classList.contains('open')) {
        searchInput.focus(); // Coloca o cursor dentro do campo automaticamente
    } else {
        // Se está fechando, limpa o texto digitado e mostra todos os cards novamente
        searchInput.value = '';
        productCards.forEach(c => c.classList.remove('hidden'));
    }
});

// Impede que clicar dentro do input feche a barra (por causa do listener no document abaixo)
searchInput.addEventListener('click', (e) => e.stopPropagation());

// Clicar em qualquer lugar FORA fecha a barra de busca
document.addEventListener('click', () => {
    if (searchInput.classList.contains('open')) {
        searchInput.classList.remove('open');
        searchInput.value = '';
        productCards.forEach(c => c.classList.remove('hidden')); // Mostra todos os cards de volta
    }
});

// Enquanto o usuário digita na barra de busca
searchInput.addEventListener('input', () => {
    // Converte o texto digitado para minúsculas (para a comparação não ser case-sensitive)
    const low = searchInput.value.toLowerCase();

    // Para cada card, esconde se o nome do produto NÃO contém o texto buscado
    // .includes() retorna true se encontrar o texto dentro da string
    productCards.forEach(card => {
        card.classList.toggle('hidden', !card.querySelector('.product-name').textContent.toLowerCase().includes(low));
    });
});