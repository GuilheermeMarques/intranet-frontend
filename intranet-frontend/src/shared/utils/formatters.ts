/**
 * Formata CPF no padrão brasileiro
 */
export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Aplica máscara
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata telefone no padrão brasileiro
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Aplica máscara baseada no tamanho
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

/**
 * Formata CEP no padrão brasileiro
 */
export const formatCEP = (cep: string): string => {
  if (!cep) return '';

  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');

  // Aplica máscara
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString('pt-BR');
};

/**
 * Formata valor monetário
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata número com separadores
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata porcentagem
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Trunca texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza primeira letra de cada palavra
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata nome próprio
 */
export const formatName = (name: string): string => {
  if (!name) return '';

  // Lista de preposições que não devem ser capitalizadas
  const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e'];

  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !prepositions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};
