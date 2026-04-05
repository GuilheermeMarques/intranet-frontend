'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import { FormModal } from '@/components/Modal';
import budgetsData from '@/mocks/budgets.json';
import productsData from '@/mocks/products.json';
import representativesData from '@/mocks/representatives.json';
import { Budget, BudgetFilters } from '@/types/budget';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

type Option = {
  value: string;
  label: string;
};

type NewBudgetItem = {
  productId: string;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type NewBudgetForm = {
  clientId: string;
  responsibleId: string;
  validityDate: string;
  items: NewBudgetItem[];
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildInitialBudget = (): NewBudgetForm => ({
  clientId: '',
  responsibleId: '',
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [],
});

const buildEmptyItem = (): NewBudgetItem => ({
  productId: '',
  productCode: '',
  productName: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

export default function BudgetsPage() {
  const [filters, setFilters] = useState<BudgetFilters>({
    budgetNumber: '',
    clientId: '',
    responsibleId: '',
    status: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<NewBudgetForm>(buildInitialBudget);

  const normalizedBudgets = useMemo<Budget[]>(() => {
    return budgetsData.budgets.map((budget) => {
      const matchedRepresentative = representativesData.representatives.find(
        (rep) => rep.name === budget.responsible,
      );

      return {
        id: budget.id,
        number: budget.number,
        clientId: `client-${slugify(budget.client)}`,
        clientName: budget.client,
        responsibleId:
          matchedRepresentative?.id ?? `representative-${slugify(budget.responsible)}`,
        responsibleName: budget.responsible,
        createdAt: budget.createdAt,
        status: budget.status as Budget['status'],
        total: budget.total,
        items: budget.items.map((item) => {
          const matchedProduct = productsData.products.find(
            (product) =>
              product.nomeProduto === item.product ||
              product.nomeProduto.includes(item.product) ||
              item.product.includes(product.nomeProduto),
          );

          return {
            id: item.id,
            productId: String(matchedProduct?.id ?? `product-${slugify(item.product)}`),
            productCode: matchedProduct?.codigoProduto,
            productName: matchedProduct?.nomeProduto ?? item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          };
        }),
      };
    });
  }, []);

  const clients = useMemo<Option[]>(() => {
    const clientMap = new Map<string, Option>();

    normalizedBudgets.forEach((budget) => {
      clientMap.set(budget.clientId, { value: budget.clientId, label: budget.clientName });
    });

    return Array.from(clientMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [normalizedBudgets]);

  const responsibles = useMemo<Option[]>(() => {
    const responsibleMap = new Map<string, Option>();

    normalizedBudgets.forEach((budget) => {
      responsibleMap.set(budget.responsibleId, {
        value: budget.responsibleId,
        label: budget.responsibleName,
      });
    });

    return Array.from(responsibleMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [normalizedBudgets]);

  const activeRepresentatives = useMemo<Option[]>(() => {
    return representativesData.representatives
      .filter((rep) => rep.status === 'active')
      .map((rep) => ({ value: rep.id, label: rep.name }));
  }, []);

  const handleOpenNewBudgetModal = () => {
    setIsNewBudgetModalOpen(true);
  };

  const handleCloseNewBudgetModal = () => {
    setIsNewBudgetModalOpen(false);
    setNewBudget(buildInitialBudget());
  };

  const handleNewBudgetChange = (field: keyof Omit<NewBudgetForm, 'items'>, value: string) => {
    setNewBudget((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddItem = () => {
    setNewBudget((prev) => ({
      ...prev,
      items: [...prev.items, buildEmptyItem()],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setNewBudget((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof NewBudgetItem, value: string | number) => {
    setNewBudget((prev) => {
      const nextItems = [...prev.items];
      const currentItem = nextItems[index];

      if (!currentItem) {
        return prev;
      }

      const updatedItem: NewBudgetItem = {
        ...currentItem,
        [field]: value,
      };

      if (field === 'productId') {
        const selectedProduct = productsData.products.find((product) => String(product.id) === value);

        if (selectedProduct) {
          updatedItem.productCode = selectedProduct.codigoProduto;
          updatedItem.productName = selectedProduct.nomeProduto;
          updatedItem.unitPrice = selectedProduct.preco;
        }
      }

      if (field === 'quantity' || field === 'unitPrice' || field === 'productId') {
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
      }

      nextItems[index] = updatedItem;

      return {
        ...prev,
        items: nextItems,
      };
    });
  };

  const handleCreateBudget = () => {
    if (!newBudget.clientId || !newBudget.responsibleId || newBudget.items.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item.');
      return;
    }

    const hasInvalidItems = newBudget.items.some((item) => !item.productId);
    if (hasInvalidItems) {
      alert('Por favor, selecione um produto para todos os itens.');
      return;
    }

    const selectedClient = clients.find((client) => client.value === newBudget.clientId);
    const selectedRepresentative = activeRepresentatives.find(
      (representative) => representative.value === newBudget.responsibleId,
    );
    const nextNumber = `ORC-2025-${String(normalizedBudgets.length + 1).padStart(3, '0')}`;

    const budgetToCreate: Budget = {
      id: String(normalizedBudgets.length + 1),
      number: nextNumber,
      clientId: newBudget.clientId,
      clientName: selectedClient?.label ?? '',
      responsibleId: newBudget.responsibleId,
      responsibleName: selectedRepresentative?.label ?? '',
      createdAt: new Date().toISOString().split('T')[0],
      validityDate: newBudget.validityDate,
      status: 'pending',
      total: newBudget.items.reduce((sum, item) => sum + item.total, 0),
      items: newBudget.items.map((item, index) => ({
        id: String(index + 1),
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };

    console.log('Novo orçamento criado:', budgetToCreate);
    handleCloseNewBudgetModal();
  };

  const handleFiltersChange = (nextFilters: Record<string, unknown>) => {
    setFilters({
      budgetNumber: (nextFilters.budgetNumber as string) || '',
      clientId: (nextFilters.clientId as string) || '',
      responsibleId: (nextFilters.responsibleId as string) || '',
      status: ((nextFilters.status as Budget['status'] | '') || '') as Budget['status'] | '',
      startDate: (nextFilters.startDate as Date) || null,
      endDate: (nextFilters.endDate as Date) || null,
    });
  };

  const filteredBudgets = useMemo(() => {
    return normalizedBudgets.filter((budget) => {
      const budgetNumberMatch =
        !filters.budgetNumber ||
        filters.budgetNumber.trim() === '' ||
        budget.number.toLowerCase().includes(filters.budgetNumber.toLowerCase());

      const clientMatch =
        !filters.clientId || filters.clientId.trim() === '' || budget.clientId === filters.clientId;

      const responsibleMatch =
        !filters.responsibleId ||
        filters.responsibleId.trim() === '' ||
        budget.responsibleId === filters.responsibleId;

      const statusMatch = !filters.status || budget.status === filters.status;
      const createdAt = new Date(budget.createdAt);
      const startDateMatch = !filters.startDate || createdAt >= filters.startDate;
      const endDateMatch = !filters.endDate || createdAt <= filters.endDate;

      return (
        budgetNumberMatch &&
        clientMatch &&
        responsibleMatch &&
        statusMatch &&
        startDateMatch &&
        endDateMatch
      );
    });
  }, [filters, normalizedBudgets]);

  const getStatusColor = (status: Budget['status']) => {
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

  const getStatusLabel = (status: Budget['status']) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filterFields: FilterField[] = [
    {
      id: 'budgetNumber',
      type: 'text',
      label: 'Numero do Orcamento',
      placeholder: 'Digite o numero do orcamento',
    },
    {
      id: 'clientId',
      type: 'select',
      label: 'Cliente',
      options: clients,
    },
    {
      id: 'responsibleId',
      type: 'select',
      label: 'Responsavel',
      options: responsibles,
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

  const columns: Column<Budget>[] = [
    {
      id: 'number',
      label: 'Numero',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'clientName',
      label: 'Cliente',
      sortable: true,
    },
    {
      id: 'responsibleName',
      label: 'Responsavel',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Chip
          label={getStatusLabel(value as Budget['status'])}
          color={getStatusColor(value as Budget['status'])}
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
      render: (value) => `${(value as Budget['items']).length} produto(s)`,
    },
  ];

  const handleRowClick = (budget: Budget) => {
    console.log('Orcamento selecionado:', budget);
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
          <Button variant="contained" color="primary" onClick={handleOpenNewBudgetModal}>
            Novo Orçamento
          </Button>
        </Box>

        <FilterPanel
          title="Filtros de Orçamentos"
          fields={filterFields}
          filters={filters as unknown as Record<string, unknown>}
          onFiltersChange={handleFiltersChange}
          showClearButton={false}
          resultsCount={filteredBudgets.length}
          resultsLabel="orçamento(s) encontrado(s)"
        />

        <DataTable
          columns={columns}
          data={filteredBudgets}
          title="Orçamentos"
          onRowClick={handleRowClick}
          emptyMessage="Nenhum orçamento encontrado com os filtros aplicados."
        />

        <FormModal
          open={isNewBudgetModalOpen}
          onClose={handleCloseNewBudgetModal}
          onSubmit={handleCreateBudget}
          title="Novo Orçamento"
          subtitle="Preencha as informações para criar um novo orçamento"
          submitLabel="Criar Orçamento"
          cancelLabel="Cancelar"
          maxWidth="xl"
          fullWidth={true}
        >
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={newBudget.clientId}
                    label="Cliente"
                    onChange={(e) => handleNewBudgetChange('clientId', e.target.value)}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.value} value={client.value}>
                        {client.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Representante</InputLabel>
                  <Select
                    value={newBudget.responsibleId}
                    label="Representante"
                    onChange={(e) => handleNewBudgetChange('responsibleId', e.target.value)}
                  >
                    {activeRepresentatives.map((representative) => (
                      <MenuItem key={representative.value} value={representative.value}>
                        {representative.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="date"
                  label="Data de Validade"
                  value={newBudget.validityDate}
                  onChange={(e) => handleNewBudgetChange('validityDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Itens do Orçamento</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    size="small"
                  >
                    Adicionar Item
                  </Button>
                </Box>

                {newBudget.items.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">
                      Clique em &quot;Adicionar Item&quot; para começar a adicionar produtos ao
                      orçamento.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Preço Unitário</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {newBudget.items.map((item, index) => (
                          <TableRow key={`${item.productId}-${index}`}>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={item.productId}
                                  onChange={(e) =>
                                    handleItemChange(index, 'productId', e.target.value)
                                  }
                                  displayEmpty
                                >
                                  <MenuItem value="" disabled>
                                    Selecione um produto
                                  </MenuItem>
                                  {productsData.products.map((product) => (
                                    <MenuItem key={product.id} value={String(product.id)}>
                                      {product.codigoProduto} - {product.nomeProduto}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(index, 'quantity', Number(e.target.value))
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemChange(index, 'unitPrice', Number(e.target.value))
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ width: 120 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                R$ {item.total.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {newBudget.items.length > 0 && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 3,
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                      boxShadow: 3,
                      border: '2px solid',
                      borderColor: 'primary.dark',
                    }}
                  >
                    <Typography
                      variant="h5"
                      color="white"
                      textAlign="right"
                      fontWeight={700}
                      sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      Total: R$ {newBudget.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="white"
                      textAlign="right"
                      sx={{ opacity: 0.9, mt: 0.5 }}
                    >
                      {newBudget.items.length} item(ns) no orçamento
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </FormModal>
      </Box>
    </DashboardLayout>
  );
}
