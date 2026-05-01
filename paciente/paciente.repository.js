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
    `SELECT p.*, t.telefone FROM paciente p 
     LEFT JOIN telefone t ON p.CPF_Paciente = t.CPF_Paciente 
     WHERE p.CPF_Paciente = ?`,
    [cpf]
  );
  return rows[0];
};

// LISTAR TODOS
export const listarTodos = async () => {
  const [rows] = await connection.execute(
    `SELECT p.*, t.telefone FROM paciente p 
     LEFT JOIN telefone t ON p.CPF_Paciente = t.CPF_Paciente`
  );
  return rows;
};

// BUSCA
export const consultarPaciente = async (busca) => {
  const [rows] = await connection.execute(
    `SELECT p.*, t.telefone FROM paciente p 
     LEFT JOIN telefone t ON p.CPF_Paciente = t.CPF_Paciente
     WHERE p.nome LIKE ? 
        OR p.CPF_Paciente LIKE ? 
        OR p.email LIKE ? 
        OR p.cidade LIKE ?`,
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

// SALVAR TELEFONE
export const salvarTelefone = async (cpf, telefone) => {
  if (!telefone) return;

  await connection.execute(
    "DELETE FROM telefone WHERE CPF_Paciente = ?",
    [cpf]
  );

  const [result] = await connection.execute(
    "INSERT INTO telefone (telefone, CPF_Paciente) VALUES (?, ?)",
    [telefone, cpf]
  );
  return result;
};

// DELETAR TELEFONE
export const deletarTelefone = async (cpf) => {
  const [result] = await connection.execute(
    "DELETE FROM telefone WHERE CPF_Paciente = ?",
    [cpf]
  );
  return result;
};
