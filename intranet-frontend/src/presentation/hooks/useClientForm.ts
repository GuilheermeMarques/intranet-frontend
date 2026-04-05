import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/domain/entities/Client';
import { ClientSchema } from '@/shared/utils/validationSchemas';
import { formatCPF, formatPhone, formatCEP } from '@/shared/utils/formatters';

interface UseClientFormOptions {
  client?: Client;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel?: () => void;
}

export const useClientForm = ({ client, onSubmit, onCancel }: UseClientFormOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
    getValues,
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

  // Preencher formulário com dados do cliente (para edição)
  const populateForm = useCallback((clientData: Client) => {
    Object.entries(clientData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'codigo' && key !== 'dataUltimaCompra' && 
          key !== 'quantidadeCompras' && key !== 'createdAt' && key !== 'updatedAt') {
        setValue(key as keyof CreateClientRequest, value);
      }
    });
  }, [setValue]);

  // Handlers de formatação
  const handleCPFChange = useCallback((value: string) => {
    return formatCPF(value);
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    return formatPhone(value);
  }, []);

  const handleCEPChange = useCallback((value: string) => {
    return formatCEP(value);
  }, []);

  // Submit do formulário
  const handleFormSubmit = useCallback(async (data: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(data);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, reset]);

  // Cancelar formulário
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      reset();
    }
  }, [onCancel, reset]);

  // Validar se formulário pode ser enviado
  const canSubmit = useCallback(() => {
    return isValid && isDirty && !isSubmitting;
  }, [isValid, isDirty, isSubmitting]);

  // Limpar formulário
  const clearForm = useCallback(() => {
    reset();
    setError(null);
  }, [reset]);

  // Obter dados atuais do formulário
  const getFormData = useCallback(() => {
    return getValues();
  }, [getValues]);

  // Verificar se há mudanças
  const hasChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  return {
    // Form state
    control,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    error,
    
    // Form actions
    handleSubmit: handleSubmit(handleFormSubmit),
    reset,
    setValue,
    watch,
    getValues,
    
    // Custom actions
    populateForm,
    handleCancel,
    clearForm,
    getFormData,
    hasChanges,
    canSubmit: canSubmit(),
    
    // Format handlers
    handleCPFChange,
    handlePhoneChange,
    handleCEPChange,
    
    // Form state helpers
    isEditMode: !!client,
    formTitle: client ? 'Editar Cliente' : 'Novo Cliente',
  };
}; 