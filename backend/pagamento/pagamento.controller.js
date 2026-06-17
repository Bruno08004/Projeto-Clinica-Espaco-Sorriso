import pagamentoService from './pagamento.service.js'

function statusPorErro(error) {
  if (!error?.message) {
    return 400
  }

  if (
    error.message.includes('nao encontrado') ||
    error.message.includes('Pagamento nao encontrado') ||
    error.message.includes('Atendimento nao encontrado')
  ) {
    return 404
  }

  return 400
}

const pagamentoController = {
  cadastrar: async (req, res) => {
    try {
      const resultado = await pagamentoService.cadastrarPagamento(req.body)
      res.status(201).json(resultado)
    } catch (error) {
      res.status(statusPorErro(error)).json({ error: error.message, erro: error.message })
    }
  },

  listar: async (req, res) => {
    try {
      const pagamentos = await pagamentoService.listarPagamentos(req.query)
      res.status(200).json(pagamentos)
    } catch (error) {
      res.status(400).json({ error: error.message, erro: error.message })
    }
  },

  listarPorAtendimento: async (req, res) => {
    try {
      const pagamentos = await pagamentoService.listarPorAtendimento(req.params.idAtendimento)
      res.status(200).json(pagamentos)
    } catch (error) {
      res.status(statusPorErro(error)).json({ error: error.message, erro: error.message })
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const pagamento = await pagamentoService.buscarPagamento(req.params.idPagamento)
      res.status(200).json(pagamento)
    } catch (error) {
      res.status(statusPorErro(error)).json({ error: error.message, erro: error.message })
    }
  },

  atualizar: async (req, res) => {
    try {
      const resultado = await pagamentoService.atualizarPagamento(req.params.idPagamento, req.body)
      res.status(200).json(resultado)
    } catch (error) {
      res.status(statusPorErro(error)).json({ error: error.message, erro: error.message })
    }
  },

  excluir: async (req, res) => {
    try {
      const resultado = await pagamentoService.excluirPagamento(req.params.idPagamento)
      res.status(200).json(resultado)
    } catch (error) {
      res.status(statusPorErro(error)).json({ error: error.message, erro: error.message })
    }
  }
}

export default pagamentoController
