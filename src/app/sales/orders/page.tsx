'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Column, DataTable } from '@/components/DataTable';
import { FilterField, FilterPanel } from '@/components/FilterPanel';
import ordersData from '@/mocks/orders.json';
import { Order, OrderItem } from '@/types/order';
import { Visibility } from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function OrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    orderCode: '',
    clientName: '',
    status: '',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    endDate: new Date(),
  });

  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters({
      orderCode: (newFilters.orderCode as string) || '',
      clientName: (newFilters.clientName as string) || '',
      status: (newFilters.status as string) || '',
      startDate: (newFilters.startDate as Date) || null,
      endDate: (newFilters.endDate as Date) || null,
    });
  };

  const filteredOrders = useMemo(() => {
    return (ordersData.orders as Order[]).filter((order) => {
      const orderCodeMatch =
        !filters.orderCode ||
        filters.orderCode.trim() === '' ||
        order.id.toLowerCase().includes(filters.orderCode.toLowerCase());

      const clientNameMatch =
        !filters.clientName ||
        filters.clientName.trim() === '' ||
        order.clientName.toLowerCase().includes(filters.clientName.toLowerCase());

      const statusMatch =
        !filters.status || filters.status.trim() === '' || order.status === filters.status;

      return orderCodeMatch && clientNameMatch && statusMatch;
    });
  }, [filters]);

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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const columns: Column[] = [
    {
      id: 'id',
      label: 'Código do Pedido',
      sortable: true,
      render: (value) => (
        <Chip label={value as string} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'clientName',
      label: 'Nome do Cliente',
      sortable: true,
    },
    {
      id: 'createdAt',
      label: 'Data do Pedido',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      id: 'items',
      label: 'Quantidade de Itens',
      sortable: true,
      render: (value) => {
        const items = value as OrderItem[];
        return (
          <Typography variant="body2" fontWeight={500}>
            {items.length}
          </Typography>
        );
      },
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
      id: 'status',
      label: 'Status do Pedido',
      sortable: true,
      render: (value) => (
        <Chip
          label={getStatusLabel(value as string)}
          color={
            getStatusColor(value as string) as 'warning' | 'info' | 'success' | 'error' | 'default'
          }
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Detalhes do Pedido',
      sortable: false,
      render: (value, row) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => router.push(`/sales/orders/${row.id}`)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      id: 'orderCode',
      type: 'text',
      label: 'Código do Pedido',
      placeholder: 'Digite o código do pedido',
    },
    {
      id: 'clientName',
      type: 'text',
      label: 'Nome do Cliente',
      placeholder: 'Digite o nome do cliente',
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status do Pedido',
      options: [
        { value: 'pending', label: 'Pendente' },
        { value: 'shipped', label: 'Enviado' },
        { value: 'delivered', label: 'Entregue' },
        { value: 'canceled', label: 'Cancelado' },
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Pedidos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os pedidos da empresa.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/sales/orders/new')}
          >
            Novo Pedido
          </Button>
        </Box>

        <FilterPanel
          title="Filtros de Pedidos"
          fields={filterFields}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showClearButton={false}
          resultsCount={filteredOrders.length}
          resultsLabel="pedido(s) encontrado(s)"
        />

        <DataTable
          columns={columns}
          data={filteredOrders as unknown as Record<string, unknown>[]}
          title="Pedidos"
          emptyMessage="Nenhum pedido encontrado com os filtros aplicados."
        />
      </Box>
    </DashboardLayout>
  );
}
