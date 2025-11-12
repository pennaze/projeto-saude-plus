/**
 * Este script é executado em todas as páginas do site.
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // ========================================================================
    // BLOCO 1: DEFINIÇÃO DE FUNÇÕES AUXILIARES (Helpers)
    // ========================================================================

    // --- 1.1: Funções de Autenticação e Sessão ---

    /**
     * BLOCO 1.1.1: Busca dados do usuário no localStorage.
     * (ATUALIZADO para incluir o ID)
     */
    const getUserData = () => {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                // Validação para garantir que o ID está presente (crucial para agendamentos)
                if (!parsedData.id) {
                    console.warn('Usuário no localStorage sem ID. A fazer logout.');
                    localStorage.removeItem('currentUser');
                    return null;
                }
                return parsedData; // Retorna { id, email, nivel }
            } catch (e) {
                console.error("Erro ao parsear dados do usuário:", e);
                localStorage.removeItem('currentUser');
                return null;
            }
        }
        return null; 
    };

    /**
     * BLOCO 1.1.2: Realiza o logout.
     */
    const logout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html'; 
    };

    // --- 1.2: Funções de Renderização de UI (Interface) ---

    /**
     * BLOCO 1.2.1: Renderiza a barra de navegação (ATUALIZADO para Agendamentos)
     */
    const renderizarNavbar = () => {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        navbarContainer.className = 'navbar navbar-expand-lg fixed-top';
        const user = getUserData();
        let navLinks = '';
        let authButtons = '';

        // Links visíveis para TODOS
        navLinks += `
            <li class="nav-item">
                <a class="nav-link" href="index.html">Início</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="servicos.html">Serviços</a>
            </li>
        `;

        if (user) {
            // --- Usuário LOGADO ---
            if (user.nivel === 'gerente') {
                navLinks += `
                    <li class="nav-item">
                        <a class="nav-link" href="cadastro.html">Cadastrar Serviço</a>
                    </li>
                `;
            }
            // (NOVO) Link do Painel para Clientes
            if (user.nivel === 'cliente') {
                navLinks += `
                    <li class="nav-item">
                        <a class="nav-link" href="meus-agendamentos.html">Meus Agendamentos</a>
                    </li>
                `;
            }
            
            authButtons = `
                <li class="nav-item me-2">
                    <span class="navbar-text user-info">
                        Olá, ${user.email}
                    </span>
                </li>
                <li class="nav-item">
                    <button id="btn-logout" class="btn btn-danger btn-sm">Sair</button>
                </li>
            `;
        } else {
            // --- Usuário DESLOGADO ---
            authButtons = `
                <li class="nav-item me-2">
                    <a class="nav-link" href="usuario.html">Cadastre-se</a>
                </li>
                <li class="nav-item">
                    <a href="login.html" class="btn btn-primary btn-sm">Login</a>
                </li>
            `;
        }

        navbarContainer.innerHTML = `
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html">Saúde+</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        ${navLinks}
                    </ul>
                    <ul class="navbar-nav ms-auto align-items-center">
                        ${authButtons}
                    </ul>
                </div>
            </div>
        `;

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', logout);
        }

        document.body.style.paddingTop = navbarContainer.offsetHeight + 'px';
    };

    /**
     * BLOCO 1.2.2: Exibe um modal de confirmação customizado.
     * (ATUALIZADO para ser mais genérico)
     */
    const showCustomConfirmModal = (titulo, mensagem, onConfirm) => {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-confirm">
                <h3>${titulo}</h3>
                <p>${mensagem}</p>
                <div class="modal-confirm-actions">
                    <button class="modal-btn-cancel">Voltar</button>
                    <button class="modal-btn-confirm">Confirmar</button>
                </div>
            </div>
        `;
        const btnCancel = overlay.querySelector('.modal-btn-cancel');
        const btnConfirm = overlay.querySelector('.modal-btn-confirm');
        const closeModal = () => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 200); 
        };
        btnCancel.addEventListener('click', closeModal);
        btnConfirm.addEventListener('click', () => {
            onConfirm(); 
            closeModal();
        });
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });
    };

    /**
     * BLOCO 1.2.3: Função de exclusão de SERVIÇO.
     */
    const excluirServico = (id) => {
        const executarExclusao = () => {
            fetch(`http://localhost:3000/servicos/${id}`, { 
                method: 'DELETE'
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Erro ao tentar excluir o serviço no servidor.');
                }
                return; 
            })
            .then(() => {
                const detalheElement = document.getElementById("servico-detalhe");
                detalheElement.innerHTML = `
                    <div class="message-success">
                        <h2>Serviço removido.</h2>
                        <p>O registro foi excluído com sucesso.</p>
                        <a href="index.html" class="btn-voltar">← Voltar para a lista</a>
                    </div>
                `;
            })
            .catch(error => {
                const detalheElement = document.getElementById("servico-detalhe");
                detalheElement.innerHTML = `
                    <div class="message-error">
                        <h2>Erro na Operação</h2>
                        <p>${error.message}</p>
                        <a href="index.html" class="btn-voltar error">← Voltar</a>
                    </div>
                `;
                console.error("Erro na exclusão:", error);
            });
        };
        
        // (ATUALIZADO) Chama o modal genérico
        showCustomConfirmModal(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o serviço com ID ${id}? Esta ação não pode ser desfeita.`,
            executarExclusao
        );
    };

    /**
     * (NOVO) BLOCO 1.2.4: Função de CANCELAR AGENDAMENTO.
     */
    const cancelarAgendamento = (id) => {
        const executarCancelamento = () => {
            fetch(`http://localhost:3000/agendamentos/${id}/status`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelado' })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Erro ao tentar cancelar o agendamento.');
                }
                return res.json(); 
            })
            .then(() => {
                // A forma mais fácil e segura de atualizar a UI é recarregar a página.
                location.reload();
            })
            .catch(error => {
                console.error("Erro no cancelamento:", error);
                alert(error.message); // Exibe um alerta simples em caso de falha
            });
        };
        
        showCustomConfirmModal(
            'Confirmar Cancelamento',
            `Tem certeza que deseja cancelar este agendamento?`,
            executarCancelamento
        );
    };


    /**
     * BLOCO 1.2.5: API DE NOTÍCIAS (Tema: Saúde)
     */
    const fetchHealthNews = () => {
        // ... (Esta função permanece 100% igual)
        console.log("Buscando notícias de saúde (API Real)...");
        const apiKey = "pub_7b4435a95203465abb2c15d4c9db15bd"; 
        const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=health%20OR%20saude&language=pt`; 
        if (apiKey === "YOUR_API_KEY") {
            console.error("ERRO: A chave da API de notícias não foi definida.");
            return Promise.reject(new Error("A chave da API (API Key) não foi definida no script.js."));
        }
        return fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar notícias da API.');
                }
                return response.json(); 
            })
            .then(data => {
                const listaDeNoticias = data.results; 
                if (!listaDeNoticias) {
                    throw new Error("Formato de resposta da API de notícias inesperado.");
                }
                return listaDeNoticias.map(item => {
                    return {
                        title: item.title,
                        source: item.source_name,
                        date: item.pubDate,
                        link: item.link
                    };
                });
            });
    };

    // ========================================================================
    // BLOCO 2: EXECUÇÃO PRINCIPAL (ROTEADOR DE PÁGINA)
    // ========================================================================

    const path = window.location.pathname; 
    const currentUser = getUserData(); 
    renderizarNavbar(); 

    // --- 2.2: Lógica Específica da Página de LOGIN (login.html) ---
    // (ATUALIZADO para guardar o ID do usuário)
    if (path.includes("login.html")) {
        const formLogin = document.getElementById('form-login');
        const messageContainer = document.getElementById('message-container');
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;

                fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        const user = data[0]; 
                        
                        // *** CORREÇÃO CRÍTICA: Guardar o ID ***
                        localStorage.setItem('currentUser', JSON.stringify({
                            id: user.id, // <-- ADICIONADO
                            email: user.email,
                            nivel: user.nivel
                        }));
                        
                        // *** (NOVO) MENSAGEM DE SUCESSO ***
                        messageContainer.textContent = 'Login bem-sucedido! Redirecionando...';
                        messageContainer.className = 'success'; // Usa a classe do CSS
                        messageContainer.style.display = 'block'; // Garante que está visível
                        
                        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                    } else {
                        throw new Error('Email ou senha inválidos.');
                    }
                })
                .catch(err => {
                    // *** (NOVO) MENSAGEM DE ERRO ***
                    messageContainer.textContent = err.message;
                    messageContainer.className = 'error'; // Usa a classe do CSS
                    messageContainer.style.display = 'block'; // Garante que está visível
                });
            });
        }
    }

    // --- 2.3: Lógica Específica da Página de CADASTRO DE USUÁRIO (usuario.html) ---
    else if (path.includes("usuario.html")) {
        //
        // *** (NOVO) LÓGICA DE CADASTRO DE CLIENTE ***
        //
        const formCadastroUsuario = document.getElementById('form-cadastro-usuario');
        const messageContainer = document.getElementById('message-container');
        if (formCadastroUsuario) {
            formCadastroUsuario.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;
                
                // (REMOVIDO) O nível não é mais pego do HTML
                // const nivel = document.getElementById('nivel').value; 

                fetch(`http://localhost:3000/usuarios?email=${email}`)
                .then(res => res.json())
                .then(existingUsers => {
                    if (existingUsers.length > 0) {
                        throw new Error('Este email já está cadastrado.');
                    }
                    // Envia o novo usuário (sem 'nivel', o backend decide)
                    return fetch('http://localhost:3000/usuarios', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        // (MUDANÇA) Envia só email e senha
                        body: JSON.stringify({ email, senha }) 
                    });
                })
                .then(res => res.json())
                .then(data => {
                    if (data.error) { // Trata erro vindo do backend (ex: email já existe)
                        throw new Error(data.error);
                    }
                    // *** (NOVO) MENSAGEM DE SUCESSO ***
                    messageContainer.textContent = 'Cadastro realizado com sucesso! Você já pode fazer o login.';
                    messageContainer.className = 'success';
                    messageContainer.style.display = 'block'; // Garante que está visível
                    
                    formCadastroUsuario.reset(); 
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                })
                .catch(err => {
                    // *** (NOVO) MENSAGEM DE ERRO ***
                    messageContainer.textContent = err.message;
                    messageContainer.className = 'error';
                    messageContainer.style.display = 'block'; // Garante que está visível
                });
            });
        }
    }

    // --- 2.4: Lógica Específica da Página de CADASTRO DE SERVIÇO (cadastro.html) ---
    else if (path.includes("cadastro.html")) {
        // (Esta lógica permanece 100% igual)
        if (!currentUser || currentUser.nivel !== 'gerente') {
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `<div class="message-error" style="text-align: center; max-width: 600px; margin: 40px auto;">
                        <h2>Acesso Negado</h2>
                        <p>Você precisa estar logado como 'gerente' para acessar esta página.</p>
                        <a href="index.html" class="btn btn-secondary btn-voltar">Voltar ao Início</a>
                    </div>`;
            }
            return; 
        }
        const formCadastroServico = document.getElementById('form-cadastro');
        const mensagemElement = document.getElementById('mensagem');
        if (formCadastroServico) {
            formCadastroServico.addEventListener('submit', function(e) {
                e.preventDefault();
                const nome = document.getElementById('nome').value.trim();
                const profissional = document.getElementById('profissional').value.trim();
                const especialidade = document.getElementById('especialidade').value.trim();
                const preco = parseFloat(document.getElementById('preco').value);
                const descricao = document.getElementById('descricao').value.trim();
                const imagem = document.getElementById('imagem').value.trim();
                if (!nome || !profissional || !especialidade || !descricao || isNaN(preco) || preco <= 0 || !imagem) {
                    mensagemElement.innerHTML = '<p style="color: red;">Preencha todos os campos corretamente (Preço deve ser maior que zero).</p>';
                    return;
                }
                mensagemElement.textContent = ''; 
                const novoServico = { nome, profissional, especialidade, preco, descricao, imagem };
                fetch('http://localhost:3000/servicos', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoServico)
                })
                .then(res => res.json())
                .then(data => {
                    mensagemElement.innerHTML = `<p style="color: green;">Serviço <strong>${data.nome}</strong> cadastrado com sucesso!</p>`;
                    formCadastroServico.reset();
                    setTimeout(() => { mensagemElement.innerHTML = ''; }, 18000);
                })
                .catch(error => {
                    mensagemElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
                });
            });
        }
    }


    // --- 2.5: Lógica Específica das Páginas de LISTAGEM (index.html, servicos.html) ---
    // (ATUALIZADO para incluir a funcionalidade de filtro)
    else if (path.includes("index.html") || path.endsWith("/") || path.includes("servicos.html")) {
        
        const isIndex = path.includes("index.html") || path.endsWith("/");
        
        // (NOVO) LÓGICA DE FILTRO DA BARRA DE PESQUISA (Apenas para servicos.html)
        const filtroInput = document.getElementById('filtro-servicos');
        if (filtroInput) { // Só vai rodar se o input (que só existe em servicos.html) for encontrado
            
            filtroInput.addEventListener('input', () => {
                const termo = filtroInput.value.toLowerCase().trim();
                const servicosContainer = document.getElementById('servicos-container');
                const cards = servicosContainer.querySelectorAll('.col'); // Seleciona as colunas do Bootstrap

                cards.forEach(card => {
                    // Busca o texto dentro dos elementos específicos do card
                    const titulo = card.querySelector('h2.card-title').textContent.toLowerCase();
                    const profissional = card.querySelector('.card-profissional').textContent.toLowerCase();
                    const especialidade = card.querySelector('.card-especialidade').textContent.toLowerCase();
                    
                    const corresponde = titulo.includes(termo) || 
                                      profissional.includes(termo) || 
                                      especialidade.includes(termo);
                    
                    // ==================================================
                    // *** CORREÇÃO APLICADA AQUI (v2) ***
                    // Usamos classes do Bootstrap (d-none) em vez de style.display
                    // para preservar o layout do grid.
                    // ==================================================
                    if (corresponde) {
                        card.classList.remove('d-none'); 
                    } else {
                        card.classList.add('d-none');
                    }
                });
            });
        }
        // FIM DA LÓGICA DE FILTRO

        // Lógica de Notícias (Apenas para index.html)
        if (isIndex) {
            const noticiasContainer = document.getElementById('noticias-container');
            if (noticiasContainer) {
                noticiasContainer.innerHTML = "<h2>Notícias de Saúde</h2>"; 
                fetchHealthNews()
                    .then(noticias => { 
                        if (!noticias || noticias.length === 0) {
                            throw new Error("A API funcionou, mas não retornou nenhuma notícia.");
                        }
                        noticias.slice(0, 3).forEach(item => {
                            const noticiaCard = document.createElement('a');
                            noticiaCard.className = 'noticia-card';
                            noticiaCard.href = item.link; 
                            noticiaCard.target = '_blank'; 
                            noticiaCard.rel = 'noopener noreferrer';
                            const dataFormatada = new Date(item.date).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric'
                            });
                            noticiaCard.innerHTML = `
                                <h3>${item.title}</h3>
                                <span>Fonte: ${item.source} - ${dataFormatada}</span>
                            `;
                            noticiasContainer.appendChild(noticiaCard);
                        });
                    })
                    .catch(err => {
                        console.error("Erro ao buscar notícias:", err.message); 
                        noticiasContainer.innerHTML += `<p style="color: red; text-align: center;">${err.message}</p>`;
                    });
            }
        }
        
        // Lógica de carregar serviços (Comum ao Index e Serviços)
        const servicosSection = document.getElementById("servicos-container");
        if (servicosSection) {
            fetch("http://localhost:3000/servicos")
                .then(res => res.json())
                .then(servicos => {
                    servicosSection.innerHTML = servicos.map(servico => {
                        // (ATUALIZADO) O .card agora é unificado pelo CSS
                        const cardHTML = `
                            <div class="card h-100">
                                <img src="${servico.imagem}" class="card-img-top" alt="${servico.nome}">
                                <div class="card-body d-flex flex-column">
                                    <h2 class="card-title">${servico.nome}</h2>
                                    <p class="card-profissional">${servico.profissional}</p>
                                    <p class="card-especialidade">Especialidade: ${servico.especialidade}</p>
                                    <p>R$ ${parseFloat(servico.preco).toFixed(2).replace('.', ',')}</p>
                                    <a href="detalhe.html?id=${servico.id}" class="mt-auto">Ver detalhes</a>
                                </div>
                            </div>
                        `;
                        if (isIndex) {
                            return `<div class="swiper-slide">${cardHTML}</div>`;
                        }
                        // (ATUALIZADO) Na página de serviços, o card é envolvido por uma coluna
                        return `<div class="col">${cardHTML}</div>`;
                    }).join("");

                    if (!isIndex) {
                        // (ATUALIZADO) Adiciona as classes do grid Bootstrap ao container
                        servicosSection.classList.add('row', 'row-cols-1', 'row-cols-md-2', 'row-cols-lg-3', 'g-4');
                    }
                    
                    if (isIndex) {
                        new Swiper('.swiper-container', {
                            loop: true,
                            slidesPerView: 1, 
                            spaceBetween: 20,
                            pagination: { el: '.swiper-pagination', clickable: true },
                            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                            breakpoints: {
                                768: { slidesPerView: 2, spaceBetween: 20 },
                                1024: { slidesPerView: 3, spaceBetween: 30 },
                                1200: { slidesPerView: 4, spaceBetween: 30 }
                            }
                        });
                    }
                })
                .catch(err => {
                    console.error("Erro ao carregar serviços:", err);
                    servicosSection.innerHTML = "<p>Erro ao carregar serviços.</p>";
                });
        }
    }

    // --- 2.6: Lógica Específica da Página de DETALHES (detalhe.html) ---
    // (ATUALIZADO para incluir formulário de agendamento)
    else if (path.includes("detalhe.html")) {
        
        const detalheElement = document.getElementById("servico-detalhe");
        const urlParams = new URLSearchParams(window.location.search);
        const servicoId = urlParams.get("id");

        if (servicoId) {
            fetch(`http://localhost:3000/servicos/${servicoId}`)
                .then(res => {
                    if (res.status === 404) throw new Error("Serviço não encontrado");
                    return res.json();
                })
                .then(servico => {
                    const precoFormatado = parseFloat(servico.preco).toFixed(2).replace('.', ',');
                    let actionButtons = '';
                    
                    if (currentUser) {
                        if (currentUser.nivel === 'gerente') {
                            actionButtons = `
                                <div class="action-buttons">
                                    <a href="editar.html?id=${servico.id}" class="btn-editar">Editar</a>
                                    <button id="btn-excluir" class="btn-excluir">Excluir Serviço</button>
                                </div>
                            `;
                        } 
                        // (NOVO) Formulário de Agendamento para Clientes
                        else if (currentUser.nivel === 'cliente') {
                            actionButtons = `
                                <form id="form-agendamento" class="action-buttons">
                                    <div class="row g-2 w-100">
                                        <div class="col-md">
                                            <label for="data_agendamento" class="form-label">Escolha a data e hora:</label>
                                            <input type="datetime-local" class="form-control" id="data_agendamento" required>
                                        </div>
                                        <div class="col-md-auto d-flex align-items-end">
                                            <button type="submit" class="btn btn-primary w-100 btn-submit">Agendar Serviço</button>
                                        </div>
                                    </div>
                                    <div id="agendamento-mensagem" class="mt-2 w-100"></div>
                                </form>
                            `;
                        }
                    } else {
                        // (AJUSTADO) Mensagem de login com classes do CSS
                        actionButtons = `
                            <div class="action-buttons" style="border-top: none; padding-top: 0;">
                                <p style="margin-bottom: 0;">
                                    <a href="login.html">Faça login</a> para poder agendar este serviço.
                                </p>
                            </div>
                        `;
                    }
                    
                    detalheElement.innerHTML = `
                        <div class="produto-detalhe-card">
                            <img src="${servico.imagem}" alt="${servico.nome}">
                            <h2>${servico.nome}</h2>
                            <p><strong>Profissional:</strong> ${servico.profissional}</p>
                            <p><strong>Especialidade:</strong> ${servico.especialidade}</p>
                            <p style="font-size: 1.5rem; font-weight: 700;">R$ ${precoFormatado}</p>
                            <p>${servico.descricao}</p>
                        </div>
                        ${actionButtons} 
                        <div class="mt-4" style="width: 100%;">
                            <a href="servicos.html" class="btn-voltar">← Voltar para a lista</a>
                        </div>
                    `;
                    
                    const btnExcluir = document.getElementById('btn-excluir');
                    if (btnExcluir) {
                        btnExcluir.addEventListener('click', () => {
                            excluirServico(servicoId);
                        });
                    }

                    // (NOVO) Listener para o formulário de agendamento
                    const formAgendamento = document.getElementById('form-agendamento');
                    if (formAgendamento) {
                        formAgendamento.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const dataInput = document.getElementById('data_agendamento').value;
                            const mensagemElement = document.getElementById('agendamento-mensagem');

                            const novoAgendamento = {
                                usuario_id: currentUser.id,
                                servico_id: servicoId,
                                data_agendamento: dataInput
                            };

                            fetch('http://localhost:3000/agendamentos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(novoAgendamento)
                            })
                            .then(res => {
                                if (!res.ok) throw new Error('Erro ao agendar. Verifique a data e tente novamente.');
                                return res.json();
                            })
                            .then(data => {
                                mensagemElement.innerHTML = `<p style="color: var(--success-green);"><strong>Agendado com sucesso!</strong></p>`;
                                formAgendamento.reset();
                            })
                            .catch(err => {
                                mensagemElement.innerHTML = `<p style="color: var(--danger-red);">${err.message}</p>`;
                            });
                        });
                    }
                })
                .catch(error => {
                    console.error("Erro ao buscar detalhes:", error);
                    detalheElement.innerHTML = `<div class="message-error">
                            <h2>Erro ao Carregar Serviço</h2>
                            <p>${error.message}</p>
                            <a href="servicos.html" class="btn-voltar error">← Voltar</a>
                        </div>`;
                });
        } else {
            detalheElement.innerHTML = "<p>Serviço não especificado.</p>";
        }
    }

    // --- 2.7: Lógica Específica da Página de EDIÇÃO (editar.html) ---
    else if (path.includes("editar.html")) {
        // (Esta lógica permanece 100% igual)
        if (!currentUser || currentUser.nivel !== 'gerente') {
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `<div class="message-error" style="text-align: center; max-width: 600px; margin: 40px auto;">
                        <h2>Acesso Negado</h2>
                        <p>Você precisa estar logado como 'gerente' para acessar esta página.</p>
                        <a href="index.html" class="btn btn-secondary btn-voltar">Voltar ao Início</a>
                    </div>`;
            }
            return; 
        }
        const formEditar = document.getElementById('form-editar');
        const mensagemElement = document.getElementById('mensagem');
        const urlParams = new URLSearchParams(window.location.search);
        const servicoId = urlParams.get("id"); 
        const nomeInput = document.getElementById('nome');
        const profissionalInput = document.getElementById('profissional');
        const especialidadeInput = document.getElementById('especialidade');
        const precoInput = document.getElementById('preco');
        const descricaoInput = document.getElementById('descricao');
        const imagemInput = document.getElementById('imagem');
        if (!servicoId) {
            document.querySelector('main').innerHTML = `<div class="message-error">ID do serviço não fornecido.</div>`;
            return;
        }
        fetch(`http://localhost:3000/servicos/${servicoId}`)
            .then(res => {
                if (!res.ok) { throw new Error('Serviço não encontrado.'); }
                return res.json();
            })
            .then(servico => {
                nomeInput.value = servico.nome;
                profissionalInput.value = servico.profissional;
                especialidadeInput.value = servico.especialidade;
                precoInput.value = servico.preco;
                descricaoInput.value = servico.descricao;
                imagemInput.value = servico.imagem;
            })
            .catch(error => {
                mensagemElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
            });
        if (formEditar) {
            formEditar.addEventListener('submit', (e) => {
                e.preventDefault();
                const servicoAtualizado = {
                    nome: nomeInput.value.trim(),
                    profissional: profissionalInput.value.trim(),
                    especialidade: especialidadeInput.value.trim(),
                    preco: parseFloat(precoInput.value),
                    descricao: descricaoInput.value.trim(),
                    imagem: imagemInput.value.trim()
                };
                if (!servicoAtualizado.nome || !servicoAtualizado.profissional || !servicoAtualizado.especialidade || !servicoAtualizado.descricao || isNaN(servicoAtualizado.preco) || servicoAtualizado.preco <= 0 || !servicoAtualizado.imagem) {
                    mensagemElement.innerHTML = '<p style="color: red;">Preencha todos os campos corretamente.</p>';
                    return;
                }
                fetch(`http://localhost:3000/servicos/${servicoId}`, { 
                    method: 'PATCH', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(servicoAtualizado)
                })
                .then(res => {
                    if (!res.ok) { throw new Error('Erro ao salvar as alterações.'); }
                    return res.json();
                })
                .then(data => {
                    mensagemElement.innerHTML = `<p style="color: green;">Serviço <strong>${data.nome}</strong> salvo com sucesso!</p>`;
                    setTimeout(() => {
                        window.location.href = `detalhe.html?id=${servicoId}`;
                    }, 2000);
                })
                .catch(error => {
                    mensagemElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
                });
            });
        }
    }

    // --- 2.8: (NOVO) Lógica Específica da Página de MEUS AGENDAMENTOS ---
    // (ATUALIZADO com botão de cancelar e status dinâmico)
    else if (path.includes("meus-agendamentos.html")) {
        
        const container = document.getElementById('agendamentos-container');

        // 1. Proteger a Rota
        if (!currentUser || currentUser.nivel !== 'cliente') {
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `<div class="message-error" style="text-align: center; max-width: 600px; margin: 40px auto;">
                        <h2>Acesso Negado</h2>
                        <p>Você precisa estar logado como 'cliente' para acessar esta página.</p>
                        <a href="index.html" class="btn btn-secondary btn-voltar">Voltar ao Início</a>
                    </div>`;
            }
            return;
        }

        // 2. Buscar os agendamentos do usuário logado
        fetch(`http://localhost:3000/agendamentos/usuario/${currentUser.id}`)
            .then(res => res.json())
            .then(agendamentos => {
                if (agendamentos.length === 0) {
                    // (CORRIGIDO) Usa a nova classe .message-info para ser legível
                    container.innerHTML = '<div class="message-info">Você ainda não possui nenhum agendamento.</div>';
                    return;
                }

                // 3. Renderizar a tabela de agendamentos
                container.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th scope="col">Serviço</th>
                                    <th scope="col">Profissional</th>
                                    <th scope="col">Data e Hora</th>
                                    <th scope="col">Preço</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Ações</th> </tr>
                            </thead>
                            <tbody>
                                ${agendamentos.map(item => {
                                    // Formata a data e hora
                                    const data = new Date(item.data_agendamento);
                                    const dataFormatada = data.toLocaleDateString('pt-BR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    });

                                    // (NOVO) Lógica de Status e Botão
                                    let statusBadge = '';
                                    let actionButton = '';

                                    if (item.status === 'Agendado') {
                                        statusBadge = `<span class="badge" style="background-color: var(--success-green);">${item.status}</span>`;
                                        actionButton = `<button class="btn btn-danger btn-sm btn-cancelar" data-id="${item.agendamento_id}">Cancelar</button>`;
                                    } else if (item.status === 'Cancelado') {
                                        statusBadge = `<span class="badge" style="background-color: var(--danger-red);">${item.status}</span>`;
                                        actionButton = ``; // Sem botão se já está cancelado
                                    } else {
                                        statusBadge = `<span class="badge bg-secondary">${item.status}</span>`;
                                    }

                                    return `
                                        <tr>
                                            <td>${item.servico_nome}</td>
                                            <td>${item.profissional}</td>
                                            <td>${dataFormatada}</td>
                                            <td>R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</td>
                                            <td>${statusBadge}</td>
                                            <td>${actionButton}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .catch(err => {
                console.error("Erro ao buscar agendamentos:", err);
                container.innerHTML = `<div class="message-error">Erro ao carregar seus agendamentos. Tente novamente.</div>`;
            });

        // (NOVO) Adiciona o event listener para os botões de cancelar
        // Usamos delegação de evento no container
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cancelar')) {
                const agendamentoId = e.target.dataset.id;
                cancelarAgendamento(agendamentoId);
            }
        });
    }

});