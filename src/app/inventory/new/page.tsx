'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import inventoryData from '@/mocks/inventory.json';
import productsData from '@/mocks/products.json';
import { Product } from '@/types/product';
import { ArrowBack, Save } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface NewMovementForm {
  codigoProduto: string;
  descricao: string;
  quantidade: number;
  tipo: 'entrada' | 'saida';
  motivo: string;
  responsavel: string;
  observacoes: string;
}

const filterProducts = createFilterOptions<Product>();

export default function NewInventoryMovementPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<NewMovementForm>({
    codigoProduto: '',
    descricao: '',
    quantidade: 0,
    tipo: 'entrada',
    motivo: '',
    responsavel: '',
    observacoes: '',
  });

  const productOptions = productsData.products as Product[];

  const handleProductChange = (event: React.SyntheticEvent, newValue: Product | null) => {
    setSelectedProduct(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        codigoProduto: newValue.codigoProduto,
        descricao: newValue.nomeProduto,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        codigoProduto: '',
        descricao: '',
      }));
    }
  };

  const handleInputChange = (field: keyof NewMovementForm, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Aqui você implementaria a lógica para salvar a nova movimentação
    console.log('Nova movimentação:', formData);
    alert('Movimentação registrada com sucesso!');
    router.push('/inventory');
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

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
                Nova Movimentação de Estoque
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Registre uma nova entrada ou saída de produto no estoque.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Formulário */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
            Informações do Produto
          </Typography>

          <Grid container spacing={3}>
            {/* Seleção do Produto */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={productOptions}
                getOptionLabel={(option) => `${option.codigoProduto} - ${option.nomeProduto}`}
                value={selectedProduct}
                onChange={handleProductChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecionar Produto"
                    placeholder="Buscar por código ou nome do produto"
                    required
                  />
                )}
                filterOptions={(options, params) => {
                  const filtered = filterProducts(options, params);
                  if (params.inputValue !== '') {
                    return filtered.filter(
                      (option) =>
                        option.codigoProduto
                          .toLowerCase()
                          .includes(params.inputValue.toLowerCase()) ||
                        option.nomeProduto
                          .toLowerCase()
                          .includes(params.inputValue.toLowerCase()) ||
                        option.descricaoProduto
                          .toLowerCase()
                          .includes(params.inputValue.toLowerCase()),
                    );
                  }
                  return filtered;
                }}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.codigoProduto} - {option.nomeProduto}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.descricaoProduto}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
            </Grid>

            {/* Código do Produto (readonly) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código do Produto"
                value={formData.codigoProduto}
                InputProps={{ readOnly: true }}
                placeholder="Selecione um produto"
              />
            </Grid>

            {/* Descrição do Produto (readonly) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição do Produto"
                value={formData.descricao}
                InputProps={{ readOnly: true }}
                placeholder="Selecione um produto"
                multiline
                rows={2}
              />
            </Grid>

            {/* Informações da Movimentação */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3, mt: 2, color: 'primary.main' }}>
                Informações da Movimentação
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 0)}
                placeholder="0"
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Movimentação</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo de Movimentação"
                  onChange={(e) => handleInputChange('tipo', e.target.value as 'entrada' | 'saida')}
                >
                  <MenuItem value="entrada">Entrada</MenuItem>
                  <MenuItem value="saida">Saída</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Motivo</InputLabel>
                <Select
                  value={formData.motivo}
                  label="Motivo"
                  onChange={(e) => handleInputChange('motivo', e.target.value)}
                >
                  {(inventoryData.motivos as string[]).map((motivo) => (
                    <MenuItem key={motivo} value={motivo}>
                      {motivo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsável"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                placeholder="Nome do responsável"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre a movimentação"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          {/* Informações do Produto Selecionado */}
          {selectedProduct && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: '4px' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Informações do Produto Selecionado:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Estoque Atual:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedProduct.quantidadeEstoque} unidades
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Preço Unitário:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    R$ {selectedProduct.preco.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Fornecedor:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedProduct.fornecedor}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={
                !selectedProduct ||
                formData.quantidade <= 0 ||
                !formData.motivo ||
                !formData.responsavel
              }
            >
              Salvar Movimentação
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
