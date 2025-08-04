import { LazyPage } from '@/presentation/components/LazyPage';

export const SettingsPageLazy = () => (
  <LazyPage
    component={() => import('@/app/settings/page')}
    title="Carregando página de configurações..."
  />
);
