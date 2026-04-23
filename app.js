import express from "express";
import cors from "cors";

// Rotas
import pacienteRoutes from "./paciente/paciente.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota padrão (teste)
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// Rotas da aplicação
app.use("/pacientes", pacienteRoutes);

export default app;