import { connection } from '../../config/database.js';

function normalizarAtendimento(dados) {
    return {
        observacao: dados.observacao ?? dados.observacoes ?? null,
        data: dados.data ?? dados.data_atendimento?.slice(0, 10),
        valorTotal: dados.valorTotal ?? dados.valor_total,
        tipoAtendimento: dados.tipoAtendimento ?? dados.tipo_atendimento,
        parcelas: dados.parcelas ?? null,
        fk_CPF_Paciente: dados.fk_CPF_Paciente ?? dados.CPF_Paciente ?? dados.cpf_paciente,
        fk_CPF_Secretaria: dados.fk_CPF_Secretaria ?? dados.CPF_Secretaria ?? dados.cpf_secretaria
    };
}

function normalizarItemAtendimento(dados, idAtendimento, valorTotal) {
    const origem = dados.item ?? dados;
    const fk_idProcedimento = origem.fk_idProcedimento ?? origem.idProcedimento ?? origem.id_procedimento;
    const CPF_Dentista = origem.CPF_Dentista ?? origem.cpf_dentista ?? origem.id_dentista;

    if (!fk_idProcedimento && !CPF_Dentista) {
        return null;
    }

    return {
        qtd: origem.qtd ?? origem.quantidade ?? 1,
        valorUnit: origem.valorUnit ?? origem.valor_unitario ?? valorTotal,
        descontoItem: origem.descontoItem ?? origem.desconto_item ?? 0,
        comissaoDentista: origem.comissaoDentista ?? origem.comissao_dentista ?? null,
        CPF_Dentista,
        fk_idProcedimento,
        fk_idAtendimento: idAtendimento
    };
}

function normalizarItensAtendimento(dados, idAtendimento, valorTotal) {
    const origens = Array.isArray(dados.itens)
        ? dados.itens
        : [dados.item ?? dados];

    return origens
        .map((origem) => normalizarItemAtendimento(origem, idAtendimento, valorTotal))
        .filter(Boolean);
}

