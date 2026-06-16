import { connection } from "../../config/database.js";

const valorBaseSql = "((ia.qtd * ia.valorUnit) - COALESCE(ia.descontoItem, 0))";

const percentualComissaoSql = `
    CASE
        WHEN p.tipoProcedimento LIKE 'CL%' THEN 50
        WHEN p.tipoProcedimento LIKE 'ORTOD%' THEN 35
        ELSE 0
    END
`;

const valorComissaoSql = `
    CASE
        WHEN p.tipoProcedimento LIKE 'CL%' THEN ${valorBaseSql} * 0.50
        WHEN p.tipoProcedimento LIKE 'ORTOD%' THEN ${valorBaseSql} * 0.35
        ELSE 0
    END
`;

const valorComissaoPersistidoSql = `
    COALESCE(
        ia.comissaoDentista,
        ${valorComissaoSql}
    )
`;

const percentualComissaoPersistidoSql = `
    CASE
        WHEN ${valorBaseSql} = 0 THEN 0
        WHEN ia.comissaoDentista IS NOT NULL THEN ROUND((ia.comissaoDentista / ${valorBaseSql}) * 100, 2)
        ELSE ${percentualComissaoSql}
    END
`;

function montarFiltros(filtros = {}) {
    const where = [];
    const params = [];

    if (filtros.cpfDentista) {
        where.push("ia.CPF_Dentista = ?");
        params.push(filtros.cpfDentista);
    }

    if (filtros.idAtendimento) {
        where.push("a.idAtendimento = ?");
        params.push(filtros.idAtendimento);
    }

    if (filtros.dataInicio) {
        where.push("a.data >= ?");
        params.push(filtros.dataInicio);
    }

    if (filtros.dataFim) {
        where.push("a.data <= ?");
        params.push(filtros.dataFim);
    }

    if (filtros.tipoProcedimento) {
        where.push("p.tipoProcedimento LIKE ?");
        params.push(`${filtros.tipoProcedimento}%`);
    }

    return {
        clausula: where.length ? `WHERE ${where.join(" AND ")}` : "",
        params,
    };
}

