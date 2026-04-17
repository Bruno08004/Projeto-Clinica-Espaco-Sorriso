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

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
const PORTA = process.env.PORTA || 3000;