import { LazyPage } from '@/presentation/components/LazyPage';

export const ClientsPageLazy = () => (
  <LazyPage
    component={() => import('@/app/clients/page')}
    title="Carregando página de clientes..."
  />
);
