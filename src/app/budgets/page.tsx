'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import budgetsData from '@/mocks/budgets.json';
import { Budget } from '@/types/budget';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

export default function BudgetsPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({
    budgetNumber: '',
    client: '',
    responsible: '',
    status: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  // Extrair listas únicas de clientes e responsáveis dos dados
  const clients = useMemo(() => {
    const uniqueClients = [...new Set(budgetsData.budgets.map((budget) => budget.client))];
    return uniqueClients.sort();
  }, []);

  const responsibles = useMemo(() => {
    const uniqueResponsibles = [
      ...new Set(budgetsData.budgets.map((budget) => budget.responsible)),
    ];
    return uniqueResponsibles.sort();
  }, []);

  // Aplicar filtros
  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
  };

  // Filtrar orçamentos baseado nos filtros aplicados
  const filteredBudgets = useMemo(() => {
    return (budgetsData.budgets as Budget[]).filter((budget) => {
      const budgetNumberMatch =
        !filters.budgetNumber ||
        (filters.budgetNumber as string).trim() === '' ||
        budget.number.toLowerCase().includes((filters.budgetNumber as string).toLowerCase());

      const clientMatch =
        !filters.client ||
        (filters.client as string).trim() === '' ||
        budget.client === filters.client;

      const responsibleMatch =
        !filters.responsible ||
        (filters.responsible as string).trim() === '' ||
        budget.responsible === filters.responsible;

      const statusMatch =
        !filters.status ||
        (filters.status as string).trim() === '' ||
        budget.status === filters.status;

      const startDateMatch =
        !filters.startDate || new Date(budget.createdAt) >= new Date(filters.startDate as Date);

      const endDateMatch =
        !filters.endDate || new Date(budget.createdAt) <= new Date(filters.endDate as Date);

      return (
        budgetNumberMatch &&
        clientMatch &&
        responsibleMatch &&
        statusMatch &&
        startDateMatch &&
        endDateMatch
      );
    });
  }, [filters]);

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  // Função para traduzir o status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'budgetNumber',
      type: 'text',
      label: 'Número do Orçamento',
      placeholder: 'Digite o número do orçamento',
    },
    {
      id: 'client',
      type: 'select',
      label: 'Cliente',
      options: clients.map((client) => ({ value: client, label: client })),
    },
    {
      id: 'responsible',
      type: 'select',
      label: 'Responsável',
      options: responsibles.map((responsible) => ({ value: responsible, label: responsible })),
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pendente' },
        { value: 'approved', label: 'Aprovado' },
        { value: 'rejected', label: 'Rejeitado' },
        { value: 'expired', label: 'Expirado' },
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

  // Configuração das colunas da tabela
  const columns: Column[] = [
    {
      id: 'number',
      label: 'Número',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'client',
      label: 'Cliente',
      sortable: true,
    },
    {
      id: 'responsible',
      label: 'Responsável',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={getStatusLabel(value as string)}
          color={getStatusColor(value as string) as 'warning' | 'success' | 'error' | 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'total',
      label: 'Valor Total',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'items',
      label: 'Itens',
      sortable: false,
      render: (value) => `${(value as unknown[]).length} produto(s)`,
    },
  ];

  const handleRowClick = (budget: Record<string, unknown>) => {
    // Implementar ação ao clicar na linha (ex: abrir modal de detalhes)
    console.log('Orçamento selecionado:', budget as unknown as Budget);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Orçamentos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os orçamentos da empresa.
            </Typography>
          </Box>
          <Button variant="contained" color="primary">
            Novo Orçamento
          </Button>
        </Box>

        {/* Filtros */}
        <FilterPanel
          title="Filtros de Orçamentos"
          fields={filterFields}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showClearButton={false}
          resultsCount={filteredBudgets.length}
          resultsLabel="orçamento(s) encontrado(s)"
        />

        {/* Tabela de Orçamentos */}
        <DataTable
          columns={columns}
          data={filteredBudgets as unknown as Record<string, unknown>[]}
          title="Orçamentos"
          onRowClick={handleRowClick}
          emptyMessage="Nenhum orçamento encontrado com os filtros aplicados."
        />
      </Box>
    </DashboardLayout>
  );
}
