'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import { FormModal } from '@/components/Modal';
import clientsData from '@/mocks/clients.json';
import { Client, ClientFilters } from '@/types/client';
import { Add, LocationOn, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

interface NewClientForm {
  nome: string;
  cpf: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  complemento: string;
  email: string;
  telefone: string;
  instagram: string;
}

export default function ClientsPage() {
  const [filters, setFilters] = useState<ClientFilters>({
    codigo: '',
    nome: '',
    cidade: '',
    dataInicial: null,
    dataFinal: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({
    nome: '',
    cpf: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    bairro: '',
    numero: '',
    complemento: '',
    email: '',
    telefone: '',
    instagram: '',
  });

  const columns: Column[] = [
    {
      id: 'codigo',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'nome',
      label: 'Nome',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'cidade',
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
      id: 'dataUltimaCompra',
      label: 'Data Última Compra',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'quantidadeCompras',
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
  ];

  // Filtrar clientes baseado nos filtros aplicados
  const filteredClients = useMemo(() => {
    return (clientsData.clients as Client[]).filter((client) => {
      const codigoMatch =
        !filters.codigo ||
        filters.codigo.trim() === '' ||
        client.codigo.toLowerCase().includes(filters.codigo.toLowerCase());

      const nomeMatch =
        !filters.nome ||
        filters.nome.trim() === '' ||
        client.nome.toLowerCase().includes(filters.nome.toLowerCase());

      const cidadeMatch =
        !filters.cidade || filters.cidade.trim() === '' || client.cidade === filters.cidade;

      // Filtro de data
      let dataMatch = true;
      if (filters.dataInicial || filters.dataFinal) {
        const dataUltimaCompra = new Date(client.dataUltimaCompra);

        if (filters.dataInicial && filters.dataFinal) {
          dataMatch =
            dataUltimaCompra >= filters.dataInicial && dataUltimaCompra <= filters.dataFinal;
        } else if (filters.dataInicial) {
          dataMatch = dataUltimaCompra >= filters.dataInicial;
        } else if (filters.dataFinal) {
          dataMatch = dataUltimaCompra <= filters.dataFinal;
        }
      }

      return codigoMatch && nomeMatch && cidadeMatch && dataMatch;
    });
  }, [filters]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters({
      codigo: (newFilters.codigo as string) || '',
      nome: (newFilters.nome as string) || '',
      cidade: (newFilters.cidade as string) || '',
      dataInicial: (newFilters.dataInicial as Date) || null,
      dataFinal: (newFilters.dataFinal as Date) || null,
    });
  };

  const clearFilters = () => {
    setFilters({
      codigo: '',
      nome: '',
      cidade: '',
      dataInicial: null,
      dataFinal: null,
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
      nome: '',
      cpf: '',
      cep: '',
      endereco: '',
      cidade: '',
      estado: '',
      bairro: '',
      numero: '',
      complemento: '',
      email: '',
      telefone: '',
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
      id: 'codigo',
      type: 'text',
      label: 'Código do Cliente',
      placeholder: 'Digite o código do cliente',
      startAdornment: <Search />,
    },
    {
      id: 'nome',
      type: 'text',
      label: 'Nome do Cliente',
      placeholder: 'Digite o nome do cliente',
      startAdornment: <Search />,
    },
    {
      id: 'cidade',
      type: 'select',
      label: 'Cidade',
      options: (clientsData.cidades as string[]).map((cidade) => ({
        value: cidade,
        label: cidade,
      })),
    },
    {
      id: 'dataInicial',
      type: 'date',
      label: 'Data Inicial',
    },
    {
      id: 'dataFinal',
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
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
          showClearButton={false}
          resultsCount={filteredClients.length}
          resultsLabel="cliente(s) encontrado(s)"
        />

        {/* Tabela de Clientes */}
        <DataTable
          columns={columns}
          data={filteredClients}
          title="Lista de Clientes"
          emptyMessage="Nenhum cliente encontrado com os filtros aplicados."
          getRowKey={(row) => (row.codigo as string) || String(row)}
        />

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
                  value={newClient.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do cliente"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={newClient.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={newClient.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={newClient.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Endereço do cliente"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={newClient.estado}
                    label="Estado"
                    onChange={(e) => handleInputChange('estado', e.target.value)}
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
                    value={newClient.cidade}
                    label="Cidade"
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                  >
                    {(clientsData.cidades as string[]).map((cidade) => (
                      <MenuItem key={cidade} value={cidade}>
                        {cidade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={newClient.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={newClient.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Complemento"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número"
                  value={newClient.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
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
                  value={newClient.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
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
