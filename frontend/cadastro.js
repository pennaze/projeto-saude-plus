document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const mensagemElement = document.getElementById('mensagem');

    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();

            // Coleta e parse dos dados do formulário.
            const nome = document.getElementById('nome').value.trim();
            const preco = parseFloat(document.getElementById('preco').value);
            const descricao = document.getElementById('descricao').value.trim();
            const imagem = document.getElementById('imagem').value.trim();
            
            // Validação simples de campos obrigatórios e preço positivo.
            if (!nome || !descricao || isNaN(preco) || preco <= 0 || !imagem) {
                mensagemElement.textContent = 'Preencha todos os campos corretamente (Preço deve ser maior que zero).';
                mensagemElement.style.color = 'red';
                return;
            }
            
            mensagemElement.textContent = ''; 

            const novoProduto = {
                nome: nome,
                preco: preco,
                descricao: descricao,
                imagem: imagem
            };

            // Envio dos dados via Fetch API (método POST).
            fetch('http://localhost:3000/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoProduto)
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Erro ao cadastrar produto. Verifique se o servidor Node.js está rodando.');
                }
                return res.json();
            })
            .then(data => {
                // Sucesso: exibe mensagem e limpa o formulário.
                mensagemElement.innerHTML = `<p style="color: green;">Produto <strong>${data.nome}</strong> cadastrado com sucesso!</p>`;
                formCadastro.reset();
                
                // Limpa a mensagem após 18 segundos.
                setTimeout(() => {
                    mensagemElement.innerHTML = '';
                }, 18000);
                
            })
            .catch(error => {
                // Trata erros de rede ou de servidor.
                mensagemElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
            });
        });
    }
});