import express from 'express';
import { connection } from '../../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.execute(
      'SELECT CPF_Secretaria, nome FROM secretaria ORDER BY nome'
    );
    res.status(200).json(rows);
  } catch (erro) {
    console.error('Erro ao buscar secretarias:', erro);
    res.status(500).json({ erro: 'Erro ao consultar secretarias.' });
  }
});

export default router;
