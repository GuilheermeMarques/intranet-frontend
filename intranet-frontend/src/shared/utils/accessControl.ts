import menuData from '@/mocks/menu.json';
import type {
  AdministrativePermissionDefinition,
  MenuPermissionItem,
} from '@/types/accessControl';

export const MANAGE_PERMISSIONS_KEY = 'settings.permissions.manage';

export const administrativePermissionDefinitions: AdministrativePermissionDefinition[] = [
  {
    key: MANAGE_PERMISSIONS_KEY,
    label: 'Gerenciar permissões',
    description: 'Permite acessar a tela de permissões e editar acessos de outros usuários.',
  },
];

export const permissionMenuItems = menuData.menuItems as MenuPermissionItem[];

const permissionIndex = new Map<string, MenuPermissionItem>();
const parentIndex = new Map<string, string | null>();
const descendantsIndex = new Map<string, string[]>();

const registerMenuItems = (items: MenuPermissionItem[], parentKey: string | null = null) => {
  items.forEach((item) => {
    permissionIndex.set(item.permissionKey, item);
    parentIndex.set(item.permissionKey, parentKey);

    if (item.children?.length) {
      registerMenuItems(item.children, item.permissionKey);
      descendantsIndex.set(
        item.permissionKey,
        item.children.flatMap((child) => [
          child.permissionKey,
          ...(descendantsIndex.get(child.permissionKey) ?? []),
        ]),
      );
      return;
    }

    descendantsIndex.set(item.permissionKey, []);
  });
};

registerMenuItems(permissionMenuItems);

const collectPermissions = (item: MenuPermissionItem): string[] => {
  return [item.permissionKey, ...(item.children?.flatMap(collectPermissions) ?? [])];
};

export const allMenuPermissionKeys = permissionMenuItems.flatMap(collectPermissions);
export const allPermissionKeys = [
  ...administrativePermissionDefinitions.map((permission) => permission.key),
  ...allMenuPermissionKeys,
];

export const getAncestorPermissionKeys = (permissionKey: string) => {
  const ancestors: string[] = [];
  let currentParent = parentIndex.get(permissionKey) ?? null;

  while (currentParent) {
    ancestors.unshift(currentParent);
    currentParent = parentIndex.get(currentParent) ?? null;
  }

  return ancestors;
};

export const getDescendantPermissionKeys = (permissionKey: string) => {
  return descendantsIndex.get(permissionKey) ?? [];
};

export const applyPermissionToggle = (
  currentPermissions: string[],
  permissionKey: string,
  enabled: boolean,
) => {
  const nextPermissions = new Set(currentPermissions);

  if (enabled) {
    nextPermissions.add(permissionKey);
    getAncestorPermissionKeys(permissionKey).forEach((ancestorKey) => nextPermissions.add(ancestorKey));
  } else {
    nextPermissions.delete(permissionKey);
    getDescendantPermissionKeys(permissionKey).forEach((descendantKey) =>
      nextPermissions.delete(descendantKey),
    );
  }

  return Array.from(nextPermissions).sort((a, b) => a.localeCompare(b));
};

export const filterMenuItemsByPermissions = (
  items: MenuPermissionItem[],
  grantedPermissions: string[],
): MenuPermissionItem[] => {
  const grantedSet = new Set(grantedPermissions);

  return items.flatMap((item) => {
    const visibleChildren = item.children?.length
      ? filterMenuItemsByPermissions(item.children, grantedPermissions)
      : undefined;
    const hasAccess = grantedSet.has(item.permissionKey);

    if (item.children?.length) {
      if (!hasAccess || !visibleChildren?.length) {
        return [];
      }

      return [{ ...item, children: visibleChildren }];
    }

    return hasAccess ? [{ ...item }] : [];
  });
};

export const findPermissionItem = (permissionKey: string) => {
  return permissionIndex.get(permissionKey);
};

export const hasPermission = (grantedPermissions: string[], permissionKey: string) => {
  return grantedPermissions.includes(permissionKey);
};
