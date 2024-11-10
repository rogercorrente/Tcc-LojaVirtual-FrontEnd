// Função para carregar o navbar, footer e modal
function loadComponents() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            atualizarNavbar(); // Atualiza a navbar com o estado de login
            // Adiciona evento ao botão "Quero Doar" após carregar o navbar
            document.querySelector('.btn-quero-doar')?.addEventListener('click', verificarLoginParaDoacao);
            document.getElementById('profileLink').addEventListener('click', carregarPerfil); // Adiciona evento ao link de perfil
        });

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        });

    fetch('modal_login_necessario.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data); // Insere o modal no corpo do documento
        });
}
// Chama a função quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', loadComponents);

// Função para atualizar a navbar com base no estado de login
function atualizarNavbar() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const loginLink = document.getElementById('loginLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    const cartLink = document.getElementById('cartLink'); // Ícone do carrinho

    if (usuarioLogado) {
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        cartLink.style.display = 'block'; // Mostra o ícone do carrinho
        loginLink.style.display = 'none';
        profileLink.querySelector('a').textContent = usuarioLogado.nome || 'Perfil';
    } else {
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
        cartLink.style.display = 'none'; // Esconde o ícone do carrinho
        loginLink.style.display = 'block';
    }
}


// Função para verificar login ao clicar em "Quero Doar"
function verificarLoginParaDoacao() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        $('#modalLoginNecessario').modal('show');
    } else {
        window.location.href = 'pagina_formulario_doacao.html';
    }
}

// Função para atribuir valores automáticos ao campo "valor" com base na categoria e condição
document.addEventListener('DOMContentLoaded', function() {
    const categoriaSelect = document.getElementById('categoriaProduto');
    const condicaoSelect = document.getElementById('condicaoProduto');
    const valorInput = document.getElementById('valorProduto');

    const valores = {
        Roupas: { Novo: 40, "Usado - Excelente": 30, "Usado - Bom": 25, Ruim: 10 },
        Calçados: { Novo: 50, "Usado - Excelente": 35, "Usado - Bom": 20, Ruim: 10 },
        Acessórios: { Novo: 20, "Usado - Excelente": 15, "Usado - Bom": 10, Ruim: 5 }
    };

    function atualizarValor() {
        const categoria = categoriaSelect.value;
        const condicao = condicaoSelect.value;
        if (valores[categoria] && valores[categoria][condicao] !== undefined) {
            valorInput.value = valores[categoria][condicao];
        } else {
            valorInput.value = '';
        }
    }

    categoriaSelect.addEventListener('change', atualizarValor);
    condicaoSelect.addEventListener('change', atualizarValor);
});

