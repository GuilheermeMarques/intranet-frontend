# 🛠 Configurações de Desenvolvimento

Este documento descreve as configurações de desenvolvimento do projeto Intranet.

## 📦 Ferramentas Configuradas

### ESLint

- Configurado para Next.js, TypeScript e React
- Integração com Prettier
- Regras personalizadas para o projeto

### Prettier

- Formatação automática de código
- Configuração padronizada para o projeto

### VS Code

- Configurações automáticas para formatação
- Extensões recomendadas
- Auto-fix ao salvar

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build para produção
npm run start        # Inicia servidor de produção

# Linting e Formatação
npm run lint         # Verifica problemas de lint
npm run lint:fix     # Corrige problemas de lint automaticamente
npm run format       # Formata todos os arquivos
npm run format:check # Verifica se os arquivos estão formatados

# TypeScript
npm run type-check   # Verifica tipos TypeScript
```

## ⚙️ Configurações do VS Code

### Extensões Recomendadas

- **Prettier - Code formatter**: Formatação automática
- **ESLint**: Linting em tempo real
- **Tailwind CSS IntelliSense**: Autocomplete para Tailwind
- **TypeScript Importer**: Importações automáticas

### Configurações Automáticas

- Formatação automática ao salvar
- Correção automática de problemas ESLint
- Organização automática de imports

## 📝 Regras de Código

### Formatação

- **Indentação**: 2 espaços
- **Aspas**: Simples (`'`)
- **Ponto e vírgula**: Obrigatório
- **Vírgula final**: Sempre
- **Largura máxima**: 100 caracteres

### ESLint

- Variáveis não utilizadas: Aviso
- Imports não utilizados: Aviso
- React in JSX scope: Desabilitado (não necessário no Next.js)

## 🔧 Como Usar

### Formatação Automática

1. Abra o projeto no VS Code
2. Instale as extensões recomendadas
3. Salve qualquer arquivo para formatação automática

### Linting Manual

```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Formatar código
npm run format
```

### Git Hooks (Opcional)

Para configurar hooks do Git que executam lint/format automaticamente:

```bash
# Instalar husky e lint-staged
npm install --save-dev husky lint-staged

# Configurar husky
npx husky install

# Adicionar pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Adicione ao `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## 🎯 Boas Práticas

1. **Sempre salve arquivos** para formatação automática
2. **Execute `npm run lint`** antes de commits
3. **Use `npm run type-check`** para verificar tipos
4. **Mantenha imports organizados** (automático)
5. **Siga as regras de linting** para consistência

## 🔍 Solução de Problemas

### ESLint não funciona

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Prettier não formata

1. Verifique se a extensão está instalada
2. Configure o Prettier como formatador padrão
3. Reinicie o VS Code

### Conflitos de configuração

- Remova arquivos `.eslintrc.js` antigos
- Use apenas `.eslintrc.json`
- Verifique se não há configurações duplicadas
