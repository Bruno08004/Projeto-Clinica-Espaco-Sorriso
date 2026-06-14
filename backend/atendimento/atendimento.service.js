import atendimentoRepository from './atendimento.repository.js';

const atendimentoService = {
    cadastrarAtendimento: async (dados) => {
        if (!dados.id_paciente || !dados.id_dentista || !dados.id_procedimento || !dados.data_atendimento) {
            throw new Error('Campos obrigatórios ausentes.');
        }
        return await atendimentoRepository.criar(dados);
    },

    listarAtendimentos: async () => {
        return await atendimentoRepository.buscarTodos();
    },

    obterAtendimento: async (id) => {
        const atendimento = await atendimentoRepository.buscarPorId(id);
        if (!atendimento) {
            throw new Error('Atendimento não encontrado.');
        }
        return atendimento;
    },

    atualizarAtendimento: async (id, dados) => {
        const existe = await atendimentoRepository.buscarPorId(id);
        if (!existe) {
            throw new Error('Atendimento não encontrado para atualização.');
        }
        return await atendimentoRepository.atualizar(id, dados);
    },

    removerAtendimento: async (id) => {
        const existe = await atendimentoRepository.buscarPorId(id);
        if (!existe) {
            throw new Error('Atendimento não encontrado para exclusão.');
        }
        return await atendimentoRepository.excluir(id);
    }
};

export default atendimentoService;