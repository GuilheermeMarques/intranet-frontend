import DOMPurify, { Config as DOMPurifyConfig } from 'dompurify';

// Configuração padrão do DOMPurify
const defaultConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

// Configuração restritiva (apenas texto)
const strictConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

// Configuração para rich text
const richTextConfig = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'div',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style'],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitiza HTML para prevenir XSS
 */
export const sanitizeHtml = (html: string, config: DOMPurifyConfig = defaultConfig): string => {
  if (typeof window === 'undefined') {
    // Server-side: retorna string vazia ou texto limpo
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, config);
};

/**
 * Sanitiza apenas texto (remove todas as tags HTML)
 */
export const sanitizeText = (text: string): string => {
  return sanitizeHtml(text, strictConfig);
};

/**
 * Sanitiza rich text (permite formatação básica)
 */
export const sanitizeRichText = (html: string): string => {
  return sanitizeHtml(html, richTextConfig);
};

/**
 * Sanitiza URLs para prevenir ataques
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = sanitizeText(url);

  // Verificar se é uma URL válida
  try {
    const urlObj = new URL(sanitized);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }

    return sanitized;
  } catch {
    return '';
  }
};

/**
 * Sanitiza dados de entrada para formulários
 */
export const sanitizeFormData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitiza dados de saída para exibição
 */
export const sanitizeForDisplay = (data: unknown): unknown => {
  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForDisplay);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeForDisplay(value);
    }
    return sanitized;
  }

  return data;
};
