'use client';

import { useAuth } from '@/presentation/hooks/useAuth';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({ children, requiredRole, fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Não autenticado
  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  // Verificar role se especificado
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error">
          Acesso Negado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Você não tem permissão para acessar esta página.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/home')}>
          Voltar ao Início
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
