import { connection } from '../../config/database.js'

function normalizarFormaPagamento(valor) {
  if (!valor) {
    return undefined
  }

  const texto = String(valor)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  if (texto.startsWith('CREDITO')) {
    return 'CRÉDITO'
  }

  if (texto.startsWith('DEBITO')) {
    return 'DÉBITO'
  }

  if (texto === 'PIX') {
    return 'PIX'
  }

  if (texto === 'DINHEIRO') {
    return 'DINHEIRO'
  }

  return undefined
}

const pagamentoRepository = {
  validarAtendimentoExiste: async (idAtendimento) => {
    const [rows] = await connection.execute(
      'SELECT idAtendimento FROM atendimento WHERE idAtendimento = ?',
      [idAtendimento],
    )

    if (rows.length === 0) {
      throw new Error('Atendimento nao encontrado.')
    }

    return true
  },

  cadastrar: async (pagamento) => {
    const query = `
      INSERT INTO pagamento
        (dataRecebimento, valorBruto, taxaCartao, valorLiquido, formaPagamento, fk_dAtendimento)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const [result] = await connection.execute(query, [
      pagamento.dataRecebimento,
      pagamento.valorBruto,
      pagamento.taxaCartao,
      pagamento.valorLiquido,
      pagamento.formaPagamento,
      pagamento.fk_dAtendimento,
    ])

    return result.insertId
  },

  montarConsulta: (filtros = {}) => {
    let query = `
      SELECT
        p.*,
        a.data AS dataAtendimento,
        a.valorTotal AS atendimentoValorTotal,
        pac.nome AS paciente_nome
      FROM pagamento p
      LEFT JOIN atendimento a ON p.fk_dAtendimento = a.idAtendimento
      LEFT JOIN paciente pac ON a.fk_CPF_Paciente = pac.CPF_Paciente
    `
    const conditions = []
    const params = []

    if (filtros.dataInicio) {
      conditions.push('p.dataRecebimento >= ?')
      params.push(filtros.dataInicio)
    }

    if (filtros.dataFim) {
      conditions.push('p.dataRecebimento <= ?')
      params.push(filtros.dataFim)
    }

    if (filtros.formaPagamento) {
      const forma = normalizarFormaPagamento(filtros.formaPagamento)
      if (forma) {
        conditions.push('p.formaPagamento = ?')
        params.push(forma)
      }
    }

    if (filtros.fk_dAtendimento) {
      conditions.push('p.fk_dAtendimento = ?')
      params.push(filtros.fk_dAtendimento)
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY p.idPagamento DESC'
    return { query, params }
  },

  listar: async (filtros) => {
    const { query, params } = pagamentoRepository.montarConsulta(filtros)
    const [rows] = await connection.execute(query, params)
    return rows
  },

  buscarPorId: async (idPagamento) => {
    const query = `
      SELECT
        p.*,
        a.data AS dataAtendimento,
        a.valorTotal AS atendimentoValorTotal,
        pac.nome AS paciente_nome
      FROM pagamento p
      LEFT JOIN atendimento a ON p.fk_dAtendimento = a.idAtendimento
      LEFT JOIN paciente pac ON a.fk_CPF_Paciente = pac.CPF_Paciente
      WHERE p.idPagamento = ?
    `
    const [rows] = await connection.execute(query, [idPagamento])
    return rows[0]
  },

  listarPorAtendimento: async (idAtendimento) => {
    const query = `
      SELECT
        p.*,
        a.data AS dataAtendimento,
        a.valorTotal AS atendimentoValorTotal,
        pac.nome AS paciente_nome
      FROM pagamento p
      LEFT JOIN atendimento a ON p.fk_dAtendimento = a.idAtendimento
      LEFT JOIN paciente pac ON a.fk_CPF_Paciente = pac.CPF_Paciente
      WHERE p.fk_dAtendimento = ?
      ORDER BY p.idPagamento DESC
    `
    const [rows] = await connection.execute(query, [idAtendimento])
    return rows
  },

  atualizar: async (idPagamento, pagamento) => {
    const query = `
      UPDATE pagamento
      SET dataRecebimento = ?, valorBruto = ?, taxaCartao = ?, valorLiquido = ?, formaPagamento = ?, fk_dAtendimento = ?
      WHERE idPagamento = ?
    `
    const [result] = await connection.execute(query, [
      pagamento.dataRecebimento,
      pagamento.valorBruto,
      pagamento.taxaCartao,
      pagamento.valorLiquido,
      pagamento.formaPagamento,
      pagamento.fk_dAtendimento,
      idPagamento,
    ])
    return result.affectedRows > 0
  },

  excluir: async (idPagamento) => {
    const [result] = await connection.execute(
      'DELETE FROM pagamento WHERE idPagamento = ?',
      [idPagamento],
    )
    return result.affectedRows > 0
  },
}

export default pagamentoRepository
