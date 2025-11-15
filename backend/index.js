// --- Importações ---
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 

// --- Configuração Inicial ---
const app = express();
const PORT = 3000;

// Configuração do Banco de Dados PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'saudeplus', 
    password: '1234', // Lembre-se de pôr a sua senha
    port: 5432,
});

// --- Middlewares ---
app.use(express.json()); // Permite ler JSON no corpo da requisição
app.use(cors()); // Habilita o CORS para requisições de diferentes origens

// ========================================================================
// --- ROTAS DE SERVIÇOS (/servicos) ---
// ========================================================================

// Rota para todos os serviços (GET /servicos) - Inclui funcionalidade de busca e ordenação.
app.get('/servicos', async (req, res) => {
    const { search, sort } = req.query;
    try {
        let query = 'SELECT * FROM servicos';
        const queryParams = [];
        if (search) {
            queryParams.push(`%${search.toLowerCase()}%`);
            query += ' WHERE LOWER(nome) ILIKE $1 OR LOWER(descricao) ILIKE $1 OR LOWER(especialidade) ILIKE $1 OR LOWER(profissional) ILIKE $1';
        }
        if (sort === 'nome') {
            query += ' ORDER BY nome ASC';
        }
        const { rows } = await pool.query(query, queryParams);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao buscar serviços.' });
    }
});

// Rota para serviço por ID (GET /servicos/:id)
app.get('/servicos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows, rowCount } = await pool.query('SELECT * FROM servicos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar serviço por ID:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao buscar serviço.' });
    }
});

// Rota de Cadastro de Serviço (POST /servicos)
app.post('/servicos', async (req, res) => {
    const { nome, profissional, especialidade, preco, descricao, imagem } = req.body;
    try {
        const sql = 'INSERT INTO servicos (nome, profissional, especialidade, preco, descricao, imagem) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [nome, profissional, especialidade, preco, descricao, imagem];
        const { rows } = await pool.query(sql, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Erro no processamento da requisição POST:", error.message);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

// ROTA DE EDIÇÃO DE SERVIÇO (PATCH /servicos/:id)
app.patch('/servicos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, profissional, especialidade, preco, descricao, imagem } = req.body;
    try {
        const sql = 'UPDATE servicos SET nome = $1, profissional = $2, especialidade = $3, preco = $4, descricao = $5, imagem = $6 WHERE id = $7 RETURNING *';
        const values = [nome, profissional, especialidade, preco, descricao, imagem, id];
        const { rows, rowCount } = await pool.query(sql, values);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado para edição.' });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao processar edição:", error);
        return res.status(500).json({ mensagem: 'Erro interno ao tentar editar o serviço.' });
    }
});

// Rota de Exclusão de Serviço (DELETE /servicos/:id)
app.delete('/servicos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM servicos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado para exclusão.' });
        }
        return res.status(200).json({ mensagem: 'Serviço excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao processar exclusão:", error);
        return res.status(500).json({ mensagem: 'Erro interno ao tentar excluir o serviço.' });
    }
});


// ========================================================================
// --- ROTAS DE USUÁRIOS (/usuarios) ---
// ========================================================================

// Rota para buscar usuários (GET /usuarios) - Usada para login e verificação de email.
app.get('/usuarios', async (req, res) => {
    const { email, senha } = req.query;
    try {
        let sql = 'SELECT * FROM usuarios WHERE 1=1';
        const params = [];
        if (email) {
            params.push(email.toLowerCase());
            sql += ` AND LOWER(email) = $${params.length}`;
        }
        if (senha) {
            params.push(senha);
            sql += ` AND senha = $${params.length}`;
        }
        const { rows } = await pool.query(sql, params);
        res.json(rows); 
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar usuários.' });
    }
});

// Rota de Cadastro de Usuário (POST /usuarios) - Define o nível como 'gerente' se for o email mestre.
app.post('/usuarios', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Lógica para definir o nível: "admin@saudeplus.com" se torna gerente, outros clientes.
    let nivel = 'cliente';
    if (email.toLowerCase() === 'admin@saudeplus.com') {
        nivel = 'gerente';
    }

    try {
        // Verifica se o email já existe
        const { rowCount } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rowCount > 0) {
            return res.status(400).json({ error: 'Este email já está cadastrado.' });
        }
        
        // Insere o novo usuário
        const sql = 'INSERT INTO usuarios (email, senha, nivel) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(sql, [email, senha, nivel]);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("Erro no processamento do POST /usuarios:", error.message);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});


// ========================================================================
// --- ROTAS DE AGENDAMENTOS (/agendamentos) ---
// ========================================================================

// Rota para CRIAR um agendamento (POST /agendamentos)
app.post('/agendamentos', async (req, res) => {
    const { usuario_id, servico_id, data_agendamento } = req.body;

    if (!usuario_id || !servico_id || !data_agendamento) {
        return res.status(400).json({ mensagem: 'Dados incompletos para o agendamento.' });
    }

    try {
        const sql = 'INSERT INTO agendamentos (usuario_id, servico_id, data_agendamento, status) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await pool.query(sql, [usuario_id, servico_id, data_agendamento, 'Agendado']);
        
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("Erro ao criar agendamento:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao criar agendamento.' });
    }
});

// Rota para LISTAR agendamentos de UM usuário (GET /agendamentos/usuario/:id)
app.get('/agendamentos/usuario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // JOIN com a tabela 'servicos' para obter informações detalhadas do serviço
        const sql = `
            SELECT 
                a.id AS agendamento_id, 
                a.data_agendamento, 
                a.status,
                s.nome AS servico_nome, 
                s.profissional, 
                s.preco
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.usuario_id = $1
            ORDER BY a.data_agendamento ASC
        `;
        
        const { rows } = await pool.query(sql, [id]);
        res.json(rows);

    } catch (error) {
        console.error("Erro ao buscar agendamentos do usuário:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao buscar agendamentos.' });
    }
});

// Rota para ATUALIZAR O STATUS de um agendamento (PATCH /agendamentos/:id/status)
app.patch('/agendamentos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Espera receber {"status": "Cancelado"}

    if (!status) {
        return res.status(400).json({ mensagem: 'Novo status é obrigatório.' });
    }

    try {
        const sql = 'UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *';
        const { rows, rowCount } = await pool.query(sql, [status, id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Erro ao atualizar status do agendamento:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar agendamento.' });
    }
});


// --- INICIA O SERVIDOR ---
app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`✅ Servidor Express do Marketplace de Saúde a rodar.`);
    console.log(`✅ Servidor pronto para receber requisições em http://localhost:${PORT}`);
    console.log('========================================================');
});