// ─────────────────────────────────────────────
// BLOCO 1 — FILTRO DE CATEGORIAS
// ─────────────────────────────────────────────

// Pega todos os botões de categoria (PARA VOCÊ, SALGADOS, DOCES)
const botoes = document.querySelectorAll('.category-item');

// Pega todos os cards de produto da grade
const cardDeProdutos = document.querySelectorAll('.product-card');

// Função que recebe uma categoria e mostra/esconde os cards
function filtrarProdutos(categoria) {
    
    // Percorre cada card individualmente
    cardDeProdutos.forEach(card => {
        
        // Lê o atributo data-category do card (ex: "salgados" ou "doces")
        const categoriaDoProduto = card.getAttribute('data-category');

        // Se a categoria for "todos" OU bater com a do card, mostra
        if (categoria === 'todos' || categoria === categoriaDoProduto) {
            card.classList.remove('hidden');
        } else {
            // Senão, esconde adicionando a classe hidden (display: none no CSS)
            card.classList.add('hidden');
        }
    });
}

// Adiciona um listener de clique em cada botão de categoria
botoes.forEach(botao => {
    botao.addEventListener('click', (e) => {

        e.preventDefault();

        // Remove a classe 'active' do botão que estava ativo antes
        document.querySelector('.category-item.active').classList.remove('active');

        // Coloca a classe 'active' no botão que acabou de ser clicado
        botao.classList.add('active');

        // Lê qual filtro esse botão representa (vem do atributo data-filter no HTML)
        const filtroSelecionado = botao.getAttribute('data-filter');

        // Chama a função de filtro passando o valor lido acima
        filtrarProdutos(filtroSelecionado);
    });
});


// ─────────────────────────────────────────────
// BLOCO 2 — CARRINHO (ARRAY DE ITENS)
// ─────────────────────────────────────────────

// Array que guarda os itens do carrinho como objetos {nome, preco, imagem, quantidade}
let carrinho = [];

// Pega todos os botões "+" de cada card de produto
const botaoAdd = document.querySelectorAll('.add-btn');

// Pega o elemento que mostra o total no botão flutuante preto
const telaTotal = document.querySelector('.cart-total');

// Pega o elemento que mostra o total dentro do modal
const totalModal = document.getElementById('modal-total');

// Adiciona listener de clique em cada botão "+"
botaoAdd.forEach(botao => {
    botao.addEventListener('click', () => {

        // Sobe na árvore do HTML a partir do botão até encontrar o card pai
        const cardDoProduto = botao.closest('.product-card');

        // Lê o texto do preço (ex: "R$7.00")
        const precoEmTexto = cardDoProduto.querySelector('.product-price').textContent;

        // Remove o "R$" e converte para número decimal (ex: 7.00)
        const precoEmReal = parseFloat(precoEmTexto.replace('R$', ''));

        // Lê o nome do produto e deixa em minúsculo pra padronizar a comparação
        const nomeEmTexto = cardDoProduto.querySelector('.product-name').textContent.toLowerCase();

        // Lê o caminho da imagem do produto para guardar no objeto
        const urlImagem = cardDoProduto.querySelector('.product-image').src;

        // Verifica se esse produto já existe no carrinho (pelo nome)
        // find() percorre o array e retorna o objeto encontrado, ou undefined se não achar
        const itemExistente = carrinho.find(p => p.nome === nomeEmTexto);

        if (itemExistente) {
            // Se já existe, só aumenta a quantidade — não cria um item duplicado
            itemExistente.quantidade++;
        } else {
            // Se não existe, cria um objeto novo com todas as informações do produto
            const item = {
                nome: nomeEmTexto,
                preco: precoEmReal,
                imagem: urlImagem,
                quantidade: 1 // começa com 1 unidade
            };
            // Adiciona o objeto no final do array carrinho
            carrinho.push(item);
        }

        // Recalcula o total somando (preco * quantidade) de cada item do array
        // reduce() acumula um valor percorrendo o array — começa do 0
        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // Atualiza o texto do botão flutuante com o novo total formatado
        telaTotal.textContent = `R$ ${total.toFixed(2)}`;
    });
});


// ─────────────────────────────────────────────
// BLOCO 3 — ABRIR E RENDERIZAR O MODAL
// ─────────────────────────────────────────────

