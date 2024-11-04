// Função para carregar o navbar, footer e modal
function loadComponents() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            atualizarNavbar(); // Atualiza a navbar com o estado de login
            // Adiciona evento ao botão "Quero Doar" após carregar o navbar
            document.querySelector('.btn-quero-doar')?.addEventListener('click', verificarLoginParaDoacao);
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

    if (usuarioLogado) {
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        loginLink.style.display = 'none';
        profileLink.querySelector('a').textContent = usuarioLogado.nome || 'Perfil'; // Nome do usuário no perfil
    } else {
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
        loginLink.style.display = 'block';
    }
}

// Função para verificar login ao clicar em "Quero Doar"
function verificarLoginParaDoacao() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        // Exibe o modal informando que é necessário login
        $('#modalLoginNecessario').modal('show');
    } else {
        // Redireciona para a página de doação caso o usuário esteja logado
        window.location.href = 'pagina_formulario_doacao.html';
    }
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
            localStorage.setItem('usuarioLogado', JSON.stringify({ nome: data.nome, email: data.email }));
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

// Função para adicionar o produto ao banco de dados via back-end
async function adicionarProduto() {
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

    if (!nome || !descricao || !categoria || !condicao || !valor || !tamanho || !marca || !cor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

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
        imagem: imageUrl
    };

    try {
        const response = await fetch('http://localhost:3000/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (response.ok) {
            alert('Produto adicionado com sucesso!');
            window.location.href = 'pagina_principal.html';
        } else {
            alert('Erro ao adicionar produto.');
        }
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
    }
}

// Função para carregar produtos do banco de dados via back-end e exibi-los
async function carregarProdutos() {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        const produtos = await response.json();
        const produtosContainer = document.getElementById('produtosContainer');

        produtosContainer.innerHTML = ''; // Limpar o container antes de adicionar produtos

        produtos.forEach(produto => {
            const productCard = `
                <div class="col-md-3">
                    <div class="product-card">
                        <img src="${produto.imagem}" alt="${produto.nome}">
                        <h5>${produto.nome}</h5>
                        <p>${produto.descricao}</p>
                        <div class="price">R$ ${produto.valor}</div>
                    </div>
                </div>
            `;
            produtosContainer.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Carregar produtos na página de produtos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('produtosContainer')) {
        carregarProdutos();
    }
});
