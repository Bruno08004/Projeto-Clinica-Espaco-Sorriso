import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

// Configurações (Middlewares)
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados
let db;

try {
    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    console.log('Conectado ao banco clinica_odonto com sucesso!');
} catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
}

const croPattern = /^\d{5}$/;
const ufPattern = /^[A-Za-z]{2}$/;
const especialidadesValidas = ['CLÍNICO', 'ORTODÔNTICO'];

function validarDadosDentista({ CPF_Dentista, nome, CRO, croUF, especialidade }) {
    if (!CPF_Dentista || !nome || !CRO || !croUF || !especialidade) {
        return 'Preencha todos os campos obrigatórios';
    }

    if (!croPattern.test(CRO)) {
        return 'CRO inválido. Use exatamente 5 números, ex: 12345.';
    }

    if (!ufPattern.test(croUF)) {
        return 'UF do CRO inválida. Use duas letras, ex: SP.';
    }

    if (!especialidadesValidas.includes(especialidade.toUpperCase())) {
        return 'Especialidade inválida. Escolha CLÍNICO ou ORTODÔNTICO.';
    }

    return null;
}

// ==========================================
// ROTAS DO MÓDULO DE DENTISTAS
// ==========================================

// 1. Rota para CADASTRAR um dentista (CREATE)
app.post('/dentistas', async (req, res) => {
    try {
        const { CPF_Dentista, nome, CRO, croUF, especialidade } = req.body;
        const erroValidacao = validarDadosDentista({ CPF_Dentista, nome, CRO, croUF, especialidade });

        if (erroValidacao) {
            return res.status(400).json({ erro: erroValidacao });
        }

        const croFormatado = CRO;
        const croUFFormatado = croUF.toUpperCase();
        const especialidadeFormatada = especialidade.toUpperCase();

        const query = 'INSERT INTO dentista (CPF_Dentista, nome, CRO, croUF, especialidade) VALUES (?, ?, ?, ?, ?)';
        await db.execute(query, [CPF_Dentista, nome, croFormatado, croUFFormatado, especialidadeFormatada]);

        res.status(201).json({ 
            mensagem: 'Dentista cadastrado com sucesso!',
            CPF_Cadastrado: CPF_Dentista
        });
    } catch (err) {
        console.error('Erro ao cadastrar dentista:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'CPF ou CRO já cadastrados no sistema.' });
        }
        return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados' });
    }
});

// 2. Rota para LISTAR todos os dentistas (READ)
app.get('/dentistas', async (req, res) => {
    try {
        const query = 'SELECT * FROM dentista';
        const [results] = await db.execute(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar dentistas:', err);
        return res.status(500).json({ erro: 'Erro ao consultar o banco de dados' });
    }
});

// 2.1. Rota para BUSCAR um dentista específico por CPF (READ ONE)
app.get('/dentistas/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const query = 'SELECT * FROM dentista WHERE CPF_Dentista = ?';
        const [results] = await db.execute(query, [cpf]);

        if (results.length === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Erro ao buscar dentista:', err);
        return res.status(500).json({ erro: 'Erro interno ao consultar o banco de dados' });
    }
});

// 3. Rota para ATUALIZAR um dentista (UPDATE)
app.put('/dentistas/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome, CRO, croUF, especialidade } = req.body;
        const erroValidacao = validarDadosDentista({ CPF_Dentista: cpf, nome, CRO, croUF, especialidade });

        if (erroValidacao) {
            return res.status(400).json({ erro: erroValidacao });
        }

        const croFormatado = CRO;
        const croUFFormatado = croUF.toUpperCase();
        const especialidadeFormatada = especialidade.toUpperCase();

        const query = 'UPDATE dentista SET nome = ?, CRO = ?, croUF = ?, especialidade = ? WHERE CPF_Dentista = ?';
        const [result] = await db.execute(query, [nome, croFormatado, croUFFormatado, especialidadeFormatada, cpf]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        res.status(200).json({ mensagem: 'Dados do dentista atualizados com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar dentista:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'O novo CRO informado já está cadastrado no sistema.' });
        }
        return res.status(500).json({ erro: 'Erro interno ao atualizar no banco de dados' });
    }
});

// 4. Rota para EXCLUIR um dentista (DELETE)
app.delete('/dentistas/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const query = 'DELETE FROM dentista WHERE CPF_Dentista = ?';
        const [result] = await db.execute(query, [cpf]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
        }

        res.status(200).json({ mensagem: 'Dentista excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir dentista:', err);
        
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                erro: 'Não é possível excluir este dentista, pois ele já possui atendimentos ou procedimentos vinculados no sistema.' 
            });
        }
        
        return res.status(500).json({ erro: 'Erro interno ao excluir no banco de dados' });
    }
});

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
const PORTA = process.env.PORTA || 3001;

app.listen(PORTA, () => {
    console.log(`Servidor de dentistas rodando em http://localhost:${PORTA}`);
});

export default app;
