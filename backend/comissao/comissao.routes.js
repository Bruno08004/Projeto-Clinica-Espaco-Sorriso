import express from "express";
import comissaoController from "./comissao.controller.js";

const router = express.Router();

router.post("/", comissaoController.cadastrar);
router.get("/", comissaoController.listar);
router.get("/resumo", comissaoController.resumo);
router.get("/resumo/:cpfDentista", comissaoController.resumoPorDentista);
router.get("/dentista/:cpfDentista", comissaoController.listarPorDentista);
router.get("/atendimento/:idAtendimento/procedimentos", comissaoController.listarPorAtendimento);
router.put("/recalcular", comissaoController.recalcular);
router.put("/:idAtendimento/:idProcedimento", comissaoController.atualizar);
router.delete("/:idAtendimento/:idProcedimento", comissaoController.excluir);

export default router;
