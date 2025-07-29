'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import productsData from '@/mocks/products.json';
import { Search } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

export default function CatalogPage() {
  const [filters, setFilters] = useState({
    codigoProduto: '',
    nomeProduto: '',
    fornecedor: '',
  });

  const columns: Column[] = [
    {
      id: 'codigoProduto',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'nomeProduto',
      label: 'Nome do Produto',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'descricaoProduto',
      label: 'Descrição',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'preco',
      label: 'Preço',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'quantidadeEstoque',
      label: 'Estoque',
      sortable: true,
      render: (value) => (
        <Chip
          label={value as string}
          size="small"
          color={(value as number) > 10 ? 'success' : (value as number) > 5 ? 'warning' : 'error'}
        />
      ),
    },
    {
      id: 'ultimaDataVenda',
      label: 'Última Venda',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'fornecedor',
      label: 'Fornecedor',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      ),
    },
  ];

  // Filtrar produtos baseado nos filtros aplicados
  const filteredProducts = useMemo(() => {
    return productsData.products.filter((product) => {
      const codigoMatch =
        !filters.codigoProduto ||
        filters.codigoProduto.trim() === '' ||
        product.codigoProduto.toLowerCase().includes(filters.codigoProduto.toLowerCase());
      const nomeMatch =
        !filters.nomeProduto ||
        filters.nomeProduto.trim() === '' ||
        product.nomeProduto.toLowerCase().includes(filters.nomeProduto.toLowerCase());
      const fornecedorMatch =
        !filters.fornecedor ||
        filters.fornecedor.trim() === '' ||
        product.fornecedor.toLowerCase().includes(filters.fornecedor.toLowerCase());

      return codigoMatch && nomeMatch && fornecedorMatch;
    });
  }, [filters]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as typeof filters);
  };

  const clearFilters = () => {
    setFilters({
      codigoProduto: '',
      nomeProduto: '',
      fornecedor: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'codigoProduto',
      type: 'text',
      label: 'Código do Produto',
      startAdornment: <Search />,
    },
    {
      id: 'nomeProduto',
      type: 'text',
      label: 'Nome do Produto',
      startAdornment: <Search />,
    },
    {
      id: 'fornecedor',
      type: 'text',
      label: 'Fornecedor',
      startAdornment: <Search />,
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Catálogo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie e visualize os produtos do seu catálogo.
        </Typography>

        {/* Filtros */}
        <FilterPanel
          title="Filtros de Busca"
          fields={filterFields}
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
          resultsCount={filteredProducts.length}
          resultsLabel="produto(s) encontrado(s)"
        />

        {/* Tabela de Produtos */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          title="Produtos do Catálogo"
          emptyMessage="Nenhum produto encontrado com os filtros aplicados."
        />
      </Box>
    </DashboardLayout>
  );
}
