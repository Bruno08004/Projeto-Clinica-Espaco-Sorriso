import pagamentoRepository from './pagamento.repository.js'

function validarData(data, nomeCampo) {
  if (!data) {
    throw new Error(`${nomeCampo} e obrigatorio.`)
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error(`${nomeCampo} deve estar no formato YYYY-MM-DD.`)
  }

  const dataValida = new Date(`${data}T00:00:00`)
  if (Number.isNaN(dataValida.getTime())) {
    throw new Error(`${nomeCampo} invalida.`)
  }
}

function validarNumero(valor, nomeCampo, permitirZero = false) {
  if (valor === undefined || valor === null || valor === '') {
    throw new Error(`${nomeCampo} e obrigatorio.`)
  }

  const numero = Number(valor)
  if (Number.isNaN(numero) || numero < 0 || (!permitirZero && numero === 0)) {
    throw new Error(`${nomeCampo} invalido.`)
  }

  return numero
}

function normalizarFormaPagamento(valor) {
  if (!valor) {
    throw new Error('Forma de pagamento e obrigatoria.')
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

  throw new Error('Forma de pagamento invalida. Use CRÉDITO, DÉBITO, PIX ou DINHEIRO.')
}

function normalizarDados(dados) {
  const dataRecebimento = dados.dataRecebimento || dados.data_recebimento
  validarData(dataRecebimento, 'dataRecebimento')

  const valorBruto = validarNumero(dados.valorBruto ?? dados.valor_bruto, 'valorBruto')
  const taxaCartao = Number(dados.taxaCartao ?? dados.taxa_cartao ?? 0)
  if (Number.isNaN(taxaCartao) || taxaCartao < 0) {
    throw new Error('taxaCartao invalida.')
  }

  let valorLiquido
  if (dados.valorLiquido !== undefined && dados.valorLiquido !== '') {
    valorLiquido = Number(dados.valorLiquido ?? dados.valor_liquido)
    if (Number.isNaN(valorLiquido) || valorLiquido < 0) {
      throw new Error('valorLiquido invalido.')
    }
  } else {
    valorLiquido = Number((valorBruto - taxaCartao).toFixed(2))
  }

  if (valorLiquido < 0) {
    throw new Error('valorLiquido nao pode ser negativo.')
  }

  const fk_dAtendimento = validarNumero(
    dados.fk_dAtendimento ?? dados.idAtendimento ?? dados.id_atendimento,
    'fk_dAtendimento',
    false,
  )
  const formaPagamento = normalizarFormaPagamento(dados.formaPagamento ?? dados.forma_pagamento)

  return {
    dataRecebimento,
    valorBruto,
    taxaCartao,
    valorLiquido,
    formaPagamento,
    fk_dAtendimento,
  }
}

function normalizarFiltros(filtros = {}) {
  const resultado = {}

  if (filtros.dataInicio) {
    validarData(filtros.dataInicio, 'dataInicio')
    resultado.dataInicio = filtros.dataInicio
  }

  if (filtros.dataFim) {
    validarData(filtros.dataFim, 'dataFim')
    resultado.dataFim = filtros.dataFim
  }

  if (filtros.formaPagamento) {
    resultado.formaPagamento = normalizarFormaPagamento(filtros.formaPagamento)
  }

  if (filtros.fk_dAtendimento) {
    resultado.fk_dAtendimento = Number(filtros.fk_dAtendimento)
    if (Number.isNaN(resultado.fk_dAtendimento) || resultado.fk_dAtendimento < 1) {
      throw new Error('fk_dAtendimento invalido.')
    }
  }

  return resultado
}

const pagamentoService = {
  cadastrarPagamento: async (dados) => {
    const pagamento = normalizarDados(dados)
    await pagamentoRepository.validarAtendimentoExiste(pagamento.fk_dAtendimento)
    const id = await pagamentoRepository.cadastrar(pagamento)
    return { mensagem: 'Pagamento cadastrado com sucesso.', id }
  },

  listarPagamentos: async (filtros) => {
    return await pagamentoRepository.listar(normalizarFiltros(filtros))
  },

  listarPorAtendimento: async (idAtendimento) => {
    const id = validarNumero(idAtendimento, 'idAtendimento')
    await pagamentoRepository.validarAtendimentoExiste(id)
    return await pagamentoRepository.listarPorAtendimento(id)
  },

  buscarPagamento: async (idPagamento) => {
    const id = validarNumero(idPagamento, 'idPagamento')
    const pagamento = await pagamentoRepository.buscarPorId(id)

    if (!pagamento) {
      throw new Error('Pagamento nao encontrado.')
    }

    return pagamento
  },

  atualizarPagamento: async (idPagamento, dados) => {
    const id = validarNumero(idPagamento, 'idPagamento')
    const pagamento = normalizarDados(dados)
    await pagamentoRepository.validarAtendimentoExiste(pagamento.fk_dAtendimento)
    const atualizado = await pagamentoRepository.atualizar(id, pagamento)

    if (!atualizado) {
      throw new Error('Pagamento nao encontrado.')
    }

    return { mensagem: 'Pagamento atualizado com sucesso.' }
  },

  excluirPagamento: async (idPagamento) => {
    const id = validarNumero(idPagamento, 'idPagamento')
    const excluido = await pagamentoRepository.excluir(id)

    if (!excluido) {
      throw new Error('Pagamento nao encontrado.')
    }

    return { mensagem: 'Pagamento excluido com sucesso.' }
  },
}

export default pagamentoService
