# Projeto Final: Marketplace de Serviços de Saúde (Saúde+)

[cite_start]Este projeto é um sistema full-stack de "Marketplace de Serviços" [cite: 6] [cite_start]desenvolvido para as disciplinas de Desenvolvimento Front-end e Back-end do curso de ADS (2025.2)[cite: 1, 3, 4].

[cite_start]O sistema consiste em um **backend** (API RESTful) construído com Node.js e Express.js [cite: 32] [cite_start]que gerencia os dados, e um **frontend** (Single Page Application) que consome essa API[cite: 40].

## 1. Estrutura do Backend e Endpoints

[cite_start]O servidor, construído com **Express.js**, se conecta a um banco de dados **PostgreSQL** [cite: 32, 33] e expõe as seguintes rotas:

### [cite_start]Rotas de Serviços (CRUD) [cite: 36]
* `GET /servicos`: Lista todos os serviços cadastrados.
* `GET /servicos/:id`: Busca um serviço específico pelo seu ID.
* `POST /servicos`: Cadastra um novo serviço (Rota protegida, requer nível 'gerente').
* `PATCH /servicos/:id`: Atualiza um serviço existente (Rota protegida, requer nível 'gerente').
* `DELETE /servicos/:id`: Exclui um serviço (Rota protegida, requer nível 'gerente').

### [cite_start]Rotas de Usuários (Autenticação e Cadastro) [cite: 37]
* `GET /usuarios`: Usada para o login, buscando um usuário por email e senha.
* `POST /usuarios`: Cadastra um novo usuário.
    * **Lógica de Nível:** O sistema automaticamente cadastra o email `admin@saudeplus.com` como `'gerente'`. Todos os outros emails são cadastrados como `'cliente'`.

### Rotas de Agendamentos
* `GET /agendamentos/usuario/:id`: Lista todos os agendamentos de um usuário específico (juntando dados do serviço).
* `POST /agendamentos`: Cria um novo agendamento para um cliente.
* `PATCH /agendamentos/:id/status`: Atualiza o status de um agendamento (usado para cancelar).

## 2. Tecnologias Utilizadas

* **Backend:**
    * Node.js
    * [cite_start]Express.js [cite: 32]
    * [cite_start]PostgreSQL (pg) [cite: 33]
    * CORS
* **Dependências Principais:** `express`, `cors`, `pg`
* **Frontend:**
    * HTML5
    * CSS3 (Dark Mode com Variáveis CSS)
    * JavaScript (ES6+)
    * Bootstrap
    * Swiper.js (para o carrossel)

## 3. Como Executar o Projeto

Para rodar este projeto, você precisará de **Node.js** e **PostgreSQL** (com o **pgAdmin**) instalados em sua máquina.

### Passo 1: Configurar o Banco de Dados (PostgreSQL)

1.  Abra o **pgAdmin**.
2.  Crie um novo banco de dados. O nome utilizado no código é `saudeplus`.
3.  Abra o "Query Tool" (Ferramenta de Consulta) para este banco e execute os seguintes comandos SQL para criar as tabelas:

    ```sql
    -- Tabela 1: Usuários
    -- Armazena clientes e gerentes
    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        nivel VARCHAR(20) NOT NULL DEFAULT 'cliente' -- 'cliente' ou 'gerente'
    );
    
    -- Tabela 2: Serviços
    -- O catálogo principal de serviços oferecidos
    CREATE TABLE servicos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        profissional VARCHAR(100),
        especialidade VARCHAR(100),
        preco NUMERIC(10, 2) NOT NULL,
        descricao TEXT,
        imagem VARCHAR(255)
    );
    
    -- Tabela 3: Agendamentos
    -- Conecta um usuário a um serviço em uma data específica
    CREATE TABLE agendamentos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        servico_id INTEGER NOT NULL,
        data_agendamento TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'Agendado', -- Ex: 'Agendado', 'Cancelado'
        
        -- Chaves estrangeiras para garantir a integridade dos dados
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (servico_id) REFERENCES servicos(id)
    );
    ```

### Passo 2: Configurar e Rodar o Backend

1.  Navegue até a pasta do backend: `cd marketplace/backend`
2.  Instale as dependências: `npm install`
3.  **IMPORTANTE:** Abra o arquivo `index.js`. Na `const pool`, **altere a senha (`password: '1234'`)** para a senha que *você* usa no seu PostgreSQL.
4.  Inicie o servidor: `node index.js`
5.  O terminal deve mostrar: `✅ Servidor pronto para receber requisições em http://localhost:3000`

### Passo 3: Rodar o Frontend

1.  Abra a pasta `marketplace/frontend` no VS Code.
2.  Clique com o botão direito no arquivo `index.html`.
3.  Selecione "Open with Live Server" (ou use qualquer servidor estático de sua preferência).
4.  O site será aberto no seu navegador (geralmente em `http://127.0.0.1:5500/frontend/index.html`).

## 4. Autores

* (Enzo Rodrigues)
* (Gabriel Roberto)
* (José Peninha)