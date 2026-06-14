import express from 'express';
import atendimentoController from './atendimento.controller.js'; // Não esqueça do .js no final

const router = express.Router();

router.post('/', atendimentoController.criar);
router.get('/', atendimentoController.listar);
router.get('/:id', atendimentoController.buscarPorId);
router.put('/:id', atendimentoController.atualizar);
router.delete('/:id', atendimentoController.excluir);

export default router;