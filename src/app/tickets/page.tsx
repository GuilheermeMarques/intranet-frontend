'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Chamados
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie os chamados de suporte da empresa.
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chamados Ativos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta página será desenvolvida com funcionalidades de gerenciamento de chamados.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