// Função para mostrar mensagem de pontos e moedas ganhos
function mostrarMensagemRecompensa(pontos, moedas) {
    const mensagemHTML = `
        <div class="recompensa-mensagem">
            <div class="recompensa-icon">&#10004;</div>
            <p>Parabéns! Sua doação foi concluída! Você ganhou</p>
            <div class="recompensa-detalhes">
                <span>&#128176; +${moedas} moedas</span>
                <span>&#127942; +${pontos} pontos</span>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', mensagemHTML);
    setTimeout(() => document.querySelector('.recompensa-mensagem').remove(), 3000);
}

// Função para cadastro de usuário com validação de campos
async function cadastrarUsuario() {
    const form = document.getElementById('formCadastro');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const nome = document.getElementById('nomeUsuario').value.trim();
    const email = document.getElementById('email').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, endereco, senha })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'pagina_login.html';
        } else {
            alert(data.error || 'Erro ao cadastrar usuário.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Função de login de usuário com validação de campos
document.getElementById('formLogin')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = document.getElementById('formLogin');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            localStorage.setItem('usuarioLogado', JSON.stringify({
                id: data.id,  // Certifique-se de que o ID do usuário está sendo salvo aqui
                nome: data.nome,
                email: data.email,
                pontos: data.pontos,
                moedas: data.moedas
            }));
            window.location.href = 'pagina_principal.html';
        } else {
            alert(data.error || 'Erro no login.');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao conectar com o servidor.');
    }
});


// Função de logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    alert('Você saiu com sucesso.');
    atualizarNavbar();
    window.location.href = 'pagina_principal.html';
}

// Função para enviar a imagem para o back-end e obter o URL
async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3000/upload', { method: 'POST', body: formData });

        if (!response.ok) {
            throw new Error('Erro no upload da imagem');
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Erro ao fazer o upload da imagem:', error);
        return 'img/produtos/default.jpg';
    }
}

// Adiciona o evento para mostrar a pré-visualização da imagem
document.addEventListener('DOMContentLoaded', function() {
    const imagemInput = document.getElementById('imagemProduto');
    if (imagemInput) {
        imagemInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('preview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

async function adicionarProduto() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const email = usuarioLogado?.email;

    // Outros dados do produto
    const nome = document.getElementById('nomeProduto').value.trim();
    const descricao = document.getElementById('descricaoProduto').value.trim();
    const categoria = document.getElementById('categoriaProduto').value;
    const condicao = document.getElementById('condicaoProduto').value;
    const valor = document.getElementById('valorProduto').value;
    const tamanho = document.getElementById('tamanhoProduto').value.trim();
    const marca = document.getElementById('marcaProduto').value.trim();
    const cor = document.getElementById('corProduto').value.trim();
    const fileInput = document.getElementById('imagemProduto');
    const file = fileInput ? fileInput.files[0] : null;
    const imageUrl = file ? await uploadImage(file) : 'img/produtos/default.jpg';

    const produto = {
        nome,
        descricao,
        categoria,
        condicao,
        valor,
        tamanho,
        marca,
        cor,
        imagem: imageUrl,
        email // Inclui o email do usuário logado
    };

    try {
        const response = await fetch('http://localhost:3000/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (response.ok) {
            alert('Produto adicionado com sucesso!');
            window.location.href = 'doacao_sucesso.html';
        } else {
            alert('Erro ao adicionar produto.');
        }
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
    }
}


async function carregarProdutos() {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const userId = usuarioLogado?.id;

        // Obter produtos e verificar itens no carrinho se o usuário estiver logado
        const [produtosResponse, carrinhoResponse] = await Promise.all([
            fetch('http://localhost:3000/produtos'),
            userId ? fetch(`http://localhost:3000/carrinho/${userId}`) : Promise.resolve({ json: () => [] })
        ]);

        const produtos = await produtosResponse.json();
        const carrinho = await carrinhoResponse.json();

        const carrinhoIds = carrinho.map(item => item.id); // IDs dos itens já no carrinho
        const produtosContainer = document.getElementById('produtosContainer');
        produtosContainer.innerHTML = '';

        produtos.forEach(produto => {
            const estaNoCarrinho = carrinhoIds.includes(produto.id);
            const productCard = `
                <div class="col-md-3">
                    <div class="card product-card mb-4">
                        <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${produto.nome}</h5>
                            <p class="card-text">${produto.descricao}</p>
                            <p class="card-text font-weight-bold text-danger">R$ ${produto.valor.toFixed(2)}</p>
                            <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                                ${estaNoCarrinho ? 'disabled' : ''}
                                onclick="adicionarAoCarrinho('${produto.id}')">
                                <i class="fas fa-shopping-cart mr-2"></i> ${estaNoCarrinho ? 'No Carrinho' : 'Adicionar ao Carrinho'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            produtosContainer.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function adicionarAoCarrinho(produtoId) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        $('#modalLoginNecessario').modal('show');
        return;
    }

    const userId = usuarioLogado.id;
    const quantidade = 1;

    try {
        // Verificar se o item já está no carrinho antes de adicionar
        const verificarResponse = await fetch(`http://localhost:3000/carrinho/${userId}`);
        const carrinho = await verificarResponse.json();
        
        if (carrinho.some(item => item.id === produtoId)) {
            alert('Este item já está no carrinho.');
            return;
        }

        // Adicionar o item ao carrinho, pois ele ainda não está lá
        const response = await fetch('http://localhost:3000/carrinho/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, produto_id: produtoId, quantidade })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = 'pagina_carrinho.html';
        } else {
            alert('Erro ao adicionar produto ao carrinho.');
        }
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
    }
}

// Função para carregar itens do carrinho
async function carregarCarrinho() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Faça login para ver seu carrinho.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/carrinho/${usuarioLogado.id}`);
        const carrinho = await response.json();
        console.log('Carrinho:', carrinho);

        const carrinhoContainer = document.getElementById('carrinhoContainer');
        carrinhoContainer.innerHTML = '';

        if (carrinho.length === 0) {
            carrinhoContainer.innerHTML = '<tr><td colspan="4" class="text-center">Seu carrinho está vazio.</td></tr>';
        } else {
            let totalPedido = 0;
            carrinho.forEach(item => {
                totalPedido += item.valor;
                carrinhoContainer.innerHTML += `
                    <tr>
                        <td><img src="${item.imagem}" alt="${item.nome}" class="img-fluid" style="width: 50px;"></td>
                        <td>${item.nome}</td>
                        <td>R$ ${item.valor.toFixed(2)}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${usuarioLogado.id}, ${item.id})"><i class="fas fa-trash-alt"></i></button></td>
                    </tr>
                `;
            });

            document.getElementById('totalPedido').textContent = `R$ ${totalPedido.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
    }
}

