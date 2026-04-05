# 📋 Módulo de Clientes

## 🎯 Funcionalidades

O módulo de Clientes permite gerenciar e visualizar a base de clientes da empresa com funcionalidades avançadas de filtros e busca.

### ✅ Funcionalidades Implementadas

- **Listagem de Clientes**: Tabela dinâmica com paginação e ordenação
- **Filtros Avançados**:
  - Busca por código do cliente
  - Busca por nome do cliente
  - Filtro por cidade (lista de todas as cidades disponíveis)
  - Filtro por período de última compra (data inicial e final)
- **Tabela Responsiva**: Com colunas organizadas e formatação adequada
- **Contador de Resultados**: Mostra quantos clientes foram encontrados
- **Limpeza de Filtros**: Botão para limpar todos os filtros aplicados

## 📊 Estrutura da Tabela

A tabela de clientes exibe as seguintes colunas:

| Coluna                    | Tipo   | Descrição                                              |
| ------------------------- | ------ | ------------------------------------------------------ |
| **Código**                | String | Código único do cliente (chip colorido)                |
| **Nome**                  | String | Nome completo do cliente                               |
| **Cidade**                | String | Cidade do cliente (com ícone de localização)           |
| **Data Última Compra**    | Date   | Data da última compra (formato brasileiro)             |
| **Quantidade de Compras** | Number | Total de compras realizadas (chip colorido por volume) |

### 🎨 Formatação Visual

- **Código**: Chip azul com borda
- **Cidade**: Ícone de localização + texto
- **Quantidade de Compras**:
  - Verde: > 15 compras
  - Amarelo: 10-15 compras
  - Cinza: < 10 compras

## 🔍 Sistema de Filtros

### Filtros Disponíveis

1. **Código do Cliente**
   - Tipo: Texto
   - Busca parcial (case-insensitive)
   - Ícone de busca

2. **Nome do Cliente**
   - Tipo: Texto
   - Busca parcial (case-insensitive)
   - Ícone de busca

3. **Cidade**
   - Tipo: Select
   - Lista de todas as cidades disponíveis na base
   - Opção "Todas as cidades" para remover filtro

4. **Data Inicial**
   - Tipo: Date Picker
   - Filtra clientes com última compra a partir desta data

5. **Data Final**
   - Tipo: Date Picker
   - Filtra clientes com última compra até esta data

### 🔄 Comportamento dos Filtros

- **Filtros de Texto**: Busca parcial em tempo real
- **Filtro de Cidade**: Busca exata
- **Filtros de Data**:
  - Se apenas data inicial: clientes com compra >= data
  - Se apenas data final: clientes com compra <= data
  - Se ambas: clientes com compra entre as datas
- **Combinação**: Todos os filtros são aplicados simultaneamente (AND)

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   └── clients/
│       ├── page.tsx          # Página principal do módulo
│       └── README.md         # Esta documentação
├── mocks/
│   └── clients.json          # Dados mockados dos clientes
└── types/
    └── client.ts             # Tipos TypeScript para clientes
```

## 🗄️ Dados Mockados

### Estrutura dos Dados

```json
{
  "clients": [
    {
      "codigo": "CLI001",
      "nome": "João Silva",
      "cidade": "São Paulo",
      "dataUltimaCompra": "2024-01-15",
      "quantidadeCompras": 12
    }
  ],
  "cidades": ["São Paulo", "Rio de Janeiro", ...]
}
```

### Estatísticas dos Dados

- **Total de Clientes**: 15 clientes
- **Cidades Disponíveis**: 10 cidades diferentes
- **Período de Dados**: Janeiro 2024
- **Faixa de Compras**: 5 a 22 compras por cliente

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React
- **Material UI**: Componentes de interface
- **TypeScript**: Tipagem estática
- **date-fns**: Manipulação de datas
- **React Hook Form**: Gerenciamento de formulários

## 🎨 Design System

O módulo segue o design system estabelecido no projeto:

- **Paleta de Cores**: Tons de azul e roxo (Materio)
- **Tipografia**: Inter como fonte principal
- **Componentes**: Cards, chips e formulários padronizados
- **Responsividade**: Layout adaptativo para mobile e desktop
- **Dark Mode**: Suporte completo ao tema escuro

## 🚀 Como Usar

1. **Acesse o Menu**: Clique em "Clientes" no menu lateral
2. **Aplique Filtros**: Use os campos de filtro para refinar a busca
3. **Visualize Resultados**: A tabela mostra os clientes filtrados
4. **Ordene Dados**: Clique nos cabeçalhos das colunas para ordenar
5. **Navegue**: Use a paginação para ver mais resultados
6. **Limpe Filtros**: Use o botão "Limpar Filtros" para resetar

## 🔧 Personalização

### Adicionar Novos Filtros

Para adicionar novos filtros, edite o array `filterFields` em `page.tsx`:

```typescript
const filterFields: FilterField[] = [
  // ... filtros existentes
  {
    id: 'novoFiltro',
    type: 'text', // ou 'select', 'date'
    label: 'Novo Filtro',
    // ... outras propriedades
  },
];
```

### Modificar Colunas da Tabela

Para modificar as colunas, edite o array `columns` em `page.tsx`:

```typescript
const columns: Column[] = [
  // ... colunas existentes
  {
    id: 'novaColuna',
    label: 'Nova Coluna',
    sortable: true,
    render: (value) => <SeuComponente value={value} />,
  },
];
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Filtros não funcionam**: Verifique se os tipos de dados estão corretos
2. **Datas não filtram**: Certifique-se de que as datas estão no formato correto
3. **Tabela vazia**: Verifique se os dados mockados estão sendo carregados

### Logs de Debug

Para debug, adicione logs no console:

```typescript
console.log('Filtros aplicados:', filters);
console.log('Clientes filtrados:', filteredClients);
```

## 📈 Próximas Melhorias

- [ ] **Exportação de Dados**: PDF e Excel
- [ ] **Gráficos**: Distribuição por cidade, volume de compras
- [ ] **Detalhes do Cliente**: Modal com informações completas
- [ ] **Histórico de Compras**: Visualização detalhada
- [ ] **Integração com API**: Substituir dados mockados
- [ ] **Filtros Avançados**: Mais opções de busca
- [ ] **Bulk Actions**: Ações em lote para múltiplos clientes

---

**Status**: ✅ Implementado e Funcional
**Última Atualização**: Janeiro 2024
**Versão**: 1.0.0
