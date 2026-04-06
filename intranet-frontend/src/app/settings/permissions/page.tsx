'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAccessControl } from '@/contexts/AccessControlContext';
import { MANAGE_PERMISSIONS_KEY } from '@/shared/utils/accessControl';
import type { MenuPermissionItem } from '@/types/accessControl';
import {
  Block,
  CheckCircleOutline,
  Lock,
  PersonOutline,
  Refresh,
  Security,
  Visibility,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

const countMenuNodes = (items: MenuPermissionItem[]): number =>
  items.reduce((total, item) => total + 1 + countMenuNodes(item.children ?? []), 0);

const flattenVisibleLabels = (
  items: MenuPermissionItem[],
  parentLabel?: string,
): Array<{ key: string; label: string }> =>
  items.flatMap((item) => {
    const currentLabel = parentLabel ? `${parentLabel} / ${item.label}` : item.label;

    return [
      { key: item.permissionKey, label: currentLabel },
      ...flattenVisibleLabels(item.children ?? [], currentLabel),
    ];
  });

export default function PermissionsSettingsPage() {
  const {
    allPermissionKeys,
    administrativePermissions,
    canManagePermissions,
    currentUser,
    getVisibleMenuItemsForUser,
    managedUser,
    managedUserId,
    menuItems,
    resetMockData,
    selectManagedUser,
    togglePermission,
    users,
  } = useAccessControl();

  const selectedPermissions = useMemo(
    () => new Set(managedUser?.permissions ?? []),
    [managedUser?.permissions],
  );
  const visibleMenuItems = useMemo(
    () => getVisibleMenuItemsForUser(managedUser?.permissions ?? []),
    [getVisibleMenuItemsForUser, managedUser?.permissions],
  );
  const visibleLabels = useMemo(() => flattenVisibleLabels(visibleMenuItems), [visibleMenuItems]);

  const renderPermissionRow = (item: MenuPermissionItem, depth: number = 0) => {
    const isGranted = selectedPermissions.has(item.permissionKey);

    return (
      <Box key={item.permissionKey}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            py: 1.5,
            pl: depth * 3,
            pr: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" fontWeight={depth === 0 ? 600 : 500}>
              {item.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {item.permissionKey}
            </Typography>
            {item.href !== '#' && (
              <Typography variant="caption" color="text.secondary">
                Rota: {item.href}
              </Typography>
            )}
          </Box>

          <FormControlLabel
            sx={{ mr: 0, flexShrink: 0 }}
            control={
              <Switch
                checked={isGranted}
                onChange={(event) =>
                  managedUser &&
                  togglePermission(managedUser.id, item.permissionKey, event.target.checked)
                }
              />
            }
            label={isGranted ? 'Liberado' : 'Bloqueado'}
            labelPlacement="start"
          />
        </Box>

        {item.children?.map((child) => renderPermissionRow(child, depth + 1))}
      </Box>
    );
  };

  if (!canManagePermissions) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Card>
            <CardContent sx={{ py: 6 }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'error.light', color: 'error.main' }}>
                  <Block />
                </Avatar>
                <Typography variant="h4" fontWeight={600}>
                  Acesso restrito
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
                  O usuário atual não possui a permissão administrativa necessária para acessar esta
                  tela.
                </Typography>
                <Chip
                  icon={<Lock />}
                  label={`Permissão exigida: ${MANAGE_PERMISSIONS_KEY}`}
                  color="error"
                  variant="outlined"
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Usuário atual: {currentUser?.name ?? 'Sem sessão'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {currentUser?.email ?? '-'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Controle de Acesso
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Libere menus e submenus por usuário e simule imediatamente o que aparece no sidebar.
            </Typography>
          </Box>

          <Button variant="outlined" startIcon={<Refresh />} onClick={resetMockData}>
            Restaurar Mocks
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Usuário em Simulação
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {currentUser?.name ?? 'Sem usuário'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.jobTitle ?? 'Sem sessão'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Permissões Liberadas
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {managedUser?.permissions.length ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  de {allPermissionKeys.length} chaves disponíveis
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Menus Visíveis
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {countMenuNodes(visibleMenuItems)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  contando menus e submenus do usuário em edição
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Último Login
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {managedUser?.lastLogin ?? '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {managedUser?.department ?? 'Sem departamento'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={3.5}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Usuários
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Escolha o usuário cujas permissões serão editadas.
                </Typography>

                <List sx={{ p: 0 }}>
                  {users.map((user) => {
                    const isSelected = user.id === managedUserId;
                    const userVisibleMenus = getVisibleMenuItemsForUser(user.permissions);

                    return (
                      <ListItemButton
                        key={user.id}
                        selected={isSelected}
                        onClick={() => selectManagedUser(user.id)}
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          alignItems: 'flex-start',
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                          <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.300' }}>
                            {user.avatar}
                          </Avatar>
                          <Box sx={{ minWidth: 0, width: '100%' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body1" fontWeight={600} noWrap>
                                {user.name}
                              </Typography>
                              <Chip
                                size="small"
                                label={
                                  user.id === currentUser?.id
                                    ? 'Sessão atual'
                                    : isSelected
                                      ? 'Em edição'
                                      : user.status === 'active'
                                        ? 'Ativo'
                                        : 'Inativo'
                                }
                                color={
                                  isSelected || user.id === currentUser?.id
                                    ? 'primary'
                                    : user.status === 'active'
                                      ? 'success'
                                      : 'default'
                                }
                                variant={isSelected ? 'filled' : 'outlined'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {user.jobTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {user.email}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={<Security />}
                                label={`${user.permissions.length} permissões`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<Visibility />}
                                label={`${countMenuNodes(userVisibleMenus)} menus`}
                                variant="outlined"
                              />
                            </Stack>
                          </Box>
                        </Box>
                      </ListItemButton>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8} lg={8.5}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', md: 'center' },
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">Permissões por Menu</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ao liberar um submenu, o menu pai é liberado automaticamente. Ao bloquear
                        um menu pai, seus filhos também são removidos.
                      </Typography>
                    </Box>

                    {managedUser && (
                      <Chip
                        icon={<PersonOutline />}
                        color="primary"
                        label={`Editando ${managedUser.name}`}
                      />
                    )}
                  </Box>

                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Permissões Administrativas
                    </Typography>
                    {administrativePermissions.map((permission) => {
                      const isGranted = selectedPermissions.has(permission.key);
                      const isCurrentSessionPermission =
                        managedUser?.id === currentUser?.id &&
                        permission.key === MANAGE_PERMISSIONS_KEY;

                      return (
                        <Box
                          key={permission.key}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 2,
                            py: 1.5,
                            pr: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {permission.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {permission.key}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>

                          <FormControlLabel
                            sx={{ mr: 0, flexShrink: 0 }}
                            control={
                              <Switch
                                checked={isGranted}
                                disabled={isCurrentSessionPermission}
                                onChange={(event) =>
                                  managedUser &&
                                  togglePermission(managedUser.id, permission.key, event.target.checked)
                                }
                              />
                            }
                            label={isGranted ? 'Liberado' : 'Bloqueado'}
                            labelPlacement="start"
                          />
                        </Box>
                      );
                    })}
                  </Box>
                  <Box>{menuItems.map((item) => renderPermissionRow(item))}</Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Preview do Menu Visível
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Esse é o recorte de navegação que o usuário em edição terá quando fizer login.
                  </Typography>

                  {visibleLabels.length > 0 ? (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {visibleLabels.map((item) => (
                        <Chip
                          key={item.key}
                          icon={<CheckCircleOutline />}
                          label={item.label}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum menu está visível para o usuário atual.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
