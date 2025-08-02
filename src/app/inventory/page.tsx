'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import inventoryData from '@/mocks/inventory.json';
import { InventoryFilters, InventoryMovement } from '@/types/inventory';
import { Add, ArrowDownward, ArrowUpward, Search } from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function InventoryPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<InventoryFilters>({
    codigoProduto: '',
    descricao: '',
    tipo: '',
    dataInicial: null,
    dataFinal: null,
  });

  const columns: Column[] = [
    {
      id: 'codigoProduto',
      label: 'Código do Produto',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'descricao',
      label: 'Descrição',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'quantidade',
      label: 'Quantidade',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {value as number}
        </Typography>
      ),
    },
    {
      id: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (value) => {
        const isEntrada = value === 'entrada';
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
      id: 'data',
      label: 'Data (Entrada/Saída)',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'motivo',
      label: 'Motivo',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'responsavel',
      label: 'Responsável',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
  ];

  // Filtrar movimentações baseado nos filtros aplicados
  const filteredMovements = useMemo(() => {
    return (inventoryData.movements as InventoryMovement[]).filter((movement) => {
      const codigoMatch =
        !filters.codigoProduto ||
        filters.codigoProduto.trim() === '' ||
        movement.codigoProduto.toLowerCase().includes(filters.codigoProduto.toLowerCase());

      const descricaoMatch =
        !filters.descricao ||
        filters.descricao.trim() === '' ||
        movement.descricao.toLowerCase().includes(filters.descricao.toLowerCase());

      const tipoMatch =
        !filters.tipo || filters.tipo.trim() === '' || movement.tipo === filters.tipo;

      // Filtro de data
      let dataMatch = true;
      if (filters.dataInicial || filters.dataFinal) {
        const dataMovimento = new Date(movement.data);

        if (filters.dataInicial && filters.dataFinal) {
          dataMatch = dataMovimento >= filters.dataInicial && dataMovimento <= filters.dataFinal;
        } else if (filters.dataInicial) {
          dataMatch = dataMovimento >= filters.dataInicial;
        } else if (filters.dataFinal) {
          dataMatch = dataMovimento <= filters.dataFinal;
        }
      }

      return codigoMatch && descricaoMatch && tipoMatch && dataMatch;
    });
  }, [filters]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters({
      codigoProduto: (newFilters.codigoProduto as string) || '',
      descricao: (newFilters.descricao as string) || '',
      tipo: (newFilters.tipo as string) || '',
      dataInicial: (newFilters.dataInicial as Date) || null,
      dataFinal: (newFilters.dataFinal as Date) || null,
    });
  };

  const clearFilters = () => {
    setFilters({
      codigoProduto: '',
      descricao: '',
      tipo: '',
      dataInicial: null,
      dataFinal: null,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNewMovement = () => {
    router.push('/inventory/new');
  };

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'codigoProduto',
      type: 'text',
      label: 'Código do Produto',
      placeholder: 'Digite o código do produto',
      startAdornment: <Search />,
    },
    {
      id: 'descricao',
      type: 'text',
      label: 'Descrição do Produto',
      placeholder: 'Digite a descrição do produto',
      startAdornment: <Search />,
    },
    {
      id: 'tipo',
      type: 'select',
      label: 'Tipo de Movimentação',
      options: [
        { value: '', label: 'Todos' },
        { value: 'entrada', label: 'Entrada' },
        { value: 'saida', label: 'Saída' },
      ],
    },
    {
      id: 'dataInicial',
      type: 'date',
      label: 'Data Inicial',
    },
    {
      id: 'dataFinal',
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
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={false}
          resultsCount={filteredMovements.length}
          resultsLabel="movimentação(ões) encontrada(s)"
        />

        {/* Tabela de Movimentações */}
        <DataTable
          columns={columns}
          data={filteredMovements}
          title="Movimentações de Estoque"
          emptyMessage="Nenhuma movimentação encontrada com os filtros aplicados."
          getRowKey={(row) => (row.id as string) || String(row)}
        />
      </Box>
    </DashboardLayout>
  );
}
