'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { Product, ProductFilters } from '@/features/products/types';
import { Search } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function CatalogPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    code: '',
    name: '',
    supplier: '',
  });

  const columns: Column<Product>[] = [
    {
      id: 'code',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'name',
      label: 'Nome do Produto',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Descrição',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'price',
      label: 'Preço',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'stockQuantity',
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
      id: 'lastSaleAt',
      label: 'Última Venda',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'supplier',
      label: 'Fornecedor',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      ),
    },
  ];

  const { data, isLoading } = useProductsQuery(filters);
  const filteredProducts = data ?? [];

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Catálogo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie e visualize os produtos do seu catálogo.
        </Typography>

        {/* Filtros Customizados */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Filtros de Busca
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código do Produto"
                  placeholder="Digite o código do produto"
                  value={filters.code}
                  onChange={(e) => handleFilterChange({ ...filters, code: e.target.value })}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nome do Produto"
                  placeholder="Digite o nome do produto"
                  value={filters.name}
                  onChange={(e) => handleFilterChange({ ...filters, name: e.target.value })}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fornecedor"
                  placeholder="Digite o nome do fornecedor"
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange({ ...filters, supplier: e.target.value })}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} produto(s) encontrado(s)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            title="Produtos do Catálogo"
            emptyMessage="Nenhum produto encontrado com os filtros aplicados."
          />
        )}
      </Box>
    </DashboardLayout>
  );
}
