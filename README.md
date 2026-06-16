# 🦷 Clínica Espaço Sorriso

Sistema de gestão desenvolvido para uma clínica odontológica, com o objetivo de organizar processos internos relacionados a pacientes, dentistas, procedimentos, atendimentos e comissões.

O projeto foi desenvolvido como trabalho acadêmico e utiliza backend em **Node.js/Express**, banco de dados **MySQL** e frontend em **HTML, CSS e JavaScript**.

---

## 📋 Resumo do projeto

O sistema centraliza funcionalidades essenciais para o funcionamento de uma clínica odontológica. A proposta é permitir o cadastro e a consulta de informações importantes, registrar atendimentos, associar procedimentos realizados e calcular as comissões dos dentistas.

Os cinco módulos desenvolvidos são:

- **Paciente**
- **Dentista**
- **Procedimento**
- **Atendimento**
- **Comissão**

Cada módulo possui uma responsabilidade específica dentro do sistema, contribuindo para um fluxo integrado de gestão da clínica.

---

## 🧩 Módulos do sistema

### 👤 Paciente

Módulo responsável pelo cadastro e gerenciamento dos pacientes da clínica.

### 👨‍⚕️ Dentista

Módulo responsável pelo cadastro e gerenciamento dos profissionais dentistas.

### 🩺 Procedimento

Módulo responsável pelo cadastro dos procedimentos odontológicos disponíveis na clínica.

### 📅 Atendimento

Módulo responsável pelo registro dos atendimentos realizados, permitindo vincular paciente, dentista e procedimentos executados.

### 💰 Comissão

Módulo responsável pelo controle das comissões dos dentistas a partir dos procedimentos realizados nos atendimentos.

---

## 🛠️ Tecnologias utilizadas

### Backend

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- cors

### Frontend

- HTML
- CSS
- JavaScript

### Banco de dados

- MySQL
- Scripts SQL para criação da estrutura e inserção de dados de teste

---

## 📁 Estrutura do projeto

```text
Projeto-Clinica-Espaco-Sorriso/
|-- app.js
|-- server.js
|-- package.json
|-- backend/
|   |-- atendimento/
|   |-- comissao/
|   |-- dentista/
|   |-- paciente/
|   `-- procedimento/
|-- config/
|-- database/
|   |-- der-Logicas/
|   `-- scripts/
|-- frontend/
|   |-- atendimento/
|   |-- comissao/
|   |-- dentista/
|   |-- paciente/
|   |-- procedimento/
|   `-- Tela/
`-- utils/
```

---

## ✅ Pré-requisitos

Para executar o projeto, é necessário ter instalado:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd Projeto-Clinica-Espaco-Sorriso
```

Instale as dependências:

```bash
npm install
```

---

## ⚙️ Configuração do ambiente

Crie o arquivo `config/.env` com as configurações do banco de dados:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=clinica_odonto
```

> ⚠️ O arquivo `.env` não deve ser enviado para o repositório, pois pode conter informações sensíveis.

É recomendado criar um arquivo `.env.example` sem dados reais de acesso para servir como modelo de configuração.

---

## 🗄️ Configuração do banco de dados

Crie o banco no MySQL:

```sql
CREATE DATABASE clinica_odonto;
USE clinica_odonto;
```

Os scripts estão disponíveis na pasta:

```text
database/scripts/
```

Execute os arquivos na seguinte ordem:

```text
1. create_tables.sql
2. alter_atendimento_tipo_ambos.sql
3. inserts_teste.sql
```

O arquivo `inserts_teste.sql` contém dados de exemplo para facilitar os testes do sistema.

---

## ▶️ Executando o projeto

Para iniciar o servidor:

```bash
npm start
```

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

Por padrão, o backend será iniciado em:

```text
http://localhost:3000
```

---

## 🌐 Acessando o frontend

Com o backend em execução, abra a página inicial:

```text
frontend/Tela/index.html
```

Também é possível acessar diretamente as telas dos módulos:

```text
frontend/paciente/Paciente/index.html
frontend/dentista/Dentista/index.html
frontend/procedimento/Procedimento/index.html
frontend/atendimento/Atendimento/index.html
frontend/comissao/Comissao/index.html
```

---

## 🔗 Rotas principais

```text
/pacientes
/procedimentos
/atendimentos
/comissoes
```

O projeto também possui uma estrutura específica para o gerenciamento de dentistas.

---

## 🔄 Fluxo básico de uso

1. Cadastre ou consulte pacientes;
2. Cadastre ou consulte dentistas;
3. Cadastre ou consulte procedimentos;
4. Registre os atendimentos realizados;
5. Consulte e gerencie as comissões dos dentistas.

---

## 📈 Possíveis melhorias e evoluções

- Implementar autenticação de usuários;
- Criar controle de permissões por perfil;
- Melhorar a integração visual entre as telas;
- Criar dashboards com indicadores da clínica;
- Adicionar relatórios financeiros e operacionais;
- Implementar testes automatizados;
- Documentar a API com Swagger ou ferramenta semelhante;
- Melhorar a responsividade para dispositivos móveis;
- Criar deploy em ambiente de produção;
- Adicionar auditoria para alterações importantes no sistema.

---

## 👩‍💻👨‍💻 Desenvolvedores

Projeto desenvolvido por:

- **Bruno Campos**
- **João Vitor Lemos**
- **Grazielly Barros**
- **Ana Luiza Freitas**

---

## 📚 Status do projeto

Projeto acadêmico em desenvolvimento.

Os principais módulos estão estruturados e integrados para demonstrar o funcionamento geral de uma clínica odontológica.
