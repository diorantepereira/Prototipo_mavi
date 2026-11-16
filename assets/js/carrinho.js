
document.addEventListener("DOMContentLoaded", () => {

    // Elementos da página
    const listaCarrinho = document.getElementById("listaCarrinho");
    const resumoCarrinho = document.getElementById("resumoCarrinho");
    const carrinhoVazio = document.getElementById("carrinhoVazio");
    const subtotalCarrinho = document.getElementById("subtotalCarrinho");

    if (!listaCarrinho || !resumoCarrinho || !carrinhoVazio) {
        console.error("Elementos do carrinho não encontrados.");
        return;
    }

    // Formatar preços
    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Proteger conteúdo HTML
    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[caractere]);
    }

    // Renderizar carrinho
    function renderizarCarrinho() {
        const carrinho = obterCarrinho();

        listaCarrinho.innerHTML = "";

        atualizarContadorCarrinho();

        // Verificar se está vazio
        if (carrinho.length === 0) {
            resumoCarrinho.hidden = true;
            carrinhoVazio.hidden = false;
            return;
        }

        resumoCarrinho.hidden = false;
        carrinhoVazio.hidden = true;

        let subtotal = 0;

        const fragmento = document.createDocumentFragment();

        carrinho.forEach(item => {
            const quantidade = Math.max(
                1,
                Number(item.quantidade) || 1
            );

            const preco = Number(item.preco) || 0;
            const totalItem = preco * quantidade;

            subtotal += totalItem;

            const unidade = item.unidade
                ? " / " + escaparHTML(item.unidade)
                : "";

            const imagem = item.imagem
                ? escaparHTML(item.imagem)
                : "assets/img/logo.png";

            const elemento = document.createElement("article");
            elemento.className = "item-carrinho";

            elemento.innerHTML = `
                <img
                    src="${imagem}"
                    alt="${escaparHTML(item.nome)}"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='assets/img/logo.png'"
                >

                <div class="item-info">
                    <h3>${escaparHTML(item.nome)}</h3>

                    <p>${formatarPreco(preco)}${unidade}</p>

                    <strong>Total: ${formatarPreco(totalItem)}</strong>

                    <div class="controles-quantidade">

                        <button
                            type="button"
                            data-acao="diminuir"
                            data-id="${escaparHTML(item.id)}"
                            aria-label="Diminuir quantidade"
                        >−</button>

                        <span>${quantidade}</span>

                        <button
                            type="button"
                            data-acao="aumentar"
                            data-id="${escaparHTML(item.id)}"
                            aria-label="Aumentar quantidade"
                        >+</button>

                        <button
                            type="button"
                            class="remover-item"
                            data-acao="remover"
                            data-id="${escaparHTML(item.id)}"
                        >
                            Remover
                        </button>

                    </div>
                </div>
            `;

            fragmento.appendChild(elemento);
        });

        listaCarrinho.appendChild(fragmento);

        if (subtotalCarrinho) {
            subtotalCarrinho.textContent = formatarPreco(subtotal);
        }
    }

    // Eventos dos botões do carrinho
    listaCarrinho.addEventListener("click", evento => {

        const botao = evento.target.closest("[data-acao]");

        if (!botao) return;

        const id = botao.dataset.id;
        const acao = botao.dataset.acao;

        let carrinho = obterCarrinho();

        const item = carrinho.find(
            produto => String(produto.id) === String(id)
        );

        if (!item) return;

        if (acao === "aumentar") {
            item.quantidade = (Number(item.quantidade) || 0) + 1;
        }

        if (acao === "diminuir") {
            item.quantidade = (Number(item.quantidade) || 0) - 1;

            if (item.quantidade <= 0) {
                carrinho = carrinho.filter(
                    produto => String(produto.id) !== String(id)
                );
            }
        }

        if (acao === "remover") {
            carrinho = carrinho.filter(
                produto => String(produto.id) !== String(id)
            );
        }

        salvarCarrinho(carrinho);

        renderizarCarrinho();
    });

    // Inicialização
    renderizarCarrinho();

});