// Função para remover item do carrinho
async function removerDoCarrinho(userId, produtoId) {
    try {
        const response = await fetch('http://localhost:3000/carrinho/remover', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, produto_id: produtoId })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            carregarCarrinho();
        } else {
            alert('Erro ao remover produto do carrinho.');
        }
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
    }
}

//Finalizar pedido:


// Variável para armazenar o desconto aplicado pelo cupom
let descontoCupom = 0;

// Função para redirecionar para a página de finalização do pedido
function finalizarPedido() {
    window.location.href = 'pagina_finalizar_pedido.html';
}

// Função para carregar dados de finalização do pedido
async function carregarDadosFinalizarPedido() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Faça login para finalizar o pedido.');
        window.location.href = 'pagina_login.html';
        return;
    }

    try {
        console.log("Carregando dados do usuário e do carrinho...");
        
        // Carregar endereço e moedas do usuário
        const responseUser = await fetch(`http://localhost:3000/user/${usuarioLogado.id}`);
        if (!responseUser.ok) throw new Error('Erro ao carregar os dados do usuário');
        const userData = await responseUser.json();

        const enderecoEntrega = document.getElementById('enderecoEntrega');
        const moedasDisponiveis = document.getElementById('moedasDisponiveis');
        
        if (enderecoEntrega) enderecoEntrega.textContent = userData.endereco;
        if (moedasDisponiveis) moedasDisponiveis.textContent = userData.moedas;

        // Carregar itens do carrinho
        const responseCarrinho = await fetch(`http://localhost:3000/carrinho/${usuarioLogado.id}`);
        if (!responseCarrinho.ok) throw new Error('Erro ao carregar o carrinho');
        const carrinho = await responseCarrinho.json();
        const itensPedidoContainer = document.getElementById('itensPedido').querySelector('tbody');

        let valorTotalPedido = 0;
        itensPedidoContainer.innerHTML = ''; // Limpar conteúdo antes de adicionar itens

        carrinho.forEach(item => {
            valorTotalPedido += item.valor;
            itensPedidoContainer.innerHTML += `
                <tr data-produto-id="${item.id}">
                    <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px;"></td>
                    <td>${item.nome}</td>
                    <td class="preco-unitario">R$ ${item.valor.toFixed(2)}</td>
                </tr>
            `;
        });

        document.getElementById('valorTotalPedido').textContent = valorTotalPedido.toFixed(2);
        atualizarTotal();
    } catch (error) {
        console.error('Erro ao carregar os dados do pedido:', error);
    }
}

// Função para aplicar o cupom de desconto
function aplicarCupom() {
    const cupom = document.getElementById('cupom').value.trim();
    if (cupom === "DESC10") {  // Exemplo de cupom com 10% de desconto
        descontoCupom = 0.1;
        alert('Cupom aplicado! Você recebeu 10% de desconto.');
    } else {
        descontoCupom = 0;
        alert('Cupom inválido.');
    }
    atualizarTotal();
}

// Função para atualizar o total com base no cupom e uso de moedas
function atualizarTotal() {
    const valorTotalPedido = parseFloat(document.getElementById('valorTotalPedido').textContent);
    const usarMoedas = document.getElementById('usarMoedas').checked;
    const moedasDisponiveis = parseInt(document.getElementById('moedasDisponiveis').textContent);
    
    let descontoMoedas = 0;
    if (usarMoedas) {
        descontoMoedas = Math.min(moedasDisponiveis * 0.25, valorTotalPedido);
    }

    const valorComCupom = valorTotalPedido * (1 - descontoCupom);
    const valorFinal = valorComCupom - descontoMoedas;

    document.getElementById('descontoMoedas').textContent = descontoMoedas.toFixed(2);
    document.getElementById('valorFinal').textContent = valorFinal.toFixed(2);

    // Calcula os pontos e moedas com base no valor final
    const pontosGanhos = Math.floor(valorFinal);
    const moedasGanhas = Math.floor(valorFinal);

    document.getElementById('pontosGanhos').textContent = pontosGanhos;
    document.getElementById('moedasGanhas').textContent = moedasGanhas;
}

