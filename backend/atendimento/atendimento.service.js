import atendimentoRepository from './atendimento.repository.js';

function temCampo(dados, ...nomes) {
    return nomes.some((nome) => dados[nome] !== undefined && dados[nome] !== null && dados[nome] !== '');
}

function validarCamposObrigatorios(dados) {
    const temData = temCampo(dados, 'data', 'data_atendimento');
    const temValorTotal = temCampo(dados, 'valorTotal', 'valor_total');
    const temTipoAtendimento = temCampo(dados, 'tipoAtendimento', 'tipo_atendimento');
    const temPaciente = temCampo(dados, 'fk_CPF_Paciente', 'CPF_Paciente', 'cpf_paciente');
    const temSecretaria = temCampo(dados, 'fk_CPF_Secretaria', 'CPF_Secretaria', 'cpf_secretaria');
    const temDentista = temCampo(dados, 'CPF_Dentista', 'cpf_dentista', 'id_dentista');
    const temProcedimento = temCampo(dados, 'fk_idProcedimento', 'idProcedimento', 'id_procedimento');

    if (!temData || !temValorTotal || !temTipoAtendimento || !temPaciente || !temSecretaria) {
        throw new Error('Campos obrigatorios ausentes.');
    }

    if (temDentista !== temProcedimento) {
        throw new Error('Informe CPF_Dentista e fk_idProcedimento juntos para vincular procedimento ao atendimento.');
    }
}

const atendimentoService = {
    cadastrarAtendimento: async (dados) => {
        validarCamposObrigatorios(dados);
        return await atendimentoRepository.criar(dados);
    },

    listarAtendimentos: async () => {
        return await atendimentoRepository.buscarTodos();
    },

    obterAtendimento: async (id) => {
        const atendimento = await atendimentoRepository.buscarPorId(id);
        if (!atendimento) {
            throw new Error('Atendimento nao encontrado.');
        }
        return atendimento;
    },

    atualizarAtendimento: async (id, dados) => {
        const existe = await atendimentoRepository.buscarPorId(id);
        if (!existe) {
            throw new Error('Atendimento nao encontrado para atualizacao.');
        }
        validarCamposObrigatorios(dados);
        return await atendimentoRepository.atualizar(id, dados);
    },

    removerAtendimento: async (id) => {
        const existe = await atendimentoRepository.buscarPorId(id);
        if (!existe) {
            throw new Error('Atendimento nao encontrado para exclusao.');
        }
        return await atendimentoRepository.excluir(id);
    }
};

export default atendimentoService;
