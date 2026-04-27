require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Configurações (Middlewares)
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco clinica_odonto com sucesso!');
});

// ==========================================
// ROTAS DO MÓDULO DE DENTISTAS
// ==========================================

// 1. Rota para CADASTRAR um dentista (CREATE)
app.post('/dentistas', (req, res) => {
    // Agora pegamos os campos exatos que a equipe definiu no banco
    const { CPF_Dentista, nome, CRO, croUF, especialidade } = req.body;

    // O nome da tabela é 'dentista' (no singular, conforme o script)
    const query = 'INSERT INTO dentista (CPF_Dentista, nome, CRO, croUF, especialidade) VALUES (?, ?, ?, ?, ?)';
    const valores = [CPF_Dentista, nome, CRO, croUF, especialidade];

    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar dentista:', err);
            // Verifica se o erro é de CPF ou CRO duplicado para dar uma resposta mais amigável
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ erro: 'CPF ou CRO já cadastrados no sistema.' });
            }
            return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados' });
        }
        res.status(201).json({ 
            mensagem: 'Dentista cadastrado com sucesso!',
            CPF_Cadastrado: CPF_Dentista
        });
    });
});

// 2. Rota para LISTAR todos os dentistas (READ)
app.get('/dentistas', (req, res) => {
    const query = 'SELECT * FROM dentista';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar dentistas:', err);
            return res.status(500).json({ erro: 'Erro ao consultar o banco de dados' });
        }
        res.status(200).json(results);
    });
});

// 2.1. Rota para BUSCAR um dentista específico por CPF (READ ONE)
app.get('/dentistas/:cpf', (req, res) => {
    const { cpf } = req.params; // Pega o CPF que o usuário digitou na URL

    const query = 'SELECT * FROM dentista WHERE CPF_Dentista = ?';

    db.query(query, [cpf], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dentista:', err);
            return res.status(500).json({ erro: 'Erro interno ao consultar o banco de dados' });
        }

        // Se o banco não encontrar nada, o array 'results' vem vazio (tamanho 0)
        if (results.length === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        // Como o CPF é único, retornamos apenas o primeiro item do array (posição 0)
        res.status(200).json(results[0]);
    });
});

// 3. Rota para ATUALIZAR um dentista (UPDATE)
app.put('/dentistas/:cpf', (req, res) => {
    // 1. Pega o CPF que vem na URL (ex: /dentistas/11122233344)
    const { cpf } = req.params; 
    
    // 2. Pega os novos dados que vieram no corpo da requisição (JSON)
    const { nome, CRO, croUF, especialidade } = req.body;

    // 3. Monta o comando SQL de atualização
    // ATENÇÃO: Geralmente não atualizamos a Chave Primária (CPF), só os outros dados.
    const query = 'UPDATE dentista SET nome = ?, CRO = ?, croUF = ?, especialidade = ? WHERE CPF_Dentista = ?';
    const valores = [nome, CRO, croUF, especialidade, cpf];

    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao atualizar dentista:', err);
            // Se tentar colocar um CRO que já pertence a outro dentista:
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ erro: 'O novo CRO informado já está cadastrado no sistema.' });
            }
            return res.status(500).json({ erro: 'Erro interno ao atualizar no banco de dados' });
        }

        // Se o banco rodou o comando, mas nenhuma linha foi alterada, significa que o CPF não existe lá
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        res.status(200).json({ mensagem: 'Dados do dentista atualizados com sucesso!' });
    });
});

// 4. Rota para EXCLUIR um dentista (DELETE)
app.delete('/dentistas/:cpf', (req, res) => {
    const { cpf } = req.params; // Pega o CPF da URL

    const query = 'DELETE FROM dentista WHERE CPF_Dentista = ?';

    db.query(query, [cpf], (err, result) => {
        if (err) {
            console.error('Erro ao excluir dentista:', err);
            
            // Tratamento de erro de Chave Estrangeira
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    erro: 'Não é possível excluir este dentista, pois ele já possui atendimentos ou procedimentos vinculados no sistema.' 
                });
            }
            
            return res.status(500).json({ erro: 'Erro interno ao excluir no banco de dados' });
        }

        // Se o banco rodou o comando, mas nenhuma linha foi apagada, o CPF não existia
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        res.status(200).json({ mensagem: 'Dentista excluído com sucesso!' });
    });
});

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
const PORTA = process.env.PORTA || 3000;

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});