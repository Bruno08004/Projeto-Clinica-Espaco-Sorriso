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
    const fk_idProcedimento = dados.fk_idProcedimento ?? dados.idProcedimento ?? dados.id_procedimento;
    const CPF_Dentista = dados.CPF_Dentista ?? dados.cpf_dentista ?? dados.id_dentista;

    if (!fk_idProcedimento && !CPF_Dentista) {
        return null;
    }

    return {
        qtd: dados.qtd ?? dados.quantidade ?? 1,
        valorUnit: dados.valorUnit ?? dados.valor_unitario ?? valorTotal,
        descontoItem: dados.descontoItem ?? dados.desconto_item ?? 0,
        comissaoDentista: dados.comissaoDentista ?? dados.comissao_dentista ?? 0,
        CPF_Dentista,
        fk_idProcedimento,
        fk_idAtendimento: idAtendimento
    };
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

            const item = normalizarItemAtendimento(dados, result.insertId, atendimento.valorTotal);

            if (item) {
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
        return rows[0];
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

            const item = normalizarItemAtendimento(dados, id, atendimento.valorTotal);

            if (item) {
                await conn.execute('DELETE FROM itematendimento WHERE fk_idAtendimento = ?', [id]);

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
