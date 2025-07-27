'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import productsData from '@/mocks/products.json';
import { ArrowDownward, ArrowUpward, Clear, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useMemo, useState } from 'react';

export default function CatalogPage() {
  const [filters, setFilters] = useState({
    codigoProduto: '',
    nomeProduto: '',
    fornecedor: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const columns = [
    { id: 'codigoProduto', label: 'Código' },
    { id: 'nomeProduto', label: 'Nome do Produto' },
    { id: 'descricaoProduto', label: 'Descrição' },
    { id: 'preco', label: 'Preço' },
    { id: 'quantidadeEstoque', label: 'Estoque' },
    { id: 'ultimaDataVenda', label: 'Última Venda' },
    { id: 'fornecedor', label: 'Fornecedor' },
  ];

  const [orderBy, setOrderBy] = useState<string>('codigoProduto');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
    setCurrentPage(1);
  };

  function getComparator(order: 'asc' | 'desc', orderBy: string) {
    return (a: (typeof productsData.products)[0], b: (typeof productsData.products)[0]) => {
      let aValue = a[orderBy as keyof typeof a];
      let bValue = b[orderBy as keyof typeof b];
      if (orderBy === 'preco' || orderBy === 'quantidadeEstoque') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (orderBy === 'ultimaDataVenda') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    };
  }

  // Filtrar produtos baseado nos filtros aplicados
  const filteredProducts = useMemo(() => {
    return productsData.products.filter((product) => {
      const codigoMatch = product.codigoProduto
        .toLowerCase()
        .includes(filters.codigoProduto.toLowerCase());
      const nomeMatch = product.nomeProduto
        .toLowerCase()
        .includes(filters.nomeProduto.toLowerCase());
      const fornecedorMatch = product.fornecedor
        .toLowerCase()
        .includes(filters.fornecedor.toLowerCase());

      return codigoMatch && nomeMatch && fornecedorMatch;
    });
  }, [filters]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort(getComparator(order, orderBy));
  }, [filteredProducts, order, orderBy]);

  // Calcular paginação
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1); // Reset para primeira página quando filtrar
  };

  const clearFilters = () => {
    setFilters({
      codigoProduto: '',
      nomeProduto: '',
      fornecedor: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset para primeira página
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

        {/* Formulário de Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Filtros de Busca
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Código do Produto"
                  value={filters.codigoProduto}
                  onChange={(e) => handleFilterChange('codigoProduto', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nome do Produto"
                  value={filters.nomeProduto}
                  onChange={(e) => handleFilterChange('nomeProduto', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Fornecedor"
                  value={filters.fornecedor}
                  onChange={(e) => handleFilterChange('fornecedor', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" startIcon={<Clear />} onClick={clearFilters} fullWidth>
                  Limpar Filtros
                </Button>
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
        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Produtos do Catálogo</Typography>

              {/* Seletor de itens por página */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Itens por página</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Itens por página"
                  onChange={handleItemsPerPageChange}
                >
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                        {orderBy === col.id &&
                          (order === 'asc' ? (
                            <ArrowUpward
                              fontSize="small"
                              sx={{ verticalAlign: 'middle', ml: 0.5 }}
                            />
                          ) : (
                            <ArrowDownward
                              fontSize="small"
                              sx={{ verticalAlign: 'middle', ml: 0.5 }}
                            />
                          ))}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Chip
                          label={product.codigoProduto}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.nomeProduto}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.descricaoProduto}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {formatCurrency(product.preco)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.quantidadeEstoque}
                          size="small"
                          color={
                            product.quantidadeEstoque > 10
                              ? 'success'
                              : product.quantidadeEstoque > 5
                                ? 'warning'
                                : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(product.ultimaDataVenda)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.fornecedor}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredProducts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Nenhum produto encontrado com os filtros aplicados.
                </Typography>
              </Box>
            )}

            {/* Paginação */}
            {filteredProducts.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de{' '}
                  {filteredProducts.length} produtos
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Página {currentPage} de {totalPages}
                  </Typography>

                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
