import { connection } from "../config/database.js";

// CREATE
export const cadastrarPaciente = async (dados) => {
  const sql = `
    INSERT INTO paciente 
    (CPF_Paciente, email, nome, CEP, numero, bairro, logradouro, cidade, UF)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [
    dados.cpf,
    dados.email,
    dados.nome,
    dados.cep,
    dados.numero,
    dados.bairro,
    dados.logradouro,
    dados.cidade,
    dados.uf
  ]);

  return result;
};

// READ por CPF
export const buscarPorCPF = async (cpf) => {
  const [rows] = await connection.execute(
    "SELECT * FROM paciente WHERE CPF_Paciente = ?",
    [cpf]
  );
  return rows[0];
};

// LISTAR TODOS
export const listarTodos = async () => {
  const [rows] = await connection.execute(
    "SELECT * FROM paciente"
  );
  return rows;
};

// BUSCA
export const consultarPaciente = async (busca) => {
  const [rows] = await connection.execute(
    `SELECT * FROM paciente 
     WHERE nome LIKE ? 
        OR CPF_Paciente LIKE ? 
        OR email LIKE ? 
        OR cidade LIKE ?`,
    [`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`]
  );
  return rows;
};

// UPDATE
export const atualizarPaciente = async (cpfParam, dados) => {
  const sql = `
    UPDATE paciente 
    SET 
      CPF_Paciente = ?, 
      email = ?, 
      nome = ?, 
      CEP = ?, 
      numero = ?, 
      bairro = ?, 
      logradouro = ?, 
      cidade = ?, 
      UF = ?
    WHERE CPF_Paciente = ?
  `;

  const [result] = await connection.execute(sql, [
    dados.cpf,
    dados.email,
    dados.nome,
    dados.cep,
    dados.numero,
    dados.bairro,
    dados.logradouro,
    dados.cidade,
    dados.uf,
    cpfParam
  ]);

  return result;
};

// DELETE
export const excluirPaciente = async (cpf) => {
  const [result] = await connection.execute(
    "DELETE FROM paciente WHERE CPF_Paciente = ?",
    [cpf]
  );
  return result;
};