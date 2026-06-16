import { connection } from "../../config/database.js"

// CREATE
export const cadastrarProcedimento = async (dados) => {
  const sql = `
    INSERT INTO procedimento 
    (nome, tipoProcedimento, descricao)
    VALUES (?, ?, ?)
  `

  const [result] = await connection.execute(sql, [
    dados.nome,
    dados.tipoProcedimento,
    dados.descricao || null,
  ])

  return result
}

// READ por ID
export const buscarPorId = async (id) => {
  const [rows] = await connection.execute(
    `SELECT
        p.*,
        (
          SELECT ia.valorUnit
          FROM itematendimento ia
          WHERE ia.fk_idProcedimento = p.idProcedimento
          ORDER BY ia.fk_idAtendimento DESC
          LIMIT 1
        ) AS valorPadrao
     FROM procedimento p
     WHERE p.idProcedimento = ?`,
    [id],
  )
  return rows[0]
}

// LISTAR TODOS
export const listarTodos = async () => {
  const [rows] = await connection.execute(
    `SELECT
        p.*,
        (
          SELECT ia.valorUnit
          FROM itematendimento ia
          WHERE ia.fk_idProcedimento = p.idProcedimento
          ORDER BY ia.fk_idAtendimento DESC
          LIMIT 1
        ) AS valorPadrao
     FROM procedimento p
     ORDER BY p.nome ASC`,
  )
  return rows
}

// BUSCA por nome ou tipo
export const consultarProcedimento = async (busca) => {
  const [rows] = await connection.execute(
    `SELECT
        p.*,
        (
          SELECT ia.valorUnit
          FROM itematendimento ia
          WHERE ia.fk_idProcedimento = p.idProcedimento
          ORDER BY ia.fk_idAtendimento DESC
          LIMIT 1
        ) AS valorPadrao
     FROM procedimento p
     WHERE p.nome LIKE ?
        OR p.tipoProcedimento LIKE ?
        OR p.descricao LIKE ?
     ORDER BY p.nome ASC`,
    [`%${busca}%`, `%${busca}%`, `%${busca}%`],
  )
  return rows
}

// UPDATE
export const atualizarProcedimento = async (id, dados) => {
  const sql = `
    UPDATE procedimento 
    SET 
      nome = ?, 
      tipoProcedimento = ?, 
      descricao = ?
    WHERE idProcedimento = ?
  `

  const [result] = await connection.execute(sql, [
    dados.nome,
    dados.tipoProcedimento,
    dados.descricao || null,
    id,
  ])

  return result
}

// DELETE
export const excluirProcedimento = async (id) => {
  const [result] = await connection.execute(
    "DELETE FROM procedimento WHERE idProcedimento = ?",
    [id],
  )
  return result
}

// VERIFICAR se procedimento está vinculado a atendimentos
export const verificarVinculoAtendimento = async (id) => {
  const [rows] = await connection.execute(
    "SELECT COUNT(*) as count FROM itematendimento WHERE fk_idProcedimento = ?",
    [id],
  )
  return rows[0].count > 0
}

// VERIFICAR se procedimento com mesmo nome já existe
export const verificarNomeDuplicado = async (nome, idExcluir = null) => {
  let sql = "SELECT COUNT(*) as count FROM procedimento WHERE nome = ?"
  const params = [nome]

  if (idExcluir) {
    sql += " AND idProcedimento != ?"
    params.push(idExcluir)
  }

  const [rows] = await connection.execute(sql, params)
  return rows[0].count > 0
}
