'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import { FormModal } from '@/components/Modal';
import budgetsData from '@/mocks/budgets.json';
import productsData from '@/mocks/products.json';
import representativesData from '@/mocks/representatives.json';
import { Budget } from '@/types/budget';
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

export default function BudgetsPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({
    budgetNumber: '',
    client: '',
    responsible: '',
    status: '',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  // Estado para controlar o modal de novo orçamento
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    client: '',
    responsible: '',
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias por padrão
    items: [] as Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>,
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

  // Extrair representantes ativos
  const activeRepresentatives = useMemo(() => {
    return representativesData.representatives
      .filter((rep) => rep.status === 'active')
      .map((rep) => ({ value: rep.name, label: rep.name }));
  }, []);

  // Funções para gerenciar o novo orçamento
  const handleOpenNewBudgetModal = () => {
    setIsNewBudgetModalOpen(true);
  };

  const handleCloseNewBudgetModal = () => {
    setIsNewBudgetModalOpen(false);
    setNewBudget({
      client: '',
      responsible: '',
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
    });
  };

  const handleNewBudgetChange = (field: string, value: string) => {
    setNewBudget((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddItem = () => {
    setNewBudget((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          productName: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setNewBudget((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setNewBudget((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Calcular total do item
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
        const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
        newItems[index].total = quantity * unitPrice;
      }

      // Atualizar nome do produto se o ID mudou
      if (field === 'productId') {
        const product = productsData.products.find((p) => p.id.toString() === value);
        if (product) {
          newItems[index].productName = product.nomeProduto;
          newItems[index].unitPrice = product.preco;
          newItems[index].total = newItems[index].quantity * product.preco;
        }
      }

      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const handleCreateBudget = () => {
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!newBudget.client || !newBudget.responsible || newBudget.items.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item.');
      return;
    }

    // Validar se todos os itens têm produto selecionado
    const hasInvalidItems = newBudget.items.some((item) => !item.productId);
    if (hasInvalidItems) {
      alert('Por favor, selecione um produto para todos os itens.');
      return;
    }

    // Gerar número do orçamento
    const nextNumber = `ORC-2025-${String(budgetsData.budgets.length + 1).padStart(3, '0')}`;

    // Criar novo orçamento
    const budgetToCreate = {
      id: String(budgetsData.budgets.length + 1),
      number: nextNumber,
      client: newBudget.client,
      responsible: newBudget.responsible,
      createdAt: new Date().toISOString().split('T')[0],
      validityDate: newBudget.validityDate,
      status: 'pending' as const,
      total: newBudget.items.reduce((sum, item) => sum + item.total, 0),
      items: newBudget.items.map((item, index) => ({
        id: String(index + 1),
        product: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };

    console.log('Novo orçamento criado:', budgetToCreate);

    // Aqui você faria a chamada para a API para salvar o orçamento
    // Por enquanto, apenas fechamos o modal
    handleCloseNewBudgetModal();
  };

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
          <Button variant="contained" color="primary" onClick={handleOpenNewBudgetModal}>
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

        {/* Modal de Novo Orçamento */}
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
              {/* Cliente */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={newBudget.client}
                    label="Cliente"
                    onChange={(e) => handleNewBudgetChange('client', e.target.value)}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client} value={client}>
                        {client}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Representante */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Representante</InputLabel>
                  <Select
                    value={newBudget.responsible}
                    label="Representante"
                    onChange={(e) => handleNewBudgetChange('responsible', e.target.value)}
                  >
                    {activeRepresentatives.map((rep) => (
                      <MenuItem key={rep.value} value={rep.value}>
                        {rep.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Data de Validade */}
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

              {/* Itens do Orçamento */}
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
                          <TableRow key={index}>
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
                                    <MenuItem key={product.id} value={product.id.toString()}>
                                      {product.nomeProduto} - R$ {product.preco.toFixed(2)}
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

                {/* Total do Orçamento */}
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
                      Total: R${' '}
                      {newBudget.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
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
