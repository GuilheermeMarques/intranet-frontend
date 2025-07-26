# 🏢 Intranet Corporativa - Projeto Freelancer

Este repositório contém o código-fonte do projeto **Intranet Corporativa**, desenvolvido com foco em modularidade, escalabilidade e usabilidade.

---

## 🔧 Tecnologias Utilizadas

- [Next.js 14+ (App Router)](https://nextjs.org/docs/app)
- [React 18+](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI v5](https://mui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) (validações)
- [ESLint + Prettier](https://prettier.io/)
- [SSR Ready (Server-Side Rendering)](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## 📁 Estrutura de Pastas

O projeto segue a estrutura do repositório da [Rocketseat - SaaS RBAC com Next.js](https://github.com/rocketseat-education/course-saas-next-rbac), priorizando organização de funcionalidades e regras de negócio.

```
.
├── app/                     # Estrutura de rotas (App Router)
│   ├── login/              # Página de Login
│   ├── home/               # Página inicial após login
│   └── layout.tsx         # Layout principal com menu lateral
├── components/             # Componentes reutilizáveis (ex: Sidebar, Header)
├── features/               # Domínios da aplicação (ex: Catalog, Tickets, Budgets)
│   ├── catalog/
│   ├── tickets/
│   ├── budgets/
│   ├── sales/
│   │   └── representatives/
├── hooks/                  # Hooks customizados
├── lib/                    # Utilitários e helpers
├── services/               # Serviços de API / backend
├── middlewares/           # Middlewares e proteções de rota
├── types/                  # Tipagens globais e DTOs
├── styles/                 # Estilizações globais
└── public/                 # Assets públicos (imagens, ícones, etc)
```

---

## 📌 Funcionalidades Iniciais

### 🟢 Páginas

- **Login**
  - Autenticação básica (com validação)

- **Home**
  - Dashboard inicial
  - Menu lateral com submenus

### 📚 Menu Lateral

- 📦 **Catálogo**
- 🛠 **Chamados**
- 💸 **Orçamentos**
- 🛍 **Vendas**
  - 👥 Representantes

---

## 🎯 Objetivo

Construir uma intranet modular, moderna e SSR-ready, baseada em boas práticas de arquitetura com Next.js e inspirada no layout do template [Materio MUI Next.js Admin](https://demos.themeselection.com/marketplace/materio-mui-nextjs-admin-template/demo-4/en/apps/academy/my-courses).

---

## 🚀 Como rodar o projeto

```bash
# Instale as dependências
npm install

# Rode o ambiente de desenvolvimento
npm run dev
```

---

## 📦 Scripts

| Comando | Ação                                 |
| ------- | ------------------------------------ |
| `dev`   | Inicia o ambiente de desenvolvimento |
| `build` | Gera a build para produção           |
| `start` | Inicia a aplicação em produção       |
| `lint`  | Roda linter com ESLint               |

---

## 🧠 Extras planejados

- 🌙 Suporte a tema dark/light
- 🔒 Proteção de rotas com middleware
- 🧪 Testes unitários com Vitest ou Jest
- 🗝 Breadcrumbs e navegação contextual
- 🖼 Layout dinâmico por página

---

## 👨‍💻 Desenvolvedor

Guilherme Marques – Full Stack Developer
