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
    const itens = Array.isArray(dados.itens) ? dados.itens : [dados.item ?? dados];

    if (!temData || !temValorTotal || !temTipoAtendimento || !temPaciente || !temSecretaria) {
        throw new Error('Campos obrigatorios ausentes.');
    }

    for (const item of itens) {
        const temDentista = temCampo(item, 'CPF_Dentista', 'cpf_dentista', 'id_dentista');
        const temProcedimento = temCampo(item, 'fk_idProcedimento', 'idProcedimento', 'id_procedimento');
        const temQtd = temCampo(item, 'qtd', 'quantidade');
        const temValorUnit = temCampo(item, 'valorUnit', 'valor_unitario');

        if (temDentista !== temProcedimento) {
            throw new Error('Informe CPF_Dentista e fk_idProcedimento juntos para vincular procedimento ao atendimento.');
        }

        if (temDentista && (!temQtd || !temValorUnit)) {
            throw new Error('Informe quantidade e valor unitario para cada procedimento do atendimento.');
        }
    }
}

function agruparAtendimentos(rows) {
    const mapa = new Map();

    for (const row of rows || []) {
        if (!mapa.has(row.idAtendimento)) {
            mapa.set(row.idAtendimento, {
                idAtendimento: row.idAtendimento,
                observacao: row.observacao,
                data: row.data,
                valorTotal: row.valorTotal,
                tipoAtendimento: row.tipoAtendimento,
                parcelas: row.parcelas,
                fk_CPF_Paciente: row.fk_CPF_Paciente,
                fk_CPF_Secretaria: row.fk_CPF_Secretaria,
                paciente_nome: row.paciente_nome,
                secretaria_nome: row.secretaria_nome,
                itens: []
            });
        }

        if (row.idProcedimento) {
            mapa.get(row.idAtendimento).itens.push({
                fk_idProcedimento: row.idProcedimento,
                idProcedimento: row.idProcedimento,
                nomeProcedimento: row.procedimento_nome,
                procedimento_nome: row.procedimento_nome,
                tipoProcedimento: row.tipoProcedimento,
                CPF_Dentista: row.CPF_Dentista,
                nomeDentista: row.dentista_nome,
                dentista_nome: row.dentista_nome,
                qtd: row.qtd,
                valorUnit: row.valorUnit,
                descontoItem: row.descontoItem,
                comissaoDentista: row.comissaoDentista
            });
        }
    }

    return Array.from(mapa.values());
}

const atendimentoService = {
    cadastrarAtendimento: async (dados) => {
        validarCamposObrigatorios(dados);
        return await atendimentoRepository.criar(dados);
    },

    listarAtendimentos: async () => {
        const rows = await atendimentoRepository.buscarTodos();
        return agruparAtendimentos(rows);
    },

    obterAtendimento: async (id) => {
        const rows = await atendimentoRepository.buscarPorId(id);
        const atendimento = agruparAtendimentos(rows)[0];
        if (!atendimento) {
            throw new Error('Atendimento nao encontrado.');
        }
        return atendimento;
    },

    atualizarAtendimento: async (id, dados) => {
        const existe = agruparAtendimentos(await atendimentoRepository.buscarPorId(id))[0];
        if (!existe) {
            throw new Error('Atendimento nao encontrado para atualizacao.');
        }
        validarCamposObrigatorios(dados);
        return await atendimentoRepository.atualizar(id, dados);
    },

    removerAtendimento: async (id) => {
        const existe = agruparAtendimentos(await atendimentoRepository.buscarPorId(id))[0];
        if (!existe) {
            throw new Error('Atendimento nao encontrado para exclusao.');
        }
        return await atendimentoRepository.excluir(id);
    }
};

export default atendimentoService;
