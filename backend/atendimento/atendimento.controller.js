import atendimentoService from './atendimento.service.js';

const atendimentoController = {
    criar: async (req, res) => {
        try {
            const id = await atendimentoService.cadastrarAtendimento(req.body);
            res.status(201).json({ message: 'Atendimento cadastrado com sucesso!', id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    listar: async (req, res) => {
        try {
            const lista = await atendimentoService.listarAtendimentos();
            res.status(200).json(lista);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const atendimento = await atendimentoService.obterAtendimento(req.params.id);
            res.status(200).json(atendimento);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            await atendimentoService.atualizarAtendimento(req.params.id, req.body);
            res.status(200).json({ message: 'Atendimento atualizado com sucesso!' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    excluir: async (req, res) => {
        try {
            await atendimentoService.removerAtendimento(req.params.id);
            res.status(200).json({ message: 'Atendimento excluído com sucesso!' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

export default atendimentoController;