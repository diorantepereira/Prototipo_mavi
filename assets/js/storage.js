
// Salvar dados no LocalStorage
function salvarLocal(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar dados:", erro);
        return false;
    }
}

// Buscar dados no LocalStorage
function buscarLocal(chave, valorPadrao = null) {
    try {
        const dados = localStorage.getItem(chave);

        return dados !== null ? JSON.parse(dados) : valorPadrao;

    } catch (erro) {
        console.error("Erro ao recuperar dados:", erro);
        return valorPadrao;
    }
}

// Obter carrinho
function obterCarrinho() {
    const carrinho = buscarLocal(
        CONFIG.armazenamento.carrinho,
        []
    );

    return Array.isArray(carrinho) ? carrinho : [];
}

// Salvar carrinho
function salvarCarrinho(carrinho) {
    const salvo = salvarLocal(
        CONFIG.armazenamento.carrinho,
        carrinho
    );

    if (salvo) {
        atualizarContadorCarrinho();
    }

    return salvo;
}

// Limpar carrinho
function limparCarrinho() {
    try {
        localStorage.removeItem(CONFIG.armazenamento.carrinho);
        atualizarContadorCarrinho();
        return true;
    } catch (erro) {
        console.error("Erro ao limpar carrinho:", erro);
        return false;
    }
}

// Atualizar todos os contadores do carrinho
function atualizarContadorCarrinho() {
    const carrinho = obterCarrinho();

    const quantidade = carrinho.reduce((total, item) => {
        return total + Number(item.quantidade || 0);
    }, 0);

    document.querySelectorAll(".cart-count").forEach(contador => {
        contador.textContent = quantidade;
    });
}
