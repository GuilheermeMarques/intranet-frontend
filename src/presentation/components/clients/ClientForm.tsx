'use client';

import { Client, CreateClientRequest, UpdateClientRequest } from '@/domain/entities/Client';
import { formatCEP, formatCPF, formatPhone } from '@/shared/utils/formatters';
import { ClientSchema } from '@/shared/utils/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cancel, Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export const ClientForm = ({
  client,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: ClientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<CreateClientRequest>({
    resolver: zodResolver(ClientSchema),
    mode: 'onChange',
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (client) {
      // Preencher formulário com dados do cliente
      Object.entries(client).forEach(([key, value]) => {
        if (
          key !== 'id' &&
          key !== 'codigo' &&
          key !== 'dataUltimaCompra' &&
          key !== 'quantidadeCompras' &&
          key !== 'createdAt' &&
          key !== 'updatedAt'
        ) {
          setValue(key as keyof CreateClientRequest, value);
        }
      });
    }
  }, [client, setValue]);

  const handleFormSubmit = async (data: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCPFChange = (value: string) => {
    return formatCPF(value);
  };

  const handlePhoneChange = (value: string) => {
    return formatPhone(value);
  };

  const handleCEPChange = (value: string) => {
    return formatCEP(value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {client ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nome Completo"
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="CPF"
                    error={!!errors.cpf}
                    helperText={errors.cpf?.message}
                    required
                    inputProps={{
                      maxLength: 14,
                    }}
                    onChange={(e) => {
                      const formatted = handleCPFChange(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Telefone"
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                    required
                    inputProps={{
                      maxLength: 15,
                    }}
                    onChange={(e) => {
                      const formatted = handlePhoneChange(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="instagram"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Instagram"
                    error={!!errors.instagram}
                    helperText={errors.instagram?.message}
                    placeholder="@usuario"
                  />
                )}
              />
            </Grid>

            {/* Endereço */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 'bold' }}>
                Endereço
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="CEP"
                    error={!!errors.cep}
                    helperText={errors.cep?.message}
                    required
                    inputProps={{
                      maxLength: 9,
                    }}
                    onChange={(e) => {
                      const formatted = handleCEPChange(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="endereco"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Endereço"
                    error={!!errors.endereco}
                    helperText={errors.endereco?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="numero"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Número"
                    error={!!errors.numero}
                    helperText={errors.numero?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="bairro"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bairro"
                    error={!!errors.bairro}
                    helperText={errors.bairro?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="cidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cidade"
                    error={!!errors.cidade}
                    helperText={errors.cidade?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.estado} required>
                    <InputLabel>Estado</InputLabel>
                    <Select {...field} label="Estado">
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
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="complemento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Complemento"
                    error={!!errors.complemento}
                    helperText={errors.complemento?.message}
                  />
                )}
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  startIcon={<Cancel />}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting || isLoading}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
