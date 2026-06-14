import { Router } from "express"
import * as controller from "./procedimento.controller.js"

const router = Router()

router.post("/", controller.cadastrarProcedimento)
router.get("/", controller.consultarProcedimento)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.atualizarProcedimento)
router.delete("/:id", controller.excluirProcedimento)

export default router
