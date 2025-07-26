# 🏢 Intranet Corporativa

Sistema de intranet corporativa desenvolvido com Next.js 14, Material UI e TypeScript, seguindo o design do template Materio.

## 🚀 Funcionalidades

### ✅ Implementado

- **Layout Responsivo**: Menu lateral com suporte a submenus
- **Dashboard Moderno**: Cards de estatísticas e progresso
- **Navegação Intuitiva**: Menu lateral com ícones e categorias
- **Design Material UI**: Interface moderna e consistente
- **Páginas Básicas**: Estrutura para todos os módulos
- **🌙 Dark Mode**: Suporte completo a tema escuro/claro
- **🎨 Tema Dinâmico**: Toggle automático entre light/dark

### 📋 Módulos Disponíveis

- **Dashboard** (`/home`) - Página principal com estatísticas
- **Catálogo** (`/catalog`) - Gerenciamento de produtos
- **Chamados** (`/tickets`) - Sistema de suporte
- **Orçamentos** (`/budgets`) - Gestão de orçamentos
- **Vendas** (`/sales`) - Sistema de vendas
  - **Representantes** (`/sales/representatives`) - Gestão de representantes

## 🛠 Tecnologias

- [Next.js 14](https://nextjs.org/) - Framework React
- [Material UI v7](https://mui.com/) - Componentes UI
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [React Hook Form](https://react-hook-form.com/) - Formulários
- [Zod](https://zod.dev/) - Validações

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── home/              # Dashboard principal
│   ├── catalog/           # Módulo de catálogo
│   ├── tickets/           # Módulo de chamados
│   ├── budgets/           # Módulo de orçamentos
│   ├── sales/             # Módulo de vendas
│   │   └── representatives/
│   └── login/             # Página de login
├── components/            # Componentes reutilizáveis
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── ThemeProvider.tsx
├── contexts/              # Contextos React
│   └── ThemeContext.tsx   # Gerenciamento de tema
├── lib/                   # Utilitários
│   └── theme.ts          # Configuração do tema
└── types/                 # Tipagens TypeScript
```

## 🎨 Design System

O projeto segue o design do [Materio MUI Next.js Admin Template](https://demos.themeselection.com/marketplace/materio-mui-nextjs-admin-template/demo-4/en/dashboards/crm), incluindo:

- **Paleta de Cores**: Tons de azul e roxo
- **Tipografia**: Inter como fonte principal
- **Componentes**: Cards, botões e formulários padronizados
- **Layout**: Menu lateral responsivo
- **🌙 Dark Mode**: Tema escuro completo com toggle

### 🌙 Dark Mode Features

- **Toggle Automático**: Botão no header para alternar temas
- **Persistência**: Preferência salva no localStorage
- **Detecção do Sistema**: Respeita preferência do usuário
- **Transições Suaves**: Mudança de tema sem reload
- **Cores Adaptativas**: Todos os componentes se adaptam

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 📱 Responsividade

- **Desktop**: Menu lateral fixo
- **Mobile**: Menu lateral retrátil
- **Tablet**: Layout adaptativo

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🎯 Próximos Passos

- [ ] Implementar autenticação
- [ ] Adicionar funcionalidades CRUD
- [ ] Implementar gráficos e dashboards
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD

## 👨‍💻 Desenvolvedor

Guilherme Marques – Full Stack Developer

---

**Status**: ✅ Funcional - Dashboard com Dark Mode implementado com sucesso!
