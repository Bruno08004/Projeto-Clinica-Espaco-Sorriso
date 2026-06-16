import atendimentoService from './atendimento.service.js';

function mensagemErro(error) {
    if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        if (error.message.includes('FK_Atendimento_2')) {
            return 'Paciente nao encontrado. Cadastre o paciente ou informe um CPF existente.';
        }

        if (error.message.includes('FK_Atendimento_3')) {
            return 'Secretaria nao encontrada. Informe um CPF de secretaria existente.';
        }

        if (error.message.includes('FK__ItemAtendimento_1')) {
            return 'Dentista nao encontrado. Informe um CPF de dentista existente.';
        }

        if (error.message.includes('FK__ItemAtendimento_2')) {
            return 'Procedimento nao encontrado. Selecione um procedimento cadastrado.';
        }
    }

    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
        return 'Nao foi possivel excluir porque existem registros vinculados.';
    }

    if (error?.code === 'WARN_DATA_TRUNCATED' || error?.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
        return 'Tipo de atendimento invalido para a estrutura atual do banco.';
    }

    return error.message;
}

const atendimentoController = {
    criar: async (req, res) => {
        try {
            const id = await atendimentoService.cadastrarAtendimento(req.body);
            res.status(201).json({ message: 'Atendimento cadastrado com sucesso!', id });
        } catch (error) {
            const mensagem = mensagemErro(error);
            res.status(400).json({ error: mensagem, erro: mensagem });
        }
    },

    listar: async (req, res) => {
        try {
            const lista = await atendimentoService.listarAtendimentos();
            res.status(200).json(lista);
        } catch (error) {
            const mensagem = mensagemErro(error);
            res.status(500).json({ error: mensagem, erro: mensagem });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const atendimento = await atendimentoService.obterAtendimento(req.params.id);
            res.status(200).json(atendimento);
        } catch (error) {
            const mensagem = mensagemErro(error);
            res.status(404).json({ error: mensagem, erro: mensagem });
        }
    },

    atualizar: async (req, res) => {
        try {
            await atendimentoService.atualizarAtendimento(req.params.id, req.body);
            res.status(200).json({ message: 'Atendimento atualizado com sucesso!' });
        } catch (error) {
            const mensagem = mensagemErro(error);
            res.status(400).json({ error: mensagem, erro: mensagem });
        }
    },

    excluir: async (req, res) => {
        try {
            await atendimentoService.removerAtendimento(req.params.id);
            res.status(200).json({ message: 'Atendimento excluido com sucesso!' });
        } catch (error) {
            const mensagem = mensagemErro(error);
            res.status(400).json({ error: mensagem, erro: mensagem });
        }
    }
};

export default atendimentoController;
