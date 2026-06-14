import * as repository from "./procedimento.repository.js"

// CREATE
export const cadastrarProcedimento = async (dados) => {
  let { nome, tipoProcedimento, descricao } = dados

  if (!nome || !tipoProcedimento) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  if (nome.trim() === "") {
    throw new Error("Nome do procedimento não pode estar vazio.")
  }

  if (tipoProcedimento.trim() === "") {
    throw new Error("Tipo do procedimento não pode estar vazio.")
  }

  // Verificar se tipo é válido (CLÍNICO ou ORTODÔNTICO)
  const tiposValidos = ['CLÍNICO', 'ORTODÔNTICO']
  if (!tiposValidos.includes(tipoProcedimento.toUpperCase())) {
    throw new Error("Tipo deve ser CLÍNICO ou ORTODÔNTICO.")
  }

  // Verificar se já existe procedimento com esse nome
  const nomeExistente = await repository.verificarNomeDuplicado(nome.trim())
  if (nomeExistente) {
    throw new Error("Procedimento já cadastrado.")
  }

  const resultado = await repository.cadastrarProcedimento({
    nome: nome.trim(),
    tipoProcedimento: tipoProcedimento.toUpperCase(),
    descricao: descricao ? descricao.trim() : null,
  })

  return resultado
}

// READ - listar ou buscar
export const consultarProcedimento = async (busca) => {
  if (!busca || busca.trim() === "") {
    return await repository.listarTodos()
  }

  return await repository.consultarProcedimento(busca.trim())
}

// READ por ID
export const buscarPorId = async (id) => {
  if (!id) {
    throw new Error("ID do procedimento é obrigatório.")
  }

  const procedimento = await repository.buscarPorId(id)

  if (!procedimento) {
    throw new Error("Procedimento não encontrado.")
  }

  return procedimento
}

// UPDATE
export const atualizarProcedimento = async (id, dados) => {
  let { nome, tipoProcedimento, descricao } = dados

  if (!id) {
    throw new Error("ID do procedimento é obrigatório.")
  }

  if (!nome || !tipoProcedimento) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  if (nome.trim() === "") {
    throw new Error("Nome do procedimento não pode estar vazio.")
  }

  if (tipoProcedimento.trim() === "") {
    throw new Error("Tipo do procedimento não pode estar vazio.")
  }

  // Verificar se tipo é válido (CLÍNICO ou ORTODÔNTICO)
  const tiposValidos = ['CLÍNICO', 'ORTODÔNTICO']
  if (!tiposValidos.includes(tipoProcedimento.toUpperCase())) {
    throw new Error("Tipo deve ser CLÍNICO ou ORTODÔNTICO.")
  }

  // Verificar se procedimento existe
  const procedimento = await repository.buscarPorId(id)
  if (!procedimento) {
    throw new Error("Procedimento não encontrado.")
  }

  // Verificar se nome já existe em outro procedimento
  const nomeExistente = await repository.verificarNomeDuplicado(
    nome.trim(),
    id,
  )
  if (nomeExistente) {
    throw new Error("Outro procedimento já utiliza esse nome.")
  }

  await repository.atualizarProcedimento(id, {
    nome: nome.trim(),
    tipoProcedimento: tipoProcedimento.toUpperCase(),
    descricao: descricao ? descricao.trim() : null,
  })

  return true
}

// DELETE
export const excluirProcedimento = async (id) => {
  if (!id) {
    throw new Error("ID do procedimento é obrigatório.")
  }

  // Verificar se procedimento existe
  const procedimento = await repository.buscarPorId(id)
  if (!procedimento) {
    throw new Error("Procedimento não encontrado.")
  }

  // Verificar se procedimento está vinculado a atendimentos
  const estaVinculado = await repository.verificarVinculoAtendimento(id)
  if (estaVinculado) {
    throw new Error(
      "Não é possível excluir um procedimento vinculado a atendimentos.",
    )
  }

  return await repository.excluirProcedimento(id)
}
