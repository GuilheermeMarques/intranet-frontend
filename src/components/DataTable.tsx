'use client';

import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  FormControl,
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
  Typography,
} from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

export interface Column<T = Record<string, unknown>> {
  id: string;
  field?: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T) => string;
  emptyMessage?: string;
  showItemsPerPage?: boolean;
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  title,
  itemsPerPage: initialItemsPerPage = 20,
  itemsPerPageOptions = [20, 60, 100],
  onRowClick,
  getRowKey = (row) => ((row as Record<string, unknown>).id as string) || String(row),
  emptyMessage = 'Nenhum item encontrado.',
  showItemsPerPage = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
    setCurrentPage(1);
  };

  const getComparator = useCallback((order: 'asc' | 'desc', orderBy: string) => {
    return (a: T, b: T) => {
      const aValue = (a as Record<string, unknown>)[orderBy];
      const bValue = (b as Record<string, unknown>)[orderBy];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        if (aValue.getTime() < bValue.getTime()) return order === 'asc' ? -1 : 1;
        if (aValue.getTime() > bValue.getTime()) return order === 'asc' ? 1 : -1;
      } else {
        const aStr = String(aValue);
        const bStr = String(bValue);
        if (aStr < bStr) return order === 'asc' ? -1 : 1;
        if (aStr > bStr) return order === 'asc' ? 1 : -1;
      }
      return 0;
    };
  }, []);

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy, getComparator]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {title && <Typography variant="h6">{title}</Typography>}

          {showItemsPerPage && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Itens por página</InputLabel>
              <Select
                value={itemsPerPage}
                label="Itens por página"
                onChange={handleItemsPerPageChange}
              >
                {itemsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      fontWeight: 600,
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    {col.label}
                    {col.sortable &&
                      orderBy === col.id &&
                      (order === 'asc' ? (
                        <ArrowUpward fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                      ) : (
                        <ArrowDownward fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                      ))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((col) => (
                    <TableCell key={`${getRowKey(row)}-${col.id}`}>
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.field || col.id], row)
                        : String((row as Record<string, unknown>)[col.field || col.id] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        )}

        {/* Paginação */}
        {data.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} itens
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
  );
}
