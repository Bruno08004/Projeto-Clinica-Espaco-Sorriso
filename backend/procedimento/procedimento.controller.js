import * as service from "./procedimento.service.js"

// POST
export const cadastrarProcedimento = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ erro: "Body não enviado." })
    }

    await service.cadastrarProcedimento(req.body)

    res.status(201).json({
      mensagem: "Procedimento cadastrado com sucesso",
    })
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}

// GET (listar ou buscar)
export const consultarProcedimento = async (req, res) => {
  try {
    const { busca } = req.query

    const resultado = await service.consultarProcedimento(busca)

    res.status(200).json(resultado)
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}

// GET por ID
export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params

    const procedimento = await service.buscarPorId(id)

    res.status(200).json(procedimento)
  } catch (error) {
    res.status(404).json({ erro: error.message })
  }
}

// PUT
export const atualizarProcedimento = async (req, res) => {
  try {
    const { id } = req.params

    await service.atualizarProcedimento(id, req.body)

    res.status(200).json({
      mensagem: "Procedimento atualizado com sucesso",
    })
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}

// DELETE
export const excluirProcedimento = async (req, res) => {
  try {
    const { id } = req.params

    await service.excluirProcedimento(id)

    res.status(200).json({
      mensagem: "Procedimento excluído com sucesso",
    })
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}
