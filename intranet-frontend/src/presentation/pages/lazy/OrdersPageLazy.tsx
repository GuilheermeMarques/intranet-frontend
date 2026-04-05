import { LazyPage } from '@/presentation/components/LazyPage';

export const OrdersPageLazy = () => (
  <LazyPage
    component={() => import('@/app/sales/orders/page')}
    title="Carregando página de pedidos..."
  />
);
