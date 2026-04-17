# 💾 Como importar o banco de dados

Este guia mostra passo a passo como configurar o banco de dados do projeto na sua máquina.

---

## 📦 Requisitos

Antes de começar, você precisa ter:

- MySQL instalado
- MySQL Workbench instalado
- Projeto clonado do GitHub
- Estar na branch `develop`

---

## 📁 Onde estão os arquivos

Os arquivos do banco estão em:

`database/scripts/`

Arquivos importantes:

- `create_tables.sql` → cria as tabelas
- `inserts_teste.sql` → insere dados de teste

---

## ⚠️ Ordem correta (OBRIGATÓRIA)

1. `create_tables.sql`
2. `inserts_teste.sql`

---

## 🚀 Passo a passo (MySQL Workbench)

### 1. Abrir o MySQL Workbench

Abra o programa e conecte no seu MySQL local.

---

### 2. Criar o banco

Abra uma nova aba SQL e execute:

```sql
CREATE DATABASE clinica_odonto;
USE clinica_odonto;
```

## 🚀 Importar banco de dados

### 3. Importar estrutura

- Vá em: **File > Open SQL Script**
- Abra: `create_tables.sql`
- Clique em executar (⚡)

---

### 4. Importar dados

- Vá em: **File > Open SQL Script**
- Abra: `inserts_teste.sql`
- Clique em executar (⚡)

---

## ✅ Como verificar se deu certo

Execute:

```sql
USE clinica_odonto;
SHOW TABLES;

```

Depois:

```sql
SELECT * FROM paciente;
SELECT * FROM dentista;
```

Se aparecerem dados → ✔ deu certo
