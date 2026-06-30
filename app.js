import express from "express"
import cors from "cors"
import "dotenv/config"

// Rotas
import pacienteRoutes from "./backend/paciente/paciente.routes.js"
import comissaoRoutes from "./backend/comissao/comissao.routes.js"
import procedimentoRoutes from "./backend/procedimento/procedimento.routes.js"
import atendimentoRoutes from "./backend/atendimento/atendimento.routes.js" // Importação adicionada
import dentistaRoutes from "./backend/dentista/dentista.routes.js"
import pagamentoRoutes from "./backend/pagamento/pagamento.routes.js"
import secretariaRoutes from "./backend/secretaria/secretaria.routes.js"

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
app.use("/dentistas", dentistaRoutes)
app.use("/secretarias", secretariaRoutes)
app.use("/pagamentos", pagamentoRoutes)

export default app
