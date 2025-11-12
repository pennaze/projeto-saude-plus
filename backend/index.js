// --- 1. Importações ---
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 

// --- 2. Configuração Inicial ---
const app = express();
const PORT = 3000;

// --- Configuração do Banco de Dados ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'saudeplus', 
    password: '1234', // Lembre-se de pôr a sua senha
    port: 5432,
});

// --- 3. Middlewares (Funções Globais) ---
app.use(express.json());
app.use(cors());

// ========================================================================
// --- 4. ROTAS DE SERVIÇOS (/servicos) ---
// ========================================================================
// (As suas rotas de GET, POST, PATCH, DELETE de /servicos permanecem aqui, inalteradas)
// Rota para todos os serviços (GET /servicos)
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
    console.log('✅ Recebida requisição POST para /servicos');
    try {
        const sql = 'INSERT INTO servicos (nome, profissional, especialidade, preco, descricao, imagem) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [nome, profissional, especialidade, preco, descricao, imagem];
        const { rows } = await pool.query(sql, values);
        console.log(`💾 Serviço ID ${rows[0].id} gravado com sucesso no DB.`);
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
    console.log(`✏️ Recebida requisição PATCH para /servicos/${id}`);
    try {
        const sql = 'UPDATE servicos SET nome = $1, profissional = $2, especialidade = $3, preco = $4, descricao = $5, imagem = $6 WHERE id = $7 RETURNING *';
        const values = [nome, profissional, especialidade, preco, descricao, imagem, id];
        const { rows, rowCount } = await pool.query(sql, values);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado para edição.' });
        }
        console.log(`💾 Serviço ID ${id} atualizado com sucesso no DB.`);
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao processar edição:", error);
        return res.status(500).json({ mensagem: 'Erro interno ao tentar editar o serviço.' });
    }
});

// Rota de Exclusão de Serviço (DELETE /servicos/:id)
app.delete('/servicos/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`❌ Recebida requisição DELETE para /servicos/${id}`);
    try {
        const { rowCount } = await pool.query('DELETE FROM servicos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Serviço não encontrado para exclusão.' });
        }
        console.log(`✅ Serviço ID ${id} excluído com sucesso do DB.`);
        return res.status(200).json({ mensagem: 'Serviço excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao processar exclusão:", error);
        return res.status(500).json({ mensagem: 'Erro interno ao tentar excluir o serviço.' });
    }
});


// ========================================================================
// --- 5. ROTAS DE USUÁRIOS (/usuarios) ---
// ========================================================================
// (Rota GET /usuarios inalterada)
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
        console.log(`🔍 GET /usuarios?email=${email} - Encontrados: ${rows.length}`);
        res.json(rows); 
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar usuários.' });
    }
});

// (NOVO) Rota POST /usuarios ATUALIZADA
app.post('/usuarios', async (req, res) => {
    // 1. MUDANÇA: 'nivel' não é mais recebido do frontend
    const { email, senha } = req.body;
    console.log('✅ Recebida requisição POST para /usuarios (Cadastro)');
    
    // 2. MUDANÇA: Validação agora é só para email e senha
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // 3. (NOVA LÓGICA) Define o nível automaticamente
    // Por padrão, todos são clientes
    let nivel = 'cliente';
    
    // *** AQUI ESTÁ A SUA IDEIA: O "EMAIL MESTRE" ***
    // Se o email for este, ele se torna gerente.
    // (Você pode mudar este email para o que quiser)
    if (email.toLowerCase() === 'admin@saudeplus.com') {
        nivel = 'gerente';
    }

    try {
        // Verifica se o email já existe
        const { rowCount } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rowCount > 0) {
            return res.status(400).json({ error: 'Este email já está cadastrado.' });
        }
        
        // 4. MUDANÇA: Insere o usuário com o 'nivel' que definimos acima
        const sql = 'INSERT INTO usuarios (email, senha, nivel) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(sql, [email, senha, nivel]);
        
        const novoUsuario = rows[0];
        // Log atualizado para mostrar o nível
        console.log(`💾 Usuário ID ${novoUsuario.id} (email: ${novoUsuario.email}) gravado com sucesso como [${nivel}].`);
        res.status(201).json(novoUsuario);

    } catch (error) {
        console.error("Erro no processamento do POST /usuarios:", error.message);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});


// ========================================================================
// --- 6. ROTAS DE AGENDAMENTOS (/agendamentos) ---
// ========================================================================
// (As rotas de agendamentos permanecem 100% inalteradas)

/**
 * Rota para CRIAR um agendamento
 */
app.post('/agendamentos', async (req, res) => {
    const { usuario_id, servico_id, data_agendamento } = req.body;
    console.log(`🗓️  Recebida requisição POST para /agendamentos`);

    if (!usuario_id || !servico_id || !data_agendamento) {
        return res.status(400).json({ mensagem: 'Dados incompletos para o agendamento.' });
    }

    try {
        const sql = 'INSERT INTO agendamentos (usuario_id, servico_id, data_agendamento, status) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await pool.query(sql, [usuario_id, servico_id, data_agendamento, 'Agendado']);
        
        console.log(`✅ Agendamento ID ${rows[0].id} criado com sucesso.`);
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("Erro ao criar agendamento:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao criar agendamento.' });
    }
});

/**
 * Rota para LISTAR agendamentos de UM usuário
 */
app.get('/agendamentos/usuario/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`🗓️  Recebida requisição GET para /agendamentos/usuario/${id}`);

    try {
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

/**
 * Rota para ATUALIZAR O STATUS de um agendamento (Cancelar)
 */
app.patch('/agendamentos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Espera receber {"status": "Cancelado"}

    console.log(`🗓️  Recebida requisição PATCH para /agendamentos/${id}/status`);

    if (!status) {
        return res.status(400).json({ mensagem: 'Novo status é obrigatório.' });
    }

    try {
        const sql = 'UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *';
        const { rows, rowCount } = await pool.query(sql, [status, id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
        }

        console.log(`✅ Agendamento ID ${id} atualizado para ${status}.`);
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Erro ao atualizar status do agendamento:", error.message);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar agendamento.' });
    }
});


// --- 7. INICIA O SERVIDOR ---
app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`✅ Servidor Express do Marketplace de Saúde a rodar.`);
    console.log(`Conectado ao banco de dados PostgreSQL.`);
    console.log(`✅ Servidor pronto para receber requisições em http://localhost:${PORT}`);
    console.log('========================================================');
});