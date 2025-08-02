// Forçando recompilação para resolver ReferenceError
'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import clientsData from '@/mocks/clients.json';
import productsData from '@/mocks/products.json';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { Add as AddIcon, ArrowBack, Delete as DeleteIcon, Search } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
// Forçando recompilação para resolver ReferenceError

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`new-order-tabpanel-${index}`}
      aria-labelledby={`new-order-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface OrderItem {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const filterClients = createFilterOptions<string>();
const filterProducts = createFilterOptions<Product>();

export function NewOrderForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchClientCode, setSearchClientCode] = useState('');
  const [searchClientName, setSearchClientName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const clientOptions = useMemo(() => {
    return (clientsData.clients as Client[]).map((client) => client.nome);
  }, []);

  const productOptions = useMemo(() => {
    return productsData.products as Product[];
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchClient = () => {
    const foundClient = (clientsData.clients as Client[]).find(
      (client) =>
        (searchClientCode && client.codigo.toLowerCase() === searchClientCode.toLowerCase()) ||
        (searchClientName && client.nome.toLowerCase() === searchClientName.toLowerCase()),
    );
    setSelectedClient(foundClient || null);
  };

  const handleClientNameChange = (event: React.SyntheticEvent, value: string | null) => {
    setSearchClientName(value || '');
    if (value) {
      const foundClient = (clientsData.clients as Client[]).find(
        (client) => client.nome.toLowerCase() === value.toLowerCase(),
      );
      setSelectedClient(foundClient || null);
    } else {
      setSelectedClient(null);
    }
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      const newItem: OrderItem = {
        productId: selectedProduct.id,
        productCode: selectedProduct.codigoProduto,
        productName: selectedProduct.nomeProduto,
        quantity: productQuantity,
        unitPrice: selectedProduct.preco,
        total: productQuantity * selectedProduct.preco,
      };
      setOrderItems((prevItems) => [...prevItems, newItem]);
      setSelectedProduct(null); // Clear selected product after adding
      setProductQuantity(1);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const totalProductsValue = orderItems.reduce((sum, item) => sum + item.total, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={600}>
                Novo Pedido
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Crie um novo pedido para um cliente.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>{/* Botões de ação futuros (Salvar, etc.) */}</Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="new order tabs">
            <Tab label="Cliente" id="new-order-tab-0" aria-controls="new-order-tabpanel-0" />
            <Tab label="Produtos" id="new-order-tab-1" aria-controls="new-order-tabpanel-1" />
            <Tab label="Frete" id="new-order-tab-2" aria-controls="new-order-tabpanel-2" />
            <Tab label="Resumo" id="new-order-tab-3" aria-controls="new-order-tabpanel-3" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Buscar Cliente
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código do Cliente"
                  value={searchClientCode}
                  onChange={(e) => setSearchClientCode(e.target.value)}
                  placeholder="Digite o código do cliente"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  fullWidth
                  options={clientOptions}
                  value={searchClientName}
                  onChange={(event, newValue) => handleClientNameChange(event, newValue)}
                  filterOptions={(options, params) => {
                    const filtered = filterClients(options, params);
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nome do Cliente"
                      placeholder="Digite o nome do cliente"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearchClient}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Buscar Cliente
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {selectedClient && (
            <Paper sx={{ mt: 4, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informações do Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedClient.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    CPF:
                  </Typography>
                  <Typography variant="body1">{selectedClient.cpf}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    CEP:
                  </Typography>
                  <Typography variant="body1">{selectedClient.cep}</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary">
                    Endereço:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClient.endereco}, {selectedClient.numero}
                    {selectedClient.complemento && ` - ${selectedClient.complemento}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Bairro:
                  </Typography>
                  <Typography variant="body1">{selectedClient.bairro}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Cidade:
                  </Typography>
                  <Typography variant="body1">{selectedClient.cidade}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Estado:
                  </Typography>
                  <Typography variant="body1">{selectedClient.estado}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {!selectedClient && (searchClientCode || searchClientName) && (
            <Paper sx={{ mt: 4, p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum cliente encontrado com os critérios de busca.
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Adicionar Produtos
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={productOptions}
                  getOptionLabel={(option) => option.nomeProduto}
                  onChange={(event, newValue) => {
                    setSelectedProduct(newValue);
                    setProductQuantity(1);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Produto"
                      placeholder="Buscar por código ou nome"
                    />
                  )}
                  filterOptions={(options, params) => {
                    const filtered = filterProducts(options, params);
                    if (params.inputValue !== '') {
                      return filtered.filter(
                        (option) =>
                          option.codigoProduto
                            .toLowerCase()
                            .includes(params.inputValue.toLowerCase()) ||
                          option.nomeProduto
                            .toLowerCase()
                            .includes(params.inputValue.toLowerCase()),
                      );
                    }
                    return filtered;
                  }}
                />
              </Grid>
              {selectedProduct && (
                <>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Quantidade"
                      type="number"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Preço Unitário"
                      value={formatCurrency(selectedProduct.preco)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>

            {selectedProduct && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">
                  Produto Selecionado:{' '}
                  <Typography component="span" fontWeight={500}>
                    {selectedProduct.nomeProduto}
                  </Typography>{' '}
                  (R$ {selectedProduct.preco.toFixed(2)})
                </Typography>
              </Box>
            )}

            {!selectedProduct && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Nenhum produto encontrado com o termo de busca.
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Itens do Pedido
            </Typography>
            {orderItems.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum produto adicionado ao pedido ainda.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço Unitário</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={item.productId + '-' + index}>
                        <TableCell>{item.productCode}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveProduct(index)}
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

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '4px',
                textAlign: 'right',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Total dos Produtos: {formatCurrency(totalProductsValue)}
              </Typography>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Informar Valor do Frete
            </Typography>
            <TextField
              fullWidth
              label="Valor do Frete"
              type="number"
              value={shippingCost === null ? '' : shippingCost}
              onChange={(e) =>
                setShippingCost(e.target.value === '' ? null : Number(e.target.value))
              }
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Resumo do Pedido
          </Typography>

          {/* Resumo do Cliente */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Cliente
            </Typography>
            {selectedClient ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedClient.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPF:
                  </Typography>
                  <Typography variant="body1">{selectedClient.cpf}</Typography>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Typography variant="body2" color="text.secondary">
                    Endereço:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClient.endereco}, {selectedClient.numero}
                    {selectedClient.complemento && ` - ${selectedClient.complemento}`},{' '}
                    {selectedClient.bairro}, {selectedClient.cidade} - {selectedClient.estado}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Nenhum cliente selecionado.
              </Typography>
            )}
          </Paper>

          {/* Resumo dos Produtos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Produtos
            </Typography>
            {orderItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Unitário</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Total Produtos:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {formatCurrency(totalProductsValue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Nenhum produto adicionado.
              </Typography>
            )}
          </Paper>

          {/* Resumo do Frete */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Frete
            </Typography>
            <Typography variant="body1">
              Valor do Frete: {formatCurrency(shippingCost || 0)}
            </Typography>
          </Paper>

          {/* Total Geral */}
          <Box sx={{ textAlign: 'right', mt: 4 }}>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              Total Geral do Pedido: {formatCurrency(totalProductsValue + (shippingCost || 0))}
            </Typography>
          </Box>

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={() => alert('Pedido Criado!')}>
              Confirmar Pedido
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
}
