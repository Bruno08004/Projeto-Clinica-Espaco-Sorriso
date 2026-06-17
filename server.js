import dotenv from "dotenv";

dotenv.config({ path: "./config/.env", override: true });

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});