'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import { FormModal } from '@/components/Modal';
import { useClientsQuery } from '@/features/clients/hooks/useClientsQuery';
import { ClientFilters } from '@/features/clients/types';
import { Add, LocationOn, Search, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NewClientForm {
  name: string;
  document: string;
  zipCode: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
  number: string;
  complement: string;
  email: string;
  phone: string;
  instagram: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ClientFilters>({
    code: '',
    name: '',
    city: '',
    startDate: null,
    endDate: null,
  });

  const { data, isLoading } = useClientsQuery(filters);
  const filteredClients = data?.clients ?? [];
  const cities = data?.cities ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({
    name: '',
    document: '',
    zipCode: '',
    street: '',
    city: '',
    state: '',
    neighborhood: '',
    number: '',
    complement: '',
    email: '',
    phone: '',
    instagram: '',
  });

  const columns: Column[] = [
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
      label: 'Nome',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'city',
      label: 'Cidade',
      sortable: true,
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value as string}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'lastPurchaseAt',
      label: 'Data Última Compra',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'purchaseCount',
      label: 'Quantidade de Compras',
      sortable: true,
      render: (value) => (
        <Chip
          label={value as string}
          size="small"
          color={
            (value as number) > 15 ? 'success' : (value as number) > 10 ? 'warning' : 'default'
          }
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      sortable: false,
      render: (value, row) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => router.push(`/clients/${row.code}`)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters({
      code: (newFilters.code as string) || '',
      name: (newFilters.name as string) || '',
      city: (newFilters.city as string) || '',
      startDate: (newFilters.startDate as Date) || null,
      endDate: (newFilters.endDate as Date) || null,
    });
  };

  const clearFilters = () => {
    setFilters({
      code: '',
      name: '',
      city: '',
      startDate: null,
      endDate: null,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewClient({
      name: '',
      document: '',
      zipCode: '',
      street: '',
      city: '',
      state: '',
      neighborhood: '',
      number: '',
      complement: '',
      email: '',
      phone: '',
      instagram: '',
    });
  };

  const handleSubmitNewClient = () => {
    // Aqui você implementaria a lógica para salvar o novo cliente
    // Por enquanto, apenas fechamos o modal
    console.log('Novo cliente:', newClient);
    handleCloseModal();
  };

  const handleInputChange = (field: keyof NewClientForm, value: string) => {
    setNewClient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Lista de estados brasileiros
  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  // Configuração dos campos de filtro
  const filterFields: FilterField[] = [
    {
      id: 'code',
      type: 'text',
      label: 'Código do Cliente',
      placeholder: 'Digite o código do cliente',
      startAdornment: <Search />,
    },
    {
      id: 'name',
      type: 'text',
      label: 'Nome do Cliente',
      placeholder: 'Digite o nome do cliente',
      startAdornment: <Search />,
    },
    {
      id: 'city',
      type: 'select',
      label: 'Cidade',
      options: cities.map((city) => ({
        value: city,
        label: city,
      })),
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie e visualize os clientes da sua base de dados.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenModal}
            sx={{ minWidth: 200 }}
          >
            Adicionar Cliente
          </Button>
        </Box>

        {/* Filtros */}
        <FilterPanel
          title="Filtros de Busca"
          fields={filterFields}
          filters={filters as unknown as Record<string, unknown>}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={false}
          resultsCount={filteredClients.length}
          resultsLabel="cliente(s) encontrado(s)"
        />

        {/* Tabela de Clientes */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredClients as unknown as Record<string, unknown>[]}
            title="Lista de Clientes"
            emptyMessage="Nenhum cliente encontrado com os filtros aplicados."
            getRowKey={(row) => (row.code as string) || String(row)}
          />
        )}

        {/* Modal para Adicionar Cliente */}
        <FormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitNewClient}
          title="Adicionar Novo Cliente"
          subtitle="Preencha os dados do novo cliente"
          submitLabel="Salvar Cliente"
          cancelLabel="Cancelar"
          maxWidth="xl"
          fullWidth={true}
        >
          <Box sx={{ p: 2 }}>
            {/* Seção de Endereço */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Informações de Endereço
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={newClient.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome completo do cliente"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={newClient.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={newClient.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={newClient.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Endereço do cliente"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={newClient.state}
                    label="Estado"
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  >
                    {estados.map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Cidade</InputLabel>
                  <Select
                    value={newClient.city}
                    label="Cidade"
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={newClient.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={newClient.complement}
                  onChange={(e) => handleInputChange('complement', e.target.value)}
                  placeholder="Complemento"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número"
                  value={newClient.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="Número da residência"
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Seção de Contato */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Informações de Contato
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={newClient.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={newClient.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@usuario_instagram"
                />
              </Grid>
            </Grid>
          </Box>
        </FormModal>
      </Box>
    </DashboardLayout>
  );
}
