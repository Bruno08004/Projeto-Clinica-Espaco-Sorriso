import express from "express";
import cors from "cors";
import "dotenv/config";

// Rotas
import pacienteRoutes from "./backend/paciente/paciente.routes.js";

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

// Rotas de dentistas (endpoint base)
app.get("/dentistas", async (req, res) => {
  res.json({ 
    mensagem: "Acesse o servidor de dentistas em http://localhost:3001",
    info: "Rotas disponíveis: POST/GET/PUT/DELETE /dentistas"
  });
});

export default app;
