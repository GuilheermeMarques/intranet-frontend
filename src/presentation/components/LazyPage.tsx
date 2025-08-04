import { Box, CircularProgress, Typography } from '@mui/material';
import { ComponentType, Suspense, lazy } from 'react';

interface LazyPageProps {
  component: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  fallback?: React.ReactNode;
  title?: string;
}

const DefaultFallback = ({ title }: { title?: string }) => (
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
    <CircularProgress size={40} />
    <Typography variant="body1" color="text.secondary">
      {title || 'Carregando...'}
    </Typography>
  </Box>
);

export const LazyPage = ({ component, fallback, title }: LazyPageProps) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback || <DefaultFallback title={title} />}>
      <LazyComponent />
    </Suspense>
  );
};
