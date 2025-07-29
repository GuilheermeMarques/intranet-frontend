'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import homeData from '@/mocks/home.json';
import {
  AttachMoney,
  Inventory,
  People,
  ShoppingCart,
  Support,
  TrendingUp,
} from '@mui/icons-material';
import type { PaletteColor } from '@mui/material';
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

// Mapear ícones
const iconMap: Record<string, React.ReactNode> = {
  People: <People />,
  ShoppingCart: <ShoppingCart />,
  AttachMoney: <AttachMoney />,
  Support: <Support />,
  Inventory: <Inventory />,
};

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          {homeData.stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={iconMap[stat.icon]}
              color={
                (theme.palette[stat.color as keyof typeof theme.palette] as PaletteColor)?.main
              }
              trend={stat.trend}
              trendValue={stat.trendValue}
            />
          ))}
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
          {homeData.progress.map((progress, index) => (
            <ProgressCard
              key={index}
              title={progress.title}
              value={progress.value}
              total={progress.total}
              color={
                (theme.palette[progress.color as keyof typeof theme.palette] as PaletteColor)?.main
              }
              icon={iconMap[progress.icon]}
            />
          ))}
        </Box>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Atividade Recente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {homeData.recentActivity.map((activity, index) => (
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
