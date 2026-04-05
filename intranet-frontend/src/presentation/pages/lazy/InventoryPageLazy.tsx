import { LazyPage } from '@/presentation/components/LazyPage';

export const InventoryPageLazy = () => (
  <LazyPage
    component={() => import('@/app/inventory/page')}
    title="Carregando página de inventário..."
  />
);
