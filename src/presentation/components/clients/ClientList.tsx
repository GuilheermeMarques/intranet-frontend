'use client';

import { Client } from '@/domain/entities/Client';
import { formatCPF, formatDate, formatPhone } from '@/shared/utils/formatters';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Column, VirtualizedDataTable } from '../VirtualizedDataTable';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView: (client: Client) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export const ClientList = ({ clients, onEdit, onDelete, onView, onAdd }: ClientListProps) => {
  const columns: Column<Client>[] = useMemo(
    () => [
      {
        id: 'codigo',
        label: 'Código',
        field: 'codigo',
        width: 100,
        sortable: true,
      },
      {
        id: 'nome',
        label: 'Nome',
        field: 'nome',
        width: 200,
        sortable: true,
      },
      {
        id: 'cpf',
        label: 'CPF',
        field: 'cpf',
        width: 150,
        sortable: true,
        render: (value) => formatCPF(value as string),
      },
      {
        id: 'email',
        label: 'Email',
        field: 'email',
        width: 200,
        sortable: true,
      },
      {
        id: 'telefone',
        label: 'Telefone',
        field: 'telefone',
        width: 150,
        sortable: true,
        render: (value) => formatPhone(value as string),
      },
      {
        id: 'cidade',
        label: 'Cidade',
        field: 'cidade',
        width: 150,
        sortable: true,
      },
      {
        id: 'dataUltimaCompra',
        label: 'Última Compra',
        field: 'dataUltimaCompra',
        width: 150,
        sortable: true,
        render: (value) => formatDate(value as Date),
      },
      {
        id: 'quantidadeCompras',
        label: 'Compras',
        field: 'quantidadeCompras',
        width: 100,
        sortable: true,
        render: (value) => (
          <Chip
            label={String(value)}
            size="small"
            color={Number(value) > 0 ? 'success' : 'default'}
          />
        ),
      },
      {
        id: 'actions',
        label: 'Ações',
        width: 120,
        render: (_, client) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Visualizar">
              <IconButton size="small" onClick={() => onView(client)} color="primary">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => onEdit(client)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton size="small" onClick={() => onDelete(client)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [onView, onEdit, onDelete],
  );

  const handleRowClick = (client: Client) => {
    onView(client);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Lista de Clientes</Typography>
          <Tooltip title="Adicionar Cliente">
            <IconButton onClick={onAdd} color="primary" size="large">
              <Add />
            </IconButton>
          </Tooltip>
        </Box>

        <VirtualizedDataTable
          columns={columns}
          data={clients}
          onRowClick={handleRowClick}
          getRowKey={(client) => client.id}
          emptyMessage="Nenhum cliente encontrado."
          height={600}
          enableVirtualization={clients.length > 50}
        />
      </CardContent>
    </Card>
  );
};
