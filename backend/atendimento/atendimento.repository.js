import { connection } from '../../config/database.js'; // <-- Ajustado para { connection }

const atendimentoRepository = {
    criar: async (dados) => {
        const { id_paciente, id_dentista, id_procedimento, data_atendimento, status, observacoes } = dados;
        const query = `
            INSERT INTO atendimento (id_paciente, id_dentista, id_procedimento, data_atendimento, status, observacoes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(query, [id_paciente, id_dentista, id_procedimento, data_atendimento, status, observacoes]); // <-- pool alterado para connection
        return result.insertId;
    },

    buscarTodos: async () => {
        const query = `
            SELECT a.*, p.nome AS procedimento_nome, p.valor AS procedimento_valor 
            FROM atendimento a
            INNER JOIN procedimento p ON a.id_procedimento = p.id
        `;
        const [rows] = await connection.execute(query); // <-- pool alterado para connection
        return rows;
    },

    buscarPorId: async (id) => {
        const query = `
            SELECT a.*, p.nome AS procedimento_nome, p.valor AS procedimento_valor 
            FROM atendimento a
            INNER JOIN procedimento p ON a.id_procedimento = p.id
            WHERE a.id = ?
        `;
        const [rows] = await connection.execute(query, [id]); // <-- pool alterado para connection
        return rows[0];
    },

    atualizar: async (id, dados) => {
        const { id_paciente, id_dentista, id_procedimento, data_atendimento, status, observacoes } = dados;
        const query = `
            UPDATE atendimento 
            SET id_paciente = ?, id_dentista = ?, id_procedimento = ?, data_atendimento = ?, status = ?, observacoes = ?
            WHERE id = ?
        `;
        const [result] = await connection.execute(query, [id_paciente, id_dentista, id_procedimento, data_atendimento, status, observacoes, id]); // <-- pool alterado para connection
        return result.affectedRows > 0;
    },

    excluir: async (id) => {
        const query = 'DELETE FROM atendimento WHERE id = ?';
        const [result] = await connection.execute(query, [id]); // <-- pool alterado para connection
        return result.affectedRows > 0;
    }
};

export default atendimentoRepository;