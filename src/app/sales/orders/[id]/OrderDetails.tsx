'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { FormModal } from '@/components/Modal';
import clientsData from '@/mocks/clients.json';
import ordersData from '@/mocks/orders.json';
import { Client } from '@/types/client';
import { Order } from '@/types/order';
import { ArrowBack, Assignment, Email, LocationOn, Person, Phone } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
      id={`order-details-tabpanel-${index}`}
      aria-labelledby={`order-details-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface OrderDetailsProps {
  orderId: string;
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const order = useMemo(() => {
    return (ordersData.orders as Order[]).find((o) => o.id === orderId);
  }, [orderId]);

  const client = useMemo(() => {
    if (!order?.clientCode) return null;
    return (clientsData.clients as Client[]).find((c) => c.codigo === order.clientCode);
  }, [order?.clientCode]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStatusChangeClick = () => {
    setNewStatus(order?.status || '');
    setNotes(order?.notes || '');
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = () => {
    // Aqui você implementaria a lógica para atualizar o status
    console.log('Status atualizado:', { status: newStatus, notes });
    setStatusModalOpen(false);
    setNewStatus('');
    setNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'canceled':
        return 'Cancelado';
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!order) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4">Pedido não encontrado</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const currentOrder = order;

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
                Pedido {currentOrder.id}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentOrder.clientName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Assignment />} onClick={handleStatusChangeClick}>
              Alterar Status
            </Button>
          </Box>
        </Box>

        {/* Status Banner */}
        <Alert
          severity={getStatusColor(currentOrder.status) as 'warning' | 'info' | 'success' | 'error'}
          sx={{ mb: 3 }}
          action={
            <Chip
              label={getStatusLabel(currentOrder.status)}
              color={
                getStatusColor(currentOrder.status) as
                  | 'warning'
                  | 'info'
                  | 'success'
                  | 'error'
                  | 'default'
              }
              size="small"
            />
          }
        >
          Status atual do pedido: <strong>{getStatusLabel(currentOrder.status)}</strong>
        </Alert>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="order details tabs">
            <Tab label="Informações Gerais" />
            <Tab label="Dados do Cliente" />
            <Tab label="Itens do Pedido" />
          </Tabs>
        </Paper>

        {/* Tab Panel - Informações Gerais */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                    Informações do Pedido
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Código do Pedido:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {currentOrder.id}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={getStatusLabel(currentOrder.status)}
                      color={
                        getStatusColor(currentOrder.status) as
                          | 'warning'
                          | 'info'
                          | 'success'
                          | 'error'
                          | 'default'
                      }
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Data de Criação:
                    </Typography>
                    <Typography variant="body1">{formatDate(currentOrder.createdAt)}</Typography>
                  </Box>

                  {currentOrder.updatedAt && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Última Atualização:
                      </Typography>
                      <Typography variant="body1">{formatDate(currentOrder.updatedAt)}</Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Quantidade de Itens:
                    </Typography>
                    <Typography variant="body1">{currentOrder.items.length}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal dos Itens:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(currentOrder.total - currentOrder.shippingCost)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Frete:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {currentOrder.shippingCost === 0
                        ? 'Grátis'
                        : formatCurrency(currentOrder.shippingCost)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {formatCurrency(currentOrder.total)}
                    </Typography>
                  </Box>

                  {currentOrder.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Observações:
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        {currentOrder.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                    Resumo do Cliente
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {currentOrder.clientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Código: {currentOrder.clientCode}
                      </Typography>
                    </Box>
                  </Box>

                  {currentOrder.clientEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{currentOrder.clientEmail}</Typography>
                    </Box>
                  )}

                  {currentOrder.clientPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{currentOrder.clientPhone}</Typography>
                    </Box>
                  )}

                  {client && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {client.cidade}, {client.estado}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab Panel - Dados do Cliente */}
        <TabPanel value={activeTab} index={1}>
          {client ? (
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary.main" sx={{ mb: 3 }}>
                  Informações Completas do Cliente
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Código:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {client.codigo}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nome:
                      </Typography>
                      <Typography variant="body1">{client.nome}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        CPF:
                      </Typography>
                      <Typography variant="body1">{client.cpf}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email:
                      </Typography>
                      <Typography variant="body1">{client.email}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Telefone:
                      </Typography>
                      <Typography variant="body1">{client.telefone}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Instagram:
                      </Typography>
                      <Typography variant="body1">{client.instagram}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Endereço:
                      </Typography>
                      <Typography variant="body1">
                        {client.endereco}, {client.numero}
                      </Typography>
                      {client.complemento && (
                        <Typography variant="body2" color="text.secondary">
                          {client.complemento}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Bairro:
                      </Typography>
                      <Typography variant="body1">{client.bairro}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cidade/Estado:
                      </Typography>
                      <Typography variant="body1">
                        {client.cidade}, {client.estado}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        CEP:
                      </Typography>
                      <Typography variant="body1">{client.cep}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Última Compra:
                      </Typography>
                      <Typography variant="body1">{formatDate(client.dataUltimaCompra)}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total de Compras:
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="primary.main">
                        {client.quantidadeCompras}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                  Informações do Cliente
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Dados completos do cliente não encontrados.
                </Typography>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Tab Panel - Itens do Pedido */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                Itens do Pedido
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço Unitário</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.id}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={item.quantity} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {formatCurrency(item.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: {formatCurrency(currentOrder.total - currentOrder.shippingCost)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Frete:{' '}
                    {currentOrder.shippingCost === 0
                      ? 'Grátis'
                      : formatCurrency(currentOrder.shippingCost)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  Total do Pedido: {formatCurrency(currentOrder.total)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Modal para alterar status */}
        <FormModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onSubmit={handleStatusUpdate}
          title="Alterar Status do Pedido"
          subtitle={`Pedido ${order.id} - ${order.clientName}`}
          submitLabel="Atualizar Status"
          maxWidth="sm"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Novo Status"
              >
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="shipped">Enviado</MenuItem>
                <MenuItem value="delivered">Entregue</MenuItem>
                <MenuItem value="canceled">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a mudança de status..."
            />
          </Box>
        </FormModal>
      </Box>
    </DashboardLayout>
  );
}
