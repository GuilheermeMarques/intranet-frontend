'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function RepresentativesPage() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Representantes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie os representantes de vendas da empresa.
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Representantes Ativos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta página será desenvolvida com funcionalidades de gerenciamento de representantes.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
