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
import { memo, useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

export interface Column<T = Record<string, unknown>> {
  id: string;
  field?: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number;
}

export interface VirtualizedDataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T) => string;
  emptyMessage?: string;
  showItemsPerPage?: boolean;
  height?: number;
  rowHeight?: number;
  enableVirtualization?: boolean;
}

const VirtualizedRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    rows: Record<string, unknown>[];
    columns: Column[];
    onRowClick?: (row: Record<string, unknown>) => void;
    getRowKey: (row: Record<string, unknown>) => string;
  };
}>(({ index, style, data }) => {
  const { rows, columns, onRowClick, getRowKey } = data;
  const row = rows[index];

  const handleClick = useCallback(() => {
    onRowClick?.(row);
  }, [onRowClick, row]);

  return (
    <TableRow
      style={style}
      hover
      onClick={handleClick}
      sx={onRowClick ? { cursor: 'pointer' } : {}}
    >
      {columns.map((col) => (
        <TableCell key={`${getRowKey(row)}-${col.id}`} style={{ width: col.width }}>
          {col.render
            ? col.render((row as Record<string, unknown>)[col.field || col.id], row)
            : String((row as Record<string, unknown>)[col.field || col.id] || '')}
        </TableCell>
      ))}
    </TableRow>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

export function VirtualizedDataTable<T = Record<string, unknown>>({
  columns,
  data,
  title,
  itemsPerPage: initialItemsPerPage = 20,
  itemsPerPageOptions = [20, 60, 100],
  onRowClick,
  getRowKey = (row) => ((row as Record<string, unknown>).id as string) || String(row),
  emptyMessage = 'Nenhum item encontrado.',
  showItemsPerPage = true,
  height = 600,
  rowHeight = 50,
  enableVirtualization = true,
}: VirtualizedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback(
    (columnId: string) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column?.sortable) return;

      setOrderBy((prevOrderBy) => {
        if (prevOrderBy === columnId) {
          setOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
          return columnId;
        } else {
          setOrder('asc');
          return columnId;
        }
      });
      setCurrentPage(1);
    },
    [columns],
  );

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

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  const listData = useMemo(
    () => ({
      rows: currentData as Record<string, unknown>[],
      columns: columns as Column<Record<string, unknown>>[],
      onRowClick: onRowClick as ((row: Record<string, unknown>) => void) | undefined,
      getRowKey: getRowKey as (row: Record<string, unknown>) => string,
    }),
    [currentData, columns, onRowClick, getRowKey],
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

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

        <TableContainer component={Paper} sx={{ maxHeight: height }}>
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
                      width: col.width,
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
          </Table>

          {enableVirtualization && currentData.length > 50 ? (
            <List
              height={height - 60} // Ajustar para o header
              width={'100%'}
              itemCount={currentData.length}
              itemSize={rowHeight}
              itemData={listData}
            >
              {VirtualizedRow}
            </List>
          ) : (
            <TableContainer>
              <Table>
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
          )}
        </TableContainer>

        {/* Paginação */}
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
      </CardContent>
    </Card>
  );
}
