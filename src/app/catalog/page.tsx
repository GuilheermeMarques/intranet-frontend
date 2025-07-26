'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function CatalogPage() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Catálogo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie os produtos do seu catálogo.
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Produtos Disponíveis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta página será desenvolvida com funcionalidades de gerenciamento de produtos.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