// Botão "X" — fecha o modal adicionando a classe hidden de volta
document.getElementById('fechar').addEventListener('click', () => {
    document.querySelector('.cart-modal').classList.add('hidden');
});

// Botão flutuante do carrinho — abre o modal e renderiza os itens
document.querySelector('.cart-floating-btn').addEventListener('click', () => {

    // Remove o hidden do modal, tornando ele visível
    document.querySelector('.cart-modal').classList.remove('hidden');

    // [NOVO]: Força a página inteira a rolar até o final (fundo)
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth' // Faz a rolagem ser suave e bonita
    });

    // Variável que vai acumular o HTML de cada item para inserir de uma vez
    let listaHTML = '';

    if (carrinho.length === 0) {
        // Se o array estiver vazio, mostra mensagem de carrinho vazio
        listaHTML = `<p style="text-align: center; color: #888; margin-top: 40px;">Seu carrinho está vazio!</p>`;
    } else {
        // Percorre cada item do array e monta uma linha HTML para ele
        // index é a posição do item no array (0, 1, 2...) — usado no botão remover
        carrinho.forEach((item, index) => {

            // Calcula o subtotal desse item (preco × quantidade)
            const precoSubtotal = item.preco * item.quantidade;

            // Concatena o HTML desse item na string listaHTML
            // data-index guarda a posição do item para o botão remover saber qual deletar
            listaHTML += `
                <div class="item-linha">
                    <div class="item-info">
                        <img src="${item.imagem}" alt="${item.nome}" 
                             style="width:40px;height:40px;object-fit:contain;margin-right:10px;border-radius:5px;">
                        <span><strong>${item.quantidade}x</strong> ${item.nome} - R$${precoSubtotal.toFixed(2)}</span>
                    </div>
                    <button class="remove-item-btn" data-index="${index}">-</button>
                </div>`;
        });
    }

    // Injeta todo o HTML construído acima de uma vez dentro da lista do modal
    document.getElementById('lista-itens').innerHTML = listaHTML;

    // Recalcula e exibe o total geral no rodapé do modal
    const totalGeral = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    totalModal.textContent = `R$ ${totalGeral.toFixed(2)}`;


    // ─────────────────────────────────────────────
    // BLOCO 4 — REMOVER ITENS INDIVIDUAIS
    // ─────────────────────────────────────────────

    // Pega os botões "-" que acabaram de ser criados pelo innerHTML acima
    // (precisa ser aqui porque antes do innerHTML eles não existiam no DOM)
    const botoesRemover = document.querySelectorAll('.remove-item-btn');

    botoesRemover.forEach(botao => {
        botao.addEventListener('click', () => {

            // Lê o data-index do botão clicado — sabe qual item do array mexer
            const index = botao.getAttribute('data-index');

            if (carrinho[index].quantidade > 1) {
                // Se tiver mais de 1 unidade, só diminui a quantidade
                carrinho[index].quantidade--;
            } else {
                // Se tiver só 1, remove o item inteiro do array
                // splice(index, 1) = "a partir da posição index, remove 1 elemento"
                carrinho.splice(index, 1);
            }

            // Recalcula e atualiza o total do botão flutuante
            const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            telaTotal.textContent = `R$ ${total.toFixed(2)}`;

            // Re-abre o modal clicando no botão flutuante programaticamente
            // Isso re-renderiza toda a lista com os índices corretos e total atualizado
            // É por isso que o bug de index não aparece — a lista é reconstruída do zero
            document.querySelector('.cart-floating-btn').click();
        });
    });
});


// ─────────────────────────────────────────────
// BLOCO 5 — LIMPAR CARRINHO INTEIRO (COM POPUP)
// ─────────────────────────────────────────────

// Clique em "Limpar Carrinho" — abre o popup de confirmação em vez de limpar direto
// Isso evita que o usuário limpe o carrinho por acidente
document.getElementById('limpar-tudo-btn').addEventListener('click', () => {
    if(carrinho.length === 0){
        return
    }
    document.getElementById('confirm-popup').classList.remove('hidden');
});

// Clique em "Cancelar" no popup — fecha o popup sem fazer nada
document.getElementById('confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-popup').classList.add('hidden');
});

