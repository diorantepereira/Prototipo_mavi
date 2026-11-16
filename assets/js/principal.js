
document.addEventListener("DOMContentLoaded", () => {

    // Atualizar ano do rodapé
    const ano = document.getElementById("currentYear");

    if (ano) {
        ano.textContent = new Date().getFullYear();
    }

    // Atualizar contador do carrinho
    if (typeof atualizarContadorCarrinho === "function") {
        atualizarContadorCarrinho();
    }

});
