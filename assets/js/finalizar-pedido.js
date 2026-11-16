
document.addEventListener("DOMContentLoaded", () => {

    // Elementos da página
    const formPedido = document.getElementById("formPedido");
    const camposEndereco = document.getElementById("camposEndereco");
    const itensResumo = document.getElementById("itensResumo");

    const campoCep = document.getElementById("cep");
    const campoEndereco = document.getElementById("endereco");
    const campoNumero = document.getElementById("numero");
    const campoBairro = document.getElementById("bairro");

    let subtotalAtual = 0;
    let taxaAtual = 0;
    let totalAtual = 0;

    // Verificar se os elementos necessários existem
    if (!formPedido || !camposEndereco || !itensResumo) {
        console.error("Elementos da finalização não encontrados.");
        return;
    }

    // Formatar valores
    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Obter modalidade de entrega
    function obterTipoEntrega() {
        return document.querySelector(
            'input[name="tipoEntrega"]:checked'
        )?.value || "retirada";
    }

    // Atualizar campos de endereço
    function atualizarCamposEntrega() {
        const entrega = obterTipoEntrega() === "entrega";

        camposEndereco.hidden = !entrega;

        campoCep.required = entrega;
        campoEndereco.required = entrega;
        campoNumero.required = entrega;
        campoBairro.required = entrega;

        atualizarResumo();
    }

    // Atualizar resumo do pedido
    function atualizarResumo() {
        const carrinho = obterCarrinho();

        subtotalAtual = carrinho.reduce((total, item) => {
            return total +
                (Number(item.preco) * Number(item.quantidade));
        }, 0);

        taxaAtual = obterTipoEntrega() === "entrega"
            ? Number(CONFIG.entrega.taxaPadrao)
            : 0;

        totalAtual = subtotalAtual + taxaAtual;

        itensResumo.innerHTML = "";

        carrinho.forEach(item => {
            const linha = document.createElement("div");
            linha.className = "linha-resumo";

            const nome = document.createElement("span");
            nome.textContent =
                Number(item.quantidade) + "x " + item.nome;

            const valor = document.createElement("strong");
            valor.textContent = formatarPreco(
                Number(item.preco) * Number(item.quantidade)
            );

            linha.append(nome, valor);
            itensResumo.appendChild(linha);
        });

        document.getElementById("subtotal").textContent =
            formatarPreco(subtotalAtual);

        document.getElementById("taxaEntrega").textContent =
            formatarPreco(taxaAtual);

        document.getElementById("totalPedido").textContent =
            formatarPreco(totalAtual);
    }

    // Recuperar dados do cliente
    function preencherDadosSalvos() {
        const cliente = buscarLocal(
            CONFIG.armazenamento.cliente,
            {}
        );

        document.getElementById("nome").value = cliente.nome || "";
        document.getElementById("telefone").value = cliente.telefone || "";
        campoCep.value = cliente.cep || "";
        campoEndereco.value = cliente.endereco || "";
        campoNumero.value = cliente.numero || "";
        campoBairro.value = cliente.bairro || "";

        document.getElementById("complemento").value =
            cliente.complemento || "";
    }

    // Eventos da modalidade de entrega
    document.querySelectorAll(
        'input[name="tipoEntrega"]'
    ).forEach(opcao => {
        opcao.addEventListener("change", atualizarCamposEntrega);
    });

    // Formatação do CEP
    campoCep.addEventListener("input", () => {
        let valor = campoCep.value.replace(/\D/g, "").slice(0, 8);

        if (valor.length > 5) {
            valor = valor.slice(0, 5) + "-" + valor.slice(5);
        }

        campoCep.value = valor;
    });

    // Consulta automática de endereço pelo CEP
    campoCep.addEventListener("blur", async () => {
        const cep = campoCep.value.replace(/\D/g, "");

        if (cep.length !== 8) return;

        try {
            const resposta = await fetch(
                "https://viacep.com.br/ws/" + cep + "/json/"
            );

            if (!resposta.ok) {
                throw new Error("Falha na consulta do CEP.");
            }

            const dados = await resposta.json();

            if (!dados.erro) {
                campoEndereco.value = dados.logradouro || "";
                campoBairro.value = dados.bairro || "";

                campoNumero.focus();
            }

        } catch (erro) {
            console.warn("Não foi possível consultar o CEP.", erro);
        }
    });

    // Finalizar pedido
    formPedido.addEventListener("submit", evento => {
        evento.preventDefault();

        const carrinho = obterCarrinho();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio. Escolha produtos antes de finalizar.");
            window.location.href = "produtos.html";
            return;
        }

        if (!formPedido.reportValidity()) return;

        const dados = new FormData(formPedido);
        const tipoEntrega = obterTipoEntrega();

        const cliente = {
            nome: dados.get("nome").trim(),
            telefone: dados.get("telefone").trim(),
            cep: dados.get("cep").trim(),
            endereco: dados.get("endereco").trim(),
            numero: dados.get("numero").trim(),
            bairro: dados.get("bairro").trim(),
            complemento: dados.get("complemento").trim()
        };

        // Salvar dados do cliente
        salvarLocal(CONFIG.armazenamento.cliente, cliente);

        // Montar mensagem para WhatsApp
        let mensagem = "Olá, Mavi! Gostaria de fazer um pedido.\n\n";

        mensagem += "*DADOS DO CLIENTE*\n";
        mensagem += "Nome: " + cliente.nome + "\n";
        mensagem += "Telefone: " + cliente.telefone + "\n\n";

        mensagem += "*PRODUTOS*\n";

        carrinho.forEach(item => {
            const totalItem =
                Number(item.preco) * Number(item.quantidade);

            mensagem +=
                Number(item.quantidade) + "x " + item.nome +
                " — " + formatarPreco(totalItem) + "\n";
        });

        mensagem += "\n*ENTREGA / RETIRADA*\n";

        if (tipoEntrega === "entrega") {
            mensagem += "Modalidade: Entrega\n";
            mensagem += "CEP: " + cliente.cep + "\n";

            mensagem += "Endereço: " + cliente.endereco +
                ", nº " + cliente.numero + "\n";

            mensagem += "Bairro: " + cliente.bairro + "\n";

            if (cliente.complemento) {
                mensagem += "Complemento: " +
                    cliente.complemento + "\n";
            }

        } else {
            mensagem += "Modalidade: Retirada no local\n";
        }

        mensagem += "\n*PAGAMENTO*\n";
        mensagem += "Forma: " + dados.get("pagamento") + "\n";

        const observacoes = dados.get("observacoes") || "";

        if (observacoes.trim()) {
            mensagem += "\n*OBSERVAÇÕES*\n";
            mensagem += observacoes.trim() + "\n";
        }

        mensagem += "\n*RESUMO*\n";
        mensagem += "Subtotal: " + formatarPreco(subtotalAtual) + "\n";
        mensagem += "Entrega: " + formatarPreco(taxaAtual) + "\n";

        mensagem += "*Total estimado: " +
            formatarPreco(totalAtual) + "*\n\n";

        mensagem += "Aguardo a confirmação do pedido. Obrigado(a)!";

        const url =
            "https://wa.me/" + CONFIG.whatsapp +
            "?text=" + encodeURIComponent(mensagem);

        window.location.href = url;
    });

    // Inicialização
    atualizarContadorCarrinho();
    preencherDadosSalvos();
    atualizarCamposEntrega();

    // Verificar carrinho vazio
    if (obterCarrinho().length === 0) {
        formPedido.innerHTML = `
            <section class="bloco-finalizacao" style="text-align:center;">
                <h2>Seu carrinho está vazio.</h2>
                <p>Adicione produtos ao carrinho antes de finalizar o pedido.</p>
                <a href="produtos.html" class="botao-mavi">Ver cardápio</a>
            </section>
        `;
    }

});
