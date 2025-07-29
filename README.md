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
- **Sistema de Filtros**: Componente reutilizável para filtros
- **Tabelas de Dados**: Componente DataTable com paginação e ordenação
- **Modais**: Sistema de modais para formulários e confirmações
- **Drag & Drop**: Implementado no sistema de tickets (Kanban)
- **Formulários**: Validação com React Hook Form + Zod

### 📋 Módulos Disponíveis

- **Dashboard** (`/home`) - Página principal com estatísticas
- **Catálogo** (`/catalog`) - Gerenciamento de produtos
- **Chamados** (`/tickets`) - Sistema de suporte com Kanban
- **Orçamentos** (`/budgets`) - Gestão de orçamentos
- **Vendas** (`/sales`) - Sistema de vendas
  - **Representantes** (`/sales/representatives`) - Gestão de representantes
- **Configurações** (`/settings`) - Configurações do sistema

## 🛠 Tecnologias

- [Next.js 14](https://nextjs.org/) - Framework React
- [Material UI v7](https://mui.com/) - Componentes UI
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [React Hook Form](https://react-hook-form.com/) - Formulários
- [Zod](https://zod.dev/) - Validações
- [@dnd-kit](https://dndkit.com/) - Drag & Drop
- [date-fns](https://date-fns.org/) - Manipulação de datas

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
│   ├── settings/          # Configurações
│   └── login/             # Página de login
├── components/            # Componentes reutilizáveis
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── DataTable.tsx
│   ├── FilterPanel.tsx
│   ├── Modal.tsx
│   └── ThemeProvider.tsx
├── contexts/              # Contextos React
│   └── ThemeContext.tsx   # Gerenciamento de tema
├── lib/                   # Utilitários
│   └── theme.ts          # Configuração do tema
├── mocks/                 # Dados mockados
│   ├── budgets.json
│   ├── products.json
│   ├── tickets.json
│   ├── representatives.json
│   └── ...
├── types/                 # Tipagens TypeScript
│   └── budget.ts
├── services/              # ⚠️ Vazio - Precisa implementar
├── hooks/                 # ⚠️ Vazio - Precisa implementar
└── features/              # ⚠️ Vazio - Precisa implementar
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
npm run lint:fix     # Corrigir problemas de lint
npm run format       # Formatar código
npm run type-check   # Verificar tipos TypeScript
```

## 📊 Análise da Aplicação

### ✅ Pontos Fortes

- **Arquitetura bem estruturada** com componentes reutilizáveis
- **Sistema de temas completo** com dark mode
- **Componentes modulares** (DataTable, FilterPanel, Modal)
- **Validação robusta** com Zod
- **Interface responsiva** e moderna
- **Dados mockados organizados** para desenvolvimento

### ⚠️ Pontos de Melhoria

- **Falta de serviços de API** - Tudo está mockado
- **Ausência de hooks customizados** - Lógica duplicada
- **Sem gerenciamento de estado global** - Apenas contextos locais
- **Falta de testes** - Nenhum teste implementado
- **Sem autenticação real** - Login apenas simulado
- **Estrutura de features vazia** - Não há organização por domínio

## 🎯 TODOs - Frontend

### 🔐 Autenticação e Segurança

- [ ] **Implementar sistema de autenticação real**
  - [ ] Integração com JWT ou similar
  - [ ] Middleware de proteção de rotas
  - [ ] Refresh token automático
  - [ ] Logout e limpeza de dados
- [ ] **Sistema de permissões e roles**
  - [ ] Controle de acesso baseado em roles (RBAC)
  - [ ] Componente de autorização
  - [ ] Proteção de rotas por permissão
- [ ] **Validação de formulários avançada**
  - [ ] Validação em tempo real
  - [ ] Mensagens de erro customizadas
  - [ ] Validação de arquivos

### 🏗️ Arquitetura e Estrutura

- [ ] **Implementar gerenciamento de estado global**
  - [ ] Zustand ou Redux Toolkit
  - [ ] Persistência de estado
  - [ ] DevTools para debug
- [ ] **Criar estrutura de features**
  - [ ] Organizar por domínio (auth, budgets, tickets, etc.)
  - [ ] Implementar padrão de slices
  - [ ] Separar lógica de negócio
- [ ] **Implementar hooks customizados**
  - [ ] `useAuth` - Gerenciamento de autenticação
  - [ ] `useApi` - Chamadas de API
  - [ ] `useLocalStorage` - Persistência local
  - [ ] `useDebounce` - Debounce para filtros
  - [ ] `useInfiniteScroll` - Paginação infinita

### 🔧 Serviços e API

- [ ] **Criar camada de serviços**
  - [ ] `src/services/api.ts` - Cliente HTTP base
  - [ ] `src/services/auth.ts` - Serviços de autenticação
  - [ ] `src/services/budgets.ts` - Serviços de orçamentos
  - [ ] `src/services/tickets.ts` - Serviços de tickets
  - [ ] `src/services/products.ts` - Serviços de produtos
- [ ] **Implementar interceptors**
  - [ ] Interceptor de autenticação
  - [ ] Interceptor de erro
  - [ ] Interceptor de loading
- [ ] **Sistema de cache**
  - [ ] Cache de requisições
  - [ ] Invalidação de cache
  - [ ] Cache offline

### 🎨 UI/UX e Componentes

- [ ] **Melhorar componentes existentes**
  - [ ] Adicionar loading states
  - [ ] Implementar error boundaries
  - [ ] Melhorar acessibilidade
  - [ ] Adicionar animações
- [ ] **Novos componentes**
  - [ ] `Breadcrumb` - Navegação hierárquica
  - [ ] `SearchInput` - Busca avançada
  - [ ] `FileUpload` - Upload de arquivos
  - [ ] `RichTextEditor` - Editor de texto rico
  - [ ] `Chart` - Gráficos e dashboards
- [ ] **Sistema de notificações**
  - [ ] Toast notifications
  - [ ] Notificações push
  - [ ] Sistema de alertas

### 📊 Dashboards e Relatórios

- [ ] **Implementar gráficos**
  - [ ] Recharts ou Chart.js
  - [ ] Gráficos de vendas
  - [ ] Gráficos de tickets
  - [ ] Gráficos de orçamentos
- [ ] **Dashboards interativos**
  - [ ] Widgets customizáveis
  - [ ] Filtros avançados
  - [ ] Exportação de dados
- [ ] **Relatórios**
  - [ ] Geração de PDF
  - [ ] Relatórios em Excel
  - [ ] Agendamento de relatórios

### 🔍 Funcionalidades Avançadas

- [ ] **Sistema de busca global**
  - [ ] Busca em tempo real
  - [ ] Filtros avançados
  - [ ] Histórico de buscas
- [ ] **Sistema de anexos**
  - [ ] Upload de múltiplos arquivos
  - [ ] Preview de arquivos
  - [ ] Compressão de imagens
- [ ] **Sistema de comentários**
  - [ ] Comentários em tickets
  - [ ] Menções de usuários
  - [ ] Notificações de comentários

### 📱 PWA e Mobile

- [ ] **Implementar PWA**
  - [ ] Service Worker
  - [ ] Manifest.json
  - [ ] Cache offline
- [ ] **Otimização mobile**
  - [ ] Touch gestures
  - [ ] Swipe actions
  - [ ] Pull to refresh

## 🎯 TODOs - Backend

### 🔐 Autenticação e Autorização

- [ ] **Sistema de autenticação**
  - [ ] JWT tokens
  - [ ] Refresh tokens
  - [ ] Password hashing (bcrypt)
  - [ ] Rate limiting
- [ ] **Sistema de permissões**
  - [ ] Roles e permissions
  - [ ] Middleware de autorização
  - [ ] Audit logs

### 🗄️ Banco de Dados

- [ ] **Modelagem de dados**
  - [ ] Users e roles
  - [ ] Products e categories
  - [ ] Budgets e items
  - [ ] Tickets e messages
  - [ ] Representatives e sales
- [ ] **Migrations e seeds**
  - [ ] Scripts de migração
  - [ ] Dados iniciais
  - [ ] Backup automático

### 🔌 APIs

- [ ] **Endpoints de autenticação**
  - [ ] POST /auth/login
  - [ ] POST /auth/refresh
  - [ ] POST /auth/logout
  - [ ] POST /auth/forgot-password
- [ ] **CRUD de usuários**
  - [ ] GET /users
  - [ ] POST /users
  - [ ] PUT /users/:id
  - [ ] DELETE /users/:id
- [ ] **CRUD de produtos**
  - [ ] GET /products
  - [ ] POST /products
  - [ ] PUT /products/:id
  - [ ] DELETE /products/:id
- [ ] **CRUD de orçamentos**
  - [ ] GET /budgets
  - [ ] POST /budgets
  - [ ] PUT /budgets/:id
  - [ ] DELETE /budgets/:id
- [ ] **CRUD de tickets**
  - [ ] GET /tickets
  - [ ] POST /tickets
  - [ ] PUT /tickets/:id
  - [ ] DELETE /tickets/:id

### 📁 Upload e Storage

- [ ] **Sistema de upload**
  - [ ] Upload de arquivos
  - [ ] Validação de tipos
  - [ ] Compressão de imagens
  - [ ] Storage em cloud (AWS S3)
- [ ] **Gerenciamento de arquivos**
  - [ ] Organização por módulos
  - [ ] Limpeza automática
  - [ ] Backup de arquivos

### 📧 Notificações

- [ ] **Sistema de emails**
  - [ ] Templates de email
  - [ ] Fila de emails
  - [ ] Notificações automáticas
- [ ] **Webhooks**
  - [ ] Integração com sistemas externos
  - [ ] Notificações em tempo real

### 📊 Relatórios e Analytics

- [ ] **Geração de relatórios**
  - [ ] PDF generation
  - [ ] Excel export
  - [ ] Gráficos e dashboards
- [ ] **Analytics**
  - [ ] Tracking de uso
  - [ ] Métricas de performance
  - [ ] Logs de auditoria

## 🧪 Testes

### Frontend

- [ ] **Testes unitários**
  - [ ] Jest + React Testing Library
  - [ ] Testes de componentes
  - [ ] Testes de hooks
- [ ] **Testes de integração**
  - [ ] Testes de fluxos completos
  - [ ] Testes de API
- [ ] **Testes E2E**
  - [ ] Playwright ou Cypress
  - [ ] Testes de regressão

### Backend

- [ ] **Testes unitários**
  - [ ] Jest para Node.js
  - [ ] Testes de services
  - [ ] Testes de models
- [ ] **Testes de integração**
  - [ ] Testes de API
  - [ ] Testes de banco de dados
- [ ] **Testes de performance**
  - [ ] Load testing
  - [ ] Stress testing

## 🚀 DevOps e Deploy

### CI/CD

- [ ] **Pipeline de CI/CD**
  - [ ] GitHub Actions ou GitLab CI
  - [ ] Build automático
  - [ ] Testes automáticos
  - [ ] Deploy automático
- [ ] **Ambientes**
  - [ ] Desenvolvimento
  - [ ] Staging
  - [ ] Produção

### Infraestrutura

- [ ] **Containerização**
  - [ ] Docker para frontend
  - [ ] Docker para backend
  - [ ] Docker Compose
- [ ] **Deploy**
  - [ ] Vercel para frontend
  - [ ] Railway/Render para backend
  - [ ] Banco de dados PostgreSQL

## 📈 Melhorias de Performance

### Frontend

- [ ] **Otimizações**
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Memoização de componentes
  - [ ] Bundle optimization
- [ ] **SEO**
  - [ ] Meta tags dinâmicas
  - [ ] Sitemap
  - [ ] Robots.txt

### Backend

- [ ] **Otimizações**
  - [ ] Caching (Redis)
  - [ ] Database indexing
  - [ ] Query optimization
  - [ ] Rate limiting

## 🔒 Segurança

- [ ] **Proteções**
  - [ ] CORS configuration
  - [ ] Helmet.js
  - [ ] Input validation
  - [ ] SQL injection prevention
- [ ] **Monitoramento**
  - [ ] Logs de segurança
  - [ ] Alertas de intrusão
  - [ ] Backup automático

## 📚 Documentação

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI
  - [ ] Postman collections
- [ ] **Documentação técnica**
  - [ ] Arquitetura
  - [ ] Deploy
  - [ ] Troubleshooting

---

**Status**: ✅ Funcional - Dashboard com Dark Mode implementado com sucesso!
**Próximo Milestone**: 🔐 Implementar autenticação e serviços de API
