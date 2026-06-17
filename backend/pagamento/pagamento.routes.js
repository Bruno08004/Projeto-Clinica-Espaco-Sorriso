import express from 'express'
import pagamentoController from './pagamento.controller.js'

const router = express.Router()

router.post('/', pagamentoController.cadastrar)
router.get('/', pagamentoController.listar)
router.get('/atendimento/:idAtendimento', pagamentoController.listarPorAtendimento)
router.get('/:idPagamento', pagamentoController.buscarPorId)
router.put('/:idPagamento', pagamentoController.atualizar)
router.delete('/:idPagamento', pagamentoController.excluir)

export default router
