import comissaoService from "./comissao.service.js";

function statusPorErro(error) {
    if (
        error.message === "Dentista nao encontrado." ||
        error.message === "Comissao nao encontrada." ||
        error.message === "Procedimento nao vinculado ao atendimento."
    ) {
        return 404;
    }

    return 400;
}

const comissaoController = {
    cadastrar: async (req, res) => {
        try {
            const resultado = await comissaoService.cadastrarComissao(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    listar: async (req, res) => {
        try {
            const comissoes = await comissaoService.listarComissoes(req.query);
            res.status(200).json(comissoes);
        } catch (error) {
            res.status(400).json({ error: error.message, erro: error.message });
        }
    },

    listarPorDentista: async (req, res) => {
        try {
            const comissoes = await comissaoService.listarPorDentista(
                req.params.cpfDentista,
                req.query,
            );
            res.status(200).json(comissoes);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    listarPorAtendimento: async (req, res) => {
        try {
            const comissoes = await comissaoService.listarPorAtendimento(req.params.idAtendimento);
            res.status(200).json(comissoes);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    resumo: async (req, res) => {
        try {
            const resumo = await comissaoService.resumo(req.query);
            res.status(200).json(resumo);
        } catch (error) {
            res.status(400).json({ error: error.message, erro: error.message });
        }
    },

    resumoPorDentista: async (req, res) => {
        try {
            const resumo = await comissaoService.resumoPorDentista(
                req.params.cpfDentista,
                req.query,
            );
            res.status(200).json(resumo);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            const resultado = await comissaoService.atualizarComissao(
                req.params.idAtendimento,
                req.params.idProcedimento,
                req.body,
            );
            res.status(200).json(resultado);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    excluir: async (req, res) => {
        try {
            const resultado = await comissaoService.excluirComissao(
                req.params.idAtendimento,
                req.params.idProcedimento,
            );
            res.status(200).json(resultado);
        } catch (error) {
            res.status(statusPorErro(error)).json({ error: error.message, erro: error.message });
        }
    },

    recalcular: async (req, res) => {
        try {
            const resultado = await comissaoService.recalcular();
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message, erro: error.message });
        }
    },
};

export default comissaoController;
