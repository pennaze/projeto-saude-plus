# 🏥 Saúde+ | Marketplace de Serviços de Saúde

## Descrição do Projeto
Saúde+ é um marketplace focado em conectar clientes a diversos serviços de saúde e bem-estar. A aplicação utiliza uma arquitetura **Full-Stack JavaScript**, com um backend **Node.js/Express** e persistência de dados em **PostgreSQL**, e um frontend moderno baseado em **HTML, CSS e JavaScript puro** com o auxílio do **Bootstrap 5**.

O projeto incorpora um sistema robusto de autenticação e controle de acesso, permitindo a separação de funcionalidades entre clientes e gerentes.

## 🌟 Funcionalidades Principais

As funcionalidades são segmentadas por nível de acesso, garantindo uma experiência de usuário segura e eficiente.

### Autenticação e Autorização (RBAC)
* **Login e Cadastro de Usuários:** Sistema completo para gerenciamento de contas.
* **Controle de Acesso por Perfil:**
    * **Gerente (`gerente`):** Possui acesso total ao CRUD (Criação, Leitura, Edição e Exclusão) de serviços.
    * **Cliente (`cliente`):** Pode visualizar serviços, realizar agendamentos e gerenciar suas consultas.
* **Acesso de Gerente Simplificado:** O usuário cadastrado com o email `admin@saudeplus.com` é automaticamente promovido ao nível de Gerente pelo backend.

### Gestão de Serviços (CRUD)
* **Listagem Completa:** Exibição de todos os serviços em destaque (carrossel) e na página de catálogo.
* **Filtro Dinâmico:** Pesquisa instantânea por nome, profissional ou especialidade na página de serviços.
* **Administração Exclusiva:** Ações de **Cadastro**, **Edição** e **Exclusão** de serviços estão disponíveis apenas para o perfil `gerente`.

### Funcionalidades do Cliente (Agendamentos)
* **Agendamento de Consultas:** Clientes logados podem escolher a data e hora na página de detalhes do serviço.
* **Painel "Meus Agendamentos":** Área privada onde o cliente pode visualizar um histórico de suas consultas agendadas.
* **Cancelamento de Agendamentos:** Opção de atualizar o status da consulta para "Cancelado" diretamente do painel do cliente.

### Design e Estilização
* **Dark Mode Seletivo:** O frontend utiliza um tema escuro confortável, conforme definido no `style.css`.
* **Notícias de Saúde:** Integração de API externa (`newsdata.io`) para exibir notícias relevantes na página inicial.

## 🛠️ Tecnologias Utilizadas

**Backend** (`marketplace/backend`)
* **Node.js & Express:** Servidor RESTful.
* **PostgreSQL (via `pg`):** Banco de dados.
* **CORS:** Middleware para comunicação segura.

**Frontend** (`marketplace/frontend`)
* **HTML5, CSS3, JavaScript (ES6+):** Base da aplicação.
* **Bootstrap 5:** Framework CSS para responsividade.
* **Swiper.js:** Biblioteca para o carrossel de destaque.

## ⚙️ Configuração do Ambiente

### Pré-requisitos
* Node.js (LTS recomendado)
* PostgreSQL (Servidor rodando)

### 1. Configuração do Banco de Dados

1.  Crie um banco de dados chamado `saudeplus` no PostgreSQL.
2.  **Ajuste de Credenciais:** Edite o arquivo `marketplace/backend/index.js` para garantir que as credenciais do seu banco de dados estejam corretas. Por padrão, ele usa:
    ```javascript
    // ...
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'saudeplus', 
        password: '', // <-- Adicione sua senha
        port: 5432,
    });
    // ...
    ```
3.  **Criação de Tabelas:** Execute os comandos SQL necessários para criar as tabelas `usuarios`, `servicos` e `agendamentos` no seu banco de dados `saudeplus`.

### 2. Executando o Backend

1.  Abra o terminal no diretório `marketplace/backend`.
2.  Instale as dependências do Node.js:
    ```bash
    npm install express pg cors
    ```
    *(Ou simplesmente `npm install` se tiver o `package.json` completo).*
3.  Inicie o servidor:
    ```bash
    node index.js
    # O servidor estará ativo em: http://localhost:3000
    ```

### 3. Executando o Frontend

1.  Navegue até o diretório `marketplace/frontend`.
2.  O Frontend é estático: simplesmente abra o arquivo `index.html` diretamente no seu navegador.
    *(Ex: `file:///caminho/para/marketplace/frontend/index.html`)*

## 🔑 Acessos de Teste

Para testar as diferentes permissões do sistema (RBAC):

| Perfil | Email | Nível | Ações |
| :--- | :--- | :--- | :--- |
| **Gerente** | `admin@saudeplus.com` | `gerente` | Acesso total a Serviços (CRUD). |
| **Cliente** | `qualquer@email.com` | `cliente` | Agendar serviços, Cancelar agendamentos, Ver lista. |

***Lembre-se:*** Para criar a conta de Gerente, utilize o email `admin@saudeplus.com` no formulário de cadastro de usuário (`usuario.html`).