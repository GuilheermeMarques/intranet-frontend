# Mocks

Esta pasta contém todos os dados mockados utilizados no projeto para facilitar o desenvolvimento e testes.

## Estrutura

### `budgets.json`

Dados mockados para orçamentos, incluindo:

- Lista de orçamentos com informações completas
- Status, valores, clientes, responsáveis
- Datas de criação e atualização

### `products.json`

Dados mockados para produtos do catálogo, incluindo:

- Informações completas dos produtos
- Preços, estoque, fornecedores
- Códigos e descrições

### `tickets.json`

Dados mockados para chamados/tickets, incluindo:

- Lista de tickets com status e prioridades
- Mensagens e anexos
- Configurações de status e prioridade

### `settings.json`

Dados mockados para configurações, incluindo:

- Seções de configuração disponíveis
- Informações do usuário

### `home.json`

Dados mockados para a página inicial, incluindo:

- Estatísticas do dashboard
- Progresso de metas
- Atividade recente

### `representatives.json`

Dados mockados para representantes de vendas, incluindo:

- Lista de representantes
- Regiões e status disponíveis
- Metas e vendas

### `menu.json`

Dados mockados para o menu lateral, incluindo:

- Estrutura de navegação
- Ícones e links

### `theme.json`

Dados mockados para personalização de tema, incluindo:

- Opções de cores disponíveis
- Configurações de tema

## Como usar

Para usar os mocks em um componente:

```typescript
import mockData from '@/mocks/nome-do-mock.json';

// Usar os dados
const data = mockData.campo;
```

## Manutenção

Quando for necessário integrar com o backend:

1. **Substitua as importações**: Troque `import mockData from '@/mocks/...'` por chamadas de API
2. **Mantenha a estrutura**: Use a mesma estrutura de dados dos mocks para facilitar a transição
3. **Atualize os tipos**: Certifique-se de que os tipos TypeScript estão alinhados com a API

## Benefícios

- **Desenvolvimento independente**: Permite desenvolver frontend sem depender do backend
- **Consistência**: Dados padronizados em todo o projeto
- **Facilita testes**: Dados previsíveis para testes
- **Documentação**: Serve como documentação da estrutura de dados esperada
