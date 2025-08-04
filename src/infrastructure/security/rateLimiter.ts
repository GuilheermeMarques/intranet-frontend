import { NextRequest, NextResponse } from 'next/server';

// Store simples em memória (em produção, usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: NextRequest) => string; // Função para gerar chave única
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // 100 requisições por 15 minutos
  keyGenerator: (req: NextRequest) => {
    // Usar IP do cliente como chave
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
    return ip;
  },
};

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: NextRequest) => {
    const key = finalConfig.keyGenerator!(req);
    const now = Date.now();

    // Limpar registros antigos
    const record = requestCounts.get(key);
    if (record && record.resetTime < now) {
      requestCounts.delete(key);
    }

    // Obter ou criar registro atual
    const currentRecord = requestCounts.get(key) || {
      count: 0,
      resetTime: now + finalConfig.windowMs,
    };

    // Incrementar contador
    currentRecord.count++;
    requestCounts.set(key, currentRecord);

    // Verificar se excedeu o limite
    if (currentRecord.count > finalConfig.maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((currentRecord.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((currentRecord.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': currentRecord.resetTime.toString(),
          },
        },
      );
    }

    // Adicionar headers de rate limit
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      (finalConfig.maxRequests - currentRecord.count).toString(),
    );
    response.headers.set('X-RateLimit-Reset', currentRecord.resetTime.toString());

    return response;
  };
};

// Rate limiters específicos
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // 5 tentativas de login por 15 minutos
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 1000, // 1000 requisições por 15 minutos
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 30, // 30 buscas por minuto
});
