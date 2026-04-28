# 🦷 Espaço Sorriso - Sistema de Gestão Odontológica

Sistema completo para gestão de consultório odontológico com controle de pacientes e dentistas.

## 📋 Pré-requisitos

- **Node.js** (v14+)
- **MySQL** (v5.7+)
- **npm** ou **yarn**

## 🚀 Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/Bruno08004/Projeto-Clinica-Espaco-Sorriso.git
cd Projeto-Clinica-Espaco-Sorriso
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar o Banco de Dados

#### Criar o banco manualmente:
```bash
mysql -u root -p < database/scripts/create_tables.sql
```

#### Inserir dados de teste (opcional):
```bash
mysql -u root -p clinica_odonto < database/scripts/inserts_teste.sql
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e atualize as credenciais:

```bash
cp .env.example .env
```

Edite `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=clinica_odonto
PORT=3000
PORTA=3001
```

## ▶️ Executar a Aplicação

### Modo desenvolvimento (com auto-reload):
```bash
# Terminal 1 - API Principal (Pacientes)
npm run dev

# Terminal 2 - API de Dentistas
npm run dev:dentista
```

### Modo produção:
```bash
# Terminal 1
npm start

# Terminal 2
npm start:dentista
```

## 📌 Endpoints da API

### API Principal (Port 3000)

#### Pacientes
- `POST /pacientes` - Criar paciente
- `GET /pacientes` - Listar todos os pacientes
- `GET /pacientes/:cpf` - Buscar paciente por CPF
- `PUT /pacientes/:cpf` - Atualizar paciente
- `DELETE /pacientes/:cpf` - Deletar paciente

### API de Dentistas (Port 3001)

- `POST /dentistas` - Criar dentista
- `GET /dentistas` - Listar todos os dentistas
- `GET /dentistas/:cpf` - Buscar dentista por CPF
- `PUT /dentistas/:cpf` - Atualizar dentista
- `DELETE /dentistas/:cpf` - Deletar dentista

## 📁 Estrutura do Projeto

```
Projeto-Clinica-Espaco-Sorriso/
├── backend/
│   ├── dentista/
│   │   └── server.js         # API de Dentistas
│   └── paciente/
├── database/
│   ├── scripts/
│   │   ├── create_tables.sql
│   │   └── inserts_teste.sql
│   └── der-Logicas/
├── frontend/
│   ├── dentista/Dentista/
│   ├── paciente/Paciente/
│   └── Tela/
├── config/
│   └── database.js           # Configuração do MySQL
├── paciente/                 # Rotas e Controllers
│   ├── paciente.controller.js
│   ├── paciente.service.js
│   ├── paciente.repository.js
│   └── paciente.routes.js
├── utils/
│   ├── validarCPF.js
│   └── validarTelefone.js
├── app.js                    # Inicialização da app
├── server.js                 # Servidor principal
├── package.json
├── .env.example
└── .gitignore
```

## 🔄 Fluxo de Funcionamento

1. **Frontend** (HTML/CSS/JavaScript) → envia requisições HTTP
2. **API Principal** (server.js:3000) → recebe requisições de pacientes
3. **API de Dentistas** (backend/dentista/server.js:3001) → recebe requisições de dentistas
4. **Config/Database** → gerencia conexões MySQL
5. **Database** → armazena dados

## 🧪 Testando a API

Use **Postman** ou **curl**:

```bash
# Criar dentista
curl -X POST http://localhost:3001/dentistas \
  -H "Content-Type: application/json" \
  -d '{
    "CPF_Dentista": "12345678900",
    "nome": "Dr. João Silva",
    "CRO": "SP-12345",
    "croUF": "SP",
    "especialidade": "Ortodontia"
  }'

# Listar dentistas
curl http://localhost:3001/dentistas

# Criar paciente
curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria@email.com",
    "cep": "12345678",
    "numero": "123",
    "bairro": "Centro",
    "logradouro": "Rua A",
    "cidade": "São Paulo",
    "uf": "SP"
  }'
```

## 🐛 Solução de Problemas

### Erro de conexão ao banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais em `.env`
- Certifique-se de que o banco `clinica_odonto` foi criado

### Porta já em uso
```bash
# Para verificar qual processo está usando a porta
lsof -i :3000  # ou :3001 para a porta dos dentistas

# Para liberar a porta (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS Error
- Confirme que ambas as APIs estão rodando
- Verifique os URLs nos arquivos HTML (`http://localhost:3001` para dentistas)

## 📚 Documentação do Banco de Dados

Veja os diagramas E-R em:
- `database/der-Logicas/esquema-conceitual.png` - Modelo Conceitual
- `database/der-Logicas/esquema-logico.png` - Modelo Lógico

## 📝 Licença

MIT - Sinta-se livre para usar este projeto!

## 👨‍💻 Autores

- Bruno Xavier - [@Bruno08004](https://github.com/Bruno08004)
