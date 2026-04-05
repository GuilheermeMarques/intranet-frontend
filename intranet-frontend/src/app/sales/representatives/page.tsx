'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import representativesData from '@/mocks/representatives.json';
import { Avatar, Box, Button, Chip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

export default function RepresentativesPage() {
  const [filters, setFilters] = useState({
    name: '',
    region: '',
    status: '',
  });

  // Extrair listas únicas de regiões e status dos dados
  const regions = useMemo(() => {
    return representativesData.regions;
  }, []);

  const statusOptions = useMemo(() => {
    return representativesData.statusOptions;
  }, []);

  // Aplicar filtros
  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as typeof filters);
  };

  // Filtrar representantes baseado nos filtros aplicados
  const filteredRepresentatives = useMemo(() => {
    return representativesData.representatives.filter((representative) => {
      const nameMatch =
        !filters.name ||
        (filters.name as string).trim() === '' ||
        representative.name.toLowerCase().includes((filters.name as string).toLowerCase());

      const regionMatch =
        !filters.region ||
        (filters.region as string).trim() === '' ||
        representative.region === filters.region;

      const statusMatch =
        !filters.status ||
        (filters.status as string).trim() === '' ||
        representative.status === filters.status;

      return nameMatch && regionMatch && statusMatch;
    });
  }, [filters]);

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'vacation':
        return 'warning';
      case 'training':
        return 'info';
      default:
        return 'default';
    }
  };

  // Função para traduzir o status
  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status);
    return statusOption ? statusOption.label : status;
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular percentual de meta
  const calculateGoalPercentage = (totalSales: number, monthlyGoal: number) => {
    return Math.round((totalSales / monthlyGoal) * 100);
  };

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'name',
      type: 'text',
      label: 'Nome do Representante',
      placeholder: 'Digite o nome do representante',
    },
    {
      id: 'region',
      type: 'select',
      label: 'Região',
      options: regions.map((region) => ({ value: region, label: region })),
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: statusOptions,
    },
  ];

  // Configuração das colunas da tabela
  const columns: Column[] = [
    {
      id: 'name',
      label: 'Representante',
      sortable: true,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.8rem' }}>
            {row.avatar as string}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {value as string}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email as string}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'region',
      label: 'Região',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={getStatusLabel(value as string)}
          color={
            getStatusColor(value as string) as 'success' | 'error' | 'warning' | 'info' | 'default'
          }
          size="small"
        />
      ),
    },
    {
      id: 'totalSales',
      label: 'Vendas',
      sortable: true,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatCurrency(value as number)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {calculateGoalPercentage(value as number, row.monthlyGoal as number)}% da meta
          </Typography>
        </Box>
      ),
    },
    {
      id: 'clientsCount',
      label: 'Clientes',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'lastActivity',
      label: 'Última Atividade',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
  ];

  const handleRowClick = (representative: Record<string, unknown>) => {
    // Implementar ação ao clicar na linha (ex: abrir modal de detalhes)
    console.log('Representante selecionado:', representative);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Representantes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os representantes de vendas da empresa.
            </Typography>
          </Box>
          <Button variant="contained" color="primary">
            Novo Representante
          </Button>
        </Box>

        {/* Filtros */}
        <FilterPanel
          title="Filtros de Representantes"
          fields={filterFields}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showClearButton={false}
          resultsCount={filteredRepresentatives.length}
          resultsLabel="representante(s) encontrado(s)"
        />

        {/* Tabela de Representantes */}
        <DataTable
          columns={columns}
          data={filteredRepresentatives as unknown as Record<string, unknown>[]}
          title="Representantes de Vendas"
          onRowClick={handleRowClick}
          emptyMessage="Nenhum representante encontrado com os filtros aplicados."
        />
      </Box>
    </DashboardLayout>
  );
}
