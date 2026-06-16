import validarCPF from "../../utils/validarCPF.js"
import * as repository from "./paciente.repository.js"

// CREATE
export const cadastrarPaciente = async (dados) => {
  let {
    nome,
    cpf,
    email,
    cep,
    numero,
    bairro,
    logradouro,
    cidade,
    uf,
    telefone,
    dataNascimento,
    data_nascimento,
  } = dados

  if (
    !nome ||
    !cpf ||
    !email ||
    !cep ||
    !numero ||
    !bairro ||
    !logradouro ||
    !cidade ||
    !uf
  ) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  if (!/^\d+$/.test(cpf)) {
    throw new Error("CPF deve conter apenas números.")
  }

  const cpfLimpo = cpf.replace(/\D/g, "")

  if (!validarCPF(cpfLimpo)) {
    throw new Error("CPF inválido.")
  }

  const existente = await repository.buscarPorCPF(cpfLimpo)
  if (existente) {
    throw new Error("Paciente já cadastrado.")
  }

  const resultado = await repository.cadastrarPaciente({
    nome,
    cpf: cpfLimpo,
    email,
    cep,
    numero,
    bairro,
    logradouro,
    cidade,
    uf,
    dataNascimento: dataNascimento || data_nascimento || null,
  })

  // Salvar telefone se fornecido
  if (telefone) {
    await repository.salvarTelefone(cpfLimpo, telefone)
  }

  return resultado
}

// READ - listar ou buscar
export const consultarPaciente = async (busca) => {
  if (!busca || busca.trim() === "") {
    return await repository.listarTodos()
  }

  return await repository.consultarPaciente(busca)
}

// READ por CPF
export const buscarPorCPF = async (cpf) => {
  const paciente = await repository.buscarPorCPF(cpf)

  if (!paciente) {
    throw new Error("Paciente não encontrado.")
  }

  return paciente
}

// UPDATE
export const atualizarPaciente = async (cpfParam, dados) => {
  let {
    nome,
    cpf,
    email,
    cep,
    numero,
    bairro,
    logradouro,
    cidade,
    uf,
    telefone,
    dataNascimento,
    data_nascimento,
  } = dados

  if (
    !nome ||
    !cpf ||
    !email ||
    !cep ||
    !numero ||
    !bairro ||
    !logradouro ||
    !cidade ||
    !uf
  ) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  const paciente = await repository.buscarPorCPF(cpfParam)

  if (!paciente) {
    throw new Error("Paciente não encontrado.")
  }

  if (!/^\d+$/.test(cpf)) {
    throw new Error("CPF deve conter apenas números.")
  }

  const cpfLimpo = cpf.replace(/\D/g, "")

  if (!validarCPF(cpfLimpo)) {
    throw new Error("CPF inválido.")
  }

  const existente = await repository.buscarPorCPF(cpfLimpo)

  if (existente && existente.CPF_Paciente !== cpfParam) {
    throw new Error("CPF já cadastrado para outro paciente.")
  }

  await repository.atualizarPaciente(cpfParam, {
    nome,
    cpf: cpfLimpo,
    email,
    cep,
    numero,
    bairro,
    logradouro,
    cidade,
    uf,
    telefone,
    dataNascimento: dataNascimento || data_nascimento || null,
  })

  return true
}

// DELETE
export const excluirPaciente = async (cpf) => {
  const paciente = await repository.buscarPorCPF(cpf)

  if (!paciente) {
    throw new Error("Paciente não encontrado.")
  }

  // Deletar telefone associado
  await repository.deletarTelefone(cpf)

  return await repository.excluirPaciente(cpf)
}
