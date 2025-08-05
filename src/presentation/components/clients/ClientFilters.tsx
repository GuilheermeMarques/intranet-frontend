'use client';

import { ClientFilters as ClientFiltersType } from '@/domain/entities/Client';
import { useClientCitiesQuery } from '@/presentation/hooks/useClientsQuery';
import { Clear, FilterList, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface ClientFiltersProps {
  filters: ClientFiltersType;
  onFiltersChange: (filters: ClientFiltersType) => void;
  onClearFilters: () => void;
}

export const ClientFilters = ({ filters, onFiltersChange, onClearFilters }: ClientFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ClientFiltersType>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: cities = [], isLoading: isLoadingCities } = useClientCitiesQuery();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof ClientFiltersType, value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: ClientFiltersType = {};
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some((value) => value && value !== '');

  const activeFiltersCount = Object.values(filters).filter((value) => value && value !== '').length;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Typography variant="h6">Filtros</Typography>
            {hasActiveFilters && (
              <Chip
                label={`${activeFiltersCount} ativo${activeFiltersCount > 1 ? 's' : ''}`}
                color="primary"
                size="small"
              />
            )}
          </Box>
          <Button size="small" onClick={() => setIsExpanded(!isExpanded)} variant="text">
            {isExpanded ? 'Ocultar' : 'Expandir'}
          </Button>
        </Box>

        {/* Filtro básico sempre visível */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por nome"
              value={localFilters.nome || ''}
              onChange={(e) => handleFilterChange('nome', e.target.value)}
              placeholder="Digite o nome do cliente..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<Search />}
                sx={{ flex: 1 }}
              >
                Aplicar Filtros
              </Button>
              {hasActiveFilters && (
                <IconButton onClick={handleClearFilters} color="error" title="Limpar filtros">
                  <Clear />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Filtros avançados */}
        {isExpanded && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CPF"
                value={localFilters.cpf || ''}
                onChange={(e) => handleFilterChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                value={localFilters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Cidade</InputLabel>
                <Select
                  value={localFilters.cidade || ''}
                  label="Cidade"
                  onChange={(e) => handleFilterChange('cidade', e.target.value)}
                  disabled={isLoadingCities}
                >
                  <MenuItem value="">Todas as cidades</MenuItem>
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
                label="Telefone"
                value={localFilters.telefone || ''}
                onChange={(e) => handleFilterChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Instagram"
                value={localFilters.instagram || ''}
                onChange={(e) => handleFilterChange('instagram', e.target.value)}
                placeholder="@usuario"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={localFilters.estado || ''}
                  label="Estado"
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <MenuItem value="">Todos os estados</MenuItem>
                  <MenuItem value="AC">Acre</MenuItem>
                  <MenuItem value="AL">Alagoas</MenuItem>
                  <MenuItem value="AP">Amapá</MenuItem>
                  <MenuItem value="AM">Amazonas</MenuItem>
                  <MenuItem value="BA">Bahia</MenuItem>
                  <MenuItem value="CE">Ceará</MenuItem>
                  <MenuItem value="DF">Distrito Federal</MenuItem>
                  <MenuItem value="ES">Espírito Santo</MenuItem>
                  <MenuItem value="GO">Goiás</MenuItem>
                  <MenuItem value="MA">Maranhão</MenuItem>
                  <MenuItem value="MT">Mato Grosso</MenuItem>
                  <MenuItem value="MS">Mato Grosso do Sul</MenuItem>
                  <MenuItem value="MG">Minas Gerais</MenuItem>
                  <MenuItem value="PA">Pará</MenuItem>
                  <MenuItem value="PB">Paraíba</MenuItem>
                  <MenuItem value="PR">Paraná</MenuItem>
                  <MenuItem value="PE">Pernambuco</MenuItem>
                  <MenuItem value="PI">Piauí</MenuItem>
                  <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                  <MenuItem value="RN">Rio Grande do Norte</MenuItem>
                  <MenuItem value="RS">Rio Grande do Sul</MenuItem>
                  <MenuItem value="RO">Rondônia</MenuItem>
                  <MenuItem value="RR">Roraima</MenuItem>
                  <MenuItem value="SC">Santa Catarina</MenuItem>
                  <MenuItem value="SP">São Paulo</MenuItem>
                  <MenuItem value="SE">Sergipe</MenuItem>
                  <MenuItem value="TO">Tocantins</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {/* Chips dos filtros ativos */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;

              return (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleFilterChange(key as keyof ClientFiltersType, '')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
