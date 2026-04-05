'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { ReactNode } from 'react';

export interface FilterField {
  id: string;
  type: 'text' | 'select' | 'date' | 'custom';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  startAdornment?: ReactNode;
  customRender?: () => ReactNode;
}

export interface FilterPanelProps {
  title?: string;
  fields: FilterField[];
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  clearButtonText?: string;
  showResultsCount?: boolean;
  resultsCount?: number;
  resultsLabel?: string;
}

export function FilterPanel({
  title = 'Filtros de Busca',
  fields,
  filters,
  onFiltersChange,
  onClearFilters,
  showClearButton = false,
  clearButtonText = 'Limpar Filtros',
  showResultsCount = true,
  resultsCount,
  resultsLabel = 'item(s) encontrado(s)',
}: FilterPanelProps) {
  const handleFilterChange = (fieldId: string, value: unknown) => {
    onFiltersChange({
      ...filters,
      [fieldId]: value,
    });
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Limpar todos os filtros para valores vazios
      const clearedFilters: Record<string, unknown> = {};
      fields.forEach((field) => {
        if (field.type === 'date') {
          clearedFilters[field.id] = null;
        } else {
          clearedFilters[field.id] = '';
        }
      });
      onFiltersChange(clearedFilters);
    }
  };

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={filters[field.id] || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
            InputProps={{
              startAdornment: field.startAdornment,
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={filters[field.id] || ''}
              label={field.label}
              onChange={(e) => handleFilterChange(field.id, e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <DatePicker
            label={field.label}
            value={(filters[field.id] as Date) || null}
            onChange={(date) => handleFilterChange(field.id, date)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'medium',
                InputProps: {
                  style: { fontSize: '14px' },
                },
              },
            }}
          />
        );

      case 'custom':
        return field.customRender?.() || null;

      default:
        return null;
    }
  };

  // Calcular quantos campos por linha baseado no número total
  const getGridSize = (totalFields: number) => {
    if (totalFields <= 4) return 3; // 4 campos por linha (md=3)
    if (totalFields <= 6) return 4; // 3 campos por linha (md=4)
    return 6; // 2 campos por linha (md=6)
  };

  const gridSize = getGridSize(fields.length);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {title}
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Grid container spacing={2} alignItems="center">
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={gridSize} key={field.id}>
                {renderField(field)}
              </Grid>
            ))}

            {showClearButton && (
              <Grid item xs={12} sm={6} md={gridSize}>
                <Button variant="outlined" onClick={handleClearFilters} fullWidth>
                  {clearButtonText}
                </Button>
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>

        {showResultsCount && resultsCount !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {resultsCount} {resultsLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
