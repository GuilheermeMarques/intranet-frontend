'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import {
  AttachMoney,
  Inventory,
  People,
  ShoppingCart,
  Support,
  TrendingUp,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendValue?: string;
}

function StatCard({ title, value, icon, color, trend, trendValue }: StatCardProps) {
  const theme = useMuiTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: color + '20',
              color: color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
            <Typography variant="caption" color="success.main">
              {trendValue} {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}

function ProgressCard({ title, value, total, color, icon }: ProgressCardProps) {
  const percentage = (value / total) * 100;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: color + '20',
              color: color,
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value} de {total}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: color + '20',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {percentage.toFixed(1)}% completo
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const theme = useMuiTheme();

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
            Bem-vindo de volta! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está o que está acontecendo hoje na sua intranet.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Total de Usuários"
            value="1,234"
            icon={<People />}
            color={theme.palette.primary.main}
            trend="este mês"
            trendValue="+12%"
          />
          <StatCard
            title="Vendas"
            value="R$ 45,678"
            icon={<ShoppingCart />}
            color={theme.palette.success.main}
            trend="este mês"
            trendValue="+8%"
          />
          <StatCard
            title="Orçamentos"
            value="89"
            icon={<AttachMoney />}
            color={theme.palette.warning.main}
            trend="este mês"
            trendValue="+15%"
          />
          <StatCard
            title="Chamados"
            value="23"
            icon={<Support />}
            color={theme.palette.error.main}
            trend="este mês"
            trendValue="-5%"
          />
        </Box>

        {/* Progress Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <ProgressCard
            title="Produtos no Catálogo"
            value={156}
            total={200}
            color={theme.palette.primary.main}
            icon={<Inventory />}
          />
          <ProgressCard
            title="Chamados Resolvidos"
            value={18}
            total={23}
            color={theme.palette.success.main}
            icon={<Support />}
          />
        </Box>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Atividade Recente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  action: 'Novo usuário registrado',
                  user: 'João Silva',
                  time: '2 minutos atrás',
                  type: 'user',
                },
                {
                  action: 'Orçamento aprovado',
                  user: 'Maria Santos',
                  time: '15 minutos atrás',
                  type: 'budget',
                },
                {
                  action: 'Chamado resolvido',
                  user: 'Pedro Costa',
                  time: '1 hora atrás',
                  type: 'ticket',
                },
                {
                  action: 'Produto adicionado ao catálogo',
                  user: 'Ana Oliveira',
                  time: '2 horas atrás',
                  type: 'catalog',
                },
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 2,
                      bgcolor:
                        activity.type === 'user'
                          ? 'primary.main'
                          : activity.type === 'budget'
                            ? 'success.main'
                            : activity.type === 'ticket'
                              ? 'warning.main'
                              : 'info.main',
                    }}
                  >
                    {activity.user.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      por {activity.user} • {activity.time}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      activity.type === 'user'
                        ? 'Usuário'
                        : activity.type === 'budget'
                          ? 'Orçamento'
                          : activity.type === 'ticket'
                            ? 'Chamado'
                            : 'Catálogo'
                    }
                    size="small"
                    color={
                      activity.type === 'user'
                        ? 'primary'
                        : activity.type === 'budget'
                          ? 'success'
                          : activity.type === 'ticket'
                            ? 'warning'
                            : 'info'
                    }
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