// Clique em "Sim, limpar" no popup — executa a limpeza de verdade
document.getElementById('confirm-yes').addEventListener('click', () => {

    // Esvazia o array — todos os objetos de item são descartados
    carrinho = [];

    // Zera o total no botão flutuante
    telaTotal.textContent = ``;

    // Fecha o popup
    document.getElementById('confirm-popup').classList.add('hidden');

    // Fecha o modal do carrinho
    document.querySelector('.cart-modal').classList.add('hidden');
});
        //─────────────────────────────────────────────
                    // FINALIZAR PEDIDO
        //─────────────────────────────────────────────
document.getElementById('finalizar-btn').addEventListener('click', () =>{
    if(carrinho.length===0){
        return
    }
    // fechando modal do carrinho
    document.querySelector('.cart-modal').classList.add('hidden');

    // gerando numero do pedido
    const numeroDoPedido       = Math.floor(Math.random() * 9000) + 1000;

    // pegando onde vai ficar o numero do pedido e guardando na variavel
    const exibirNumeroDoPedido = document.getElementById('numero-pedido');

    // exibindo o numero do pedido na tela
    exibirNumeroDoPedido.textContent = `${numeroDoPedido}`

    const lista = document.getElementById('resumo-itens-lista');
    // map pra percorrer oq estiver no carrinho

    // zera antes de ir pro forEach pra previnir de sempre ficar o mesmo item lá
    lista.innerHTML = ''

    carrinho.forEach((item) => { 
    // adicionando informações no html da lista de resumo
    lista.innerHTML += `<li><span><strong>${item.quantidade}</strong>x </span>${item.nome} - R$ ${item.preco}</li>`; 
});
    //removendo classe hidden para que a tela de confirmação apareca
    document.querySelector('.cart-confirm').classList.remove('hidden');
    // [NOVO]: Força a página a pular direto para o topo absoluto (início)
    window.scrollTo({
        top: 0,
        behavior: 'auto' // 'auto' faz o pulo ser instantâneo para não atrasar o usuário
});

    // calculando total 
    const totalDaConfirmacao = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
    //pegando onde vai ficar o valor total e guardando na variavel
    const telaTotal = document.getElementById('checkout-total');
    // inserindo na tela o total
    telaTotal.textContent = ` R$ ${totalDaConfirmacao.toFixed(2)}`
});
// BOTAO DE FECHAR CONFIRMAÇÃO DE PEDIDO

document.getElementById('fecharr').addEventListener('click', () =>{
    document.querySelector('.cart-confirm').classList.add('hidden');
})

        //─────────────────────────────────────
                // CONFIRMAR PEDIDO
        //─────────────────────────────────────

document.getElementById('confirmar-pedido-btn').addEventListener('click', () =>{
    // pegando numero do pedido
    const numeroDoPedido_confirm = document.getElementById('numero-pedido').textContent;
    // pegando nome do cliente
    const nomeCliente = document.getElementById('nome-cliente').value;
    // validando nome do cliente
    if(!nomeCliente.trim() || nomeCliente.length === 1){
        return alert('Por favor, digite seu nome antes de confirmar o pedido!')
    }
    // criando variavel pra poder jogar informação dentro
    let texto_confirm = ''
    // for each pra percorrer cada item,quantidade e preco e acrescentae um texto a ele
    carrinho.forEach((item) => {
        texto_confirm += `\n${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`
    })
    // soma do carrinho
    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
    // mensagem que chega no whatsApp
    const mensagem = 
`CANTINA IDB — PEDIDO #${numeroDoPedido_confirm}
------------------------------
Cliente: ${nomeCliente}

ITENS:
${texto_confirm}
------------------------------
TOTAL: R$ ${total.toFixed(2)}
------------------------------
Pedido enviado pelo app da Cantina IDB.`
    // variavel quer ler msg e codifica pra URL
    const url = `https://wa.me/5581993369736?text=${encodeURIComponent(mensagem)}`

    // POPUP DE CONFIRMAÇÃO
    document.getElementById('popup-sucesso').classList.remove('hidden');

    // abre o whats depois de 2sgs
    setTimeout(() => {
        document.getElementById('popup-sucesso').classList.add('hidden');
        window.location.href = url;
    }, 1300);
    
});