// Função para finalizar a compra
async function finalizarCompra() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Faça login para finalizar o pedido.');
        window.location.href = 'pagina_login.html';
        return;
    }

    const valorFinal = parseFloat(document.getElementById('valorTotalPedido').textContent);
    const usarMoedas = document.getElementById('usarMoedas').checked;
    const moedasDisponiveis = parseFloat(document.getElementById('moedasDisponiveis').textContent);

    // Calcula o máximo de moedas que podem ser usadas sem ultrapassar o valor final
    const maxMoedasUsadas = Math.min(moedasDisponiveis, Math.floor(valorFinal / 0.25));
    const descontoMoedas = usarMoedas ? maxMoedasUsadas * 0.25 : 0;
    const valorFinalComDesconto = valorFinal - descontoMoedas;

    // Calcula pontos e moedas ganhos com base no valor final com desconto
    const pontosGanhos = Math.floor(valorFinalComDesconto);
    const moedasGanhas = Math.floor(valorFinalComDesconto);

    // Calcula o saldo final de moedas: subtrai as moedas usadas e depois soma as moedas ganhas
    const saldoMoedasFinal = moedasDisponiveis - maxMoedasUsadas + moedasGanhas;

    const itensPedido = [];
    document.querySelectorAll('#itensPedido tbody tr').forEach(row => {
        const produto_id = row.getAttribute('data-produto-id');
        const quantidade = 1;
        const preco_unitario = parseFloat(row.querySelector('.preco-unitario').textContent.replace("R$ ", "").replace(",", "."));
        itensPedido.push({ produto_id, quantidade, preco_unitario });
    });

    try {
        const response = await fetch('http://localhost:3000/finalizarPedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: usuarioLogado.id,
                valorFinal: valorFinalComDesconto,
                itensPedido,
                moedasUsadas: usarMoedas ? maxMoedasUsadas : 0,
                pontosGanhos,
                saldoMoedasFinal // Envia o saldo final atualizado de moedas
            })
        });

        if (response.ok) {
            alert('Compra finalizada com sucesso!');
            window.location.href = 'pagina_principal.html';
        } else {
            alert('Erro ao finalizar o pedido.');
        }
    } catch (error) {
        console.error('Erro ao finalizar a compra:', error);
    }
}

async function carregarPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Faça login para acessar seu perfil.');
        window.location.href = 'pagina_login.html';
        return;
    }

    try {
        // Obtenha os dados do usuário a partir da API
        const response = await fetch(`http://localhost:3000/user/${usuarioLogado.id}`);
        if (!response.ok) {
            console.error('Erro na resposta do servidor:', response.status, response.statusText);
            return;
        }

        const data = await response.json();

        // Atualiza o perfil com as informações do usuário
        document.getElementById('nomeUsuario').textContent = data.nome;
        document.getElementById('pontosUsuario').textContent = `${data.pontos} pontos`;
        document.getElementById('moedasUsuario').textContent = `${data.moedas} moedas`;

        // Obtenha o ranking para determinar a posição do usuário
        const rankingResponse = await fetch('http://localhost:3000/ranking');
        if (!rankingResponse.ok) {
            console.error('Erro ao carregar o ranking:', rankingResponse.status, rankingResponse.statusText);
            return;
        }

        const rankingData = await rankingResponse.json();

        // Localize a posição do usuário no ranking
        const userRank = rankingData.findIndex(user => user.nome === data.nome);
        
        if (userRank !== -1) {
            let medalImage;

            // Define a imagem da medalha com base na posição do usuário
            if (userRank < 5) { // Apenas os primeiros 5 recebem medalhas
                medalImage = `img/medalhas/medalha_${userRank + 1}.png`;
            } else {
                medalImage = `img/medalhas/medalha_default.png`; // Medalha padrão ou genérica para posições maiores
            }

            // Exibe a imagem da medalha no perfil
            const medalElement = document.getElementById('medalhaUsuario');
            if (medalElement) {
                medalElement.src = medalImage;
                medalElement.alt = `Medalha de posição ${userRank + 1}`;
            }
        }

        // Calcula a diferença de pontos até o primeiro colocado
        const primeiroColocado = rankingData[0].pontos;
        const pontosParaPrimeiro = primeiroColocado - data.pontos;
        document.getElementById('pontosParaPrimeiro').textContent = pontosParaPrimeiro > 0 ? pontosParaPrimeiro : 0;
    } catch (error) {
        console.error('Erro ao carregar os dados do perfil:', error);
    }
}



// Função para carregar o perfil apenas na página correta
function carregarPerfilSeNecessario() {
    if (window.location.pathname.endsWith('pagina_perfil.html')) {
        carregarPerfil();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('produtosContainer')) {
        carregarProdutos();
    }
    if (document.getElementById('carrinhoContainer')) {
        carregarCarrinho();
    }
    if (document.getElementById('enderecoEntrega') && document.getElementById('itensPedido')) {
        carregarDadosFinalizarPedido();
    }
    // Chama a função para carregar o perfil apenas na página de perfil
    carregarPerfilSeNecessario();
});