async function preencherComissaoAutomatica(conn, item) {
    if (item.comissaoDentista !== null && item.comissaoDentista !== undefined && item.comissaoDentista !== '') {
        return item;
    }

    const [rows] = await conn.execute(
        'SELECT tipoProcedimento FROM procedimento WHERE idProcedimento = ?',
        [item.fk_idProcedimento]
    );
    const tipoProcedimento = rows[0]?.tipoProcedimento;
    const tipoNormalizado = String(tipoProcedimento || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
    const valorBase = (Number(item.qtd) * Number(item.valorUnit)) - Number(item.descontoItem || 0);

    if (tipoNormalizado.startsWith('CL')) {
        item.comissaoDentista = Number((valorBase * 0.50).toFixed(2));
    } else if (tipoNormalizado.startsWith('ORTOD')) {
        item.comissaoDentista = Number((valorBase * 0.35).toFixed(2));
    } else {
        item.comissaoDentista = 0;
    }

    return item;
}

const atendimentoRepository = {
    criar: async (dados) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const atendimento = normalizarAtendimento(dados);
            const query = `
                INSERT INTO atendimento
                    (observacao, data, valorTotal, tipoAtendimento, parcelas, fk_CPF_Paciente, fk_CPF_Secretaria)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await conn.execute(query, [
                atendimento.observacao,
                atendimento.data,
                atendimento.valorTotal,
                atendimento.tipoAtendimento,
                atendimento.parcelas,
                atendimento.fk_CPF_Paciente,
                atendimento.fk_CPF_Secretaria
            ]);

            const itens = normalizarItensAtendimento(dados, result.insertId, atendimento.valorTotal);

            for (const item of itens) {
                await preencherComissaoAutomatica(conn, item);

                const itemQuery = `
                    INSERT INTO itematendimento
                        (qtd, valorUnit, descontoItem, comissaoDentista, CPF_Dentista, fk_idProcedimento, fk_idAtendimento)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await conn.execute(itemQuery, [
                    item.qtd,
                    item.valorUnit,
                    item.descontoItem,
                    item.comissaoDentista,
                    item.CPF_Dentista,
                    item.fk_idProcedimento,
                    item.fk_idAtendimento
                ]);
            }

            await conn.commit();
            return result.insertId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    buscarTodos: async () => {
        const query = `
            SELECT
                a.*,
                pac.nome AS paciente_nome,
                sec.nome AS secretaria_nome,
                ia.qtd,
                ia.valorUnit,
                ia.descontoItem,
                ia.comissaoDentista,
                ia.CPF_Dentista,
                dent.nome AS dentista_nome,
                proc.idProcedimento,
                proc.nome AS procedimento_nome,
                proc.tipoProcedimento
            FROM atendimento a
            LEFT JOIN paciente pac ON a.fk_CPF_Paciente = pac.CPF_Paciente
            LEFT JOIN secretaria sec ON a.fk_CPF_Secretaria = sec.CPF_Secretaria
            LEFT JOIN itematendimento ia ON a.idAtendimento = ia.fk_idAtendimento
            LEFT JOIN dentista dent ON ia.CPF_Dentista = dent.CPF_Dentista
            LEFT JOIN procedimento proc ON ia.fk_idProcedimento = proc.idProcedimento
        `;
        const [rows] = await connection.execute(query);
        return rows;
    },

    buscarPorId: async (id) => {
        const query = `
            SELECT
                a.*,
                pac.nome AS paciente_nome,
                sec.nome AS secretaria_nome,
                ia.qtd,
                ia.valorUnit,
                ia.descontoItem,
                ia.comissaoDentista,
                ia.CPF_Dentista,
                dent.nome AS dentista_nome,
                proc.idProcedimento,
                proc.nome AS procedimento_nome,
                proc.tipoProcedimento
            FROM atendimento a
            LEFT JOIN paciente pac ON a.fk_CPF_Paciente = pac.CPF_Paciente
            LEFT JOIN secretaria sec ON a.fk_CPF_Secretaria = sec.CPF_Secretaria
            LEFT JOIN itematendimento ia ON a.idAtendimento = ia.fk_idAtendimento
            LEFT JOIN dentista dent ON ia.CPF_Dentista = dent.CPF_Dentista
            LEFT JOIN procedimento proc ON ia.fk_idProcedimento = proc.idProcedimento
            WHERE a.idAtendimento = ?
        `;
        const [rows] = await connection.execute(query, [id]);
        return rows;
    },

    atualizar: async (id, dados) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const atendimento = normalizarAtendimento(dados);
            const query = `
                UPDATE atendimento
                SET observacao = ?, data = ?, valorTotal = ?, tipoAtendimento = ?, parcelas = ?,
                    fk_CPF_Paciente = ?, fk_CPF_Secretaria = ?
                WHERE idAtendimento = ?
            `;
            const [result] = await conn.execute(query, [
                atendimento.observacao,
                atendimento.data,
                atendimento.valorTotal,
                atendimento.tipoAtendimento,
                atendimento.parcelas,
                atendimento.fk_CPF_Paciente,
                atendimento.fk_CPF_Secretaria,
                id
            ]);

            const itens = normalizarItensAtendimento(dados, id, atendimento.valorTotal);

            if (itens.length) {
                await conn.execute('DELETE FROM itematendimento WHERE fk_idAtendimento = ?', [id]);

                const itemQuery = `
                    INSERT INTO itematendimento
                        (qtd, valorUnit, descontoItem, comissaoDentista, CPF_Dentista, fk_idProcedimento, fk_idAtendimento)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                for (const item of itens) {
                    await preencherComissaoAutomatica(conn, item);
                    await conn.execute(itemQuery, [
                        item.qtd,
                        item.valorUnit,
                        item.descontoItem,
                        item.comissaoDentista,
                        item.CPF_Dentista,
                        item.fk_idProcedimento,
                        item.fk_idAtendimento
                    ]);
                }
            }

            await conn.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    excluir: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();
            await conn.execute('DELETE FROM itematendimento WHERE fk_idAtendimento = ?', [id]);
            const [result] = await conn.execute('DELETE FROM atendimento WHERE idAtendimento = ?', [id]);
            await conn.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default atendimentoRepository;
