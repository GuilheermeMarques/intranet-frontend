import { LazyPage } from '@/presentation/components/LazyPage';

export const TicketsPageLazy = () => (
  <LazyPage
    component={() => import('@/app/tickets/page')}
    title="Carregando página de tickets..."
  />
);
