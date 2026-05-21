import { Router } from "express";
import * as controller from "./paciente.controller.js";

const router = Router();

router.post("/", controller.cadastrarPaciente);
router.get("/", controller.consultarPaciente);
router.get("/:cpf", controller.buscarPorCPF);
router.put("/:cpf", controller.atualizarPaciente);
router.delete("/:cpf", controller.excluirPaciente);

export default router;