'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Orçamentos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie os orçamentos da empresa.
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Orçamentos Pendentes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta página será desenvolvida com funcionalidades de gerenciamento de orçamentos.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
