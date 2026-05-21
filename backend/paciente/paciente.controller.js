import * as service from "./paciente.service.js";

// POST
export const cadastrarPaciente = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ erro: "Body não enviado." });
    }

    await service.cadastrarPaciente(req.body);

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso"
    });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

// GET (listar ou buscar)
export const consultarPaciente = async (req, res) => {
  try {
    const { busca } = req.query;

    const resultado = await service.consultarPaciente(busca);

    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

// GET por CPF
export const buscarPorCPF = async (req, res) => {
  try {
    const { cpf } = req.params;

    const paciente = await service.buscarPorCPF(cpf);

    res.status(200).json(paciente);
  } catch (error) {
    res.status(404).json({ erro: error.message });
  }
};

// PUT
export const atualizarPaciente = async (req, res) => {
  try {
    const { cpf } = req.params;

    await service.atualizarPaciente(cpf, req.body);

    res.status(200).json({
      mensagem: "Dados atualizados com sucesso"
    });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

// DELETE
export const excluirPaciente = async (req, res) => {
  try {
    const { cpf } = req.params;

    await service.excluirPaciente(cpf);

    res.status(200).json({
      mensagem: "Exclusão realizada com sucesso"
    });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};