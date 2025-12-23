# Aconchego App

Sistema de gerenciamento para escola de dança, desenvolvido como Trabalho de Conclusão de Curso (TCC). A aplicação permite o gerenciamento de aulas, eventos, notícias, feedbacks de alunos e controle de frequência.

## 📋 Visão Geral

O Aconchego App é uma aplicação frontend que oferece:

- **Calendário interativo** com visualização de aulas e eventos
- **Gerenciamento de aulas** com sistema de recorrência
- **Sistema de feedback** para avaliação de alunos
- **Notícias e avisos** para comunicação com alunos
- **Múltiplos perfis de usuário** (Aluno, Professor, Secretário, Administrador)

## ⚙️ Backend

> **📌 Importante:** Este repositório contém apenas o **frontend** da aplicação. O backend está disponível em um repositório separado: **[backend-api](https://github.com/leobritto95/aconchego-backend)**.

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **TanStack Query (React Query)** - Gerenciamento de estado servidor
- **Tailwind CSS** - Framework CSS utilitário
- **FullCalendar** - Componente de calendário
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm**, **yarn** ou **bun** (gerenciador de pacotes)
- **Docker** e **Docker Compose** (para MongoDB via Docker) ou **MongoDB** instalado localmente

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd aconchego-app
```

### 2. Instalar dependências

```bash
npm install
# ou
yarn install
```

## ▶️ Como Executar

### Desenvolvimento

#### Terminal

```bash
npm run dev
```

O servidor frontend será iniciado em `http://localhost:5173` (ou outra porta disponível)

### Produção

#### Frontend

```bash
npm run build
npm run preview
```
## 🔐 Autenticação

A aplicação usa JWT (JSON Web Tokens) para autenticação. Após fazer login, o token é armazenado no `localStorage` e incluído automaticamente nas requisições.

### Perfis de Usuário

- **STUDENT** - Aluno: visualiza aulas, eventos e pode enviar feedbacks
- **TEACHER** - Professor: gerencia aulas e visualiza feedbacks dos alunos
- **SECRETARY** - Secretário: acesso administrativo limitado
- **ADMIN** - Administrador: acesso completo ao sistema
