
const produtos = [
    {
        id: 1,
        nome: "Bolo de Chocolate",
        categoria: "Bolos",
        descricao: "Bolo de chocolate preparado artesanalmente.",
        preco: 65.00,
        imagem: "assets/img/produtos/bolo-chocolate.jpg",
        unidade: "kg",
        disponivel: true
    },
    {
        id: 2,
        nome: "Bolo Amanteigado",
        categoria: "Bolos",
        descricao: "Bolo amanteigado.",
        preco: 60.00,
        imagem: "assets/img/produtos/bolo-amanteigado.jpg",
        unidade: "kg",
        disponivel: true
    }
];

// Elementos da página
const gradeProdutos = document.getElementById("gradeProdutos");
const buscaProduto = document.getElementById("buscaProduto");
const filtroCategoria = document.getElementById("filtroCategoria");
const mensagemVazia = document.getElementById("mensagemVazia");

// Formatação de valores
function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Proteção de conteúdo HTML
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

// Carregar categorias
function carregarCategorias() {
    const categorias = [...new Set(
        produtos
            .filter(p => p.disponivel !== false)
            .map(p => p.categoria)
            .filter(Boolean)
    )];

    categorias.sort((a, b) => a.localeCompare(b, "pt-BR"));

    categorias.forEach(categoria => {
        const opcao = document.createElement("option");
        opcao.value = categoria;
        opcao.textContent = categoria;
        filtroCategoria.appendChild(opcao);
    });
}

// Exibir produtos
function exibirProdutos() {
    const termo = buscaProduto.value.trim().toLowerCase();
    const categoriaSelecionada = filtroCategoria.value;

    const lista = produtos.filter(produto => {
        const disponivel = produto.disponivel !== false;

        const correspondeBusca =
            produto.nome.toLowerCase().includes(termo) ||
            (produto.descricao || "").toLowerCase().includes(termo);

        const correspondeCategoria =
            !categoriaSelecionada ||
            produto.categoria === categoriaSelecionada;

        return disponivel && correspondeBusca && correspondeCategoria;
    });

    gradeProdutos.innerHTML = "";

    if (lista.length === 0) {
        mensagemVazia.hidden = false;

        mensagemVazia.querySelector("h2").textContent =
            produtos.filter(p => p.disponivel !== false).length === 0
                ? "Nosso cardápio está sendo atualizado!"
                : "Nenhum produto encontrado.";

        mensagemVazia.querySelector("p").textContent =
            produtos.filter(p => p.disponivel !== false).length === 0
                ? "Em breve teremos nossos produtos disponíveis por aqui."
                : "Tente alterar sua busca ou escolher outra categoria.";

        return;
    }

    mensagemVazia.hidden = true;

    const fragmento = document.createDocumentFragment();

    lista.forEach(produto => {
        const imagem = produto.imagem
            ? escaparHTML(produto.imagem)
            : "assets/img/logo.png";

        const unidade = produto.unidade
            ? " / " + escaparHTML(produto.unidade)
            : "";

        const card = document.createElement("article");
        card.className = "produto-card";

        card.innerHTML = `
            <img
                src="${imagem}"
                alt="${escaparHTML(produto.nome)}"
                loading="lazy"
                onerror="this.onerror=null; this.src='assets/img/logo.png'"
            >

            <div class="produto-info">
                <h3>${escaparHTML(produto.nome)}</h3>

                <p class="produto-descricao">
                    ${escaparHTML(produto.descricao || "")}
                </p>

                <p class="produto-preco">
                    ${formatarPreco(produto.preco)}${unidade}
                </p>

                <button
                    class="botao-mavi"
                    type="button"
                    data-adicionar="${escaparHTML(produto.id)}"
                >
                    Adicionar ao carrinho
                </button>
            </div>
        `;

        fragmento.appendChild(card);
    });

    gradeProdutos.appendChild(fragmento);
}

// Adicionar ao carrinho
function adicionarProduto(id) {
    const produto = produtos.find(
        p => String(p.id) === String(id)
    );

    if (!produto || produto.disponivel === false) return;

    const carrinho = obterCarrinho();

    const existente = carrinho.find(
        item => String(item.id) === String(produto.id)
    );

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: Number(produto.preco),
            imagem: produto.imagem || "",
            unidade: produto.unidade || "",
            quantidade: 1
        });
    }

    salvarCarrinho(carrinho);
    atualizarContadores();

    alert(produto.nome + " foi adicionado ao carrinho!");
}

// Atualizar contadores
function atualizarContadores() {
    atualizarContadorCarrinho();

    const quantidade = obterCarrinho().reduce(
        (total, item) => total + Number(item.quantidade || 0),
        0
    );

    const contadorTopo = document.getElementById("cartCountTopo");

    if (contadorTopo) {
        contadorTopo.textContent = quantidade;
    }
}

// Eventos da página
gradeProdutos.addEventListener("click", evento => {
    const botao = evento.target.closest("[data-adicionar]");

    if (!botao) return;

    adicionarProduto(botao.dataset.adicionar);
});

buscaProduto.addEventListener("input", exibirProdutos);
filtroCategoria.addEventListener("change", exibirProdutos);

// Inicialização
carregarCategorias();
exibirProdutos();
atualizarContadores();
