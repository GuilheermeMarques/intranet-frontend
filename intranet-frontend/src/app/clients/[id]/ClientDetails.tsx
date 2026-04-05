'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import clientsData from '@/mocks/clients.json';
import purchasesData from '@/mocks/purchases.json';
import { Client } from '@/types/client';
import { Purchase } from '@/types/purchase';
import { ArrowBack, Edit, Email, Instagram, Phone, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ClientDetailsProps {
  clientId: string;
}

export function ClientDetails({ clientId }: ClientDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  // Encontrar o cliente pelo código
  const client = useMemo(() => {
    return (clientsData.clients as Client[]).find((c) => c.codigo === clientId);
  }, [clientId]);

  // Encontrar as compras do cliente
  const clientPurchases = useMemo(() => {
    return (purchasesData.purchases as Purchase[]).filter(
      (purchase) => purchase.clientCode === clientId,
    );
  }, [clientId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditClick = () => {
    setEditedClient({ ...client! });
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    console.log('Cliente atualizado:', editedClient);
    setIsEditMode(false);
    setEditedClient(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedClient(null);
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient((prev) => ({
        ...prev!,
        [field]: value,
      }));
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

  // Colunas para a tabela de histórico de compras
  const purchaseColumns: Column[] = [
    {
      id: 'orderNumber',
      label: 'Número do Pedido',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'date',
      label: 'Data da Compra',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'total',
      label: 'Valor Total',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'products',
      label: 'Produtos',
      sortable: false,
      render: (value) => {
        const products = value as { quantity: number; name: string; total: number }[];
        return (
          <Box>
            {products.map((product, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {product.quantity}x {product.name} - {formatCurrency(product.total)}
              </Typography>
            ))}
          </Box>
        );
      },
    },
  ];

  if (!client) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4">Cliente não encontrado</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const currentClient = editedClient || client;

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
                {currentClient.nome}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Código: {currentClient.codigo}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditMode ? (
              <Button variant="outlined" startIcon={<Edit />} onClick={handleEditClick}>
                Editar Cliente
              </Button>
            ) : (
              <>
                <Button variant="contained" startIcon={<Save />} onClick={handleSaveClick}>
                  Salvar
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="client tabs">
            <Tab label="Informações Gerais" />
            <Tab label="Histórico de Compras" />
          </Tabs>
        </Paper>

        {/* Tab Panel - Informações Gerais */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Informações Pessoais */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Informações Pessoais
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nome Completo
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={500}>
                          {currentClient.nome}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        CPF
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.cpf}</Typography>
                      )}
                    </Box>
                    {/* Espaçador para alinhar com o card de contato */}
                    <Box sx={{ flex: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Informações de Contato */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Informações de Contato
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          E-mail
                        </Typography>
                        {isEditMode ? (
                          <input
                            type="email"
                            value={currentClient.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '16px',
                            }}
                          />
                        ) : (
                          <Typography variant="body1">{currentClient.email}</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Telefone
                        </Typography>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={currentClient.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '16px',
                            }}
                          />
                        ) : (
                          <Typography variant="body1">{currentClient.telefone}</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Instagram fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Instagram
                        </Typography>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={currentClient.instagram}
                            onChange={(e) => handleInputChange('instagram', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '16px',
                            }}
                          />
                        ) : (
                          <Typography variant="body1">{currentClient.instagram}</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Endereço */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Endereço
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        CEP
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.cep}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Endereço
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.endereco}
                          onChange={(e) => handleInputChange('endereco', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">
                          {currentClient.endereco}
                          {currentClient.complemento && ` - ${currentClient.complemento}`}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Número
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.numero}
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.numero}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Bairro
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.bairro}
                          onChange={(e) => handleInputChange('bairro', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.bairro}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Cidade
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.cidade}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={currentClient.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px',
                          }}
                        />
                      ) : (
                        <Typography variant="body1">{currentClient.estado}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Estatísticas */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Estatísticas de Compras
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight={600}>
                          {currentClient.quantidadeCompras}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total de Compras
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight={600}>
                          {formatDate(currentClient.dataUltimaCompra)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Última Compra
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab Panel - Histórico de Compras */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Histórico de Compras
            </Typography>
            {clientPurchases.length > 0 ? (
              <DataTable
                columns={purchaseColumns}
                data={clientPurchases as unknown as Record<string, unknown>[]}
                title=""
                emptyMessage="Nenhuma compra encontrada para este cliente."
                getRowKey={(row) => (row.orderNumber as string) || String(row)}
              />
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Este cliente ainda não possui histórico de compras.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
}
