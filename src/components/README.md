# Componentes Reutilizáveis

Este diretório contém componentes reutilizáveis que seguem o padrão de design da aplicação.

## Modal

Componente reutilizável para modais na aplicação, baseado no Material-UI Dialog com funcionalidades adicionais.

### Componentes Disponíveis

- **Modal**: Componente base para qualquer tipo de modal
- **ConfirmModal**: Modal específico para confirmações
- **FormModal**: Modal específico para formulários

### Uso Básico

```typescript
import { Modal, ConfirmModal, FormModal } from '@/components/Modal';

// Modal base
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Título do Modal"
  actions={[
    { label: 'Cancelar', onClick: () => setOpen(false), variant: 'text' },
    { label: 'Salvar', onClick: handleSave, variant: 'contained' },
  ]}
>
  <Typography>Conteúdo do modal</Typography>
</Modal>

// Modal de confirmação
<ConfirmModal
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Confirmar Exclusão"
  message="Tem certeza que deseja excluir este item?"
  confirmColor="error"
/>

// Modal de formulário
<FormModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={handleSubmit}
  title="Novo Item"
  submitLabel="Criar"
  disabled={!isValid}
>
  <TextField label="Nome" />
</FormModal>
```

Para documentação completa, consulte [Modal/README.md](./Modal/README.md).

## FilterPanel

Componente para painéis de filtros padronizados.

### Props

```typescript
interface FilterPanelProps {
  title?: string; // Título do painel (padrão: "Filtros de Busca")
  fields: FilterField[]; // Array de campos de filtro
  filters: Record<string, any>; // Estado atual dos filtros
  onFiltersChange: (filters: Record<string, any>) => void; // Callback quando filtros mudam
  onClearFilters?: () => void; // Callback para limpar filtros (opcional)
  showClearButton?: boolean; // Mostrar botão limpar (padrão: true)
  clearButtonText?: string; // Texto do botão limpar (padrão: "Limpar Filtros")
  showResultsCount?: boolean; // Mostrar contador de resultados (padrão: true)
  resultsCount?: number; // Número de resultados encontrados
  resultsLabel?: string; // Label para contador (padrão: "item(s) encontrado(s)")
}
```

### Tipos de Campo

```typescript
interface FilterField {
  id: string; // ID único do campo
  type: 'text' | 'select' | 'date' | 'custom'; // Tipo do campo
  label: string; // Label do campo
  placeholder?: string; // Placeholder (apenas para text)
  options?: { value: string; label: string }[]; // Opções (apenas para select)
  startAdornment?: ReactNode; // Ícone ou elemento no início (apenas para text)
  customRender?: () => ReactNode; // Renderização customizada (apenas para custom)
}
```

### Exemplo de Uso

```typescript
import { FilterPanel, FilterField } from '@/components/FilterPanel';
import { Search } from '@mui/icons-material';

const filterFields: FilterField[] = [
  {
    id: 'search',
    type: 'text',
    label: 'Buscar',
    placeholder: 'Digite para buscar...',
    startAdornment: <Search />,
  },
  {
    id: 'category',
    type: 'select',
    label: 'Categoria',
    options: [
      { value: 'cat1', label: 'Categoria 1' },
      { value: 'cat2', label: 'Categoria 2' },
    ],
  },
  {
    id: 'startDate',
    type: 'date',
    label: 'Data Inicial',
  },
];

<FilterPanel
  title="Filtros de Produtos"
  fields={filterFields}
  filters={filters}
  onFiltersChange={setFilters}
  resultsCount={filteredItems.length}
  resultsLabel="produto(s) encontrado(s)"
/>
```

## DataTable

Componente para tabelas de dados padronizadas com ordenação, paginação e filtros.

### Props

```typescript
interface DataTableProps {
  columns: Column[]; // Array de colunas
  data: any[]; // Dados da tabela
  title?: string; // Título da tabela
  itemsPerPage?: number; // Itens por página (padrão: 20)
  itemsPerPageOptions?: number[]; // Opções de itens por página (padrão: [20, 60, 100])
  onRowClick?: (row: any) => void; // Callback ao clicar na linha
  getRowKey?: (row: any) => string; // Função para obter chave única (padrão: row.id)
  emptyMessage?: string; // Mensagem quando não há dados (padrão: "Nenhum item encontrado.")
  showItemsPerPage?: boolean; // Mostrar seletor de itens por página (padrão: true)
}
```

### Configuração de Colunas

```typescript
interface Column {
  id: string; // ID da coluna (deve corresponder à propriedade dos dados)
  label: string; // Label da coluna
  render?: (value: any, row: any) => ReactNode; // Renderização customizada
  sortable?: boolean; // Se a coluna é ordenável (padrão: false)
}
```

### Exemplo de Uso

```typescript
import { DataTable, Column } from '@/components/DataTable';
import { Chip, Typography } from '@mui/material';

const columns: Column[] = [
  {
    id: 'id',
    label: 'ID',
    sortable: true,
    render: (value) => (
      <Chip label={value} size="small" color="primary" variant="outlined" />
    ),
  },
  {
    id: 'name',
    label: 'Nome',
    sortable: true,
    render: (value) => (
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    ),
  },
  {
    id: 'price',
    label: 'Preço',
    sortable: true,
    render: (value) => (
      <Typography variant="body2" fontWeight={600} color="primary">
        {formatCurrency(value)}
      </Typography>
    ),
  },
];

<DataTable
  columns={columns}
  data={items}
  title="Lista de Itens"
  onRowClick={(item) => console.log('Item clicado:', item)}
  emptyMessage="Nenhum item encontrado."
/>
```

## Padrões de Uso

### 1. Filtros com DataTable

```typescript
const [filters, setFilters] = useState({
  search: '',
  category: '',
  date: null,
});

const [data, setData] = useState([]);

const handleFiltersChange = (newFilters) => {
  setFilters(newFilters);
  // Aplicar filtros aos dados
  const filtered = applyFilters(rawData, newFilters);
  setData(filtered);
};

return (
  <>
    <FilterPanel
      fields={filterFields}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      resultsCount={data.length}
    />
    <DataTable
      columns={columns}
      data={data}
      title="Dados Filtrados"
    />
  </>
);
```

### 2. Renderização Customizada

```typescript
const columns: Column[] = [
  {
    id: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <Chip
        label={getStatusLabel(value)}
        color={getStatusColor(value)}
        size="small"
      />
    ),
  },
  {
    id: 'actions',
    label: 'Ações',
    sortable: false,
    render: (value, row) => (
      <Button
        size="small"
        onClick={() => handleEdit(row)}
      >
        Editar
      </Button>
    ),
  },
];
```

### 3. Integração com APIs

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

const loadData = async (filters) => {
  setLoading(true);
  try {
    const response = await api.getData(filters);
    setData(response.data);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData(filters);
}, [filters]);
```

## Benefícios

1. **Consistência**: Todos os filtros e tabelas seguem o mesmo padrão visual
2. **Reutilização**: Componentes podem ser usados em múltiplas telas
3. **Manutenibilidade**: Mudanças no design são aplicadas automaticamente
4. **Performance**: Componentes otimizados com memoização
5. **Acessibilidade**: Seguem padrões de acessibilidade do Material-UI
6. **Responsividade**: Layout adaptável para diferentes tamanhos de tela
