import comissaoRepository from "./comissao.repository.js"

function validarData(data, nomeCampo) {
  if (!data) return

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error(`${nomeCampo} deve estar no formato YYYY-MM-DD.`)
  }

  const dataValida = new Date(`${data}T00:00:00`)

  if (Number.isNaN(dataValida.getTime())) {
    throw new Error(`${nomeCampo} invalida.`)
  }

  const dataNormalizada = dataValida.toISOString().slice(0, 10)

  if (dataNormalizada !== data) {
    throw new Error(`${nomeCampo} invalida.`)
  }
}

function normalizarCPF(cpfDentista) {
  return cpfDentista ? String(cpfDentista).replace(/\D/g, "") : undefined
}

function normalizarTipoParaRegra(tipoProcedimento) {
  return String(tipoProcedimento || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
}

function normalizarTipo(tipoProcedimento) {
  if (!tipoProcedimento) return undefined

  const tipoNormalizado = normalizarTipoParaRegra(tipoProcedimento)

  if (tipoNormalizado.startsWith("CL")) {
    return "CL"
  }

  if (tipoNormalizado.startsWith("ORTOD")) {
    return "ORTOD"
  }

  throw new Error("Tipo de procedimento deve ser CLINICO ou ORTODONTICO.")
}

function numeroObrigatorio(valor, nomeCampo) {
  if (valor === undefined || valor === null || valor === "") {
    throw new Error("Preencha todos os campos obrigatorios.")
  }

  const numero = Number(valor)

  if (Number.isNaN(numero) || numero < 0) {
    throw new Error(`${nomeCampo} invalido.`)
  }

  return numero
}

function inteiroObrigatorio(valor, nomeCampo) {
  const numero = numeroObrigatorio(valor, nomeCampo)

  if (!Number.isInteger(numero) || numero < 1) {
    throw new Error(`${nomeCampo} invalido.`)
  }

  return numero
}

function calcularPercentualPadrao(tipoProcedimento) {
  const tipoNormalizado = normalizarTipoParaRegra(tipoProcedimento)

  if (tipoNormalizado.startsWith("CL")) {
    return 50
  }

  if (tipoNormalizado.startsWith("ORTOD")) {
    return 35
  }

  return 0
}

function normalizarDadosComissao(dados, procedimento) {
  const qtd = inteiroObrigatorio(dados.qtd, "Quantidade")
  const valorUnit = numeroObrigatorio(dados.valorUnit, "Valor unitario")
  const descontoItem =
    dados.descontoItem === undefined || dados.descontoItem === ""
      ? 0
      : numeroObrigatorio(dados.descontoItem, "Desconto")
  const valorBase = qtd * valorUnit - descontoItem

  if (valorBase < 0) {
    throw new Error("Desconto nao pode ser maior que o valor do item.")
  }

  let percentualComissao = dados.percentualComissao
  let comissaoDentista = dados.comissaoDentista

  if (percentualComissao !== undefined && percentualComissao !== "") {
    percentualComissao = numeroObrigatorio(percentualComissao, "Percentual")

    if (percentualComissao > 100) {
      throw new Error("Percentual invalido.")
    }

    comissaoDentista = Number(
      ((valorBase * percentualComissao) / 100).toFixed(2),
    )
  } else if (comissaoDentista !== undefined && comissaoDentista !== "") {
    comissaoDentista = numeroObrigatorio(comissaoDentista, "Comissao")
  } else {
    percentualComissao = calcularPercentualPadrao(procedimento.tipoProcedimento)
    comissaoDentista = Number(
      ((valorBase * percentualComissao) / 100).toFixed(2),
    )
  }

  return {
    fk_idAtendimento: inteiroObrigatorio(dados.fk_idAtendimento, "Atendimento"),
    fk_idProcedimento: inteiroObrigatorio(
      dados.fk_idProcedimento,
      "Procedimento",
    ),
    CPF_Dentista: normalizarCPF(dados.CPF_Dentista || dados.cpfDentista),
    qtd,
    valorUnit,
    descontoItem,
    comissaoDentista,
  }
}

function normalizarFiltros(filtros = {}) {
  validarData(filtros.dataInicio, "dataInicio")
  validarData(filtros.dataFim, "dataFim")

  if (
    filtros.dataInicio &&
    filtros.dataFim &&
    filtros.dataInicio > filtros.dataFim
  ) {
    throw new Error("dataInicio nao pode ser maior que dataFim.")
  }

  return {
    cpfDentista: normalizarCPF(filtros.cpfDentista),
    dataInicio: filtros.dataInicio,
    dataFim: filtros.dataFim,
    tipoProcedimento: normalizarTipo(filtros.tipoProcedimento),
  }
}

async function garantirDentistaExiste(cpfDentista) {
  const cpfLimpo = normalizarCPF(cpfDentista)

  if (!cpfLimpo) {
    throw new Error("CPF do dentista e obrigatorio.")
  }

  const dentista = await comissaoRepository.buscarDentistaPorCPF(cpfLimpo)

  if (!dentista) {
    throw new Error("Dentista nao encontrado.")
  }

  return dentista
}

async function validarVinculos(dados) {
  const atendimento = await comissaoRepository.buscarAtendimentoPorId(
    dados.fk_idAtendimento,
  )
  if (!atendimento) {
    throw new Error("Atendimento nao encontrado.")
  }

  const procedimento = await comissaoRepository.buscarProcedimentoPorId(
    dados.fk_idProcedimento,
  )
  if (!procedimento) {
    throw new Error("Procedimento nao encontrado.")
  }

  if (!dados.CPF_Dentista) {
    throw new Error("CPF do dentista e obrigatorio.")
  }

  await garantirDentistaExiste(dados.CPF_Dentista)

  return procedimento
}

const comissaoService = {
  cadastrarComissao: async (dados) => {
    const ids = {
      fk_idAtendimento: dados.fk_idAtendimento,
      fk_idProcedimento: dados.fk_idProcedimento,
      CPF_Dentista: dados.CPF_Dentista || dados.cpfDentista,
    }
    const procedimento = await validarVinculos(ids)
    const comissao = normalizarDadosComissao(dados, procedimento)

    const existente = await comissaoRepository.buscarItem(
      comissao.fk_idAtendimento,
      comissao.fk_idProcedimento,
    )

    if (!existente) {
      throw new Error(
        "Procedimento nao vinculado ao atendimento.",
      )
    }

    await comissaoRepository.atualizar(
      comissao.fk_idAtendimento,
      comissao.fk_idProcedimento,
      comissao,
    )
    return { mensagem: "Comissao cadastrada com sucesso." }
  },

  listarComissoes: async (filtros) => {
    return await comissaoRepository.listar(normalizarFiltros(filtros))
  },

  listarPorDentista: async (cpfDentista, filtros = {}) => {
    const dentista = await garantirDentistaExiste(cpfDentista)
    return await comissaoRepository.listar(
      normalizarFiltros({ ...filtros, cpfDentista: dentista.CPF_Dentista }),
    )
  },

  listarPorAtendimento: async (idAtendimento) => {
    inteiroObrigatorio(idAtendimento, "Atendimento")
    return await comissaoRepository.listar({ idAtendimento })
  },

  resumo: async (filtros) => {
    return await comissaoRepository.resumo(normalizarFiltros(filtros))
  },

  resumoPorDentista: async (cpfDentista, filtros = {}) => {
    const dentista = await garantirDentistaExiste(cpfDentista)
    const resultado = await comissaoRepository.resumo(
      normalizarFiltros({ ...filtros, cpfDentista: dentista.CPF_Dentista }),
    )

    return (
      resultado[0] || {
        CPF_Dentista: dentista.CPF_Dentista,
        nome: dentista.nome,
        totalAtendimentos: 0,
        totalProcedimentos: 0,
        totalComissao: 0,
      }
    )
  },

  atualizarComissao: async (idAtendimento, idProcedimento, dados) => {
    const existente = await comissaoRepository.buscarItem(
      idAtendimento,
      idProcedimento,
    )

    if (!existente) {
      throw new Error("Comissao nao encontrada.")
    }

    const dadosComIds = {
      ...dados,
      fk_idAtendimento: idAtendimento,
      fk_idProcedimento: idProcedimento,
    }
    const procedimento = await validarVinculos({
      fk_idAtendimento: idAtendimento,
      fk_idProcedimento: idProcedimento,
      CPF_Dentista: dadosComIds.CPF_Dentista || dadosComIds.cpfDentista,
    })
    const comissao = normalizarDadosComissao(dadosComIds, procedimento)

    await comissaoRepository.atualizar(idAtendimento, idProcedimento, comissao)
    return { mensagem: "Comissao atualizada com sucesso." }
  },

  excluirComissao: async (idAtendimento, idProcedimento) => {
    const existente = await comissaoRepository.buscarItem(
      idAtendimento,
      idProcedimento,
    )

    if (!existente) {
      throw new Error("Comissao nao encontrada.")
    }

    await comissaoRepository.excluir(idAtendimento, idProcedimento)
    return { mensagem: "Comissao excluida com sucesso." }
  },

  recalcular: async () => {
    const result = await comissaoRepository.recalcular()

    return {
      mensagem: "Comissoes recalculadas com sucesso.",
      registrosAtualizados: result.affectedRows,
    }
  },
}

export default comissaoService
