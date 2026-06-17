import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Dentista] ${req.method} ${req.originalUrl} - params=${JSON.stringify(req.params)} query=${JSON.stringify(req.query)} body=${JSON.stringify(req.body)}`);
  next();
});

let db;

try {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log('Conectado ao banco clinica_odonto (dentistas) com sucesso!');
} catch (err) {
  console.error('Erro ao conectar ao banco de dados de dentistas:', err);
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

async function rollbackQuietly() {
  try {
    await db.rollback();
  } catch {
    // Ignora rollback sem transação ativa.
  }
}

router.post('/', async (req, res) => {
  try {
    const { CPF_Dentista, nome, CRO, croUF, especialidade, telefone } = req.body;
    const erroValidacao = validarDadosDentista({ CPF_Dentista, nome, CRO, croUF, especialidade });

    if (erroValidacao) {
      return res.status(400).json({ erro: erroValidacao });
    }

    const croFormatado = CRO;
    const croUFFormatado = croUF.toUpperCase();
    const especialidadeFormatada = especialidade.toUpperCase();

    await db.beginTransaction();

    const query = 'INSERT INTO dentista (CPF_Dentista, nome, CRO, croUF, especialidade) VALUES (?, ?, ?, ?, ?)';
    await db.execute(query, [CPF_Dentista, nome, croFormatado, croUFFormatado, especialidadeFormatada]);

    if (telefone) {
      await db.execute('INSERT INTO telefone_dentista (telefone, CPF_Dentista) VALUES (?, ?)', [telefone, CPF_Dentista]);
    }

    await db.commit();

    res.status(201).json({
      mensagem: 'Dentista cadastrado com sucesso!',
      CPF_Cadastrado: CPF_Dentista,
    });
  } catch (err) {
    await rollbackQuietly();
    console.error('Erro ao cadastrar dentista:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'CPF ou CRO já cadastrados no sistema.' });
    }
    return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados' });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT d.*, t.telefone
      FROM dentista d
      LEFT JOIN telefone_dentista t ON d.CPF_Dentista = t.CPF_Dentista
    `;
    const [results] = await db.execute(query);
    res.status(200).json(results);
  } catch (err) {
    console.error('Erro ao buscar dentistas:', err);
    return res.status(500).json({ erro: 'Erro ao consultar o banco de dados' });
  }
});

router.get('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const query = `
      SELECT d.*, t.telefone
      FROM dentista d
      LEFT JOIN telefone_dentista t ON d.CPF_Dentista = t.CPF_Dentista
      WHERE d.CPF_Dentista = ?
    `;
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

router.put('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const { nome, CRO, croUF, especialidade, telefone } = req.body;
    const erroValidacao = validarDadosDentista({ CPF_Dentista: cpf, nome, CRO, croUF, especialidade });

    if (erroValidacao) {
      return res.status(400).json({ erro: erroValidacao });
    }

    const croFormatado = CRO;
    const croUFFormatado = croUF.toUpperCase();
    const especialidadeFormatada = especialidade.toUpperCase();

    await db.beginTransaction();

    const query = 'UPDATE dentista SET nome = ?, CRO = ?, croUF = ?, especialidade = ? WHERE CPF_Dentista = ?';
    const [result] = await db.execute(query, [nome, croFormatado, croUFFormatado, especialidadeFormatada, cpf]);

    if (result.affectedRows === 0) {
      await rollbackQuietly();
      return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
    }

    await db.execute('DELETE FROM telefone_dentista WHERE CPF_Dentista = ?', [cpf]);

    if (telefone) {
      await db.execute('INSERT INTO telefone_dentista (telefone, CPF_Dentista) VALUES (?, ?)', [telefone, cpf]);
    }

    await db.commit();

    res.status(200).json({ mensagem: 'Dados do dentista atualizados com sucesso!' });
  } catch (err) {
    await rollbackQuietly();
    console.error('Erro ao atualizar dentista:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'O novo CRO informado já está cadastrado no sistema.' });
    }
    return res.status(500).json({ erro: 'Erro interno ao atualizar no banco de dados' });
  }
});

router.delete('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    await db.beginTransaction();

    await db.execute('DELETE FROM telefone_dentista WHERE CPF_Dentista = ?', [cpf]);

    const query = 'DELETE FROM dentista WHERE CPF_Dentista = ?';
    const [result] = await db.execute(query, [cpf]);

    if (result.affectedRows === 0) {
      await rollbackQuietly();
      return res.status(404).json({ erro: 'Dentista não encontrado com o CPF informado.' });
    }

    await db.commit();

    res.status(200).json({ mensagem: 'Dentista excluído com sucesso!' });
  } catch (err) {
    await rollbackQuietly();
    console.error('Erro ao excluir dentista:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        erro: 'Não é possível excluir este dentista, pois ele já possui atendimentos ou procedimentos vinculados no sistema.',
      });
    }

    return res.status(500).json({ erro: 'Erro interno ao excluir no banco de dados' });
  }
});

export default router;
