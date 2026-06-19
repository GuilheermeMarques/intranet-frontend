'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import { useInventoryQuery } from '@/features/inventory/hooks/useInventoryQuery';
import { InventoryFilters } from '@/features/inventory/types';
import { formatDateTime as formatDate } from '@/shared/utils/formatDate';
import { Add, ArrowDownward, ArrowUpward, Search } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function InventoryPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<InventoryFilters>({
    productCode: '',
    description: '',
    type: '',
    startDate: null,
    endDate: null,
  });

  const columns: Column[] = [
    {
      id: 'productCode',
      label: 'Código do Produto',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'description',
      label: 'Descrição',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantidade',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {value as number}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Tipo',
      sortable: true,
      render: (value) => {
        const isEntrada = value === 'inbound';
        return (
          <Chip
            label={isEntrada ? 'Entrada' : 'Saída'}
            size="small"
            color={isEntrada ? 'success' : 'error'}
            icon={isEntrada ? <ArrowDownward /> : <ArrowUpward />}
            variant="filled"
          />
        );
      },
    },
    {
      id: 'occurredAt',
      label: 'Data (Entrada/Saída)',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'reason',
      label: 'Motivo',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {(value as string) || '-'}
        </Typography>
      ),
    },
    {
      id: 'handledBy',
      label: 'Responsável',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {(value as string) || '-'}
        </Typography>
      ),
    },
  ];

  const { data, isLoading } = useInventoryQuery(filters);
  const filteredMovements = data?.movements ?? [];

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters({
      productCode: (newFilters.productCode as string) || '',
      description: (newFilters.description as string) || '',
      type: (newFilters.type as string) || '',
      startDate: (newFilters.startDate as Date) || null,
      endDate: (newFilters.endDate as Date) || null,
    });
  };

  const clearFilters = () => {
    setFilters({
      productCode: '',
      description: '',
      type: '',
      startDate: null,
      endDate: null,
    });
  };

  const handleNewMovement = () => {
    router.push('/inventory/new');
  };

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'productCode',
      type: 'text',
      label: 'Código do Produto',
      placeholder: 'Digite o código do produto',
      startAdornment: <Search />,
    },
    {
      id: 'description',
      type: 'text',
      label: 'Descrição do Produto',
      placeholder: 'Digite a descrição do produto',
      startAdornment: <Search />,
    },
    {
      id: 'type',
      type: 'select',
      label: 'Tipo de Movimentação',
      options: [
        { value: '', label: 'Todos' },
        { value: 'inbound', label: 'Entrada' },
        { value: 'outbound', label: 'Saída' },
      ],
    },
    {
      id: 'startDate',
      type: 'date',
      label: 'Data Inicial',
    },
    {
      id: 'endDate',
      type: 'date',
      label: 'Data Final',
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Estoque
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Controle de entrada e saída de produtos do estoque.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewMovement}
            sx={{ minWidth: 200 }}
          >
            Nova Movimentação
          </Button>
        </Box>

        {/* Filtros */}
        <FilterPanel
          title="Filtros de Busca"
          fields={filterFields}
          filters={filters as unknown as Record<string, unknown>}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={false}
          resultsCount={filteredMovements.length}
          resultsLabel="movimentação(ões) encontrada(s)"
        />

        {/* Tabela de Movimentações */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredMovements as unknown as Record<string, unknown>[]}
            title="Movimentações de Estoque"
            emptyMessage="Nenhuma movimentação encontrada com os filtros aplicados."
            getRowKey={(row) => (row.id as string) || String(row)}
          />
        )}
      </Box>
    </DashboardLayout>
  );
}