const comissaoRepository = {
    buscarDentistaPorCPF: async (cpfDentista) => {
        const [rows] = await connection.execute(
            "SELECT CPF_Dentista, nome FROM dentista WHERE CPF_Dentista = ?",
            [cpfDentista],
        );

        return rows[0];
    },

    listar: async (filtros) => {
        const { clausula, params } = montarFiltros(filtros);

        const query = `
            SELECT
                a.idAtendimento,
                a.idAtendimento AS fk_idAtendimento,
                DATE_FORMAT(a.data, '%Y-%m-%d') AS data,
                ia.CPF_Dentista,
                d.nome AS nomeDentista,
                p.idProcedimento,
                p.idProcedimento AS fk_idProcedimento,
                p.nome AS nomeProcedimento,
                p.tipoProcedimento,
                ia.qtd,
                ia.valorUnit,
                COALESCE(ia.descontoItem, 0) AS descontoItem,
                ROUND(${valorBaseSql}, 2) AS valorBase,
                ${percentualComissaoPersistidoSql} AS percentualComissao,
                ROUND(${valorComissaoPersistidoSql}, 2) AS valorComissao,
                ia.comissaoDentista
            FROM itematendimento ia
            INNER JOIN atendimento a ON ia.fk_idAtendimento = a.idAtendimento
            INNER JOIN dentista d ON ia.CPF_Dentista = d.CPF_Dentista
            INNER JOIN procedimento p ON ia.fk_idProcedimento = p.idProcedimento
            ${clausula}
            ORDER BY a.data DESC, a.idAtendimento DESC, p.nome ASC
        `;

        const [rows] = await connection.execute(query, params);
        return rows;
    },

    buscarAtendimentoPorId: async (idAtendimento) => {
        const [rows] = await connection.execute(
            "SELECT idAtendimento FROM atendimento WHERE idAtendimento = ?",
            [idAtendimento],
        );

        return rows[0];
    },

    buscarProcedimentoPorId: async (idProcedimento) => {
        const [rows] = await connection.execute(
            "SELECT idProcedimento, tipoProcedimento FROM procedimento WHERE idProcedimento = ?",
            [idProcedimento],
        );

        return rows[0];
    },

    buscarItem: async (idAtendimento, idProcedimento) => {
        const [rows] = await connection.execute(
            `SELECT *
             FROM itematendimento
             WHERE fk_idAtendimento = ? AND fk_idProcedimento = ?`,
            [idAtendimento, idProcedimento],
        );

        return rows[0];
    },

    cadastrar: async (dados) => {
        const query = `
            INSERT INTO itematendimento
                (qtd, valorUnit, descontoItem, comissaoDentista, CPF_Dentista, fk_idProcedimento, fk_idAtendimento)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(query, [
            dados.qtd,
            dados.valorUnit,
            dados.descontoItem,
            dados.comissaoDentista,
            dados.CPF_Dentista,
            dados.fk_idProcedimento,
            dados.fk_idAtendimento,
        ]);

        return result;
    },

    atualizar: async (idAtendimento, idProcedimento, dados) => {
        const query = `
            UPDATE itematendimento
            SET
                qtd = ?,
                valorUnit = ?,
                descontoItem = ?,
                comissaoDentista = ?,
                CPF_Dentista = ?
            WHERE fk_idAtendimento = ? AND fk_idProcedimento = ?
        `;

        const [result] = await connection.execute(query, [
            dados.qtd,
            dados.valorUnit,
            dados.descontoItem,
            dados.comissaoDentista,
            dados.CPF_Dentista,
            idAtendimento,
            idProcedimento,
        ]);

        return result;
    },

    excluir: async (idAtendimento, idProcedimento) => {
        const [result] = await connection.execute(
            `UPDATE itematendimento
             SET comissaoDentista = 0
             WHERE fk_idAtendimento = ? AND fk_idProcedimento = ?`,
            [idAtendimento, idProcedimento],
        );

        return result;
    },

    resumo: async (filtros) => {
        const { clausula, params } = montarFiltros(filtros);

        const query = `
            SELECT
                d.CPF_Dentista,
                d.nome,
                COUNT(DISTINCT a.idAtendimento) AS totalAtendimentos,
                COUNT(*) AS totalProcedimentos,
                ROUND(SUM(${valorComissaoPersistidoSql}), 2) AS totalComissao
            FROM itematendimento ia
            INNER JOIN atendimento a ON ia.fk_idAtendimento = a.idAtendimento
            INNER JOIN dentista d ON ia.CPF_Dentista = d.CPF_Dentista
            INNER JOIN procedimento p ON ia.fk_idProcedimento = p.idProcedimento
            ${clausula}
            GROUP BY d.CPF_Dentista, d.nome
            ORDER BY d.nome ASC
        `;

        const [rows] = await connection.execute(query, params);
        return rows;
    },

    recalcular: async () => {
        const query = `
            UPDATE itematendimento ia
            INNER JOIN procedimento p ON ia.fk_idProcedimento = p.idProcedimento
            SET ia.comissaoDentista =
                CASE
                    WHEN p.tipoProcedimento LIKE 'CL%' THEN ROUND(((ia.qtd * ia.valorUnit) - COALESCE(ia.descontoItem, 0)) * 0.50, 2)
                    WHEN p.tipoProcedimento LIKE 'ORTOD%' THEN ROUND(((ia.qtd * ia.valorUnit) - COALESCE(ia.descontoItem, 0)) * 0.35, 2)
                    ELSE ia.comissaoDentista
                END
        `;

        const [result] = await connection.execute(query);
        return result;
    },
};

export default comissaoRepository;
