import express from "express"
import cors from "cors"
import "dotenv/config"

// Rotas
import pacienteRoutes from "./backend/paciente/paciente.routes.js"
import comissaoRoutes from "./backend/comissao/comissao.routes.js"
import procedimentoRoutes from "./backend/procedimento/procedimento.routes.js"
import atendimentoRoutes from "./backend/atendimento/atendimento.routes.js" // Importação adicionada

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Rota padrão (teste)
app.get("/", (req, res) => {
  res.send("API rodando 🚀")
})

// Rotas da aplicação
app.use("/pacientes", pacienteRoutes)
app.use("/comissoes", comissaoRoutes)
app.use("/procedimentos", procedimentoRoutes)
app.use("/atendimentos", atendimentoRoutes) // Rota adicionada seguindo o padrão do projeto

// Rotas de dentistas (endpoint base)
app.get("/dentistas", async (req, res) => {
  res.json({
    mensagem: "Acesse o servidor de dentistas em http://localhost:3001",
    info: "Rotas disponíveis: POST/GET/PUT/DELETE /dentistas",
  })
})

export default app
